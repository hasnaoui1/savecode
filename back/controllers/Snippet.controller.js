const { Snippet, User, Version, Execution, Favorite, Comment } = require('../models');


exports.createSnippet = async (req, res) => {
  try {
    const userId = req.user.id;

    const snippet = await Snippet.create({
      title: 'Untitled',
      code: '',
      language: 'plaintext',
      isPublic: true,
      userId,
    });

    await Version.create({
      versionNumber: 1,
      changes: 'Initial version',
      snippetId: snippet.id,
      previousVersionId: null
    });

    res.status(201).json({ snippetId: snippet.id });
  } catch (error) {
    console.error('Create Snippet Error:', error);
    res.status(500).json({ message: 'Failed to create snippet' });
  }
};



exports.updateSnippet = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, code, language, isPublic } = req.body;
    const userId = req.user.id;

    const snippet = await Snippet.findByPk(id);

    if (!snippet) return res.status(404).json({ message: 'Snippet not found' });
    if (snippet.userId !== userId) return res.status(403).json({ message: 'Unauthorized' });


    const lastVersion = await Version.findOne({
      where: { snippetId: snippet.id },
      order: [['versionNumber', 'DESC']]
    });

    const newVersionNumber = (lastVersion?.versionNumber || 0) + 1;

    await Version.create({
      versionNumber: newVersionNumber,
      changes: 'Snippet updated',
      snippetId: snippet.id,
      previousVersionId: lastVersion?.id || null
    });


    await snippet.update({ title, code, language, isPublic });

    res.json({ message: 'Snippet updated successfully', snippet });
  } catch (error) {
    console.error('Update Snippet Error:', error);
    res.status(500).json({ message: 'Failed to update snippet' });
  }
};


exports.deleteSnippet = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const snippet = await Snippet.findByPk(id);
    if (!snippet) return res.status(404).json({ message: 'Snippet not found' });
    if (snippet.userId !== userId) return res.status(403).json({ message: 'Unauthorized' });

    await snippet.destroy();
    res.json({ message: 'Snippet deleted successfully' });
  } catch (error) {
    console.error('Delete Snippet Error:', error);
    res.status(500).json({ message: 'Failed to delete snippet' });
  }
};




exports.getSnippetById = async (req, res) => {
  const { id } = req.params;
  try {
    const snippet = await Snippet.findByPk(id, {
      include: [
        { model: Favorite },
        { model: Comment, include: [User] },
        { model: User }

      ]
    });

    if (!snippet) {
      return res.status(404).json({ message: 'Snippet not found' });
    }

    const favoritesCount = snippet.Favorites.length;
    const comments = snippet.Comments.map(comment => ({
      id: comment.id,
      content: comment.content,
      createdAt: comment.createdAt,
      user: comment.User.username,
    }));

    res.json({
      ...snippet.toJSON(),
      favoritesCount,
      comments,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching snippet' });
  }
};



exports.getAllSnippets = async (req, res) => {
  try {
    const snippets = await Snippet.findAll({
      include: [
        { model: User, attributes: ['id', 'username'] },
        { model: Favorite },
      ],
      order: [['createdAt', 'DESC']]
    });

    const enrichedSnippets = snippets.map(snippet => {
      const snippetJson = snippet.toJSON();
      snippetJson.favoritesCount = snippet.Favorites.length;
      return snippetJson;
    });

    res.json(enrichedSnippets);
  } catch (error) {
    console.error('Get All Snippets Error:', error);
    res.status(500).json({ message: 'Failed to get snippets' });
  }
};




const Docker = require('dockerode');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');


const docker = new Docker();

exports.executeSnippet = async (req, res) => {
  const { snippetId } = req.body;

  try {
    const snippet = await Snippet.findByPk(snippetId);
    if (!snippet) {
      return res.status(404).json({ message: 'Snippet not found' });
    }

    const { code, language } = snippet;

    const languageConfig = {
      javascript: {
        image: 'node:20',
        fileName: 'code.js',
        command: ['node', 'code.js']
      },
      python: {
        image: 'python:latest',
        fileName: 'code.py',
        command: ['python', 'code.py']
      }
    };

    const config = languageConfig[language.toLowerCase()];
    if (!config) {
      return res.status(400).json({ message: 'Unsupported language' });
    }

    const tempDir = path.join(__dirname, '..', 'temp', uuidv4());
    const codeFilePath = path.join(tempDir, config.fileName);

    fs.mkdirSync(tempDir, { recursive: true });
    fs.writeFileSync(codeFilePath, code);

    const container = await docker.createContainer({
      Image: config.image,
      Cmd: config.command,
      Tty: true, // Output is raw text, no multiplexing headers
      HostConfig: {
        AutoRemove: true,
        Binds: [`${tempDir}:/app`]
      },
      WorkingDir: '/app'
    });

    await container.start();
    console.log(`Container started for snippet ${snippetId}`);

    const stream = await container.attach({ stream: true, stdout: true, stderr: true });

    let output = '';
    stream.on('data', (chunk) => {
      const chunkStr = chunk.toString();
      console.log('Received chunk:', JSON.stringify(chunkStr));
      // Docker attaches header to stream, might need stripping if using raw stream, 
      // but dockerode stream usually handles it or returns raw. 
      // Let's log raw first.
      output += chunkStr;
    });

    console.log('Waiting for container...');
    await container.wait();
    console.log('Container finished.');
    console.log('Raw output collected:', JSON.stringify(output));

    // Simple strip of non-printable might be removing too much if encoding is weird
    // or if the first 8 bytes are the Docker header (stream format).
    // Docker multiplexed stream headers are 8 bytes: [STREAM_TYPE, 0, 0, 0, SIZE, SIZE, SIZE, SIZE]
    // If tty=false, we get these headers.

    // Attempt to strip headers if they exist (naive approach for debugging)
    // or just leave as is for now to see what's happening.

    const cleanOutput = output
      .replace(/[^\x20-\x7E\n\r]/g, '')
      .trim();

    console.log('Cleaned output:', JSON.stringify(cleanOutput));

    res.status(200).json({ output: cleanOutput });

    // Async save to execution history
    Execution.create({
      input: code,
      output: cleanOutput,
      createdAt: Date.now()
    }).catch(err => console.error('Failed to save execution history:', err));

  } catch (err) {
  } catch (err) {
    console.error('Execution error:', err);
    res.status(500).json({ message: 'Failed to execute snippet', error: err.message });
  } finally {
    const tempBase = path.join(__dirname, '..', 'temp');
    fs.rmSync(tempBase, { recursive: true, force: true });
  }
};


const { Op } = require("sequelize");

exports.searchSnippets = async (req, res) => {
  try {
    const { title } = req.params;

    const whereClause = title && title.trim() !== ""
      ? { title: { [Op.iLike]: `%${title}%` } }
      : {};

    const snippets = await Snippet.findAll({
      where: whereClause,
      include: [
        { model: User, attributes: ['id', 'username'] },
        { model: Favorite },
      ],
      order: [['createdAt', 'DESC']],
    });

    const enrichedSnippets = snippets.map(snippet => {
      const snippetJson = snippet.toJSON();
      snippetJson.favoritesCount = snippet.Favorites.length;
      snippetJson.owner = snippetJson.User?.username || 'Unknown';
      delete snippetJson.Favorites;
      delete snippetJson.User;
      return snippetJson;
    });

    res.json(enrichedSnippets);
  } catch (error) {
    console.error('Search Snippets Error:', error);
    res.status(500).json({ message: 'Failed to search snippets' });
  }
};
