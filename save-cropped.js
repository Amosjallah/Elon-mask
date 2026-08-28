const http = require('http');
const fs = require('fs');

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  if (req.url === '/image.png') {
    const imgPath = 'C:/Users/AMOS/.gemini/antigravity-ide/brain/5eb40adf-2d16-4a1c-8faf-899f1d371c60/.user_uploaded/media_1787687968894.png';
    res.writeHead(200, { 'Content-Type': 'image/png' });
    fs.createReadStream(imgPath).pipe(res);
    return;
  }
  
  if (req.url === '/' || req.url === '/crop.html') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(`<!DOCTYPE html>
<html>
<body>
<canvas id="c" width="956" height="159"></canvas>
<script>
const img = new Image();
img.onload = () => {
  const canvas = document.getElementById('c');
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 203, 956, 159, 0, 0, 956, 159);
  const data = canvas.toDataURL('image/png');
  fetch('/upload', { method: 'POST', body: data })
    .then(r => r.text())
    .then(t => { document.body.innerHTML += '<h1>SUCCESS_' + t + '</h1>'; });
};
img.src = '/image.png';
</script>
</body>
</html>`);
    return;
  }

  if (req.url === '/upload' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      const base64Data = body.replace(/^data:image\/png;base64,/, '');
      fs.writeFileSync('c:/Users/AMOS/Desktop/BENSON/header-bg.png', Buffer.from(base64Data, 'base64'));
      console.log('CROP_SUCCESS: header-bg.png saved!');
      res.end('CROPPED_AND_SAVED');
    });
    return;
  }

  res.writeHead(404);
  res.end();
});

server.listen(9999, () => {
  console.log('Server running on http://localhost:9999');
});
