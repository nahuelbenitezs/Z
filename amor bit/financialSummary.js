import { db } from "./firebaseConfig.js";
import { doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-firestore.js";

export let initialBalance = 0;
export let totalSpent = 0;
export let totalProfit = 0;

export async function updateFinancialSummary() {
    const totalSpentDisplay = document.getElementById("totalSpent");
    const totalProfitDisplay = document.getElementById("totalProfit");
    const totalBalanceDisplay = document.getElementById("totalBalance");

    if (totalSpentDisplay && totalProfitDisplay && totalBalanceDisplay) {
        totalSpentDisplay.textContent = `$${totalSpent.toFixed(2)}`;
        totalProfitDisplay.textContent = `$${totalProfit.toFixed(2)}`;
        totalBalanceDisplay.textContent = `$${(initialBalance + totalProfit - totalSpent).toFixed(2)}`;
    }
}

export async function loadInitialBalance() {
    const initialBalanceInput = document.getElementById("initialBalance");
    const balanceDocRef = doc(db, "financialSummary", "initialBalance");
    const docSnap = await getDoc(balanceDocRef);

    if (docSnap.exists()) {
        initialBalance = docSnap.data().initialBalance;
        if (initialBalanceInput) {
            initialBalanceInput.value = initialBalance;
        }
        await updateFinancialSummary();
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const setInitialBalanceButton = document.getElementById("setInitialBalance");

    if (setInitialBalanceButton) {
        setInitialBalanceButton.addEventListener("click", async () => {
            const initialBalanceInput = document.getElementById("initialBalance");
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
    }

    loadInitialBalance();
});
