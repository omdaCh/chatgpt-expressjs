const cors = require('cors');
const express = require('express')

const threadRoutes = require('./routes/threadRoutes');
const messageRoutes = require('./routes/messageRoutes');
const fileRoutes = require('./routes/fileRoutes');

const app = express();

app.use(express.json());
app.use(express.text());
app.use(express.urlencoded({ extended: true }));

app.use(cors({
  origin: 'http://localhost:4200', // Allow requests from this origin
  methods: ['GET', 'PUT', 'POST', 'DELETE'], // Allow only specified HTTP methods
  credentials: true, // Allow cookies and credentials (if needed)
}));

app.use('/threads', threadRoutes);

app.use('/messages', messageRoutes);

app.use('/files', fileRoutes);

const port = 3000;

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})