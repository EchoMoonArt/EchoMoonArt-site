// =========================================================
// js/firebase-config.js
// Initializes Firebase for use on contact.html (and later
// login.html). Loaded as a <script type="module"> — only
// on the pages that actually need Firebase, so the rest of
// the site stays plain vanilla JS.
//
// NOTE: these values are NOT secret. The Firebase web config
// is meant to be public — it's how the browser knows which
// Firebase project to talk to. Actual security is enforced
// by Firestore Security Rules (see the rules provided
// separately), not by hiding this config.
//
// Get these values from:
// Firebase console -> Project settings (gear icon) -> General
// -> "Your apps" -> select the web app -> SDK setup and configuration
// =========================================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-auth.js";

// TODO: replace with Mani's actual Firebase config values.
const firebaseConfig = {
    apiKey: "AIzaSyAjbFi_W1zRNdmMHRbMYU8yq3fdUtWiyRg",
    authDomain: "echomoonart-5c25c.firebaseapp.com",
    databaseURL: "https://echomoonart-5c25c-default-rtdb.firebaseio.com",
    projectId: "echomoonart-5c25c",
    storageBucket: "echomoonart-5c25c.firebasestorage.app",
    messagingSenderId: "981942658843",
    appId: "1:981942658843:web:7c3caafcea68b9255f55be",
    measurementId: "G-GCW7P665S1"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);