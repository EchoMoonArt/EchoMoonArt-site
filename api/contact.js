// =========================================================
// /api/contact.js — Vercel serverless function
// Sends a notification email via Resend whenever the
// contact form on contact.html is submitted.
//
// This function does NOT touch Firestore — the form saves
// the message to Firestore directly from the browser
// (see js/contact-form.js). This function's only job is
// sending the "hey, you got a message" email to Mani.
//
// Required environment variables (set in Vercel dashboard,
// Settings > Environment Variables — never hardcode these):
//   RESEND_API_KEY    — your Resend API key (starts with re_)
//   RESEND_FROM_EMAIL  — verified sender, e.g. "Mani's Art <onboarding@resend.dev>"
//   CONTACT_TO_EMAIL   — the inbox that should receive new message alerts
// =========================================================

module.exports = async function handler(req, res) {
    // Only allow POST — anything else gets rejected.
    if (req.method !== 'POST') {
        res.setHeader('Allow', 'POST');
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { name, email, message, website } = req.body || {};

    // Honeypot check: "website" is a hidden field real users never fill in.
    // If it has a value, it's almost certainly a bot — pretend success and
    // silently drop it instead of telling the bot its submission was rejected.
    if (website) {
        return res.status(200).json({ success: true });
    }

    // ---- basic validation ----
    if (!name || typeof name !== 'string' || name.trim().length === 0 || name.length > 100) {
        return res.status(400).json({ error: 'Please provide a valid name.' });
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || typeof email !== 'string' || !emailPattern.test(email)) {
        return res.status(400).json({ error: 'Please provide a valid email address.' });
    }

    if (!message || typeof message !== 'string' || message.trim().length === 0 || message.length > 5000) {
        return res.status(400).json({ error: 'Please provide a message.' });
    }

    // ---- environment variable check ----
    const { RESEND_API_KEY, RESEND_FROM_EMAIL, CONTACT_TO_EMAIL } = process.env;

    if (!RESEND_API_KEY || !RESEND_FROM_EMAIL || !CONTACT_TO_EMAIL) {
        console.error('Missing required environment variables for /api/contact.');
        return res.status(500).json({ error: 'Server is not configured correctly. Please try again later.' });
    }

    // ---- send the email via Resend's REST API ----
    // Using plain fetch (built into Node 18+, which Vercel uses) instead of
    // the Resend npm package, so there's no dependency/package.json to manage.
    try {
        const resendResponse = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${RESEND_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                from: RESEND_FROM_EMAIL,
                to: CONTACT_TO_EMAIL,
                reply_to: email,
                subject: `New commission inquiry from ${name}`,
                text:
                    `You've got a new message from Mani's Art:\n\n` +
                    `Name: ${name}\n` +
                    `Email: ${email}\n\n` +
                    `Message:\n${message}\n\n` +
                    `— Reply directly to this email to respond to ${name}.`,
            }),
        });

        if (!resendResponse.ok) {
            const errorBody = await resendResponse.text();
            console.error('Resend API error:', resendResponse.status, errorBody);
            return res.status(502).json({ error: 'Failed to send email notification.' });
        }

        return res.status(200).json({ success: true });
    } catch (err) {
        console.error('Unexpected error sending email:', err);
        return res.status(500).json({ error: 'Something went wrong. Please try again.' });
    }
};