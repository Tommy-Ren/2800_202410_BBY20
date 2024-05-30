import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, FacebookAuthProvider } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

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
const googleProvider = new GoogleAuthProvider();
const facebookProvider = new FacebookAuthProvider();

document.addEventListener('DOMContentLoaded', () => {

    // Function to handle signup with popup and retry logic
    function signUpAndRetry(provider, delay) {
        signInWithPopup(auth, provider)
        .then((result) => {

            // Gives the Google or Facebook Access Token
            const credential = provider === googleProvider 
                ? GoogleAuthProvider.credentialFromResult(result)
                : FacebookAuthProvider.credentialFromResult(result);
            const token = credential.accessToken;
            
            // The signed-in user info.
            const user = result.user;
            const name = user.displayName;
            const email = user.email;
            const pass = user.password || "freshstock"; // Default Password for Google signup

            // Send the user data to your server
            fetch('/signupSubmit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                },
                body: JSON.stringify({
                    name: name,
                    email: email,
                    password: pass 
                })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    window.location.href = "/connection"; // Redirect connection if success
                } else {
                    alert("Can't create user");
                }
            })
        })
        .catch((error) => {
            if (error.code === 'auth/popup-closed-by-user') {
                setTimeout(() => {
                    signUpAndRetry(provider, delay);
                }, delay)
            }
        });
    }

    // Add event listener to the Google Sign Up button
    document.getElementById('signup-google').addEventListener('click', () => {
        signUpAndRetry(googleProvider, 1000)
    });

    // Add event listener to the Facebook Sign Up button
    document.getElementById('signup-facebook').addEventListener('click', () => {
        signUpAndRetry(facebookProvider, 1000)
    });
});