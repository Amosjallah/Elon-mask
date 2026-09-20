const http = require('http');
const fs = require('fs');
const path = require('path');
const { sendMailtrapEmail } = require('./api/send-email');

const mimeTypes = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.mp4': 'video/mp4',
  '.svg': 'image/svg+xml'
};

const server = http.createServer(async (req, res) => {
  let safePath = decodeURIComponent(req.url.split('?')[0]);

  // Handle Mailtrap Email API endpoint
  if (req.method === 'POST' && safePath === '/api/send-email') {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', async () => {
      try {
        const formData = JSON.parse(body);
        const result = await sendMailtrapEmail(formData);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, message: 'Email sent successfully via Mailtrap API!', result }));
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: err.message }));
      }
    });
    return;
  }

  if (safePath === '/') safePath = '/index.html';
  const filePath = path.join(__dirname, safePath);
  const ext = path.extname(filePath).toLowerCase();
  const contentType = mimeTypes[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(404);
      res.end('Not found');
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);
    }
  });
});

server.listen(5000, '127.0.0.1', () => console.log('Server running on http://127.0.0.1:5000'));
