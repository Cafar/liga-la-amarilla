// Inicialización de Parse
Parse.initialize("ODRvdbKJuXMlb2KGoqC40RTm6aMIMR0cNyy2LLAJ", "N84W4tFPD9TFu6dsCIjddsJtNrZFLBc6ChshauCx");
Parse.serverURL = "https://parseapi.back4app.com";

/**
 * Carga los resultados desde Parse y los muestra en la página.
 */
async function loadResults() {
    try {
        const response = await Parse.Cloud.run("getRoundsData");
        const resultsContainer = document.getElementById("results-container");

        if (!response || response.length === 0) {
            resultsContainer.innerHTML = "<p>No hay resultados disponibles.</p>";
            return;
        }

        resultsContainer.innerHTML = ""; // Limpiar el contenedor

        response.forEach((round) => {
            const resultCard = document.createElement("div");
            resultCard.classList.add("result-card");

            if (round.Unlocked) {
                // Mostrar resultados con botón para bloquear
                resultCard.innerHTML = `
                    <h2>Round ${round.round}</h2>
                    <p>Equipo Azul: <span>${round.teamBlue || 0}</span> votos</p>
                    <p>Equipo Rojo: <span>${round.teamRed || 0}</span> votos</p>
                    <button class="lock-btn" onclick="toggleLockRound(${round.round}, false)">Bloquear</button>
                `;
            } else {
                // Mostrar botón para desbloquear
                resultCard.innerHTML = `
                    <h2>Juego ${round.round}</h2>
                    <p>Ronda bloqueada.</p>
                    <button class="unlock-btn" onclick="toggleLockRound(${round.round}, true)">Desbloquear</button>
                `;
            }

            resultsContainer.appendChild(resultCard);
        });
    } catch (error) {
        console.error("Error al cargar los resultados:", error.message);
        document.getElementById("results-container").innerHTML = `
            <p>Error al cargar los resultados. Por favor, inténtalo más tarde.</p>
        `;
    }
}

/**
 * Alterna el estado de bloqueo de una ronda.
 * @param {number} roundNumber - El número de la ronda.
 * @param {boolean} unlock - Si es `true`, desbloquea; si es `false`, bloquea.
 */
async function toggleLockRound(roundNumber, unlock) {
    try {
        const action = unlock ? "unlockRound" : "lockRound";
        const message = unlock ? "desbloqueada" : "bloqueada";

        await Parse.Cloud.run(action, { roundNumber });

        loadResults(); // Recargar los resultados
    } catch (error) {
        console.error(`Error al cambiar el estado de la ronda ${roundNumber}:`, error.message);
    }
}

/**
 * Resetea todos los datos de UserVotes y reinicia los votos en Votes.
 */
async function resetAllVotes() {
    if (!confirm("¿Estás seguro de que deseas borrar todos los datos de votos? Esta acción no se puede deshacer.")) {
        return;
    }

    try {
        const response = await Parse.Cloud.run("resetVotes");
        alert(response); // Muestra el mensaje de éxito del backend
        loadResults(); // Recarga los resultados después de reiniciar
    } catch (error) {
        console.error("Error al reiniciar los votos:", error.message);
        alert("Hubo un error al intentar reiniciar los votos. Por favor, inténtalo de nuevo.");
    }
}


/**
 * Redirige a la página principal.
 */
function backToHome() {
    window.location.href = "index.html";
}

// Cargar los resultados al cargar la página
document.addEventListener("DOMContentLoaded", loadResults);
