function jugarJuego() {
  // Generador de número aleatorio
  function numeroAleatorio() {
    let alazar = Date.now();
    return (alazar % 30) + 1;
  }

  // Variable que almacena el número aleatorio
  let numeroCorrecto = numeroAleatorio();

  // Variable que almacena los intentos
  let intentos = 0;

  // Función para verificar si el número ingresado es correcto
  function verificarNumero(numero) {
    let aleatorio = numeroAleatorio();
    if (numero === numeroCorrecto) {
      alert("El número ingresado es el correcto. ¡Felicidades!");
      return true;
    } else if (numero < numeroCorrecto) {
      alert("El número ingresado es demasiado bajo. Intenta nuevamente.");
      alert("Número de intentos: " + intentos);
    } else {
      alert("El número ingresado es demasiado alto. Intenta nuevamente.");
      alert("Número de intentos: " + intentos);
    }
    return false;
  }

  // Ciclo principal del juego
  while (true) {
    let numeroIngresado = Number(prompt("Ingresa un número entre 1 y 30:"));

    // Verificar si se ingresó un número válido
    if (isNaN(numeroIngresado)) {
      alert("No has ingresado un número válido. Intenta nuevamente.");
      continue;
    }

    // Incrementar el número de intentos
    intentos++;

    // Verificar si el número es correcto
    if (verificarNumero(numeroIngresado)) {
      
      const reiniciar = confirm("¿Deseas reiniciar el juego?");

      if (reiniciar) {
        // Reiniciar el juego generando un nuevo número aleatorio y reiniciando los intentos
        numeroCorrecto = numeroAleatorio();
        intentos = 0;
      } else {
        alert("¡Gracias por jugar!");
        break; 
      }
    }
  }
}


jugarJuego();
