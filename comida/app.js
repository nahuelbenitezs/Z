// ====================================================================
// CONSTANTES Y ESTRUCTURAS DE DATOS (En memoria)
// ====================================================================
const COMIDAS_KEY = 'comidas';
const HISTORIAL_KEY = 'historial';

let listaComidas = [];
let historialComidas = [];

// ====================================================================
// FUNCIONES DE UTILIDAD PARA LOCALSTORAGE
// ====================================================================

/** Carga los datos de localStorage al iniciar la aplicación. */
function cargarDatos() {
    const comidasJSON = localStorage.getItem(COMIDAS_KEY);
    const historialJSON = localStorage.getItem(HISTORIAL_KEY);

    // Inicializa o parsea la lista de comidas
    listaComidas = comidasJSON ? JSON.parse(comidasJSON) : [];
    
    // Inicializa o parsea el historial (asegurando que las fechas sean objetos Date si es necesario, aunque aquí las guardamos como string)
    // El historial es un array de {nombre: 'Plato', fecha: '2025-11-02'}
    historialComidas = historialJSON ? JSON.parse(historialJSON) : [];
}

/** Guarda la lista de comidas en localStorage. */
function guardarComidas() {
    localStorage.setItem(COMIDAS_KEY, JSON.stringify(listaComidas));
    renderizarLista();
}

/** Guarda el historial de comidas en localStorage. */
function guardarHistorial() {
    localStorage.setItem(HISTORIAL_KEY, JSON.stringify(historialComidas));
}

// ====================================================================
// FUNCIONES DE LA INTERFAZ (UI)
// ====================================================================

/** Renderiza la lista de comidas en la sección de administración. */
function renderizarLista() {
    const ul = document.getElementById('lista-actual');
    ul.innerHTML = ''; // Limpiar la lista existente
    document.getElementById('contador-platos').textContent = listaComidas.length;

    listaComidas.forEach((comida, index) => {
        const li = document.createElement('li');
        li.textContent = comida.nombre;
        ul.appendChild(li);
    });
}

/** Habilita/deshabilita los botones de giro al inicio del día si ya se giró. */
function verificarGiroDiario() {
    const hoy = new Date().toISOString().slice(0, 10); // 'YYYY-MM-DD'
    const ultimoGiro = historialComidas.length > 0 ? historialComidas[historialComidas.length - 1].fecha : '';

    const btnGirar = document.getElementById('btn-girar');
    const btnVolverGirar = document.getElementById('btn-volver-girar');
    const comidaDelDiaEl = document.getElementById('comida-del-dia');

    if (ultimoGiro === hoy) {
        btnGirar.disabled = true;
        btnVolverGirar.disabled = true;
        comidaDelDiaEl.textContent = `¡Hoy comes ${historialComidas[historialComidas.length - 1].nombre}!`;
        // Habilitar Volver a Girar solo si no se ha usado ya el 'volver'
        // Simplificación: si ya hay un giro para hoy, se asume que la selección es final.
        // La lógica de "Volver a Girar" es compleja de seguir solo con la fecha, así que se simplifica a un solo uso por día.
    } else {
        btnGirar.disabled = false;
        btnVolverGirar.disabled = true;
        comidaDelDiaEl.textContent = "...Gira para comenzar...";
    }
}

// ====================================================================
// LÓGICA DE NEGOCIO
// ====================================================================

/** Obtiene la lista de comidas restringidas por el historial y la regla de los 7 días. */
function obtenerComidasRestringidas() {
    const hoy = new Date();
    const hoyStr = hoy.toISOString().slice(0, 10);
    const diaSemana = hoy.getDay(); // 0 (Domingo) - 6 (Sábado)

    // 1. Restricción por Historial (5 o 2 días)
    const DIAS_EXCLUSION = diaSemana === 1 ? 2 : 5; // 1 = Lunes
    const fechaLimiteHistoria = new Date(hoy);
    fechaLimiteHistoria.setDate(hoy.getDate() - DIAS_EXCLUSION);

    const historialReciente = historialComidas.filter(item => {
        const fechaComida = new Date(item.fecha);
        return fechaComida > fechaLimiteHistoria;
    }).map(item => item.nombre.toLowerCase());

    // 2. Restricción de 7 Días
    const fechaLimite7Dias = new Date(hoy);
    fechaLimite7Dias.setDate(hoy.getDate() - 7);

    // Obtener la última fecha de cada plato en el historial
    const ultimaFechaComida = historialComidas.reduce((acc, item) => {
        acc[item.nombre] = Math.max(acc[item.nombre] || 0, new Date(item.fecha).getTime());
        return acc;
    }, {});

    const comidasEn7Dias = listaComidas.filter(comida => {
        const lastTime = ultimaFechaComida[comida.nombre];
        if (!lastTime) return false; // Nunca se ha comido
        return lastTime > fechaLimite7Dias.getTime();
    }).map(comida => comida.nombre.toLowerCase());

    // Combinar y obtener nombres únicos
    const restringidasSet = new Set([...historialReciente, ...comidasEn7Dias]);
    
    // Si ya se hizo un giro hoy, el plato seleccionado en el último historial **no** cuenta como restringido
    // ya que debe ser posible si se presiona 'Volver a Girar' y la anterior se elimina
    if (historialComidas.length > 0 && historialComidas[historialComidas.length - 1].fecha === hoyStr) {
        restringidasSet.delete(historialComidas[historialComidas.length - 1].nombre.toLowerCase());
    }

    return Array.from(restringidasSet);
}


