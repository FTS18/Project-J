// src/firebase.js
import { initializeApp } from "firebase/app"; // Use modular imports
import { getDatabase, ref, onValue, set, get } from "firebase/database"; // Import Realtime Database functions

// Your Firebase project configuration
const firebaseConfig = {
    apiKey: "AIzaSyDc1TevGso9fI3sBSEaqE5_WqsBGA-_zXk",
    authDomain: "views-4576f.firebaseapp.com",
    databaseURL: "https://views-4576f-default-rtdb.firebaseio.com",
    projectId: "views-4576f",
    storageBucket: "views-4576f.firebasestorage.app",
    messagingSenderId: "666092567983",
    appId: "1:666092567983:web:c868e1973002f7bcb6435a"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app); 

export { app, database, ref, onValue, set, get }; 