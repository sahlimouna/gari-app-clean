const express = require('express');
const path = require('path');
const next = require('next');

const port = parseInt(process.env.PORT, 10) || 3000;
const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev, dir: '.' });
const handle = app.getRequestHandler();

// 🔒 Gestion des promesses non gérées
process.on('unhandledRejection', (reason) => {
  console.error('⨯ Unhandled Rejection:', reason);
});

app.prepare().then(() => {
  const server = express();

  // ✅ Serveur d’actifs Next.js (scripts, styles, etc.)
  server.use('/_next', express.static(path.join(__dirname, '.next', 'static')));

  // ✅ Serveur de fichiers statiques (images, icônes, etc.)
  server.use(express.static(path.join(__dirname, 'public')));

  // ✅ Sécurité minimale recommandée
  server.use((req, res, next) => {
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    next();
  });

  // ✅ Gestion des requêtes (SSR + pages statiques)
  server.all('*', (req, res) => {
    return handle(req, res);
  });

  // ✅ Lancement du serveur
  server.listen(port, '0.0.0.0', () => {
    console.log(`🚀 Gari App server is running at http://0.0.0.0:${port}`);
  });

}).catch((err) => {
  console.error('⨯ Failed to start server:', err);
});
