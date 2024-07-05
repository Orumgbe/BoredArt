import express from 'express';
import path from 'path';
import router from './router';

const app = express();
const port = 3000;

app.use(express.static(path.join(__dirname, 'public')));
app.use('/', router);

app.listen(port, () => {
  console.log(`App is now listening on port ${port}`);
});
