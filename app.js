// Configuración del SDK de Parse
Parse.initialize("ODRvdbKJuXMlb2KGoqC40RTm6aMIMR0cNyy2LLAJ", "hZkEJwwVbgfHO5d7o54e2yTEE7fOmH8SFrLted1g");
Parse.serverURL = "https://parseapi.back4app.com";

let currentSlide = 0;

// Función para votar
async function vote(roundName, team, roundId) {
    const Round = Parse.Object.extend(roundName);
    const query = new Parse.Query(Round);

    try {
        // Obtén el registro del round
        const round = await query.first();
        if (round) {
            // Incrementa los puntos del equipo seleccionado
            round.increment(team, 1);
            await round.save();

            // Oculta los botones de ese round
            document.getElementById(`${roundId}-buttons`).style.display = "none";

            // Muestra los puntos actualizados
            loadPoints(roundName, roundId);

            alert(`¡Votaste por el equipo seleccionado!`);
        } else {
            console.error(`No se encontró la clase ${roundName}`);
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
        const round = await query.first();
        if (round) {
            document.getElementById(`${roundId}-red-points`).textContent = round.get("teamRed") || 0;
            document.getElementById(`${roundId}-blue-points`).textContent = round.get("teamBlue") || 0;
            document.getElementById(`${roundId}-green-points`).textContent = round.get("teamGreen") || 0;
            document.getElementById(`${roundId}-yellow-points`).textContent = round.get("teamYellow") || 0;
        }
    } catch (error) {
        console.error(`Error al cargar puntos de ${roundName}: ${error.message}`);
    }
}

// Función para inicializar todos los rounds
async function initializeRounds() {
    for (let i = 1; i <= 5; i++) {
        loadPoints(`Round${i}`, `round${i}`);
    }
}

// Función de carrusel
function updateCarousel() {
    const wrapper = document.querySelector(".carousel-wrapper");
    wrapper.style.transform = `translateX(-${currentSlide * 100}%)`;
}

function nextSlide() {
    const totalSlides = document.querySelectorAll(".round").length;
    currentSlide = (currentSlide + 1) % totalSlides;
    updateCarousel();
}

function prevSlide() {
    const totalSlides = document.querySelectorAll(".round").length;
    currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
    updateCarousel();
}

// Cargar puntos al iniciar la página
document.addEventListener("DOMContentLoaded", () => {
    initializeRounds();
});
