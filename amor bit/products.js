import { db } from "./firebaseConfig.js";
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-firestore.js";

const productTableBody = document.getElementById("productTableBody");
const productForm = document.getElementById("productForm");

async function renderProducts() {
    try {
        console.log("Cargando productos...");
        if (!productTableBody) {
            console.error("Elemento con id 'productTableBody' no encontrado en el DOM.");
            return;
        }
        productTableBody.innerHTML = ""; // Limpia la tabla antes de llenarla

        const productsSnapshot = await getDocs(collection(db, "products"));

        if (productsSnapshot.empty) {
            console.warn("No hay productos disponibles en Firebase.");
            productTableBody.innerHTML = "<tr><td colspan='7'>No hay productos disponibles</td></tr>";
            return;
        }

        productsSnapshot.forEach((doc) => {
            const product = doc.data();
            console.log("Producto cargado:", product);
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${product.name || "N/A"}</td>
                <td>${product.photo ? `<img src="${product.photo}" style="width: 50px; height: 50px;" />` : "No disponible"}</td>
                <td>$${(product.purchasePrice || 0).toFixed(2)}</td>
                <td>$${(product.salePrice || 0).toFixed(2)}</td>
                <td>${product.stock || 0}</td>
                <td>
                    <button class="btn btn-danger btn-sm" onclick="deleteProduct('${doc.id}')">Eliminar</button>
                    <button class="btn btn-primary btn-sm" onclick="updateStock('${doc.id}', ${product.stock})">Modificar Stock</button>
                    <button class="btn btn-success btn-sm" onclick="sellProduct('${doc.id}', ${product.stock}, ${product.salePrice})">Vender</button>
                </td>
            `;
            productTableBody.appendChild(row);
        });
        console.log("Contenido renderizado en la tabla: ", productTableBody.innerHTML);
        console.log("Productos cargados correctamente.");
    } catch (error) {
        console.error("Error al cargar productos:", error);
    }
}

async function deleteProduct(productId) {
    try {
        await deleteDoc(doc(db, "products", productId));
        alert("Producto eliminado correctamente.");
        renderProducts();
    } catch (error) {
        console.error("Error al eliminar producto:", error);
        alert("No se pudo eliminar el producto.");
    }
}

async function updateStock(productId, currentStock) {
    const newStock = parseInt(prompt("Ingrese la nueva cantidad de stock:", currentStock));
    if (isNaN(newStock) || newStock < 0) {
        alert("Cantidad no válida.");
        return;
    }
    try {
        await updateDoc(doc(db, "products", productId), { stock: newStock });
        alert("Stock actualizado correctamente.");
        renderProducts();
    } catch (error) {
        console.error("Error al actualizar stock:", error);
        alert("No se pudo actualizar el stock.");
    }
}

async function sellProduct(productId, currentStock, salePrice) {
    if (currentStock <= 0) {
        alert("No hay stock disponible para vender.");
        return;
    }
    const quantity = parseInt(prompt("Ingrese la cantidad a vender:", 1));
    if (isNaN(quantity) || quantity <= 0 || quantity > currentStock) {
        alert("Cantidad no válida.");
        return;
    }
    try {
        const newStock = currentStock - quantity;
        const totalSale = quantity * salePrice;
        await updateDoc(doc(db, "products", productId), { stock: newStock });
        alert(`Venta realizada correctamente. Total: $${totalSale.toFixed(2)}`);
        renderProducts();
    } catch (error) {
        console.error("Error al realizar la venta:", error);
        alert("No se pudo completar la venta.");
    }
}

// Hacer las funciones globales
window.deleteProduct = deleteProduct;
window.updateStock = updateStock;
window.sellProduct = sellProduct;

if (productForm) {
    productForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const name = document.getElementById("productName").value;
        const photo = document.getElementById("productPhoto").value;
        const purchasePrice = parseFloat(document.getElementById("productPurchasePrice").value);
        const salePrice = parseFloat(document.getElementById("productSalePrice").value);
        const stock = parseInt(document.getElementById("productStock").value);

        if (!name || isNaN(purchasePrice) || isNaN(salePrice) || isNaN(stock)) {
            alert("Por favor, complete todos los campos correctamente.");
            return;
        }

        try {
            await addDoc(collection(db, "products"), {
                name,
                photo,
                purchasePrice,
                salePrice,
                stock
            });
            alert("Producto agregado correctamente.");
            productForm.reset();
            renderProducts();
        } catch (error) {
            console.error("Error al agregar producto:", error);
            alert("No se pudo agregar el producto.");
        }
    });
}

export { renderProducts };
