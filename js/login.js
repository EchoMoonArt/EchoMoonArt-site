// =========================================================
// js/login.js
// Handles sign-in on login.html.
//
// If Mani is already signed in (e.g. she has a valid session
// from a previous visit), this skips straight to the
// dashboard instead of showing the login form again.
//
// Loaded as a <script type="module">, only on login.html.
// =========================================================

import { auth } from "./firebase-config.js";
import {
    signInWithEmailAndPassword,
    onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/10.13.1/firebase-auth.js";

// If already logged in, skip the form entirely.
onAuthStateChanged(auth, (user) => {
    if (user) {
        window.location.href = 'dashboard.html';
    }
});

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('loginForm');
    if (!form) return;

    const submitBtn = form.querySelector('button[type="submit"]');
    const statusEl = document.getElementById('loginStatus');

    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        const email = form.email.value.trim();
        const password = form.password.value;

        if (!email || !password) {
            showStatus('Please enter your email and password.', 'error');
            return;
        }

        setLoading(true);
        showStatus('', null);

        try {
            await signInWithEmailAndPassword(auth, email, password);
            window.location.href = 'dashboard.html';
        } catch (err) {
            showStatus(friendlyErrorMessage(err.code), 'error');
            setLoading(false);
        }
    });

    function setLoading(isLoading) {
        if (!submitBtn) return;
        submitBtn.disabled = isLoading;
        submitBtn.textContent = isLoading ? 'Signing in…' : 'Sign In';
    }

    function showStatus(text, type) {
        if (!statusEl) return;
        statusEl.textContent = text;
        statusEl.className = 'form-status' + (type ? ` form-status-${type}` : '');
        statusEl.hidden = !text;
    }

    function friendlyErrorMessage(code) {
        switch (code) {
            case 'auth/invalid-credential':
            case 'auth/wrong-password':
            case 'auth/user-not-found':
                return 'Incorrect email or password.';
            case 'auth/too-many-requests':
                return 'Too many attempts. Please wait a moment and try again.';
            case 'auth/invalid-email':
                return 'That email address doesn\'t look right.';
            default:
                return 'Something went wrong signing in. Please try again.';
        }
    }
});