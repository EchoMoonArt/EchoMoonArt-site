// =========================================================
// js/contact-form.js
// Handles the contact form on contact.html.
//
// On submit, two things happen:
//   1. The message is saved directly to Firestore from the
//      browser, so it shows up in the (future) login
//      dashboard. This relies on Firestore Security Rules
//      to only allow well-formed "create" writes from the
//      public — see the rules provided alongside this file.
//   2. A POST to /api/contact triggers a Resend email so
//      Mani gets notified immediately, without needing to
//      check the dashboard.
//
// Loaded as a <script type="module">, only on contact.html.
// =========================================================

import { db } from "./firebase-config.js";
import {
    collection,
    addDoc,
    serverTimestamp,
} from "https://www.gstatic.com/firebasejs/10.13.1/firebase-firestore.js";

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('contactForm');
    if (!form) return;

    const submitBtn = form.querySelector('button[type="submit"]');
    const statusEl = document.getElementById('formStatus');

    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        const name = form.name.value.trim();
        const email = form.email.value.trim();
        const message = form.message.value.trim();
        const website = form.website.value; // honeypot — should always be empty

        // Honeypot tripped — silently do nothing, don't tip off the bot.
        if (website) return;

        if (!name || !email || !message) {
            showStatus('Please fill out every field before sending.', 'error');
            return;
        }

        setLoading(true);
        showStatus('', null);

        try {
            // 1. Save the message to Firestore so it appears in the dashboard.
            await addDoc(collection(db, 'messages'), {
                name,
                email,
                message,
                createdAt: serverTimestamp(),
                read: false,
            });

            // 2. Trigger the email notification via the serverless function.
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, message, website }),
            });

            if (!response.ok) {
                // The message was still saved to Firestore even if the email
                // failed, so don't scare the user — just let them know.
                console.error('Email notification failed, but message was saved.');
            }

            form.reset();
            showStatus("Message sent! I'll get back to you soon.", 'success');
        } catch (err) {
            console.error('Contact form submission error:', err);
            showStatus('Something went wrong. Please try again in a moment.', 'error');
        } finally {
            setLoading(false);
        }
    });

    function setLoading(isLoading) {
        if (!submitBtn) return;
        submitBtn.disabled = isLoading;
        submitBtn.textContent = isLoading ? 'Sending…' : 'Send Message';
    }

    function showStatus(text, type) {
        if (!statusEl) return;
        statusEl.textContent = text;
        statusEl.className = 'form-status' + (type ? ` form-status-${type}` : '');
        statusEl.hidden = !text;
    }
});