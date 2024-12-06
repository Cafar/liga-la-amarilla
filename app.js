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

// Función para cargar puntos de un round
async function loadPoints(roundName, roundId) {
    const Round = Parse.Object.extend(roundName);
    const query = new Parse.Query(Round);

    try {
        // Obtener el registro del round
        const round = await query.first();
        if (round) {
            document.getElementById(`${roundId}-red-points`).textContent = round.get("teamRed") || 0;
            document.getElementById(`${roundId}-blue-points`).textContent = round.get("teamBlue") || 0;
            document.getElementById(`${roundId}-green-points`).textContent = round.get("teamGreen") || 0;
            document.getElementById(`${roundId}-yellow-points`).textContent = round.get("teamYellow") || 0;

            // Deshabilitar botones si ya votó
            if (localStorage.getItem(`${roundId}-voted`)) {
                disableVoting(roundId);
            }
        }
    } catch (error) {
        console.error(`Error al cargar puntos de ${roundName}: ${error.message}`);
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

// Cargar puntos al inicializar la página
document.addEventListener("DOMContentLoaded", () => {
    // Cargar los puntos para todos los rounds
    for (let i = 1; i <= 5; i++) {
        loadPoints(`Round${i}`, `round${i}`);
    }
});
