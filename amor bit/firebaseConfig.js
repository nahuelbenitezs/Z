import { initializeApp } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-auth.js";

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

export { app, db, auth };
