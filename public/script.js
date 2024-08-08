document.addEventListener('DOMContentLoaded', () => {
    loadTeams();
    loadResults();
    document.getElementById('add-team-btn').addEventListener('click', addTeam);
    document.getElementById('remove-team-btn').addEventListener('click', removeTeam);
    document.getElementById('add-result-btn').addEventListener('click', addResult);
    document.getElementById('update-result-btn').addEventListener('click', updateResult);
});

const apiUrl = '/data';

// Load teams into select elements
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

// Load results into the results table
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
            <td>
                <button onclick="populateEditForm(${index})" class="edit-btn">Edit</button>
                <button onclick="deleteResult(${index})" class="delete-btn">Delete</button>
            </td>
        `;
        resultsTableBody.appendChild(row);
    });

    updateStandings(data); // Ensure standings are updated
}

// Populate result entry form with details for editing
async function populateEditForm(index) {
    const data = await fetchData();
    if (!data) return;

    const result = data.results[index];
    const team1Select = document.getElementById('team1-select');
    const team2Select = document.getElementById('team2-select');

    team1Select.innerHTML = '<option value="">Odaberite domačina</option>';
    team2Select.innerHTML = '<option value="">Odaberite gosta</option>';

    data.teams.forEach(team => {
        const option1 = document.createElement('option');
        option1.value = team;
        option1.textContent = team;
        if (team === result.team1) option1.selected = true;
        team1Select.appendChild(option1);

        const option2 = document.createElement('option');
        option2.value = team;
        option2.textContent = team;
        if (team === result.team2) option2.selected = true;
        team2Select.appendChild(option2);
    });

    document.getElementById('team1-score').value = result.score1;
    document.getElementById('team2-score').value = result.score2;

    document.getElementById('add-result-btn').style.display = 'none';
    document.getElementById('update-result-btn').style.display = 'block';
    document.getElementById('update-result-btn').dataset.index = index;
}

// Save the edited result
async function updateResult() {
    const index = document.getElementById('update-result-btn').dataset.index;
    const team1 = document.getElementById('team1-select').value;
    const team2 = document.getElementById('team2-select').value;
    const score1 = parseInt(document.getElementById('team1-score').value, 10);
    const score2 = parseInt(document.getElementById('team2-score').value, 10);

    if (team1 && team2 && !isNaN(score1) && !isNaN(score2)) {
        const data = await fetchData();
        if (!data) return;

        data.results[index] = { team1, team2, score1, score2 };

        await saveData(data);
        document.getElementById('team1-score').value = '';
        document.getElementById('team2-score').value = '';
        document.getElementById('add-result-btn').style.display = 'block';
        document.getElementById('update-result-btn').style.display = 'none';
        loadResults(); // Refresh results table
        updateStandings(data); // Ensure standings are updated
        alert('Result updated.');
    } else {
        alert('Please enter valid scores and teams.');
    }
}

// Delete a result
async function deleteResult(index) {
    const data = await fetchData();
    if (!data) return;

    data.results.splice(index, 1);
    await saveData(data);
    loadResults();
    alert('Result deleted.');
}

// Add a new team
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

// Remove a team
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

// Add a new result
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

// Fetch data from the server
async function fetchData() {
    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

// Save data to the server
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

// Update the standings table
function updateStandings(data) {
    const standings = {};

    // Initialize standings for all teams
    data.teams.forEach(team => {
        standings[team] = {
            played: 0,
            won: 0,
            drawn: 0,
            lost: 0,
            goalsFor: 0,
            goalsAgainst: 0,
            points: 0
        };
    });

    // Process results to update standings
    data.results.forEach(result => {
        const { team1, team2, score1, score2 } = result;

        standings[team1].played++;
        standings[team2].played++;
        standings[team1].goalsFor += score1;
        standings[team1].goalsAgainst += score2;
        standings[team2].goalsFor += score2;
        standings[team2].goalsAgainst += score1;

        if (score1 > score2) {
            standings[team1].won++;
            standings[team2].lost++;
            standings[team1].points += 3;
            standings[team2].points += 1;
        } else if (score1 < score2) {
            standings[team2].won++;
            standings[team1].lost++;
            standings[team2].points += 3;
            standings[team1].points += 1;
        }
        // No draw case as it's not allowed
    });

    // Calculate goal difference
    Object.keys(standings).forEach(team => {
        standings[team].goalDifference = standings[team].goalsFor - standings[team].goalsAgainst;
    });

    // Convert standings object to an array and sort
    const sortedStandings = Object.keys(standings).map(team => ({
        team,
        ...standings[team]
    })).sort((a, b) => {
        if (b.points === a.points) {
            return b.goalDifference - a.goalDifference; // Sort by goal difference if points are the same
        }
        return b.points - a.points; // Sort by points
    });

    // Render sorted standings
    const standingsTableBody = document.querySelector('#league-table tbody');
    standingsTableBody.innerHTML = '';

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
