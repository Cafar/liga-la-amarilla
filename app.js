// Configuración del SDK de Parse
Parse.initialize("ODRvdbKJuXMlb2KGoqC40RTm6aMIMR0cNyy2LLAJ", "hZkEJwwVbgfHO5d7o54e2yTEE7fOmH8SFrLted1g");
Parse.serverURL = "https://parseapi.back4app.com";

// Función para actualizar puntos
async function updatePoints(roundName, team) {
    const Round = Parse.Object.extend(roundName);
    const query = new Parse.Query(Round);

    try {
        const round = await query.first();
        if (round) {
            round.increment(team, 1); // Incrementa los puntos del equipo
            await round.save();
            alert(`¡Votaste por el equipo ${team}!`);
            loadPoints(roundName); // Recargar los puntos actualizados
        } else {
            console.error(`No se encontró la clase ${roundName}`);
        }
    } catch (error) {
        console.error(`Error actualizando puntos: ${error.message}`);
    }
}

// Función para cargar los puntos de un round
async function loadPoints(roundName) {
    const Round = Parse.Object.extend(roundName);
    const query = new Parse.Query(Round);

    try {
        const round = await query.first();
        if (round) {
            document.getElementById(`${roundName.toLowerCase()}-red-points`).textContent = round.get("teamRed") || 0;
            document.getElementById(`${roundName.toLowerCase()}-blue-points`).textContent = round.get("teamBlue") || 0;
            document.getElementById(`${roundName.toLowerCase()}-green-points`).textContent = round.get("teamGreen") || 0;
            document.getElementById(`${roundName.toLowerCase()}-yellow-points`).textContent = round.get("teamYellow") || 0;
        }
    } catch (error) {
        console.error(`Error cargando puntos de ${roundName}: ${error.message}`);
    }
}

// Cargar los puntos de todos los rounds al iniciar la página
document.addEventListener("DOMContentLoaded", () => {
    for (let i = 1; i <= 5; i++) {
        loadPoints(`Round${i}`);
    }
});
