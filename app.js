// Configuración de Parse
Parse.initialize("ODRvdbKJuXMlb2KGoqC40RTm6aMIMR0cNyy2LLAJ", "hZkEJwwVbgfHO5d7o54e2yTEE7fOmH8SFrLted1g");
Parse.serverURL = "https://parseapi.back4app.com";

// Inicializar Swiper
const swiper = new Swiper('.swiper', {
    loop: true,
    navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
    },
});

// Función para votar
async function vote(roundName, team, roundId) {
    const Round = Parse.Object.extend(roundName);
    const query = new Parse.Query(Round);

    try {
        // Obtener el registro del round
        const round = await query.first();
        if (round) {
            // Incrementar puntos del equipo
            round.increment(team, 1);
            await round.save();

            // Guardar el estado de votación en localStorage
            localStorage.setItem(`${roundId}-voted`, true);

            // Deshabilitar botones
            disableVoting(roundId);

            alert(`¡Votaste por el equipo seleccionado!`);
        }
    } catch (error) {
        console.error(`Error al votar: ${error.message}`);
    }
}

async function loadRoundsData() {
    try {
        const roundsData = await Parse.Cloud.run("getRoundsData");

        // Iterar sobre los datos recibidos y cargar en la interfaz
        roundsData.forEach((round) => {
            const roundId = `round${round.name.replace("Round", "")}`;
            document.getElementById(`${roundId}-red-points`).textContent = `${round.teamRed} puntos`;
            document.getElementById(`${roundId}-blue-points`).textContent = `${round.teamBlue} puntos`;
            document.getElementById(`${roundId}-green-points`).textContent = `${round.teamGreen} puntos`;
            document.getElementById(`${roundId}-yellow-points`).textContent = `${round.teamYellow} puntos`;
        });
    } catch (error) {
        console.error(`Error al cargar los datos de los rounds: ${error.message}`);
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
