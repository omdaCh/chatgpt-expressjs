const cors = require('cors');




const express = require('express');

const threadRoutes = require('./routes/threadRoutes');
const messageRoutes = require('./routes/messageRoutes');
const fileRoutes = require('./routes/fileRoutes');

const app = express();

app.use(express.json());
app.use(express.text());
app.use(express.urlencoded({ extended: true }));

const allowedOrigins = [
  'http://localhost:4200', // Local development
  'https://chatgpt-with-angular.firebaseapp.com/' // Deployed Angular app
];

app.use(cors());

app.use('/threads', threadRoutes);

app.use('/messages', messageRoutes);

app.use('/files', fileRoutes);

const port = 3000;

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})