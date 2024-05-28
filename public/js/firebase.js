import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, signInWithPopup, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

// Your Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBfYnMEFewHDlRoUrzzwkRRzKJV4a0ShcQ",
    authDomain: "fresh-stock-21eb2.firebaseapp.com",
    projectId: "fresh-stock-21eb2",
    storageBucket: "fresh-stock-21eb2.appspot.com",
    messagingSenderId: "232096998515",
    appId: "1:232096998515:web:a38d36806b663a60573606"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth();
const provider = new GoogleAuthProvider();