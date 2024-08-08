document.addEventListener('DOMContentLoaded', () => {
    loadTeams();
    loadResults();
    document.getElementById('add-team-btn').addEventListener('click', addTeam);
    document.getElementById('remove-team-btn').addEventListener('click', removeTeam);
    document.getElementById('add-result-btn').addEventListener('click', addResult);
    document.getElementById('update-result-btn').addEventListener('click', updateResult);
});

const apiUrl = '/data';

async function fetchData() {
    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

async function saveData(data) {
    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        console.log('Data saved successfully');
    } catch (error) {
        console.error('Error saving data:', error);
    }
}

async function loadTeams() {
    const data = await fetchData();
    if (!data) return;

    const teams = data.teams;
    const teamSelects = document.querySelectorAll('#team1-select, #team2-select');
    const removeSelect = document.getElementById('remove-team-select');

    teamSelects.forEach(select => {
        select.innerHTML = '<option value="">Odaberite igrača</option>';
        teams.forEach(team => {
            const option = document.createElement('option');
            option.value = team;
            option.textContent = team;
            select.appendChild(option);
        });
    });

    removeSelect.innerHTML = '<option value="">Odaberite igrača</option>';
    teams.forEach(team => {
        const option = document.createElement('option');
        option.value = team;
        option.textContent = team;
        removeSelect.appendChild(option);
    });

    updateStandings(data); // Update standings after loading teams
}

async function loadResults() {
    const data = await fetchData();
    if (!data) return;

    const results = data.results;
    const resultsTableBody = document.querySelector('#results-table tbody');
    resultsTableBody.innerHTML = '';
    results.forEach((result, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${result.team1}</td>
            <td>${result.score1}</td>
            <td>${result.score2}</td>
            <td>${result.team2}</td>
           
        `;
        resultsTableBody.appendChild(row);
    });

    updateStandings(data); // Update standings after loading results
}

async function addTeam() {
    const teamName = document.getElementById('team-name').value.trim();
    if (teamName) {
        const data = await fetchData();
        if (!data) return;

        if (!data.teams.includes(teamName)) {
            data.teams.push(teamName);
            await saveData(data);
            loadTeams();
            document.getElementById('team-name').value = '';
            alert(`Dodan igrač: ${teamName}`);
        } else {
            alert('Igrač već postoji.');
        }
    } else {
        alert('Unesite ime igrača.');
    }
}

async function removeTeam() {
    const teamSelect = document.getElementById('remove-team-select');
    const selectedTeam = teamSelect.value;
    if (selectedTeam) {
        const data = await fetchData();
        if (!data) return;

        data.teams = data.teams.filter(team => team !== selectedTeam);
        data.results = data.results.filter(result => result.team1 !== selectedTeam && result.team2 !== selectedTeam);
        await saveData(data);
        loadTeams();
        loadResults();
        alert(`Uklonjen igrač: ${selectedTeam}`);
    } else {
        alert('Molimo odaberite igrača.');
    }
}

async function addResult() {
    const team1 = document.getElementById('team1-select').value;
    const team2 = document.getElementById('team2-select').value;
    const score1 = parseInt(document.getElementById('team1-score').value, 10);
    const score2 = parseInt(document.getElementById('team2-score').value, 10);

    if (team1 && team2 && !isNaN(score1) && !isNaN(score2)) {
        const data = await fetchData();
        if (!data) return;

        data.results.push({ team1, team2, score1, score2 });
        await saveData(data);
        document.getElementById('team1-score').value = '';
        document.getElementById('team2-score').value = '';
        loadResults();
        alert(`Dodan rezultat: ${team1} ${score1} - ${score2} ${team2}`);
    } else {
        alert('Please fill out all fields.');
    }
}

function updateResult() {
    // Implement update result logic here
    alert('Result updated.');
}

function editResult(index) {
    // Implement edit result logic here
    alert(`Editing result ${index}`);
}

function deleteResult(index) {
    // Implement delete result logic here
    alert(`Deleted result ${index}`);
}

function toggleNav() {
    const nav = document.getElementById('mobile-nav');
    nav.classList.toggle('open');
    document.body.style.overflow = nav.classList.contains('open') ? 'hidden' : 'auto';
}

function updateStandings(data) {
    const standingsTableBody = document.querySelector('#league-table tbody');
    standingsTableBody.innerHTML = '';

    const teams = data.teams;
    const results = data.results;

    const standings = {};

    // Initialize standings for all teams
    teams.forEach(team => {
        standings[team] = {
            played: 0,
            won: 0,
            lost: 0,
            points: 0,
            goalsFor: 0,
            goalsAgainst: 0,
            goalDifference: 0
        };
    });

    // Calculate results
    results.forEach(result => {
        const { team1, team2, score1, score2 } = result;

        standings[team1].played += 1;
        standings[team2].played += 1;
        standings[team1].goalsFor += score1;
        standings[team1].goalsAgainst += score2;
        standings[team2].goalsFor += score2;
        standings[team2].goalsAgainst += score1;

        if (score1 > score2) {
            standings[team1].won += 1;
            standings[team2].lost += 1;
            standings[team1].points += 3;
        } else if (score1 < score2) {
            standings[team1].lost += 1;
            standings[team2].won += 1;
            standings[team2].points += 3;
        } else {
            standings[team1].points += 1;
            standings[team2].points += 1;
        }
    });

    // Calculate goal difference
    Object.keys(standings).forEach(team => {
        standings[team].goalDifference = standings[team].goalsFor - standings[team].goalsAgainst;
    });

    // Convert standings object to an array and sort by points and goal difference
    const sortedStandings = Object.keys(standings).map(team => ({
        team,
        ...standings[team]
    })).sort((a, b) => {
        if (b.points === a.points) {
            return b.goalDifference - a.goalDifference;
        }
        return b.points - a.points;
    });

    // Render sorted standings
    sortedStandings.forEach(entry => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${entry.team}</td>
            <td>${entry.played}</td>
            <td>${entry.won}</td>
            <td>${entry.lost}</td>
            <td>${entry.goalsFor}</td>
            <td>${entry.goalsAgainst}</td>
            <td>${entry.goalDifference}</td>
            <td>${entry.points}</td>
        `;
        standingsTableBody.appendChild(row);
    });
}

function toggleNav() {
    const mobileNav = document.getElementById('mobile-nav');
    mobileNav.classList.toggle('open');
}

// Close the mobile nav when clicking outside
document.addEventListener('click', (event) => {
    const mobileNav = document.getElementById('mobile-nav');
    if (!mobileNav.contains(event.target) && !event.target.matches('.nav-toggle')) {
        mobileNav.classList.remove('open');
    }
});

