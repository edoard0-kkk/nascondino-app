const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }
});

// Salviamo i giocatori connessi
let players = {};

io.on('connection', (socket) => {
  console.log('Un utente si è connesso:', socket.id);

  // Registrazione del giocatore con un nome (es. Giocatore 1 / Giocatore 2)
  socket.on('join-game', (playerName) => {
    players[socket.id] = playerName;
    // Avvisa gli altri che un giocatore è entrato
    socket.broadcast.emit('player-joined', `${playerName} si è connesso alla partita!`);
  });

  // Ricezione stato dei confini (DENTRO / FUORI)
  socket.on('update-status', (data) => {
    // Trasmette all'altro giocatore SOLO lo stato (dentro/fuori), NON la posizione esatta!
    socket.broadcast.emit('opponent-status', {
      player: players[socket.id],
      isInside: data.isInside
    });
  });

  // Gestione della DISCONNESSIONE (Browser chiuso, crash, o perdita di rete)
  socket.on('disconnect', () => {
    const playerName = players[socket.id] || "Il tuo amico";
    delete players[socket.id];
    
    // AVVISA L'ALTRO GIOCATORE IMMEDIATAMENTE
    io.emit('player-disconnected', `🚨 ATTENZIONE: ${playerName} si è disconnesso o ha chiuso l'app!`);
    console.log(`${playerName} si è disconnesso.`);
  });
});

server.listen(3000, () => {
  console.log('Server di gioco attivo sulla porta 3000');
});