// =========================================================
// js/dashboard.js
// Handles dashboard.html — the private message viewer.
//
// - Redirects to login.html if Mani isn't signed in.
// - Listens to the Firestore "messages" collection in real
//   time (onSnapshot), so new contact form submissions show
//   up automatically without needing a page refresh.
// - Lets her mark messages read/unread and delete them.
//
// Loaded as a <script type="module">, only on dashboard.html.
// =========================================================

import { auth, db } from "./firebase-config.js";
import {
    onAuthStateChanged,
    signOut,
} from "https://www.gstatic.com/firebasejs/10.13.1/firebase-auth.js";
import {
    collection,
    query,
    orderBy,
    onSnapshot,
    doc,
    updateDoc,
    deleteDoc,
} from "https://www.gstatic.com/firebasejs/10.13.1/firebase-firestore.js";

let allMessages = [];
let currentFilter = 'all';
let unsubscribeMessages = null;

// ---- auth guard ----
onAuthStateChanged(auth, (user) => {
    if (!user) {
        window.location.href = 'login.html';
        return;
    }
    startListening();
});

document.addEventListener('DOMContentLoaded', () => {
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            if (unsubscribeMessages) unsubscribeMessages();
            await signOut(auth);
            window.location.href = 'login.html';
        });
    }

    const filterBar = document.querySelector('.dashboard-filter-bar');
    if (filterBar) {
        filterBar.addEventListener('click', (event) => {
            const btn = event.target.closest('.filter-btn');
            if (!btn) return;

            filterBar.querySelectorAll('.filter-btn').forEach((b) => b.classList.remove('is-active'));
            btn.classList.add('is-active');
            currentFilter = btn.dataset.filter;
            render();
        });
    }
});

function startListening() {
    const messagesQuery = query(collection(db, 'messages'), orderBy('createdAt', 'desc'));

    unsubscribeMessages = onSnapshot(messagesQuery, (snapshot) => {
        allMessages = snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }));
        render();
    }, (err) => {
        console.error('Failed to load messages:', err);
        const sub = document.getElementById('dashboardSub');
        if (sub) sub.textContent = 'Something went wrong loading messages.';
    });
}

function render() {
    const list = document.getElementById('messageList');
    const empty = document.getElementById('dashboardEmpty');
    const sub = document.getElementById('dashboardSub');
    if (!list) return;

    const unreadCount = allMessages.filter((m) => !m.read).length;
    if (sub) {
        sub.textContent = allMessages.length === 0
            ? "Nothing here yet."
            : `${unreadCount} unread of ${allMessages.length} total.`;
    }

    const visible = currentFilter === 'unread'
        ? allMessages.filter((m) => !m.read)
        : allMessages;

    list.innerHTML = '';

    if (visible.length === 0) {
        if (empty) {
            empty.hidden = false;
            empty.textContent = currentFilter === 'unread'
                ? "No unread messages."
                : "No messages yet — they'll show up here as soon as someone writes in.";
        }
        return;
    }

    if (empty) empty.hidden = true;

    visible.forEach((msg) => {
        list.appendChild(buildMessageCard(msg));
    });
}

function buildMessageCard(msg) {
    const card = document.createElement('article');
    card.className = 'message-card' + (msg.read ? '' : ' message-card-unread');

    const dateText = msg.createdAt?.toDate
        ? msg.createdAt.toDate().toLocaleString(undefined, {
            month: 'short', day: 'numeric', year: 'numeric',
            hour: 'numeric', minute: '2-digit',
        })
        : 'Just now';

    card.innerHTML = `
        <div class="message-card-header">
            <div class="message-card-who">
                <span class="message-card-name">${escapeHtml(msg.name)}</span>
                <a href="mailto:${escapeHtml(msg.email)}" class="message-card-email">${escapeHtml(msg.email)}</a>
            </div>
            <span class="message-card-date">${dateText}</span>
        </div>
        <p class="message-card-body">${escapeHtml(msg.message)}</p>
        <div class="message-card-actions">
            <button class="message-action" data-action="toggle-read">${msg.read ? 'Mark unread' : 'Mark read'}</button>
            <button class="message-action message-action-danger" data-action="delete">Delete</button>
        </div>
    `;

    card.querySelector('[data-action="toggle-read"]').addEventListener('click', () => toggleRead(msg));
    card.querySelector('[data-action="delete"]').addEventListener('click', () => deleteMessage(msg));

    return card;
}

async function toggleRead(msg) {
    try {
        await updateDoc(doc(db, 'messages', msg.id), { read: !msg.read });
    } catch (err) {
        console.error('Failed to update message:', err);
    }
}

async function deleteMessage(msg) {
    const confirmed = window.confirm(`Delete the message from ${msg.name}? This can't be undone.`);
    if (!confirmed) return;

    try {
        await deleteDoc(doc(db, 'messages', msg.id));
    } catch (err) {
        console.error('Failed to delete message:', err);
    }
}

// Basic HTML escaping so message content can't inject markup into the page.
function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str ?? '';
    return div.innerHTML;
}