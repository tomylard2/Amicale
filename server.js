// Serveur Node.js personnalisé pour héberger Next.js sur o2switch (Passenger).
//
// Sur un hébergement mutualisé o2switch, l'application est lancée par Passenger
// via ce fichier de démarrage. Passenger fournit la variable d'environnement
// PORT (un chemin de socket) : on écoute donc directement dessus, SANS le
// convertir en nombre. En local, PORT n'est pas défini → on écoute sur 3000.
//
// Ce fichier n'est PAS compilé par Next.js : on reste en CommonJS (require).
const { createServer } = require("http");
const next = require("next");

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer((req, res) => handle(req, res));
  server.listen(process.env.PORT || 3000, () => {
    console.log(
      `> Serveur Next.js prêt (${dev ? "développement" : "production"})`,
    );
  });
});
