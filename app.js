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

        alert("Has votado al equipo:", team);

        window.location.reload();
    } catch (error) {
        console.error(`Error al votar: ${error.message}`);
        alert("Hubo un problema al registrar tu voto.");
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
        });
    } catch (error) {
        console.error(`Error al cargar los datos de los rounds: ${error.message}`);
    }
}

function updatePoints(element, newValue) {
    if (element.textContent !== `${newValue} puntos`) {
        element.textContent = `${newValue} puntos`;
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
        loop: false, // No ciclar las diapositivas
        centeredSlides: true, // Centramos las diapositivas
        slidesPerView: 1, // Mostramos solo una diapositiva a la vez
        spaceBetween: 10, // Espaciado entre diapositivas (puedes ajustar)
        navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
        },
        on: {
            slideChange: function () {
                const activeIndex = this.activeIndex; // Obtener el índice activo
                localStorage.setItem("currentRoundIndex", activeIndex); // Guardar el índice en localStorage
            },
        },
    });

    // Restaurar el índice guardado en localStorage
    const savedIndex = localStorage.getItem("currentRoundIndex");
    if (savedIndex !== null) {
        swiper.slideTo(parseInt(savedIndex, 10), 0); // Moverse al índice guardado
    }

    // Cargar los datos iniciales para los rounds
    loadRoundsData();
});

