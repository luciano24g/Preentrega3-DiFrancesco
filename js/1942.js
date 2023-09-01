const canvas = document.getElementById('juegoCanvas');
const ctx = canvas.getContext('2d');

// Variables generales
let juegoActivo = false;
let puntaje = 0;
let vidaAvion = 100;
let oleada = 0;

let intervaloActualizacion;
let intervaloDibujo;

// Variables para el avión del jugador
let avionX = canvas.width / 2;
let avionY = canvas.height - 30;
const avionVelocidad = 5;


// Variables para los disparos del jugador
const disparos = [];
const disparoVelocidad = 10;
const disparoRadio = 3;

// Variables para los disparos de los enemigos
const disparosEnemigos = [];
const disparoEnemigoVelocidad = 5;
const disparoEnemigoRadio = 3;

// Variables para los enemigos
const enemigos = [];
const enemigoVelocidad = 2;
const tiposEnemigos = [
    { color: 'red', vida: 10, disparoTipo: 'normal', daño: 5 },
    { color: 'orange', vida: 10, disparoTipo: 'fuerte', daño: 15 },
    { color: 'yellow', vida: 10, disparoTipo: 'cono', daño: 5 }
];

let contadorDisparoEnemigo = 0;
const LIMITE_DISPARO_ENEMIGO = 60; // Ajusta este valor según la frecuencia deseada
// Variables para los power-ups
const powerUps = [];
const powerUpRadio = 10;
let efectoPowerUp = null;
let duracionEfectoPowerUp = 0;

// Eventos de teclado
let teclasPresionadas = {};
let disparoPermitido = true;

document.addEventListener('keydown', function(event) {
    teclasPresionadas[event.keyCode] = true;
});

document.addEventListener('keyup', function(event) {
    teclasPresionadas[event.keyCode] = false;
});

function inicializarHUD() {
    actualizarVida();
    actualizarPuntaje();
}


function moverAvion() {
    if (teclasPresionadas[37] && avionX > 0) { // Izquierda
        avionX -= avionVelocidad;
    }
    if (teclasPresionadas[39] && avionX < canvas.width) { // Derecha
        avionX += avionVelocidad;
    }
    if (teclasPresionadas[38] && avionY > 0) { // Arriba
        avionY -= avionVelocidad;
    }
    if (teclasPresionadas[40] && avionY < canvas.height) { // Abajo
        avionY += avionVelocidad;
    }
    if (teclasPresionadas[32] && disparoPermitido) { // Espacio (disparar)
        disparos.push({ x: avionX, y: avionY });
        disparoPermitido = false;
        setTimeout(() => {
            disparoPermitido = true;
        }, 500); // 500ms de espera entre disparos
    }
}

function generarEnemigos() {
    if (Math.random() < 0.02 && enemigos.length < 2) {  // Solo genera nuevos enemigos si hay menos de 2 enemigos en pantalla
        let tipo = tiposEnemigos[Math.floor(Math.random() * tiposEnemigos.length)];
        let enemigo = { x: Math.random() * canvas.width, y: 0, tipo: tipo, vida: tipo.vida };
        enemigos.push(enemigo);
    }
}

function disparoEnemigo(enemigo) {
    switch (enemigo.tipo.disparoTipo) {
        case 'normal':
            disparosEnemigos.push({ x: enemigo.x, y: enemigo.y + 15, daño: 10, radio: 3 });
            break;
        case 'fuerte':
            disparosEnemigos.push({ x: enemigo.x, y: enemigo.y + 15, daño: 15, radio: 5 });
            break;
        case 'cono':
            disparosEnemigos.push({ x: enemigo.x, y: enemigo.y + 15, daño: 10, radio: 3 });
            disparosEnemigos.push({ x: enemigo.x - 15, y: enemigo.y + 25, daño: 10, radio: 3 });
            disparosEnemigos.push({ x: enemigo.x + 15, y: enemigo.y + 25, daño: 10, radio: 3 });
            disparosEnemigos.push({ x: enemigo.x - 30, y: enemigo.y + 35, daño: 10, radio: 3 });
            disparosEnemigos.push({ x: enemigo.x + 30, y: enemigo.y + 35, daño: 10, radio: 3 });
            break;
    }
}

function colisiona(disparo, enemigo) {
    let dx = disparo.x - enemigo.x;
    let dy = disparo.y - enemigo.y;
    let distancia = Math.sqrt(dx * dx + dy * dy);
    return distancia < disparoRadio + 15;
}

function colisionaConAvion(disparoEnemigo) {
    let dx = disparoEnemigo.x - avionX;
    let dy = disparoEnemigo.y - avionY;
    let distancia = Math.sqrt(dx * dx + dy * dy);
    return distancia < disparoEnemigoRadio + 15;
}

