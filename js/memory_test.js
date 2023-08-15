// Objeto del juego
const juegoMemoria = {

  cartas: [], // Aquí almacenaremos las cartas del juego
  cartasVolteadas: [], // Almacenará temporalmente las cartas volteadas
  cartasEmparejadas: [], // Almacenará las cartas emparejadas
  totalCartas: 16, // Número total de cartas en el juego (deben ser pares)

  
  tiempoInicio: null,
  intervaloTemporizador: null,
  juegoTerminado: false, // Variable para controlar si el juego ha terminado

  // Función para iniciar el juego
  iniciarJuego: function() {
    this.cartas = this.generarCartas();
    this.mezclarCartas();
    this.totalCartas = this.cartas.length; // Actualizar el total de cartas
    this.juegoTerminado = false; // Reiniciar el estado del juego
    this.mostrarCartasAlInicio(); // Mostrar las cartas al inicio
  },

  // Función para reiniciar el juego
  reiniciarJuego: function() {
    this.detenerTemporizador(); // Detener el contador cuando se reinicia el juego
    this.cartas.forEach(carta => {
      carta.estaVolteada = false;
      carta.estaEmparejada = false;
    });
    this.mezclarCartas();
    this.cartasEmparejadas = [];
    this.juegoTerminado = false;
    this.totalCartas = this.cartas.length; // Actualizar el total de cartas
    this.renderizarCartas();
  },

  // Función para generar las cartas en pares
  generarCartas: function() {
    const simbolos = ['🌟', '🍎', '🎉', '🐶', '🌈', '🚀', '🎸', '🍕']; // Símbolos para las cartas
    let cartas = [];
    for (let i = 0; i < this.totalCartas / 2; i++) {
      const simbolo = simbolos[i % simbolos.length];
      const carta = {
        id: i,
        simbolo: simbolo,
        estaVolteada: false,
        estaEmparejada: false,
      };
      cartas.push(carta, { ...carta }); // Agregamos dos cartas idénticas (el par)
    }
    return cartas;
  },

  // Función para mezclar las cartas usando el algoritmo de Fisher-Yates
  mezclarCartas: function() {
    for (let i = this.cartas.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.cartas[i], this.cartas[j]] = [this.cartas[j], this.cartas[i]];
    }
  },


  renderizarCartas: function() {
    const contenedorJuego = document.getElementById('contenedor-juego');
    contenedorJuego.innerHTML = '';
    this.cartas.forEach(carta => {
      const elementoCarta = document.createElement('div');
      elementoCarta.classList.add('carta');
      elementoCarta.textContent = carta.estaVolteada ? carta.simbolo : '';
      elementoCarta.addEventListener('click', () => this.voltearCarta(carta));
      contenedorJuego.appendChild(elementoCarta);
    });
  },

  

  
  mostrarCartasAlInicio: function() {
    this.cartas.forEach(carta => {
      carta.estaVolteada = true;
    });
    this.renderizarCartas();

    let contador = 3;
    const intervaloCuentaRegresiva = setInterval(() => {
      contador--;
      if (contador === 0) {
        this.cartas.forEach(carta => {
          carta.estaVolteada = false; // Voltear las cartas nuevamente
        });
        this.renderizarCartas();
        clearInterval(intervaloCuentaRegresiva);
        this.iniciarTemporizador();
      }
    }, 1000);
  },

  // Función para voltear una carta
  voltearCarta: function(carta) {
    if (!this.juegoTerminado && this.cartasVolteadas.length < 2 && !carta.estaVolteada && !carta.estaEmparejada) {
      carta.estaVolteada = true;
      this.cartasVolteadas.push(carta);
      this.renderizarCartas();
      if (this.cartasVolteadas.length === 2) {
        this.comprobarEmparejamiento();
      }
    }
  },

  // Función para comprobar si las cartas volteadas coinciden
  comprobarEmparejamiento: function() {
    const [carta1, carta2] = this.cartasVolteadas;
    if (carta1.simbolo === carta2.simbolo) {
      carta1.estaEmparejada = true;
      carta2.estaEmparejada = true;
      this.cartasEmparejadas.push(carta1, carta2);
      this.cartasVolteadas = [];
      this.comprobarVictoria();
    } else {
      setTimeout(() => {
        carta1.estaVolteada = false;
        carta2.estaVolteada = false;
        this.cartasVolteadas = [];
        this.renderizarCartas();
      }, 1000); // Esperar 1 segundo antes de voltear las cartas de nuevo
    }
    this.renderizarCartas();
  },

  // Función para comprobar si el juego ha sido ganado
  comprobarVictoria: function() {
    if (this.cartasEmparejadas.length === this.totalCartas) {
      this.juegoTerminado = true;
      this.detenerTemporizador();
      alert('¡Felicidades! Has ganado el juego.');
    }
  },

};


const botonIniciar = document.getElementById('boton-iniciar');
const botonReiniciar = document.getElementById('boton-reiniciar');


botonIniciar.addEventListener('click', () => juegoMemoria.iniciarJuego());
botonReiniciar.addEventListener('click', () => juegoMemoria.reiniciarJuego());

// Inicializamos el juego al cargar la página
juegoMemoria.iniciarJuego();
