document.addEventListener('DOMContentLoaded', () => {
    // 1. Inicializar AOS (Animate On Scroll)
    AOS.init({
        duration: 1000, // Duración de la animación en ms
        once: true,    // Si la animación debe ocurrir solo una vez
        mirror: false  // Si las animaciones deben ocurrir al salir de la vista
    });

    // 2. Control de la Música de Fondo
    const backgroundMusic = document.getElementById('background-music');
    const playPauseButton = document.getElementById('play-pause-button');
    let isPlaying = false;

    // Intenta reproducir al cargar. Los navegadores modernos a menudo bloquean el autoplay
    // sin interacción del usuario, por eso el botón es crucial.
    backgroundMusic.volume = 0.4; // Ajusta el volumen a tu gusto
    // backgroundMusic.play().catch(e => console.log("Autoplay blocked:", e)); // Intenta reproducir

    playPauseButton.addEventListener('click', () => {
        if (isPlaying) {
            backgroundMusic.pause();
            playPauseButton.innerHTML = '<i class="fas fa-volume-mute"></i>'; // Icono de silencio
        } else {
            backgroundMusic.play();
            playPauseButton.innerHTML = '<i class="fas fa-volume-up"></i>'; // Icono de sonido
        }
        isPlaying = !isPlaying;
    });

    // Asegurarse de que el botón muestra el estado correcto al cargar
    backgroundMusic.addEventListener('play', () => {
        isPlaying = true;
        playPauseButton.innerHTML = '<i class="fas fa-volume-up"></i>';
    });
    backgroundMusic.addEventListener('pause', () => {
        isPlaying = false;
        playPauseButton.innerHTML = '<i class="fas fa-volume-mute"></i>';
    });


    // 3. Transición de la Página de Inicio a la Carta
    const discoverButton = document.getElementById('discover-button');
    const landingPage = document.getElementById('landing-page');
    const letterSection = document.getElementById('letter-section');

    discoverButton.addEventListener('click', () => {
        landingPage.style.opacity = '0'; // Desvanecer la landing page
        landingPage.style.pointerEvents = 'none'; // Deshabilitar interacción
        setTimeout(() => {
            landingPage.classList.add('hidden'); // Ocultar después de desvanecer
            letterSection.classList.remove('hidden'); // Mostrar la sección de la carta
            letterSection.style.opacity = '0'; // Asegurar que esté oculta para el fade-in
            setTimeout(() => {
                letterSection.style.transition = 'opacity 1s ease-in-out';
                letterSection.style.opacity = '1'; // Desvanecer la carta
                // Trigger AOS animations for the letter section
                AOS.refresh();
            }, 50); // Pequeño retraso para asegurar que CSS reconozca el cambio de display
        }, 1000); // Coincide con la duración del fade-out de la landing page
    });

    // 4. Parallax Effect para la imagen de fondo (OPCIONAL, si no usas una librería como simpleParallax.js)
    const backgroundImage = document.querySelector('#landing-page .background-image');
    if (backgroundImage) {
        window.addEventListener('scroll', () => {
            // Solo aplica el parallax a la landing page
            const scrollPosition = window.pageYOffset;
            const translateY = scrollPosition * 0.4; // Ajusta este valor para más o menos efecto
            backgroundImage.style.transform = `translateY(${translateY}px)`;
        });
    }

    // 5. Revelar Contenido de la Sorpresa
    const revealSurpriseButton = document.getElementById('reveal-surprise-button');
    const surpriseReveal = document.getElementById('surprise-reveal');

    revealSurpriseButton.addEventListener('click', () => {
        if (surpriseReveal.classList.contains('hidden')) {
            surpriseReveal.classList.remove('hidden');
            surpriseReveal.style.opacity = '0'; // Para la animación de fade-in
            setTimeout(() => {
                surpriseReveal.style.transition = 'opacity 1s ease-in-out';
                surpriseReveal.style.opacity = '1';
                // Puedes añadir aquí una animación de confeti si lo deseas
                // triggerConfetti(); // Si implementas una función de confeti
            }, 50);
            revealSurpriseButton.style.display = 'none'; // Oculta el botón después de revelar
        }
    });

    // --- Funciones Adicionales (Más Complejas y Opcionales) ---

    // Tipo Escritura para la Carta (Requiere modificar cómo se muestra la carta en HTML)
    // Esto implicaría que cada párrafo se escriba caracter por caracter.
    // Esto es más complejo y requeriría una reestructuración del HTML de la carta para envolver cada caracter en un span.
    // O puedes aplicar el efecto a un solo elemento como un "saludo" inicial.
    /*
    function typeWriter(element, text, i = 0) {
        if (i < text.length) {
            element.innerHTML += text.charAt(i);
            setTimeout(() => typeWriter(element, text, i + 1), 50); // Velocidad
        }
    }
    // Para usarlo en un elemento específico:
    // const myElement = document.getElementById('my-typing-element');
    // typeWriter(myElement, "Hola mi amor...");
    */

    // Animación de Confeti (requiere librería como `canvas-confetti`)
    // Instalar: npm install canvas-confetti o añadir el script directamente
    // <script src="https://cdn.jsdelivr.net/npm/canvas-confetti@1.9.3/dist/confetti.browser.min.js"></script>
    /*
    function triggerConfetti() {
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
        });
    }
    // Llama a triggerConfetti() cuando quieras que el confeti aparezca (ej. al revelar la sorpresa)
    */

    // Animación de Pájaro Liberándose (Requiere SVG o GIF pre-hecho)
    // Si usas un GIF, solo asegúrate de que el `src` sea el correcto y se cargue.
    // Si quieres un SVG animado, es más complejo y se usarían librerías como GreenSock (GSAP)
    // o animaciones CSS/JS directas para manipular las rutas del SVG.
    // Para el GIF: la clase `freedom-animation-gif` en CSS y el `src` en HTML ya lo manejan.
    // Si es un SVG:
    /*
    const freedomSVG = document.getElementById('freedom-svg');
    const birdElement = freedomSVG.querySelector('#bird'); // Asume que tienes un elemento con ID 'bird' dentro del SVG
    const cageElement = freedomSVG.querySelector('#cage'); // Asume un elemento con ID 'cage'

    // Ejemplo básico de cómo podrías animar un SVG (requiere que el SVG esté bien estructurado)
    // Esto es muy simplificado y probablemente necesitaría una librería como GSAP para algo complejo
    // freedomSVG.classList.remove('hidden');
    // // Simula la animación de la jaula abriéndose y el pájaro volando
    // cageElement.style.transform = 'translateX(50px) rotate(10deg)';
    // birdElement.style.transform = 'translateY(-100px) scale(1.2)';
    // birdElement.style.opacity = '0';
    */

    // Cursor de Corazones (más complejo, implica crear elementos en el DOM en cada movimiento del mouse)
    // Buscar "HTML CSS JS heart cursor" para tutoriales.
    /*
    document.addEventListener('mousemove', (e) => {
        const heart = document.createElement('span');
        heart.classList.add('heart-cursor');
        heart.style.left = `${e.clientX}px`;
        heart.style.top = `${e.clientY}px`;
        document.body.appendChild(heart);

        // Remover el corazón después de un tiempo para no llenar el DOM
        setTimeout(() => {
            heart.remove();
        }, 1000); // Ajusta la duración
    });
    // Necesitarás CSS para la clase .heart-cursor (ej. position: absolute, animation para flotar y desvanecer)
    */

    // Animación de partículas de fondo (requiere mucha CPU si no está optimizada)
    // Puedes usar librerías como Particles.js o crear tu propio script de Canvas.
    // Es un tema avanzado que añadiría al `body` o a un `div` específico.
});