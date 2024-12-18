import { auth } from "./firebaseConfig.js";
import { signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-auth.js";
import { renderProducts } from "./products.js";
import { renderSalesHistory } from "./sales.js";
import { loadInitialBalance, updateFinancialSummary } from "./financialSummary.js";

const loginForm = document.getElementById("loginForm");
const productSection = document.getElementById("productSection");

loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    signInWithEmailAndPassword(auth, email, password)
        .then(() => {
            loginForm.style.display = "none";
            productSection.style.display = "block";
        })
        .catch((error) => {
            alert("Error de inicio de sesión: " + error.message);
        });
});

onAuthStateChanged(auth, (user) => {
    if (user) {
        loginForm.style.display = "none";
        productSection.style.display = "block";
        renderProducts();
        renderSalesHistory();
        loadInitialBalance();
        updateFinancialSummary();
    } else {
        loginForm.style.display = "block";
        productSection.style.display = "none";
    }
});

const logoutButton = document.getElementById("logoutButton");
logoutButton.addEventListener("click", () => {
    signOut(auth).then(() => {
        productSection.style.display = "none";
        loginForm.style.display = "block";
    });
});
