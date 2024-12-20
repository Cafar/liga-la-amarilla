// Configuración de Parse
Parse.initialize("ODRvdbKJuXMlb2KGoqC40RTm6aMIMR0cNyy2LLAJ", "N84W4tFPD9TFu6dsCIjddsJtNrZFLBc6ChshauCx");
Parse.serverURL = "https://parseapi.back4app.com";


// Inicializar Swiper
const swiper = new Swiper('.swiper', {
    loop: true,
    navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
    },
});

async function vote(roundNumber, team) {
    try {
        // Llamar a la Cloud Function con roundNumber y team
        const response = await Parse.Cloud.run("voteForTeam", {
            roundNumber: roundNumber, // Número del round
            team: team,               // Equipo (e.g., "teamRed")
        });

        // Marcar el round como votado en localStorage
        localStorage.setItem(`round${roundNumber}-voted`, true);

        // Deshabilitar los botones del round
        disableVoting(`round${roundNumber}`);

        window.location.reload();
    } catch (error) {
        console.error(`Error al votar: ${error.message}`);
    }
}

async function loadRoundsData() {
    try {
        const roundsData = await Parse.Cloud.run("getRoundsData");
        console.log("Datos recibidos de la Cloud Function:", roundsData);

        roundsData.forEach((round) => {
            const roundId = `round${round.round}`;
            const redPoints = document.getElementById(`${roundId}-red-points`);
            const bluePoints = document.getElementById(`${roundId}-blue-points`);
            const greenPoints = document.getElementById(`${roundId}-green-points`);
            const yellowPoints = document.getElementById(`${roundId}-yellow-points`);

            // Actualizar puntos y agregar animación
            updatePoints(redPoints, round.teamRed);
            updatePoints(bluePoints, round.teamBlue);
            updatePoints(greenPoints, round.teamGreen);
            updatePoints(yellowPoints, round.teamYellow);

            // Deshabilitar botones si ya votó
            if (localStorage.getItem(`${roundId}-voted`)) {
                disableVoting(roundId);
            }

            // Calcular y mostrar los ganadores por ronda
            displayGlobalWinner(roundsData);
        });
    } catch (error) {
        console.error(`Error al cargar los datos de los rounds: ${error.message}`);
    }
}

function updatePoints(element, newValue) {
    if (element.textContent !== `${newValue} votos`) {
        element.textContent = `${newValue} votos`;
        element.classList.add("updated"); // Agregar clase para animación
        setTimeout(() => element.classList.remove("updated"), 1000); // Remover después de 1 segundo
    }
}



// Función para deshabilitar botones de votación
function disableVoting(roundId) {
    const buttons = document.querySelectorAll(`#${roundId} button`);
    buttons.forEach((button) => {
        button.disabled = true;
        button.style.opacity = 0.5;
        button.style.cursor = "not-allowed";
    });
}

document.addEventListener("DOMContentLoaded", () => {
    const swiper = new Swiper('.swiper', {
        loop: true, // No repetir las diapositivas
        centeredSlides: true, // Centramos las diapositivas
        slidesPerView: 1, // Mostramos solo una diapositiva a la vez
        spaceBetween: 0, // Sin espacio entre las diapositivas
        navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
        },
    });

    // Restaurar el round activo al recargar la página
    const savedIndex = localStorage.getItem("currentRoundIndex");
    if (savedIndex !== null && !isNaN(savedIndex)) {
        swiper.slideToLoop(parseInt(savedIndex, 10), 0); // Navegar al índice guardado
    } else {
        swiper.slideTo(0, 0); // Ir a la primera diapositiva si no hay índice guardado
    }
    // Cargar los datos iniciales
    loadRoundsData();
});

