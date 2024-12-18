import { db } from "./firebaseConfig.js";
import { collection, addDoc, getDocs } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-firestore.js";

const salesHistoryBody = document.getElementById("salesHistoryBody");

async function renderSalesHistory() {
    salesHistoryBody.innerHTML = "";
    const querySnapshot = await getDocs(collection(db, "salesHistory"));
    querySnapshot.forEach((doc) => {
        const sale = doc.data();
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${sale.productName}</td>
            <td>${sale.quantity}</td>
            <td>${sale.date}</td>
            <td>$${sale.total.toFixed(2)}</td>`;
        salesHistoryBody.appendChild(row);
    });
}

export { renderSalesHistory };