function actualizarBarraVida() {
    const vidaBarra = document.getElementById('vidaBarra');
    const porcentajeVida = (vidaAvion / 100) * 100;
    vidaBarra.style.width = `${porcentajeVida}%`;
    if (porcentajeVida <= 30) {
        vidaBarra.style.backgroundColor = '#FF0000';
    } else {
        vidaBarra.style.backgroundColor = '#00FF00';
    }
}

function generarOleadaEnemigos() {
    if (enemigos.length < 3) {  // Solo genera nuevos enemigos si hay menos de 3 enemigos en pantalla
        let tipo = tiposEnemigos[Math.floor(Math.random() * tiposEnemigos.length)];
        let enemigo = { x: Math.random() * canvas.width, y: 0, tipo: tipo, vida: tipo.vida };
        enemigos.push(enemigo);
    }
}

function actualizarPuntaje() {
    let elementoPuntaje = document.getElementById('puntaje');
    elementoPuntaje.textContent = 'Puntaje: ' + puntaje;
}



function reiniciarIntervalos() {
    clearInterval(intervaloActualizacion);
    clearInterval(intervaloDibujo);
    intervaloActualizacion = setInterval(actualizar, 1000 / 60);
    intervaloDibujo = setInterval(dibujar, 1000 / 60);
}

function actualizar() {
    if (!juegoActivo) return;

    moverAvion();
    generarEnemigos();
    generarPowerUps();

    // Actualizar disparos del jugador
    for (let i = 0; i < disparos.length; i++) {
        disparos[i].y -= disparoVelocidad;
        if (disparos[i].y < 0) {
            disparos.splice(i, 1);
            i--;
        }
    }

    // Actualizar disparos de los enemigos
    for (let i = 0; i < disparosEnemigos.length; i++) {
        disparosEnemigos[i].y += disparoEnemigoVelocidad;
        if (disparosEnemigos[i].y > canvas.height) {
            disparosEnemigos.splice(i, 1);
            i--;
        }
    }

    // Actualizar enemigos
    for (let i = 0; i < enemigos.length; i++) {
        enemigos[i].y += enemigoVelocidad;
        if (enemigos[i].y > canvas.height) {
            enemigos.splice(i, 1);
            i--;
        }
    }

    // Lógica para que los enemigos disparen
    contadorDisparoEnemigo++;
    if (contadorDisparoEnemigo >= LIMITE_DISPARO_ENEMIGO) {
        for (let enemigo of enemigos) {
            disparoEnemigo(enemigo);
        }
        contadorDisparoEnemigo = 0; // Reiniciar el contador
    }

    // Lógica de colisión entre disparos de enemigos y el avión
    for (let i = 0; i < disparosEnemigos.length; i++) {
        if (colisionaConAvion(disparosEnemigos[i])) {
            vidaAvion -= disparosEnemigos[i].daño;
            actualizarBarraVida(); // Actualizamos la barra de vida
            disparosEnemigos.splice(i, 1);
            i--;
    
            if (vidaAvion <= 0 && juegoActivo) {
                juegoActivo = false;
                clearInterval(intervaloActualizacion);
                clearInterval(intervaloDibujo);
                ctx.clearRect(0, 0, canvas.width, canvas.height); // Limpiar el canvas
                mostrarBotonIniciar();
            }
        }
    }

    // Lógica de colisión entre disparos del jugador y enemigos
    for (let i = 0; i < disparos.length; i++) {
    for (let j = 0; j < enemigos.length; j++) {
        if (colisiona(disparos[i], enemigos[j])) {
            enemigos[j].vida -= 10; // Asumiendo que cada disparo hace 10 de daño
            if (enemigos[j].vida <= 0) {
                enemigos.splice(j, 1);
                puntaje += 10; // Asumiendo que matar a un enemigo da 10 puntos
                actualizarPuntaje();
                j--;
            }
            disparos.splice(i, 1);
            i--;
            break; // Salir del bucle interno si el disparo ya colisionó con un enemigo
        }
    }
}

    // Lógica de colisión entre el jugador y los power-ups
    for (let i = 0; i < powerUps.length; i++) {
        let powerUp = powerUps[i];
        let distancia = Math.sqrt(Math.pow(powerUp.x - avionX, 2) + Math.pow(powerUp.y - avionY, 2));
        if (distancia < powerUpRadio + 15) {  // 15 es aproximadamente la mitad del tamaño del avión del jugador
            switch (powerUp.color) {
                case 'yellow':
                    efectoPowerUp = 'fuerte';
                    vidaAvion += 20; // Aumenta la vida en 20
                    if (vidaAvion > 100) vidaAvion = 100; // Asegura que la vida no exceda 100
                    break;
                case 'orange':
                    efectoPowerUp = 'cono';
                    vidaAvion += 10; // Aumenta la vida en 10
                    if (vidaAvion > 100) vidaAvion = 100; // Asegura que la vida no exceda 100
                    break;
                case 'blue':
                    efectoPowerUp = 'normal';
                    vidaAvion += 5; // Aumenta la vida en 5
                    if (vidaAvion > 100) vidaAvion = 100; // Asegura que la vida no exceda 100
                    break;
            }
            actualizarBarraVida(); // Actualiza la barra de vida
            powerUps.splice(i, 1);
            i--;
        }
    }
    // Actualizar posición de los power-ups
    for (let i = 0; i < powerUps.length; i++) {
        powerUps[i].y += enemigoVelocidad; // Usamos la misma velocidad que los enemigos
        if (powerUps[i].y > canvas.height) {
            powerUps.splice(i, 1);
            i--;
        }
    }

}

   
function generarPowerUps() {
    if (Math.random() < 0.005){ // Reducir la probabilidad a 0.5%
        let tipo = ['yellow', 'orange'][Math.floor(Math.random() * 2)];
        let powerUp = { x: Math.random() * canvas.width, y: 0, color: tipo, velocidad: 2 };
        powerUps.push(powerUp);
    }
}

