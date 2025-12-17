import React, { useEffect, useState, useContext, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import EngagementBar from "../components/EngagementBar";
import SnippetInfo from "../components/SnippetInfo";
import TextEditor from "../components/TextEditor";
import axiosInstance from "../services/axiosInstance";
import { useSnippets } from "../services/SnippetContext";
import { SocketContext } from "../services/socketContext";
import CommentsSection from "../components/CommentSection";

export default function CreatePost() {
  const { snippetId } = useParams();
  const navigate = useNavigate();
  const [text, setText] = useState("");
  const [response, setResponse] = useState(null); // Init as null to distinguish from empty string
  const { snippet, fetchSnippetById, resetSnippet } = useSnippets();
  const { socket, isCollaborating, collaboratingSnippetId } =
    useContext(SocketContext);
  const [isThinking, setIsThinking] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false); // New execution state
  const [executionError, setExecutionError] = useState(null); // New error state
  const [comments, setComments] = useState([]);
  const [isCreating, setIsCreating] = useState(false);

  
  const createSnippetIfNeeded = async () => {
    console.log("createSnippetIfNeeded called, snippetId:", snippetId);
    if (snippetId === undefined || snippetId === null) {
      if (isCreating) {
        console.log("Already creating snippet, skipping");
        return;
      }
      const token = localStorage.getItem("token");
     
      setIsCreating(true);
      setText("");
      setResponse(null);
      setComments([]);
      resetSnippet();
      try {
        console.log("Making POST request to /createS");
        const data = await axiosInstance.post("/createS");
        console.log("Response from /createS:", data);
        const newSnippetId = data.snippetId || data.id;
        if (newSnippetId) {
          console.log("Navigating to /create/", newSnippetId);
          navigate(`/create/${newSnippetId}`, { replace: true });
        } else {
          console.error("No snippetId in response:", data);
        }
      } catch (err) {
        console.error("Failed to create snippet:", err.message);
      } finally {
        setIsCreating(false);
      }
    } else {
      console.log("snippetId exists, skipping creation:", snippetId);
    }
  };

  useEffect(() => {
    console.log("First useEffect running, snippetId:", snippetId);
    if (!isCreating) {
      createSnippetIfNeeded();
      if (snippetId) {
        fetchSnippetById(snippetId);
      }
    }
  }, [snippetId, navigate, fetchSnippetById, isCreating]);

  useEffect(() => {
    if (!socket || !snippetId) return;

    socket.on("codeUpdate", (code) => {
      if (isCollaborating && collaboratingSnippetId === snippetId) {
        console.log(`Received codeUpdate: ${code}`);
        setText(code);
        setComments(snippet?.Comments || []);
      }
    });

    return () => {
      socket.off("codeUpdate");
    };
  }, [socket, snippetId, isCollaborating, collaboratingSnippetId, snippet]);

  useEffect(() => {
    if (snippet && snippet.code && text !== snippet.code) {
      console.log("Updating text from snippet:", snippet.code);
      setText(snippet.code);
    }
    if (snippet?.Comments) {
      setComments(snippet.Comments);
    }
  }, [snippet]);

  const handleTextChange = (newText) => {
    setText(newText);
    if (isCollaborating && collaboratingSnippetId === snippetId) {
      console.log(`Emitting codeChange: ${newText}`);
      socket.emit("codeChange", { snippetId, code: newText });
    }
  };

  const saveAndRun = async () => {
    if (!snippetId) return;

    setIsExecuting(true);
    setExecutionError(null);
    setResponse(null);

    try {
      console.log("Saving code for snippet:", snippetId);
      await axiosInstance.put(`/updateS/${snippetId}`, { code: text });
      console.log("Executing snippet:", snippetId);
      const data = await axiosInstance.post("/executeS", { snippetId });
      setResponse(data.output);
      // here
      console.log("Fetching snippet after saveAndRun:", snippetId);
      const newSnippet = await fetchSnippetById(snippetId);
      console.log("Fetched snippet:", newSnippet);
    } catch (err) {
      console.error("Error in saveAndRun:", err.message);
      setExecutionError(err.message || "Failed to execute snippet");
    } finally {
      setIsExecuting(false);
    }
  };

  const handleStreamPrompt = (prompt) => {
    setIsThinking(true);
    setIsStreaming(true);
    setText("");

    const commentContext = comments
      .map((c) => `${c.User?.username || "Anonymous"}: ${c.content}`)
      .join("\n");
    const fullPrompt = `User Prompt: ${prompt}\n\nComments Context:\n${
      commentContext || "No comments available."
    }`;

    const eventSource = new EventSource(
      `http://localhost:3002/ai-assistant-stream?prompt=${encodeURIComponent(
        fullPrompt
      )}`
    );

    let fullText = "";
    let isFirstChunk = true;

    eventSource.onmessage = (event) => {
      if (event.data === "[DONE]") {
        eventSource.close();
        setIsThinking(false);
        setIsStreaming(false);
      } else {
        try {
          const data = JSON.parse(event.data);
          if (data.content) {
            if (isFirstChunk) {
              setIsThinking(false);
              isFirstChunk = false;
            }
            fullText += data.content;
            setText(fullText);
          } else if (data.error) {
            console.error("Stream Error:", data.error);
            setIsThinking(false);
            setIsStreaming(false);
            eventSource.close();
          }
        } catch (err) {
          console.error("SSE Parse Error:", err);
        }
      }
    };

    eventSource.onerror = (err) => {
      console.error("SSE Error:", err);
      eventSource.close();
      setIsThinking(false);
      setIsStreaming(false);
    };
  };

  return (
    <div className="min-h-screen bg-[#0e0e10] pt-1 px-6 max-w-full mx-auto">
      {snippetId === undefined && isCreating ? (
        <div>Creating snippet...</div>
      ) : (
        <>
          <SnippetInfo snippetId={snippetId} />
          <TextEditor
            text={text}
            onChange={handleTextChange}
            isThinking={isThinking}
            isStreaming={isStreaming}
          />
          <EngagementBar
            onRun={saveAndRun}
            onAIPrompt={handleStreamPrompt}
            initialLikes={snippet?.favoritesCount}
            snippetOwnerId={snippet?.userId}
          />
          
          {/* Execution Status & Output */}
          {isExecuting && (
            <div className="mt-4 bg-[#1a1a1d] text-blue-400 p-4 rounded-lg animate-pulse">
              Running code...
            </div>
          )}
          
          {executionError && (
            <div className="mt-4 bg-red-900/50 border border-red-500 text-red-100 p-4 rounded-lg">
              <strong>Error:</strong> {executionError}
            </div>
          )}

          {response !== null && !isExecuting && !executionError && (
            <div className="mt-4 bg-black text-white p-4 rounded-lg border border-gray-800">
              <strong>Output:</strong>
              <pre className="mt-2 whitespace-pre-wrap font-mono">
                {response === "" ? <span className="text-gray-500 italic">No output</span> : response}
              </pre>
            </div>
          )}
          
          <CommentsSection comments={comments} setComments={setComments} />
        </>
      )}
    </div>
  );
}
