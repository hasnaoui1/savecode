module.exports = (sequelize, DataTypes) => {
  const Favorite = sequelize.define('Favorite', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    snippetId: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  });

  Favorite.associate = (models) => {
    Favorite.belongsTo(models.User, {
      foreignKey: {
        name: 'userId',
        allowNull: false
      },
      onDelete: 'CASCADE'
    });

    Favorite.belongsTo(models.Snippet, {
      foreignKey: {
        name: 'snippetId',
        allowNull: false
      },
      onDelete: 'CASCADE'
    });
  };

  return Favorite;
};
