import cookieParser from 'cookie-parser';
import express from 'express';
import path from 'path';
import router from './router';

const app = express();
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

app.listen(port, () => {
  console.log(`App is now listening on port ${port}`);
});
