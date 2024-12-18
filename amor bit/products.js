import { db } from "./firebaseConfig.js";
import { collection, addDoc, getDocs, deleteDoc, doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-firestore.js";
import { updateFinancialSummary } from "./financialSummary.js";
import { renderSalesHistory } from "./sales.js";

const productForm = document.getElementById("productForm");
const productTableBody = document.getElementById("productTableBody");

let totalProfit = 0; // Declarar como mutable
let totalSpent = 0; // Declarar como mutable

async function renderProducts() {
    productTableBody.innerHTML = "";
    const querySnapshot = await getDocs(collection(db, "products"));
    querySnapshot.forEach((doc) => {
        const product = doc.data();
        const row = document.createElement("tr");
        row.setAttribute("data-id", doc.id);
        row.innerHTML = `
            <td>${product.name}</td>
            <td>${product.photo ? `<img src="${product.photo}" style="width: 50px; height: 50px;">` : "N/A"}</td>
            <td>$${product.purchasePrice.toFixed(2)}</td>
            <td>$${product.salePrice.toFixed(2)}</td>
            <td>${product.stock}</td>
            <td>
                <button class="btn btn-danger btn-sm" onclick="deleteProduct('${doc.id}')">Eliminar</button>
                <button class="btn btn-success btn-sm" onclick="sellProduct('${doc.id}', ${product.stock}, ${product.salePrice}, ${product.purchasePrice})">Vender</button>
                <button class="btn btn-primary btn-sm" onclick="modifyStock('${doc.id}', ${product.stock})">Modificar Stock</button>
            </td>`;
        productTableBody.appendChild(row);
    });
}

async function deleteProduct(id) {
    try {
        const productDoc = await getDoc(doc(db, "products", id));
        if (productDoc.exists()) {
            const productData = productDoc.data();
            const productTotalSpent = productData.purchasePrice * productData.stock;

            await deleteDoc(doc(db, "products", id));
            totalSpent -= productTotalSpent; // Actualiza la variable local
            await updateFinancialSummary();

            const productRow = document.querySelector(`tr[data-id="${id}"]`);
            if (productRow) {
                productRow.remove();
            }
        }
    } catch (error) {
        console.error("Error al eliminar el producto:", error);
        alert("Hubo un error al intentar eliminar el producto.");
    }
}

async function sellProduct(id, stock, salePrice, purchasePrice) {
    const quantity = parseInt(prompt("Ingrese la cantidad vendida:"));
    if (isNaN(quantity) || quantity <= 0 || quantity > stock) {
        alert("Cantidad no válida.");
        return;
    }

    try {
        const newStock = stock - quantity;
        const saleTotal = salePrice * quantity;
        const purchaseTotal = purchasePrice * quantity;

        await updateDoc(doc(db, "products", id), { stock: newStock });

        await addDoc(collection(db, "salesHistory"), {
            productName: id,
            quantity,
            date: new Date().toLocaleDateString(),
            total: saleTotal,
        });

        totalProfit += saleTotal - purchaseTotal; // Actualiza la ganancia localmente
        totalSpent += purchaseTotal; // Incrementa los gastos locales
        await updateFinancialSummary();

        await renderProducts();
        await renderSalesHistory();
    } catch (error) {
        console.error("Error al vender el producto:", error);
        alert("Hubo un error al intentar realizar la venta.");
    }
}

async function modifyStock(id, currentStock) {
    const additionalStock = parseInt(prompt(`Stock actual: ${currentStock}\nIngresa la cantidad adicional:`));
    if (isNaN(additionalStock) || additionalStock < 0) {
        alert("Cantidad no válida.");
        return;
    }

    const newStock = currentStock + additionalStock;

    try {
        await updateDoc(doc(db, "products", id), { stock: newStock });
        alert("Stock actualizado correctamente.");
        await renderProducts();
    } catch (error) {
        console.error("Error al modificar el stock:", error);
        alert("Hubo un error al intentar modificar el stock.");
    }
}

productForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("productName").value;
    const photo = document.getElementById("productPhoto").value;
    const purchasePrice = parseFloat(document.getElementById("productPurchasePrice").value);
    const salePrice = parseFloat(document.getElementById("productSalePrice").value);
    const stock = parseInt(document.getElementById("productStock").value);

    try {
        await addDoc(collection(db, "products"), { name, photo, purchasePrice, salePrice, stock });
        await renderProducts();
        productForm.reset();
    } catch (error) {
        console.error("Error al agregar el producto:", error);
        alert("Hubo un error al intentar agregar el producto.");
    }
});

// Hacer las funciones accesibles globalmente
window.deleteProduct = deleteProduct;
window.sellProduct = sellProduct;
window.modifyStock = modifyStock;

export { renderProducts };
