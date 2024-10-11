import express, {Request, Response} from 'express'
import {createServer} from 'http'
import {Server} from "socket.io";
import cors from 'cors'

const PORT = process.env.PORT || 3009;
const initialMessagesData: Message[] = [{
  id: 1,
  userName: 'Alex',
  message: 'Hello, how are you7'
}, {id: 2, userName: 'Max', message: 'Do you watch a Harry Potter film?'}]

const currentUsers = new Map()

const app = express();

app.use(cors()); // Разрешить CORS для всех запросов


const server = createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  }
});

app.get('/', (req: Request, res: Response) => {
  res.send(`Hello, server websocket chat ${PORT}`);
});

io.on('connection', (socket) => {
  console.log('a user connected');
  currentUsers.set(socket, {userName: 'anonym', id: socket.id});

  socket.emit('get-data', initialMessagesData)

  socket.on('set-name', (data: {userName: string}) => {
    const user = currentUsers.get(socket)
    user.userName = data.userName
    socket.broadcast.emit('user-go-in', {userName: user.userName, userId: socket.id});
  })

  socket.on('start-typing-message', () => {
    const user = currentUsers.get(socket)
    socket.broadcast.emit('user-start-typing-message', {userName: user.userName, id: user.id});
  })

  socket.on('send-message', (data: GetMessage) => {
    console.log(data);
    const message = {message: data.message, userName: data.userName, id: Date.now(), userId: socket.id};
    initialMessagesData.push(message);
    io.emit('get-message', message)
  })


  socket.on('disconnect', (reason, description) => {
    const user = currentUsers.get(socket)
    socket.broadcast.emit('user-go-out', {userName: user.userName, userId: socket.id})
    currentUsers.delete(socket)
  })


});



server.listen(PORT, () => {
  console.log(`server running at http://localhost:${PORT}`);
});


type Message = {
  id: number
  message: string
  userName: string
}

type GetMessage = {
  message: string
  userName: string
}

type User = {
  userName: string
}