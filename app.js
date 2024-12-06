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

        alert(response.message);
    } catch (error) {
        console.error(`Error al votar: ${error.message}`);
        alert("Hubo un problema al registrar tu voto.");
    }
}

async function loadRoundsData() {
    try {
        // Llamar a la Cloud Function
        const roundsData = await Parse.Cloud.run("getRoundsData");
        console.log("Datos recibidos de la Cloud Function:", roundsData);

        // Iterar sobre los datos recibidos y cargar en la interfaz
        roundsData.forEach((round) => {
            const roundId = `round${round.round}`; // Crear el ID del round (e.g., round1, round2)

            console.log(`Procesando roundId: ${roundId}`); // Depuración

            // Actualizar los puntos en los elementos correspondientes
            document.getElementById(`${roundId}-red-points`).textContent = `${round.teamRed} puntos`;
            document.getElementById(`${roundId}-blue-points`).textContent = `${round.teamBlue} puntos`;
            document.getElementById(`${roundId}-green-points`).textContent = `${round.teamGreen} puntos`;
            document.getElementById(`${roundId}-yellow-points`).textContent = `${round.teamYellow} puntos`;

            // Deshabilitar los botones si ya votó
            if (localStorage.getItem(`${roundId}-voted`)) {
                disableVoting(roundId);
            }
        });
    } catch (error) {
        console.error(`Error 2: ${error.message}`);
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
    loadRoundsData();
});
