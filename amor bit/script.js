// Firebase configuration and initialization
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, updateDoc, doc, deleteDoc } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-firestore.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyA-FaBtKCZkkssNz-luKbe3ETGO2vp91ZY",
    authDomain: "luges-bb7f8.firebaseapp.com",
    projectId: "luges-bb7f8",
    storageBucket: "luges-bb7f8.firebasestorage.app",
    messagingSenderId: "1060302349549",
    appId: "1:1060302349549:web:83b12f75140eeeff2918e4"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

document.addEventListener("DOMContentLoaded", async () => {
    const loginForm = document.getElementById("loginForm");
    const productSection = document.getElementById("productSection");
    const logoutButton = document.getElementById("logoutButton");

    loginForm.addEventListener("submit", (event) => {
        event.preventDefault();
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

    logoutButton.addEventListener("click", () => {
        signOut(auth)
            .then(() => {
                productSection.style.display = "none";
                loginForm.style.display = "block";
            })
            .catch((error) => {
                alert("Error al cerrar sesión: " + error.message);
            });
    });

    onAuthStateChanged(auth, (user) => {
        if (user) {
            loginForm.style.display = "none";
            productSection.style.display = "block";
            initializeCRUD();
        } else {
            loginForm.style.display = "block";
            productSection.style.display = "none";
        }
    });

    async function initializeCRUD() {
        const productForm = document.getElementById("productForm");
        const productTableBody = document.getElementById("productTableBody");
        const salesHistoryBody = document.getElementById("salesHistoryBody");
        const totalSpent = document.getElementById("totalSpent");
        const totalProfit = document.getElementById("totalProfit");

        const productsRef = collection(db, "products");
        const salesRef = collection(db, "salesHistory");

        let totalSpentAmount = 0;
        let totalProfitAmount = 0;

        productForm.addEventListener("submit", async (event) => {
            event.preventDefault();

            const productName = document.getElementById("productName").value;
            const productPhoto = document.getElementById("productPhoto").value;
            const productPurchasePrice = parseFloat(document.getElementById("productPurchasePrice").value);
            const productSalePrice = parseFloat(document.getElementById("productSalePrice").value);
            const productStock = parseInt(document.getElementById("productStock").value);

            const product = {
                name: productName,
                photo: productPhoto,
                purchasePrice: productPurchasePrice,
                salePrice: productSalePrice,
                stock: productStock,
            };

            await addDoc(productsRef, product);
            totalSpentAmount += productPurchasePrice * productStock;
            updateFinancialSummary();
            renderProducts();
            productForm.reset();
        });

        async function renderProducts() {
            productTableBody.innerHTML = "";
            const querySnapshot = await getDocs(productsRef);
            querySnapshot.forEach((doc) => {
                const product = doc.data();
                const row = document.createElement("tr");
                row.innerHTML = `
                    <td>${product.name}</td>
                    <td>${product.photo ? `<img src="${product.photo}" alt="${product.name}" style="width: 50px; height: 50px;">` : "N/A"}</td>
                    <td>$${product.purchasePrice.toFixed(2)}</td>
                    <td>$${product.salePrice.toFixed(2)}</td>
                    <td>${product.stock}</td>
                    <td>
                        <button class="btn btn-success btn-sm" onclick="sellProduct('${doc.id}', ${product.stock}, ${product.salePrice}, ${product.purchasePrice})">Vender</button>
                        <button class="btn btn-danger btn-sm" onclick="deleteProduct('${doc.id}')">Eliminar</button>
                    </td>
                `;
                productTableBody.appendChild(row);
            });
        }

        window.deleteProduct = async (id) => {
            await deleteDoc(doc(db, "products", id));
            renderProducts();
        };

        window.sellProduct = async (id, stock, salePrice, purchasePrice) => {
            const quantity = parseInt(prompt("Ingrese la cantidad vendida:"));
            if (isNaN(quantity) || quantity <= 0) {
                alert("Cantidad no válida.");
                return;
            }

            if (quantity > stock) {
                alert("No hay suficiente stock disponible.");
                return;
            }

            const newStock = stock - quantity;
            const saleTotal = salePrice * quantity;
            const purchaseTotal = purchasePrice * quantity;

            await updateDoc(doc(db, "products", id), { stock: newStock });

            await addDoc(salesRef, {
                productName: id,
                quantity,
                date: new Date().toLocaleDateString(),
                total: saleTotal,
            });

            totalProfitAmount += saleTotal - purchaseTotal;
            updateFinancialSummary();
            renderProducts();
            renderSalesHistory();
        };

        async function renderSalesHistory() {
            salesHistoryBody.innerHTML = "";
            const querySnapshot = await getDocs(salesRef);
            querySnapshot.forEach((doc) => {
                const sale = doc.data();
                const row = document.createElement("tr");
                row.innerHTML = `
                    <td>${sale.productName}</td>
                    <td>${sale.quantity}</td>
                    <td>${sale.date}</td>
                    <td>$${sale.total.toFixed(2)}</td>
                `;
                salesHistoryBody.appendChild(row);
            });
        }

        function updateFinancialSummary() {
            totalSpent.textContent = `$${totalSpentAmount.toFixed(2)}`;
            totalProfit.textContent = `$${totalProfitAmount.toFixed(2)}`;
        }

        renderProducts();
        renderSalesHistory();
        updateFinancialSummary();
    }
});
