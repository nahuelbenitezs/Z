import { updateFinancialSummary, loadInitialBalance } from "./financialSummary.js";
import { renderProducts } from "./products.js";
import { renderSalesHistory } from "./sales.js";
import { signOut } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-auth.js";
import { auth } from "./firebaseConfig.js";

document.addEventListener("DOMContentLoaded", () => {
    const navLinks = document.querySelectorAll(".navbar-nav .nav-link");
    const sections = document.querySelectorAll(".dashboard-section");
    const logoutButton = document.getElementById("logoutButton");

    // Manejo de navegación entre secciones
    navLinks.forEach(link => {
        link.addEventListener("click", (event) => {
            event.preventDefault();
            const sectionId = link.getAttribute("data-section");

            // Verificar si la sección existe
            const activeSection = document.getElementById(sectionId);
            if (!activeSection) {
                console.error(`Sección "${sectionId}" no encontrada.`);
                return;
            }

            // Ocultar todas las secciones
            sections.forEach(section => section.classList.add("d-none"));

            // Mostrar la sección activa
            activeSection.classList.remove("d-none");

            // Cambiar el estado activo en la navegación
            navLinks.forEach(nav => nav.classList.remove("active"));
            link.classList.add("active");

            // Inicializar funcionalidades específicas según la sección
            switch (sectionId) {
                case "financialSummary":
                    loadInitialBalance();
                    updateFinancialSummary();
                    break;
                case "products":
                    renderProducts();
                    break;
                case "sales":
                    renderSalesHistory();
                    break;
                default:
                    console.warn(`No se han definido acciones para la sección: ${sectionId}`);
            }
        });
    });

    // Cargar Resumen Financiero por defecto al iniciar
    loadInitialBalance();
    updateFinancialSummary();

    // Manejo del cierre de sesión
    if (logoutButton) {
        logoutButton.addEventListener("click", () => {
            signOut(auth)
                .then(() => {
                    alert("Sesión cerrada correctamente.");
                    window.location.href = "index.html";
                })
                .catch((error) => {
                    console.error("Error al cerrar sesión:", error);
                    alert("Error al cerrar sesión: " + error.message);
                });
        });
    } else {
        console.warn("El botón de cierre de sesión no se encontró en el DOM.");
    }
});
