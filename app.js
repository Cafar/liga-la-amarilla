// Inicialización de Parse
Parse.initialize("ODRvdbKJuXMlb2KGoqC40RTm6aMIMR0cNyy2LLAJ", "N84W4tFPD9TFu6dsCIjddsJtNrZFLBc6ChshauCx");
Parse.serverURL = "https://parseapi.back4app.com";

let currentRound = null;
let selectedTeam = null; // Equipo seleccionado para votar
let roundsData = {}; // Objeto para almacenar el estado de cada ronda

/**
 * Muestra el spinner de carga.
 */
function showLoadingSpinner() {
    document.getElementById("loading-spinner").style.display = "block";
}

/**
 * Oculta el spinner de carga.
 */
function hideLoadingSpinner() {
    document.getElementById("loading-spinner").style.display = "none";
}

/**
 * Carga las rondas desde Parse y verifica si el usuario ha votado.
 */
async function loadRounds() {
    showLoadingSpinner(); // Mostrar el spinner al iniciar la carga

    try {
        const userId = Parse.User.current() ? Parse.User.current().id : getClientId();

        // Obtener datos de las rondas
        const response = await Parse.Cloud.run("getRoundsData");

        if (!response || response.length === 0) {
            document.getElementById("game-buttons").innerHTML = "<p>No hay rondas disponibles.</p>";
            return;
        }

        // Verificar el estado de votación para cada ronda
        for (const round of response) {
            const voteResponse = await Parse.Cloud.run("checkUserVote", {
                roundNumber: round.round,
                userId: userId,
            });

            // Almacenar datos de la ronda
            roundsData[round.round] = {
                Unlocked: round.Unlocked,
                hasVoted: voteResponse.hasVoted,
                team: voteResponse.team,
            };
        }

        renderRounds(response); // Renderizar los botones
    } catch (error) {
        console.error("Error al cargar las rondas:", error.message);
        document.getElementById("game-buttons").innerHTML = `
            <p>Error al cargar las rondas. Por favor, inténtalo más tarde.</p>
        `;
    } finally {
        hideLoadingSpinner(); // Ocultar el spinner al terminar la carga
    }
}

/**
 * Renderiza los botones de las rondas.
 * @param {Array} rounds - Datos de las rondas.
 */
function renderRounds(rounds) {
    const gameButtonsContainer = document.getElementById("game-buttons");
    gameButtonsContainer.innerHTML = ""; // Limpiar el contenedor

    rounds.forEach((round) => {
        const button = document.createElement("button");
        button.id = `game${round.round}`;
        button.classList.add("game-btn");
        button.textContent = `Round ${round.round}`;

        // Habilitar o deshabilitar según el estado de "Unlocked"
        if (round.Unlocked) {
            button.disabled = false;
            button.onclick = () => selectGame(round.round);
        } else {
            button.disabled = true;
        }

        gameButtonsContainer.appendChild(button);
    });
}

/**
 * Selecciona un juego y muestra la pantalla de votación.
 * @param {number} roundNumber - El número del juego seleccionado.
 */
function selectGame(roundNumber) {
    currentRound = roundNumber;

    // Ocultar la selección de juegos y mostrar la votación
    document.getElementById("game-selection").style.display = "none";
    document.getElementById("game-voting").style.display = "block";

    // Actualizar el título de la ronda
    const gameTitle = document.getElementById("game-title");
    gameTitle.textContent = `Round ${roundNumber} - Vota por tu equipo`;

    // Mostrar el mensaje o los botones según el estado
    const roundData = roundsData[roundNumber];
    if (roundData.hasVoted) {
        showVoteMessage(roundData.team);
    } else {
        showVoteButtons();
    }
}

/**
 * Muestra los botones de votación.
 */
function showVoteButtons() {
    document.querySelector(".cards").innerHTML = `
        <div class="card red">
            <h3>Equipo Rojo</h3>
            <button onclick="confirmVote('teamRed')">Votar</button>
        </div>
        <div class="card blue">
            <h3>Equipo Azul</h3>
            <button onclick="confirmVote('teamBlue')">Votar</button>
        </div>
    `;
}

/**
 * Muestra un mensaje indicando que ya se ha votado.
 * @param {string} team - El equipo al que se votó ("teamRed" o "teamBlue").
 */
function showVoteMessage(team) {
    const teamName = team === "teamRed" ? "Rojo" : "Azul";
    document.querySelector(".cards").innerHTML = `
        <div class="vote-message">
            <h3>Ya has votado al equipo ${teamName}.</h3>
        </div>
    `;
}

/**
 * Muestra el modal de confirmación para votar.
 * @param {string} team - El equipo seleccionado ("teamRed" o "teamBlue").
 */
function confirmVote(team) {
    selectedTeam = team;
    const teamName = team === "teamRed" ? "Equipo Rojo" : "Equipo Azul";
    document.getElementById("selected-team").textContent = teamName;

    // Mostrar el modal
    document.getElementById("vote-confirm-modal").style.display = "flex";
}

/**
 * Cierra el modal de confirmación.
 */
function closeModal() {
    selectedTeam = null;
    document.getElementById("vote-confirm-modal").style.display = "none";
}

/**
 * Envía el voto seleccionado.
 */
async function submitVote() {
    if (!selectedTeam || !currentRound) {
        alert("Ocurrió un error. Intenta de nuevo.");
        return;
    }

    const userId = Parse.User.current() ? Parse.User.current().id : getClientId();

    try {
        await Parse.Cloud.run("voteForTeam", {
            roundNumber: currentRound,
            team: selectedTeam,
            userId: userId,
        });

        closeModal(); // Cerrar el modal
        roundsData[currentRound].hasVoted = true; // Actualizar estado local
        roundsData[currentRound].team = selectedTeam;
        showVoteMessage(selectedTeam); // Mostrar mensaje de votación
    } catch (error) {
        console.error("Error al votar:", error.message);
        alert("Hubo un error al registrar tu voto. Inténtalo de nuevo.");
        closeModal();
    }
}

/**
 * Genera un identificador único para el cliente si no está autenticado.
 */
function getClientId() {
    let clientId = localStorage.getItem("clientId");
    if (!clientId) {
        clientId = "anon_" + Math.random().toString(36).substr(2, 9);
        localStorage.setItem("clientId", clientId);
    }
    return clientId;
}

/**
 * Regresa a la pantalla de selección de juegos.
 */
function backToSelection() {
    currentRound = null;

    // Ocultar la votación y mostrar la selección
    document.getElementById("game-voting").style.display = "none";
    document.getElementById("game-selection").style.display = "block";
}

// Cargar las rondas al cargar la página
document.addEventListener("DOMContentLoaded", loadRounds);
