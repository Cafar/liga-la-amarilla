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

            // Calcular y mostrar el total de ganadores
            const teamWins = calculateTotalWins(roundsData);
            displayTotalWins(teamWins);
            // Deshabilitar botones si ya votó
            if (localStorage.getItem(`${roundId}-voted`)) {
                disableVoting(roundId);
            }
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


function calculateTotalWins(roundsData) {
    const teamWins = {
        teamRed: 0,
        teamBlue: 0,
        teamGreen: 0,
        teamYellow: 0,
    };

    // Iterar sobre cada ronda para calcular ganadores
    roundsData.forEach((round) => {
        const teams = {
            teamRed: round.teamRed || 0,
            teamBlue: round.teamBlue || 0,
            teamGreen: round.teamGreen || 0,
            teamYellow: round.teamYellow || 0,
        };

        // Ignorar rondas con votos totales iguales a 0
        const totalVotes = Object.values(teams).reduce((sum, votes) => sum + votes, 0);
        if (totalVotes === 0) {
            return; // Saltar esta ronda
        }

        // Determinar el máximo de votos
        const maxVotes = Math.max(...Object.values(teams));
        const winners = Object.keys(teams).filter((team) => teams[team] === maxVotes);

        // Sumar una "X" a cada equipo ganador
        winners.forEach((team) => {
            teamWins[team]++;
        });
    });

    return teamWins;
}

function displayTotalWins(teamWins) {
    const winnerContainer = document.getElementById("total-wins");

    // Construir el HTML con el recuento de "X" para cada equipo
    let resultHTML = '<h3>Resultados Totales:</h3>';
    Object.entries(teamWins).forEach(([team, wins]) => {
        const teamName = team.replace('team', 'Equipo '); // Formatear el nombre
        if (wins > 0) {
            resultHTML += `<p>${teamName}: ${'X '.repeat(wins)}</p>`;
        }
    });

    winnerContainer.innerHTML = resultHTML;
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
        on: {
            slideChange: function () {
                const activeIndex = this.activeIndex; // Guardar el índice activo
                localStorage.setItem("currentRoundIndex", activeIndex);
            },
        },
    });

    // Restaurar el round activo al recargar la página
    const savedIndex = localStorage.getItem("currentRoundIndex");
    if (savedIndex !== null) {
        swiper.slideTo(parseInt(savedIndex, 10), 0);
    }

    // Cargar los datos iniciales
    loadRoundsData();
});
