document.addEventListener('DOMContentLoaded', () => {
    loadTeams();
    loadResults();
    document.getElementById('add-team-btn').addEventListener('click', addTeam);
    document.getElementById('remove-team-btn').addEventListener('click', removeTeam);
    document.getElementById('add-result-btn').addEventListener('click', addResult);
    document.getElementById('update-result-btn').addEventListener('click', updateResult);
});

const apiUrl = '/data';

function toggleNav() {
    const mobileNav = document.getElementById('mobile-nav');
    const navToggle = document.querySelector('.nav-toggle');

    // Toggle the 'open' class on the mobile navigation
    mobileNav.classList.toggle('open');

    // Toggle the 'active' class on the nav toggle button for a visual effect
    navToggle.classList.toggle('active');

    // Add a click event listener to the document to close the nav when clicking outside of it
    if (mobileNav.classList.contains('open')) {
        document.addEventListener('click', closeNavOnClickOutside);
    } else {
        document.removeEventListener('click', closeNavOnClickOutside);
    }
}

function closeNavOnClickOutside(event) {
    const mobileNav = document.getElementById('mobile-nav');
    const navToggle = document.querySelector('.nav-toggle');

    // Check if the click was outside the navigation or on a navigation link
    if (!mobileNav.contains(event.target) && !navToggle.contains(event.target)) {
        mobileNav.classList.remove('open');
        navToggle.classList.remove('active');

        // Remove the event listener after the nav is closed
        document.removeEventListener('click', closeNavOnClickOutside);
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
            option.value = team.name;
            option.textContent = team.name;
            select.appendChild(option);
        });
    });

    removeSelect.innerHTML = '<option value="">Odaberite igrača</option>';
    teams.forEach(team => {
        const option = document.createElement('option');
        option.value = team.name;
        option.textContent = team.name;
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
            <td>${result.team1Score}</td>
            <td>${result.team2Score}</td>
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
        option1.value = team.name;
        option1.textContent = team.name;
        if (team.name === result.team1) option1.selected = true;
        team1Select.appendChild(option1);

        const option2 = document.createElement('option');
        option2.value = team.name;
        option2.textContent = team.name;
        if (team.name === result.team2) option2.selected = true;
        team2Select.appendChild(option2);
    });

    document.getElementById('team1-score').value = result.team1Score;
    document.getElementById('team2-score').value = result.team2Score;

    document.getElementById('add-result-btn').style.display = 'none';
    document.getElementById('update-result-btn').style.display = 'block';
    document.getElementById('update-result-btn').dataset.index = index;
}

async function updateResult() {
    const index = document.getElementById('update-result-btn').dataset.index;
    const team1 = document.getElementById('team1-select').value;
    const team2 = document.getElementById('team2-select').value;
    const team1Score = parseInt(document.getElementById('team1-score').value, 10);
    const team2Score = parseInt(document.getElementById('team2-score').value, 10);

    if (team1 && team2 && !isNaN(team1Score) && !isNaN(team2Score)) {
        const data = await fetchData();
        if (!data) return;

        data.results[index] = { team1, team2, team1Score, team2Score };

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

async function deleteResult(index) {
    const data = await fetchData();
    if (!data) return;

    data.results.splice(index, 1);
    await saveData(data);
    loadResults();
    alert('Result deleted.');
}

async function addTeam() {
    const teamName = document.getElementById('team-name').value.trim();
    if (teamName) {
        const data = await fetchData();
        if (!data) return;

        if (!data.teams.some(team => team.name === teamName)) {
            data.teams.push({ name: teamName });
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
    const teamName = document.getElementById('remove-team-select').value;
    if (teamName) {
        const data = await fetchData();
        if (!data) return;

        data.teams = data.teams.filter(team => team.name !== teamName);
        data.results = data.results.filter(result => result.team1 !== teamName && result.team2 !== teamName);

        await saveData(data);
        loadTeams();
        loadResults();
        alert(`Obrisan igrač: ${teamName}`);
    } else {
        alert('Odaberite igrača za brisanje.');
    }
}

async function addResult() {
    const team1 = document.getElementById('team1-select').value;
    const team2 = document.getElementById('team2-select').value;
    const team1Score = parseInt(document.getElementById('team1-score').value, 10);
    const team2Score = parseInt(document.getElementById('team2-score').value, 10);

    if (team1 && team2 && !isNaN(team1Score) && !isNaN(team2Score)) {
        const data = await fetchData();
        if (!data) return;

        data.results.push({ team1, team2, team1Score, team2Score });
        await saveData(data);
        document.getElementById('team1-score').value = '';
        document.getElementById('team2-score').value = '';
        loadResults();
        alert(`Dodan rezultat: ${team1} ${team1Score} - ${team2Score} ${team2}`);
    } else {
        alert('Please fill out all fields.');
    }
}

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

function updateStandings(data) {
    const standings = {};

    // Initialize standings for all teams
    data.teams.forEach(team => {
        standings[team.name] = {
            played: 0,
            won: 0,
            lost: 0,
            goalsFor: 0,
            goalsAgainst: 0,
            points: 0
        };
    });

    // Process results to update standings
    data.results.forEach(result => {
        const { team1, team2, team1Score, team2Score } = result;

        standings[team1].played++;
        standings[team2].played++;
        standings[team1].goalsFor += team1Score;
        standings[team1].goalsAgainst += team2Score;
        standings[team2].goalsFor += team2Score;
        standings[team2].goalsAgainst += team1Score;

        if (team1Score > team2Score) {
            standings[team1].won++;
            standings[team2].lost++;
            standings[team1].points += 3; // 3 points for a win
            standings[team2].points += 1; // 1 point for a loss
        } else if (team1Score < team2Score) {
            standings[team2].won++;
            standings[team1].lost++;
            standings[team2].points += 3; // 3 points for a win
            standings[team1].points += 1; // 1 point for a loss
        }
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



