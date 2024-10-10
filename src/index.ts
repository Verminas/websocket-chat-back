import express, {Request, Response} from 'express'
import {createServer} from 'http'
import {Server} from "socket.io";
import cors from 'cors'

const PORT = process.env.PORT || 3009;
const initialMessagesData: Message[] = [{
  id: 1,
  name: 'Alex',
  message: 'Hello, how are you7'
}, {id: 2, name: 'Max', message: 'Do you watch a Harry Potter film?'}]

const app = express();

app.use(cors()); // Разрешить CORS для всех запросов

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

const server = createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    allowedHeaders: ["my-custom-header"],
    credentials: true
  }
});

app.get('/', (req: Request, res: Response) => {
  res.send(`hello on port ${PORT}`);
});

io.on('connection', (socket) => {
  console.log('a user connected');
  socket.emit('get-data', initialMessagesData)

  socket.on('send-message', (data) => {
    console.log(data);
    const message = {message: data, name: 'Julia', id: Date.now()}
    initialMessagesData.push(message);
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