function calculateGlobalWinner(roundsData) {
    const teamWins = {
        Rojo: 0,
        Azul: 0,
        Verde: 0,
        Naranja: 0,
    };

    // Calcular las victorias por equipo
    roundsData.forEach((round) => {
        const teams = {
            Rojo: round.teamRed || 0,
            Azul: round.teamBlue || 0,
            Verde: round.teamGreen || 0,
            Naranja: round.teamYellow || 0,
        };

        // Determinar el máximo de votos
        const maxVotes = Math.max(...Object.values(teams));
        const winningTeams = Object.keys(teams).filter(
            (team) => teams[team] === maxVotes && maxVotes > 0
        );

        // Incrementar el contador de victorias para los equipos ganadores
        winningTeams.forEach((team) => {
            teamWins[team]++;
        });
    });

    // Determinar el equipo con más victorias
    const maxWins = Math.max(...Object.values(teamWins));
    const globalWinners = Object.keys(teamWins).filter(
        (team) => teamWins[team] === maxWins
    );

    return { teamWins, globalWinners, maxWins };
}

function displayGlobalWinner(roundsData) {
    const globalWinnerText = document.getElementById("global-winner");
    const roundsWinnersContainer = document.getElementById("rounds-winners-grid");

    if (!globalWinnerText) {
        console.error("El elemento #global-winner no se encuentra en el DOM.");
        return;
    }

    if (!roundsWinnersContainer) {
        console.error("El elemento #rounds-winners-grid no se encuentra en el DOM.");
        return;
    }

  

    // Continuar con la lógica si hay al menos 6 rondas
    const { teamWins, globalWinners, maxWins } = calculateGlobalWinner(roundsData);

    if (globalWinners.length === 1) {
        globalWinnerText.textContent = `Equipo ${globalWinners[0]}: ${maxWins} rondas ganadas`;
        globalWinnerText.style.backgroundColor = getTeamColor(globalWinners[0]);
    } else if (globalWinners.length > 1) {
        globalWinnerText.textContent = `Empate entre: ${globalWinners.join(
            " y "
        )} (${maxWins} rondas ganadas cada uno)`;
        globalWinnerText.style.backgroundColor = "#3b3b3b"; // Gris neutro en caso de empate
    } else {
        globalWinnerText.textContent = "Sin ganador global";
        globalWinnerText.style.backgroundColor = "#3b3b3b";
    }

    const round6 = roundsData.find((round) => round.round === 6);

    if (!round6 || (round6.teamRed === 0 && round6.teamBlue === 0 && round6.teamGreen === 0 && round6.teamYellow === 0)) {
        globalWinnerText.textContent = "Aún no lo sabemos...";
        globalWinnerText.style.backgroundColor = "#3b3b3b"; // Fondo neutro
    }

    // Mostrar los ganadores por ronda en un grid
    roundsWinnersContainer.innerHTML = ""; // Limpiar contenido previo
    roundsData.forEach((round, index) => {
        const teams = {
            Rojo: round.teamRed || 0,
            Azul: round.teamBlue || 0,
            Verde: round.teamGreen || 0,
            Naranja: round.teamYellow || 0,
        };

        const maxVotes = Math.max(...Object.values(teams));
        const winningTeams = Object.keys(teams).filter(
            (team) => teams[team] === maxVotes && maxVotes > 0
        );

        let roundClass = "round-winner-none";
        if (winningTeams.length === 1) {
            roundClass = `round-winner-${winningTeams[0].toLowerCase()}`;
        }

        const roundWinnerHTML = `
            <p class="${roundClass}">
                <strong>Ronda ${index + 1}:</strong> ${
            winningTeams.length > 0
                ? winningTeams.join(" y ") + ` (${maxVotes} votos)`
                : "Sin ganador"
        }</p>
        `;
        roundsWinnersContainer.innerHTML += roundWinnerHTML;
    });
}



function getTeamColor(teamName) {
    switch (teamName.toLowerCase()) {
        case "rojo":
            return "#e74c3c";
        case "azul":
            return "#3498db";
        case "verde":
            return "#2ecc71";
        case "amarillo":
            return "#f1c40f";
        default:
            return "#3b3b3b"; // Gris neutro
    }
}
