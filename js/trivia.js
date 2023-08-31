let nombreActualPokemon = "";
let puntuacion = 0;
let pokemonsMostrados = [];
let contadorRonda = 0;
let respuestasCorrectas = 0;
let rondaIniciada = false;
let pistasUsadas = 0;  // Nuevo: contador de pistas usadas

    function generarIdAleatorio(minId, maxId) {
    return Math.floor(Math.random() * (maxId - minId + 1)) + minId;
    }

    function obtenerPokemonAleatorio() {
        const generacion = document.getElementById('generacion').value;
        let minId, maxId;
    
        switch (generacion) {
            case '1':
                minId = 1;
                maxId = 151;
                break;
            case '2':
                minId = 152;
                maxId = 251;
                break;
            case '3':
                minId = 252;
                maxId = 386;
                break;
            // Puedes continuar con las demás generaciones
        }
    
        let idAleatorio;
        do {
            idAleatorio = generarIdAleatorio(minId, maxId);
        } while (pokemonsMostrados.includes(idAleatorio) && pokemonsMostrados.length < (maxId - minId + 1));
    
        pokemonsMostrados.push(idAleatorio);
    
        pistasUsadas = 0;

        fetch(`https://pokeapi.co/api/v2/pokemon/${idAleatorio}/`)
            .then(response => response.json())
            .then(pokemon => {
                mostrarPokemon(pokemon);
            });
    
        contadorRonda++;
        
        if (contadorRonda >= 10) {
            rondaIniciada = false;  // Finalizar la ronda
            mostrarModalResultado();
            return;  // Salir de la función para no obtener un nuevo Pokémon
        }
    }
    
    function mostrarModalResultado() {
        const modal = document.getElementById('modalResultado');
        const textoResultado = document.getElementById('textoResultado');
    
        if (respuestasCorrectas >= 7) {
            textoResultado.textContent = `¡Felicitaciones! Has acertado ${respuestasCorrectas} de 10 Pokémon.`;
        } else {
            textoResultado.textContent = `Has fallado. Aciertos: ${respuestasCorrectas} de 10 Pokémon. ¡Sigue intentándolo!`;
        }
    
        modal.style.display = "block";
    }
    

    function mostrarPokemon(pokemon) {
    const imagenPokemon = document.getElementById('pokemonImage');
    imagenPokemon.src = pokemon.sprites.front_default;
    nombreActualPokemon = pokemon.name;
    document.getElementById('respuesta').value = '';  // Reiniciar el input cuando se carga un nuevo Pokémon
    }

    function verificarRespuesta() {
        const respuesta = document.getElementById('respuesta').value;
    
        if (respuesta.toLowerCase() === nombreActualPokemon) {
            switch (pistasUsadas) {
                case 0:
                    puntuacion += 6;
                    break;
                case 1:
                    puntuacion += 5;
                    break;
                case 2:
                    puntuacion += 4;
                    break;
                case 3:
                    puntuacion += 3;
                    break;
            }
            respuestasCorrectas++;
            Toastify({
                text: "¡Correcto!",
                duration: 3000,
                close: true,
                gravity: "top",
                position: 'right',
                backgroundColor: "linear-gradient(to right, #00b09b, #96c93d)",
            }).showToast();
        } else {
            puntuacion -= 1;  // Restar solo 1 punto si la respuesta es incorrecta
            Toastify({
                text: `Incorrecto. El Pokémon es ${nombreActualPokemon}.`,
                duration: 3000,
                close: true,
                gravity: "top",
                position: 'right',
                style: {
                    background: "linear-gradient(to right, #ff5f6d, #ffc371)"
                }
            }).showToast();
        }
    
        pistasUsadas = 0;  // Reiniciar el contador de pistas usadas después de verificar la respuesta
        document.getElementById('respuesta').value = '';  // Reiniciar el input
    
        actualizarPuntuacion();  // Actualizar la puntuación en la interfaz
    
        if (rondaIniciada) {
            obtenerPokemonAleatorio();  // Cargar otro Pokémon automáticamente
        }
    }
    
    
    function mostrarPista() {
        pistasUsadas++;
        const feedback = document.getElementById('feedback');
        switch (pistasUsadas) {
            case 1:
                feedback.textContent = `La primera letra es: ${nombreActualPokemon.charAt(0)}`;
                break;
            case 2:
                feedback.textContent = `Las primeras dos letras son: ${nombreActualPokemon.substring(0, 2)}`;
                break;
            case 3:
                feedback.textContent = `Las primeras tres letras son: ${nombreActualPokemon.substring(0, 3)}`;
                break;
            default:
                feedback.textContent = "No hay más pistas disponibles.";
                break;
        }
    }

    function actualizarPuntuacion() {
        const displayPuntuacion = document.getElementById('puntuacion');
        displayPuntuacion.textContent = puntuacion;
    }

    function iniciarRonda() {
    rondaIniciada = true;
    contadorRonda = 0;
    respuestasCorrectas = 0;
    pokemonsMostrados = [];
    pistasUsadas = 0;  // Reiniciar el contador de pistas usadas al iniciar una nueva ronda
    puntuacion = 0;    // Reiniciar la puntuación al iniciar una nueva ronda
    actualizarPuntuacion();  // Actualizar la puntuación en la interfaz
    obtenerPokemonAleatorio();
}

    function mostrarModalResultado() {
    const modal = document.getElementById('modalResultado');
    const mensajePrincipal = document.getElementById('mensajePrincipal');
    const mensajeSecundario = document.getElementById('mensajeSecundario');

    // Mostrar la puntuación
    mensajeSecundario.textContent = `Has acertado ${respuestasCorrectas} de 10 Pokémon.`;

    // Determinar si el jugador ganó o perdió
    if (respuestasCorrectas >= 7) {
        mensajePrincipal.textContent = "¡Felicidades, has ganado!";
    } else {
        mensajePrincipal.textContent = "Fallaste. ¡Sigue intentándolo!";
    }

    modal.style.display = "block";
}

    function crearModal() {
        // Crear el contenedor del modal
        const modal = document.createElement('div');
        modal.id = 'modalResultado';
        modal.classList.add('modal');
    
        // Crear el contenido del modal
        const modalContent = document.createElement('div');
        modalContent.classList.add('modal-content');
    
        // Crear el título del modal
        const modalTitle = document.createElement('h2');
        modalTitle.textContent = 'Resultado de la Ronda';
        modalContent.appendChild(modalTitle);
    
        // Crear el mensaje principal
        const mensajePrincipal = document.createElement('p');
        mensajePrincipal.id = 'mensajePrincipal';
        modalContent.appendChild(mensajePrincipal);
    
        // Crear el mensaje secundario
        const mensajeSecundario = document.createElement('p');
        mensajeSecundario.id = 'mensajeSecundario';
        modalContent.appendChild(mensajeSecundario);
    
        // Crear el botón de cierre
        const closeButton = document.createElement('span');
        closeButton.classList.add('close');
        closeButton.innerHTML = '&times;';
        closeButton.onclick = function() {
            modal.style.display = 'none';
        };
        modalContent.appendChild(closeButton);
    
        // Adjuntar el contenido del modal al contenedor del modal
        modal.appendChild(modalContent);
    
        // Adjuntar el modal al cuerpo del documento
        document.body.appendChild(modal);
    
        // Cerrar el modal al hacer clic fuera de él
        window.onclick = function(event) {
            if (event.target == modal) {
                modal.style.display = 'none';
            }
        }
    }
    

    function siguientePokemon() {
        puntuacion -= 1;  // Restar 1 punto al pasar al siguiente Pokémon
        Toastify({
            text: `No adivinaste. El Pokémon era ${nombreActualPokemon}.`,
            duration: 3000,
            close: true,
            gravity: "top",
            position: 'right',
            style: {
                background: "linear-gradient(to right, #ff5f6d, #ffc371)"
            }
            
        }).showToast();
        actualizarPuntuacion();  // Actualizar la puntuación en la interfaz
        obtenerPokemonAleatorio();
    }

    document.addEventListener('DOMContentLoaded', function() {
    crearModal();  // Crear el modal al cargar el documento
    document.getElementById('btnResponder').addEventListener('click', verificarRespuesta);
    document.getElementById('btnSiguiente').addEventListener('click', siguientePokemon);
    document.getElementById('btnPista').addEventListener('click', mostrarPista);
    document.getElementById('btnIniciarRonda').addEventListener('click', iniciarRonda);

    // Agregar evento para responder con la tecla "Enter"
    document.getElementById('respuesta').addEventListener('keyup', function(event) {
        if (event.key === 'Enter') {
            verificarRespuesta();
        }
    });
    iniciarRonda();
});
