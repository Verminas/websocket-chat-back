const express = require('express');
const { createServer } = require('node:http');
const { join } = require('node:path');
const { Server } = require('socket.io');
const cors = require('cors');

const PORT = process.env.PORT || 3009;

const app = express();

// app.use(cors()); // Разрешить CORS для всех запросов

const server = createServer(app);
// const io = new Server(server);

const messagesData: Message[] = [{
  id: 1,
  name: 'Alex',
  message: 'Hello, how are you7'
}, {id: 2, name: 'Max', message: 'Do you watch a Harry Potter film?'}]

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    // methods: ["GET", "POST"],
    // allowedHeaders: ["my-custom-header"],
    // credentials: true
  }
});

// http://localhost:3000/

app.get('/', (req, res) => {
  res.send("hello on port 3009");
});

io.on('connection', (socket) => {
  console.log('a user connected');
  socket.emit('get-data', messagesData)

  socket.on('send-message', (data) => {
    console.log(data);
    const message = {message: data, name: 'Julia', id: Date.now()}
    messagesData.push(message);
    io.emit('get-message', message)
  })


});



server.listen(PORT, () => {
  console.log(`server running at http://localhost:${PORT}`);
});



type Message = {
  id: number
  message: string
  name: string
}