// server.js
const express = require('express');
const bodyParser = require('body-parser');
const { Team, Match } = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(express.static('public'));

app.get('/data', async (req, res) => {
    const teams = await Team.findAll();
    const results = await Match.findAll();
    res.json({ teams, results });
});

app.post('/data', async (req, res) => {
    const { teams, results } = req.body;
    
    await Team.destroy({ where: {} });
    await Match.destroy({ where: {} });

    for (let team of teams) {
        await Team.create(team);
    }

    for (let match of results) {
        await Match.create(match);
    }

    res.json({ success: true });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
