// db.js
const { Sequelize, DataTypes } = require('sequelize');

// Update this path to the persistent disk location
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: '/opt/render/project/src/db/database.sqlite'
});

const Team = sequelize.define('Team', {
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    played: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    won: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    lost: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    setsWon: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    setsLost: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    setDifference: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    points: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    }
});

const Match = sequelize.define('Match', {
    team1: {
        type: DataTypes.STRING,
        allowNull: false
    },
    team2: {
        type: DataTypes.STRING,
        allowNull: false
    },
    team1Score: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    team2Score: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
});

// Synchronize the models with the database
sequelize.sync();

module.exports = { Team, Match, sequelize };
