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
    apiKey: "AIzaSyB9-0re5Gx2yAe4e41fs7a2WUqHnOF3AkY",
    authDomain: "echomoonart-ad626.firebaseapp.com",
    projectId: "echomoonart-ad626",
    storageBucket: "echomoonart-ad626.firebasestorage.app",
    messagingSenderId: "769629404046",
    appId: "1:769629404046:web:f09bb12d02edc83a2cc2df"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);