function moverPowerUps() {
    for (let i = 0; i < powerUps.length; i++) {
        powerUps[i].y += powerUps[i].velocidad;
        if (powerUps[i].y > canvas.height) {
            powerUps.splice(i, 1);
            i--;
        }
    }
}

function dibujar() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);


    // Dibujar avión del jugador como triángulo
    ctx.beginPath();
    ctx.moveTo(avionX, avionY - 15);
    ctx.lineTo(avionX - 15, avionY + 15);
    ctx.lineTo(avionX + 15, avionY + 15);
    ctx.closePath();
    ctx.fillStyle = 'blue';
    ctx.fill();

    // Dibujar disparos del jugador
    ctx.fillStyle = 'green';
    for (let disparo of disparos) {
        ctx.beginPath();
        ctx.arc(disparo.x, disparo.y, disparoRadio, 0, Math.PI * 2);
        ctx.fill();
    }

    // Dibujar enemigos como triángulos
    for (let enemigo of enemigos) {
        ctx.beginPath();
        ctx.moveTo(enemigo.x, enemigo.y + 15);
        ctx.lineTo(enemigo.x - 15, enemigo.y - 15);
        ctx.lineTo(enemigo.x + 15, enemigo.y - 15);
        ctx.closePath();
        ctx.fillStyle = enemigo.tipo.color;
        ctx.fill();
    }

    // Dibujar power-ups como círculos
    for (let powerUp of powerUps) {
        ctx.fillStyle = powerUp.color;
        ctx.beginPath();
        ctx.arc(powerUp.x, powerUp.y, powerUpRadio, 0, Math.PI * 2);
        ctx.fill();
    }

    // Dibujar disparos de los enemigos
    for (let disparo of disparosEnemigos) {
        ctx.fillStyle = 'red';
        ctx.beginPath();
        ctx.arc(disparo.x, disparo.y, disparo.radio, 0, Math.PI * 2);
        ctx.fill();
    }
}

function mostrarBotonIniciar() {
    let btn = document.getElementById('iniciarJuego');
    if (btn) {
        document.body.removeChild(btn);
    }
    btn = document.createElement('button');
    btn.id = 'iniciarJuego';
    btn.innerHTML = juegoActivo ? 'Reiniciar Partida' : 'Iniciar Partida';

    // Estilos para el botón
    btn.style.position = 'absolute';
    btn.style.top = '50%';
    btn.style.left = '50%';
    btn.style.transform = 'translate(-50%, -50%)';
    btn.style.padding = '15px 30px';
    btn.style.fontSize = '20px';
    btn.style.border = 'none';
    btn.style.borderRadius = '5px';
    btn.style.backgroundColor = '#3498db';
    btn.style.color = 'white';
    btn.style.cursor = 'pointer';
    btn.style.transition = 'background-color 0.3s';

    // Efecto hover para el botón
    btn.onmouseover = function() {
        this.style.backgroundColor = '#2980b9';
    }
    btn.onmouseout = function() {
        this.style.backgroundColor = '#3498db';
    }

    btn.addEventListener('click', function() {
        document.body.removeChild(btn);
        reiniciarJuego();
    });

    document.body.appendChild(btn);
}


function reiniciarJuego() {
    // Reiniciar todas las variables del juego
    juegoActivo = true;
    puntaje = 0;
    avionX = canvas.width / 2;
    avionY = canvas.height - 30;
    vidaAvion = 100;
    disparos.length = 0;
    enemigos.length = 0;
    powerUps.length = 0;
    efectoPowerUp = null;
    duracionEfectoPowerUp = 0;
    oleada = 0;

    // Comenzar el juego
    iniciarJuego();
}

function iniciarJuego() {
    clearInterval(intervaloActualizacion);
    clearInterval(intervaloDibujo);
    intervaloActualizacion = setInterval(actualizar, 1000 / 60);
    intervaloDibujo = setInterval(dibujar, 1000 / 60);
}


// Mostrar el botón al inicio
mostrarBotonIniciar();

inicializarHUD();