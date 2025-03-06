const cors = require('cors');




const express = require('express');

const threadRoutes = require('./routes/threadRoutes');
const messageRoutes = require('./routes/messageRoutes');
const fileRoutes = require('./routes/fileRoutes');

const app = express();

app.use(express.json());
app.use(express.text());
app.use(express.urlencoded({ extended: true }));



app.use(cors());

app.use('/threads', threadRoutes);

app.use('/messages', messageRoutes);

app.use('/files', fileRoutes);

const port = 3000;

app.listen(port, () => {
  console.log(`OmdaGPT App listening on port ${port}`)
})