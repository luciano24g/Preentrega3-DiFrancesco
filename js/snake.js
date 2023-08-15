const canvas = document.getElementById('areaJuego');
        const ctx = canvas.getContext('2d');
        const tamañoCelda = 20;
        let serpiente = [{x: 10, y: 10}];
        const tiposComida = [
            {color: 'red', puntos: 10},
            {color: 'yellow', puntos: 20},
            {color: 'green', puntos: 15}
        ];
        let comidaActual = generarComidaAleatoria();
        let dx = 1;
        let dy = 0;
        let puntos = 0;

        function generarComidaAleatoria() {
            let tipoAleatorio = tiposComida[Math.floor(Math.random() * tiposComida.length)];
            return {
                x: Math.floor(Math.random() * 20),
                y: Math.floor(Math.random() * 20),
                color: tipoAleatorio.color,
                puntos: tipoAleatorio.puntos
            };
        }

        function actualizarPuntos() {
            document.getElementById('puntos').textContent = 'Puntos: ' + puntos;
        }

        function serpienteChocaConsigoMisma() {
            for(let i = 1; i < serpiente.length; i++) {
                if(serpiente[i].x === serpiente[0].x && serpiente[i].y === serpiente[0].y) {
                    return true;
                }
            }
            return false;
        }

        function dibujarJuego() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            for(let i = 0; i < serpiente.length; i++) {
                ctx.fillStyle = 'green';
                ctx.beginPath();
                if(i === 0) { // Cabeza
                    ctx.arc(serpiente[i].x * tamañoCelda + tamañoCelda / 2, serpiente[i].y * tamañoCelda + tamañoCelda / 2, tamañoCelda / 2 + 2, 0, Math.PI * 2, false);
                } else { // Cuerpo
                    ctx.arc(serpiente[i].x * tamañoCelda + tamañoCelda / 2, serpiente[i].y * tamañoCelda + tamañoCelda / 2, tamañoCelda / 2 - 2, 0, Math.PI * 2, false);
                }
                ctx.fill();
            }
            ctx.fillStyle = comidaActual.color;
            ctx.fillRect(comidaActual.x * tamañoCelda, comidaActual.y * tamañoCelda, tamañoCelda, tamañoCelda);
            let cabeza = {...serpiente[0]};
            cabeza.x += dx;
            cabeza.y += dy;
            serpiente.unshift(cabeza);
            if(cabeza.x === comidaActual.x && cabeza.y === comidaActual.y) {
                puntos += comidaActual.puntos;
                actualizarPuntos();
                comidaActual = generarComidaAleatoria();
            } else {
                serpiente.pop();
            }
            if(cabeza.x < 0 || cabeza.x >= 20 || cabeza.y < 0 || cabeza.y >= 20 || serpienteChocaConsigoMisma()) {
                serpiente = [{x: 10, y: 10}];
                dx = 1;
                dy = 0;
                puntos = 0;
                actualizarPuntos();
            }
        }
        setInterval(dibujarJuego, 100);
        document.addEventListener('keydown', function(evento) {
            if(evento.key === 'ArrowUp' && dy === 0) {
                dx = 0;
                dy = -1;
            } else if(evento.key === 'ArrowDown' && dy === 0) {
                dx = 0;
                dy = 1;
            } else if(evento.key === 'ArrowLeft' && dx === 0) {
                dx = -1;
                dy = 0;
            } else if(evento.key === 'ArrowRight' && dx === 0) {
                dx = 1;
                dy = 0;
            }
        });