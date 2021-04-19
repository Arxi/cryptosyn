import firebase from "firebase/app";
import "firebase/analytics";
import "firebase/auth";
import "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyCSX3mNG7rKEOghK5DKbydZ1uRioNAMvFw",
    authDomain: "cryptosyn.firebaseapp.com",
    projectId: "cryptosyn",
    storageBucket: "cryptosyn.appspot.com",
    messagingSenderId: "879058630357",
    appId: "1:879058630357:web:9f44d091bf3b6950d8145c",
    measurementId: "G-MHQJMKRMS3"
};
firebase.initializeApp(firebaseConfig);

// utils
const db = firebase.firestore();
const auth = firebase.auth();

// collection references
const coinsCollection = db.collection('coins');

// export utils/refs
export {
    db,
    auth,
    coinsCollection,
};