/**
 * Realiza el giro y selecciona una comida.
 * @param {boolean} esReGiro - Indica si es un 'Volver a Girar' (true) o un 'Girar' normal (false).
 */
function girarComida(esReGiro = false) {
    const hoy = new Date().toISOString().slice(0, 10); // 'YYYY-MM-DD'
    const btnGirar = document.getElementById('btn-girar');
    const btnVolverGirar = document.getElementById('btn-volver-girar');
    const comidaDelDiaEl = document.getElementById('comida-del-dia');

    // 1. Si es re-giro, eliminamos la selección anterior de hoy.
    if (esReGiro) {
        // Encontramos y eliminamos la última entrada que tenga la fecha de hoy
        const indiceUltimoGiro = historialComidas.length - 1;
        if (historialComidas[indiceUltimoGiro].fecha === hoy) {
            historialComidas.pop(); // La comida anterior vuelve a la lista de posibles
        }
    } else {
        // Verificación inicial: Si ya se giró hoy, no permitir un giro normal.
        if (historialComidas.length > 0 && historialComidas[historialComidas.length - 1].fecha === hoy) {
            alert("Ya realizaste tu giro normal de hoy.");
            return;
        }
    }

    // 2. Obtener las restricciones
    const comidasRestringidas = obtenerComidasRestringidas();
    
    // 3. Crear lista de opciones
    const opciones = listaComidas.filter(comida => {
        return !comidasRestringidas.includes(comida.nombre.toLowerCase());
    });

    // 4. Selección
    if (opciones.length === 0) {
        comidaDelDiaEl.textContent = "¡Te has quedado sin opciones! Agrega más comidas.";
        btnGirar.disabled = true;
        btnVolverGirar.disabled = true;
        return;
    }

    const indiceAleatorio = Math.floor(Math.random() * opciones.length);
    const comidaSeleccionada = opciones[indiceAleatorio].nombre;

    // 5. Registro y UI
    historialComidas.push({
        nombre: comidaSeleccionada,
        fecha: hoy
    });
    guardarHistorial();

    comidaDelDiaEl.textContent = `¡Hoy comes: ${comidaSeleccionada}! 😋`;

    // Deshabilitar/Habilitar botones
    btnGirar.disabled = true; // Solo un giro por día
    btnVolverGirar.disabled = esReGiro; // Solo un re-giro por día
}


/** Maneja la adición de una nueva comida. */
function agregarComida() {
    const input = document.getElementById('input-comida');
    const nombreComida = input.value.trim();

    if (!nombreComida) {
        alert("Por favor, introduce el nombre de una comida.");
        return;
    }

    // Verificar si ya existe (sin importar mayúsculas/minúsculas)
    const existe = listaComidas.some(c => c.nombre.toLowerCase() === nombreComida.toLowerCase());

    if (existe) {
        alert(`"${nombreComida}" ya existe en la lista.`);
        input.value = '';
        return;
    }

    listaComidas.push({ nombre: nombreComida });
    guardarComidas();
    input.value = ''; // Limpiar input
    alert(`"${nombreComida}" agregada correctamente.`);
}


// ====================================================================
// INICIALIZACIÓN Y EVENT LISTENERS
// ====================================================================

function inicializar() {
    cargarDatos();
    renderizarLista();
    verificarGiroDiario();

    // Event Listeners
    document.getElementById('btn-agregar').addEventListener('click', agregarComida);
    document.getElementById('btn-girar').addEventListener('click', () => {
        girarComida(false);
        // Después del giro normal, habilitamos el 'Volver a Girar'
        document.getElementById('btn-volver-girar').disabled = false;
    });
    document.getElementById('btn-volver-girar').addEventListener('click', () => {
        girarComida(true);
        // Después del re-giro, lo deshabilitamos
        document.getElementById('btn-volver-girar').disabled = true;
    });
}

// Iniciar la aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', inicializar);