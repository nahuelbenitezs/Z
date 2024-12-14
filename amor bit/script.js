// Firebase configuration and initialization
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-app.js";
import { getFirestore, collection, addDoc, getDoc, updateDoc, doc, deleteDoc, setDoc, getDocs } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-firestore.js";
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

let totalSpent = 0;
let totalProfit = 0;

// DOM Elements
const loginForm = document.getElementById("loginForm");
const productSection = document.getElementById("productSection");
const productForm = document.getElementById("productForm");
const productTableBody = document.getElementById("productTableBody");
const salesHistoryBody = document.getElementById("salesHistoryBody");
const totalSpentDisplay = document.getElementById("totalSpent");
const totalProfitDisplay = document.getElementById("totalProfit");


// Functions
async function updateFinancialSummary() {

    totalSpentDisplay.textContent = `$${totalSpent.toFixed(2)}`;
    totalProfitDisplay.textContent = `$${totalProfit.toFixed(2)}`;
    totalBalanceDisplay.textContent = `$${initialBalance.toFixed(2)}`;

}

async function renderProducts() {
    productTableBody.innerHTML = "";
    const querySnapshot = await getDocs(collection(db, "products"));
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
                <button class="btn btn-danger btn-sm" onclick="deleteProduct('${doc.id}')">Eliminar</button>
                <button class="btn btn-success btn-sm" onclick="sellProduct('${doc.id}', ${product.stock}, ${product.salePrice}, ${product.purchasePrice})">Vender</button>
            </td>
        `;
        productTableBody.appendChild(row);
    });
}

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
            <td>$${sale.total.toFixed(2)}</td>
        `;
        salesHistoryBody.appendChild(row);
    });
}

window.deleteProduct = async (id) => {
    // Obtén el producto antes de eliminarlo para saber cuánto gastaste en él
    const productDoc = await getDoc(doc(db, "products", id));
    if (productDoc.exists()) {
        const productData = productDoc.data();
        const productTotalSpent = productData.purchasePrice * productData.stock;

        // Elimina el producto de Firebase
        await deleteDoc(doc(db, "products", id));

        // Actualiza el total gastado
        totalSpent -= productTotalSpent;
        await updateFinancialSummary(); // Actualiza el resumen financiero
        await renderProducts(); // Vuelve a renderizar los productos
    }
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

    //actualiza el stock en firestore
    await updateDoc(doc(db, "products", id), { stock: newStock });

    //registra la venta en el historial
    await addDoc(collection(db, "salesHistory"), {
        productName: id,
        quantity,
        date: new Date().toLocaleDateString(),
        total: saleTotal,
    });

    totalProfit += saleTotal - purchaseTotal;
    console.log(saleTotal)
    initialBalance += saleTotal;

    // Actualizar el balance en Firestore
    const balanceDocRef = doc(db, "financialSummary", "initialBalance");
    await setDoc(balanceDocRef, { initialBalance });  // Guardar el nuevo balance en Firebase

    await updateFinancialSummary();
    await renderProducts();
    await renderSalesHistory();
};

// Authentication
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

async function calculateTotalSpent() {
    totalSpent = 0; // Reinicia el total gastado
    const querySnapshot = await getDocs(collection(db, "products"));
    querySnapshot.forEach((doc) => {
        const product = doc.data();
        totalSpent += product.purchasePrice * product.stock; // Calcula el total gastado
    });
    await updateFinancialSummary(); // Actualiza el resumen financiero
}

// Cargar datos iniciales al iniciar sesión
onAuthStateChanged(auth, (user) => {
    if (user) {
        loginForm.style.display = "none";
        productSection.style.display = "block";
        renderProducts();
        renderSalesHistory();
        loadInitialBalance(); // Cargar el balance inicial
        calculateTotalSpent(); // Cargar y calcular el total gastado
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

productForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("productName").value;
    const photo = document.getElementById("productPhoto").value;
    const purchasePrice = parseFloat(document.getElementById("productPurchasePrice").value);
    const salePrice = parseFloat(document.getElementById("productSalePrice").value);
    const stock = parseInt(document.getElementById("productStock").value);

    // Calcula el total gastado por el nuevo producto
    const productTotalSpent = purchasePrice * stock;

    const product = { name, photo, purchasePrice, salePrice, stock };

    await addDoc(collection(db, "products"), product);

    // Actualiza el total gastado
    totalSpent += productTotalSpent;

    // Actualiza el balance total disponible
    initialBalance -= productTotalSpent;

    // Actualiza el balance en Firebase
    const balanceDocRef = doc(db, "financialSummary", "initialBalance");
    await setDoc(balanceDocRef, { initialBalance });

    await updateFinancialSummary();
    await renderProducts();
    productForm.reset();
});


//monto inicial

const initialBalanceInput = document.getElementById("initialBalance");
const totalBalanceDisplay = document.getElementById("totalBalance");
const setInitialBalanceButton = document.getElementById("setInitialBalance");

let initialBalance = 0; // Variable para guardar el monto inicial

async function updateTotalBalance() {
    const totalBalance = initialBalance + totalProfit - totalSpent;
    totalBalanceDisplay.textContent = `$${totalBalance.toFixed(2)}`;
}

setInitialBalanceButton.addEventListener("click", async () => {
    const balance = parseFloat(initialBalanceInput.value);

    if (isNaN(balance) || balance < 0) {
        alert("Por favor, ingresa un monto válido.");
        return;
    }

    initialBalance = balance;

    // Guardar en Firebase
    const balanceDocRef = doc(db, "financialSummary", "initialBalance");
    await setDoc(balanceDocRef, { initialBalance: balance });

    await updateTotalBalance();
    alert("Monto inicial guardado correctamente.");
});

// Recuperar el balance inicial al cargar
async function loadInitialBalance() {
    const balanceDocRef = doc(db, "financialSummary", "initialBalance");
    const docSnap = await getDoc(balanceDocRef);

    if (docSnap.exists()) {
        initialBalance = docSnap.data().initialBalance;
        initialBalanceInput.value = initialBalance;
        await updateTotalBalance();
    }
}


