import { initializeApp } from "firebase/app";
import { GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDSjUgmGDvPYc8Mls6_-Uqcx2bOcUEubis",
  authDomain: "freshstock-d8848.firebaseapp.com",
  projectId: "freshstock-d8848",
  storageBucket: "freshstock-d8848.appspot.com",
  messagingSenderId: "740302981733",
  appId: "1:740302981733:web:56646041142393ef1d548c"
};


const app = initializeApp(firebaseConfig);
const provider = new GoogleAuthProvider();

function backgroundColor() {
  if (window.location.pathname === '/setting') {
      document.body.style.background = '#D9D9D9';
  } 
}
backgroundColor();
// Initialize Firebase
