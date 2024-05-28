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

document.addEventListener('DOMContentLoaded', () => {
    
    // Add event listener to the Google Login button
    document.getElementById('login-google').addEventListener('click', () => {
        setTimeout(() => {
            signInWithPopup(auth, provider)
            .then((result) => {
                // This gives you a Google Access Token. You can use it to access the Google API.
                const credential = GoogleAuthProvider.credentialFromResult(result);
                const token = credential.accessToken;
                
                // The signed-in user info.
                const user = result.user;
                const email = user.email;
                const pass = "freshstock" // Default Password for Google sign-ins

                // Send the user data to your server
                fetch('/loggingin', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        email: email,
                        password: pass 
                    })
                })
            }).then(() => {
                // Redirect to the connection page
                window.location.href = "/home";
            });
        }, 500);
    });
});