import { db } from "./firebaseConfig.js";
import { doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-firestore.js";

let initialBalance = 0;
let totalSpent = 0;
let totalProfit = 0;

const initialBalanceInput = document.getElementById("initialBalance");
const totalBalanceDisplay = document.getElementById("totalBalance");
const setInitialBalanceButton = document.getElementById("setInitialBalance");
const totalSpentDisplay = document.getElementById("totalSpent");
const totalProfitDisplay = document.getElementById("totalProfit");

async function updateFinancialSummary() {
    totalSpentDisplay.textContent = `$${totalSpent.toFixed(2)}`;
    totalProfitDisplay.textContent = `$${totalProfit.toFixed(2)}`;
    totalBalanceDisplay.textContent = `$${(initialBalance + totalProfit - totalSpent).toFixed(2)}`;
}

async function loadInitialBalance() {
    const balanceDocRef = doc(db, "financialSummary", "initialBalance");
    const docSnap = await getDoc(balanceDocRef);

    if (docSnap.exists()) {
        initialBalance = docSnap.data().initialBalance;
        initialBalanceInput.value = initialBalance;
        await updateFinancialSummary();
    }
}

setInitialBalanceButton.addEventListener("click", async () => {
    const balance = parseFloat(initialBalanceInput.value);
    if (isNaN(balance) || balance < 0) {
        alert("Por favor, ingresa un monto válido.");
        return;
    }

    initialBalance = balance;
    await setDoc(doc(db, "financialSummary", "initialBalance"), { initialBalance: balance });
    await updateFinancialSummary();
    alert("Monto inicial guardado correctamente.");
});

export { updateFinancialSummary, loadInitialBalance, initialBalance, totalSpent, totalProfit };
