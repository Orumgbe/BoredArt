import cookieParser from 'cookie-parser';
import 'dotenv/config';
import express from 'express';
import { createServer } from 'http';
import path from 'path';
import router from './router';
import { Server } from 'socket.io';
import socketHandler from './socket';

const app = express();
const appServer = createServer(app);
const io = new Server(appServer, {
  connectionStateRecovery: {}
});

const port = 3000;

// Data parsing
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Set ejs templating view engine
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');

// App router
app.use('/', router);
socketHandler(io);

appServer.listen(port, () => {
  console.log(`App is now listening on port ${port}`);
});
