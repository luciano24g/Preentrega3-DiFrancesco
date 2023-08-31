const canvas = document.getElementById('juegoCanvas');
const ctx = canvas.getContext('2d');

// Variables generales
let juegoActivo = false;
let puntaje = 0;
let vidaAvion = 100;
let oleada = 0;

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

// Agregar un contador de retraso para los disparos de los enemigos

let contadorDisparoEnemigo = 0;

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
    if (oleada < 3) {
        if (Math.random() < 0.025) {
            let tipo = tiposEnemigos[Math.floor(Math.random() * tiposEnemigos.length)];
            let enemigo = { x: Math.random() * canvas.width, y: 0, tipo: tipo, vida: tipo.vida };
            enemigos.push(enemigo);
        }
    } else {
        // Generar aviones finales (2 aviones más fuertes)
        if (enemigos.length === 0) {
            enemigos.push({ x: canvas.width * 0.25, y: 0, tipo: { color: 'purple', vida: 200, disparoProbabilidad: 0.05, daño: 40 }, vida: 200 });
            enemigos.push({ x: canvas.width * 0.75, y: 0, tipo: { color: 'purple', vida: 200, disparoProbabilidad: 0.05, daño: 40 }, vida: 200 });
        }
    }
}

function disparoEnemigo(enemigo) {
    if (Math.random() < 0.01) {  // Reducimos la probabilidad al 2%
        switch (enemigo.tipo.disparoTipo) {
            case 'normal':
                disparosEnemigos.push({ x: enemigo.x, y: enemigo.y + 15, daño: 10, radio: 3 });  // Aumentamos la posición en y
                break;
            case 'fuerte':
                disparosEnemigos.push({ x: enemigo.x, y: enemigo.y + 15, daño: 20, radio: 5 });
                break;
                case 'cono':
                disparosEnemigos.push({ x: enemigo.x, y: enemigo.y + 15, daño: 10, radio: 3 }); // Centro
                disparosEnemigos.push({ x: enemigo.x - 15, y: enemigo.y + 25, daño: 10, radio: 3 }); // Diagonal izquierda
                disparosEnemigos.push({ x: enemigo.x + 15, y: enemigo.y + 25, daño: 10, radio: 3 }); // Diagonal derecha
                disparosEnemigos.push({ x: enemigo.x - 30, y: enemigo.y + 35, daño: 10, radio: 3 }); // Diagonal izquierda más alejada
                disparosEnemigos.push({ x: enemigo.x + 30, y: enemigo.y + 35, daño: 10, radio: 3 }); // Diagonal derecha más alejada
    break;
        }
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

function actualizarVida() {
    let vidaBarra = document.getElementById('vidaBarra');
    vidaBarra.style.width = (vidaAvion / 100) * 200 + 'px';
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

let intervaloActualizacion, intervaloDibujo;

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
    // Actualizar enemigos y disparos de enemigos
    for (let i = 0; i < enemigos.length; i++) {
        enemigos[i].y += enemigoVelocidad;
        disparoEnemigo(enemigos[i]);
        if (enemigos[i].y > canvas.height) {
            enemigos.splice(i, 1);
            i--;
        }
    }
    contadorDisparoEnemigo++; 
    // Lógica de colisión entre disparos de enemigos y el avión
    for (let i = 0; i < disparos.length; i++) {
        for (let j = 0; j < enemigos.length; j++) {
            let disparo = disparos[i];
            let enemigo = enemigos[j];
            let distancia = Math.sqrt(Math.pow(disparo.x - enemigo.x, 2) + Math.pow(disparo.y - enemigo.y, 2));
            if (distancia < disparoRadio + 15) {  // 15 es aproximadamente la mitad del tamaño del enemigo
                enemigo.vida -= 50;  // Daño causado por el disparo del jugador
                if (enemigo.vida <= 0) {
                    enemigos.splice(j, 1);
                    j--;
                }
                disparos.splice(i, 1);
                i--;
                break;
            }
        }
    }
     // Lógica para que los enemigos disparen
     for (let enemigo of enemigos) {
        disparoEnemigo(enemigo);
    }

    // Lógica de colisión entre el jugador y los power-ups
    for (let i = 0; i < powerUps.length; i++) {
    let powerUp = powerUps[i];
    let distancia = Math.sqrt(Math.pow(powerUp.x - avionX, 2) + Math.pow(powerUp.y - avionY, 2));
    if (distancia < powerUpRadio + 15) {  // 15 es aproximadamente la mitad del tamaño del avión del jugador
        switch (powerUp.color) {
            case 'yellow':
                efectoPowerUp = 'fuerte';
                break;
            case 'orange':
                efectoPowerUp = 'cono';
                break;
        }
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
    ctx.fillStyle = 'yellow';
    for (let powerUp of powerUps) {
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
    btn.style.position = 'absolute';
    btn.style.top = '50%';
    btn.style.left = '50%';
    btn.style.transform = 'translate(-50%, -50%)';
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
    setInterval(actualizar, 1000 / 60);
    setInterval(dibujar, 1000 / 60);
    setInterval(generarOleadaEnemigos, 10000);  // Genera oleada de enemigos cada 10 segundos
}

// Mostrar el botón al inicio
mostrarBotonIniciar();

inicializarHUD();