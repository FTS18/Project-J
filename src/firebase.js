import { initializeApp } from "firebase/app"; // Use modular imports
import { getAuth } from "firebase/auth";       // Import Firebase Auth
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

const app = initializeApp(firebaseConfig);
const auth = getAuth(app); // Initialize Firebase Auth
const database = getDatabase(app);

export { app, auth, database, ref, onValue, set, get };