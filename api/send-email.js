// Serverless Function / Node.js handler for sending emails via Mailtrap API
const fs = require('fs');
const path = require('path');

// Helper to load .env file if process.env values are missing
function loadEnv() {
  try {
    const envPath = path.join(process.cwd(), '.env');
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf8');
      envContent.split('\n').forEach(line => {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#')) {
          const [key, ...valueParts] = trimmed.split('=');
          const val = valueParts.join('=').trim().replace(/^["']|["']$/g, '');
          if (key && val && !process.env[key.trim()]) {
            process.env[key.trim()] = val;
          }
        }
      });
    }
  } catch (err) {
    // Ignore .env read errors
  }
}

async function sendMailtrapEmail(formData) {
  loadEnv();

  const token = process.env.MAILTRAP_API_TOKEN || 
                process.env.MAILTRAP_TOKEN || 
                process.env.MAILTRAP_API_KEY || 
                process.env.MAILTRAPEMAIL_API || 
                process.env.MAILTRAP_EMAIL_API;

  const senderEmail = process.env.MAILTRAP_SENDER_EMAIL || 'hello@demomailtrap.com';
  const recipientEmail = process.env.RECIPIENT_EMAIL || 'Tesla.xmuskceo@gmail.com';

  if (!token) {
    throw new Error('Mailtrap API Token is not set in environment variables (MAILTRAP_API_TOKEN)');
  }

  const { fullName, email, phone, country, contactReason, userStory, address, city, zipCode, dob } = formData;

  const textBody = `New Network Inquiry Received:

Full Name: ${fullName || 'N/A'}
Client Email: ${email || 'N/A'}
Phone: ${phone || 'N/A'}
Country: ${country || 'N/A'}
${dob ? `Date of Birth: ${dob}\n` : ''}Reason for Contact: ${contactReason || 'N/A'}
Address: ${address || ''} ${city || ''} ${zipCode || ''}

Story / Inquiry Message:
${userStory || 'N/A'}
`;

  const htmlBody = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
      <h2 style="color: #1a202c; border-bottom: 2px solid #3182ce; padding-bottom: 10px;">New Network Inquiry</h2>
      <p><strong>Full Name:</strong> ${fullName || 'N/A'}</p>
      <p><strong>Client Email:</strong> <a href="mailto:${email}">${email || 'N/A'}</a></p>
      <p><strong>Phone:</strong> ${phone || 'N/A'}</p>
      <p><strong>Country:</strong> ${country || 'N/A'}</p>
      ${dob ? `<p><strong>Date of Birth:</strong> ${dob}</p>` : ''}
      <p><strong>Reason for Contact:</strong> ${contactReason || 'N/A'}</p>
      <p><strong>Address:</strong> ${address || ''} ${city || ''} ${zipCode || ''}</p>
      <hr style="margin: 20px 0; border: 0; border-top: 1px solid #e2e8f0;">
      <h4 style="color: #2d3748; margin-bottom: 8px;">Story / Inquiry Message:</h4>
      <p style="background: #f7fafc; padding: 15px; border-radius: 6px; white-space: pre-wrap;">${userStory || 'No message provided.'}</p>
    </div>
  `;

  const payload = {
    from: {
      email: senderEmail,
      name: 'Elon Space & Innovation Network'
    },
    to: [
      { email: recipientEmail }
    ],
    subject: `New Network Inquiry: ${fullName || 'Submission'} (${contactReason || 'General'})`,
    text: textBody,
    html: htmlBody,
    category: 'Network Inquiry'
  };

  const response = await fetch('https://send.api.mailtrap.io/api/send', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  const responseData = await response.json();

  if (!response.ok) {
    throw new Error(responseData.errors ? responseData.errors.join(', ') : 'Failed to send email via Mailtrap API');
  }

  return responseData;
}

// Export for serverless environments (Vercel / Netlify)
module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }

  try {
    const data = await sendMailtrapEmail(req.body);
    return res.status(200).json({ success: true, message: 'Email sent successfully via Mailtrap API!', data });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

module.exports.sendMailtrapEmail = sendMailtrapEmail;
