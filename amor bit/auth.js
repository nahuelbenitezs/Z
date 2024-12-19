import { auth } from "./firebaseConfig.js";
import { signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-auth.js";

const loginForm = document.getElementById("loginForm");

// Manejo del inicio de sesión
if (loginForm) {
    loginForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;

        signInWithEmailAndPassword(auth, email, password)
            .then(() => {
                window.location.href = "dashboard.html";
            })
            .catch((error) => {
                alert("Error de inicio de sesión: " + error.message);
            });
    });
}

// Manejo del estado de autenticación
onAuthStateChanged(auth, (user) => {
    if (!user && window.location.pathname.includes("dashboard.html")) {
        window.location.href = "index.html";
    }
});

// Manejo del cierre de sesión
const logoutButton = document.getElementById("logoutButton");
if (logoutButton) {
    logoutButton.addEventListener("click", () => {
        signOut(auth)
            .then(() => {
                alert("Sesión cerrada correctamente.");
                window.location.href = "index.html";
            })
            .catch((error) => {
                alert("Error al cerrar sesión: " + error.message);
                console.error("Error al cerrar sesión:", error);
            });
    });
} else {
    console.warn("El botón de cierre de sesión no se encontró en el DOM.");
}
