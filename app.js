const cors = require('cors');

const express = require('express'); 
// require('./src/config/db'); 

require("dotenv").config();

const port = process.env.PORT | 3000;


const threadRoutes = require('./src/routes/threadRoutes');
const messageRoutes = require('./src/routes/messageRoutes');
const fileRoutes = require('./src/routes/fileRoutes');

const app = express();

app.use(express.json());
app.use(express.text());
app.use(express.urlencoded({ extended: true }));

app.use(cors());

app.use('/threads', threadRoutes);

app.use('/messages', messageRoutes);

app.use('/files', fileRoutes);


if (require.main === module) {
  app.listen(port, () => {
    console.log(`OmdaGPT App listening on port ${port}`)
  });
}
