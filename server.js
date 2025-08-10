const express = require('express');
const config = require('./configs/config');
const helmet = require('helmet');
const compression = require('compression');
const cors = require('cors');
const connectDb = require('./db');
const app = express();

// Connect to MongoDB
connectDb();

// Middleware
// Body parsing with size limits
app.use(
  express.json({
    limit: '10kb',
    strict: true,
  }),
);

app.use(
  express.urlencoded({
    extended: false,
    limit: '10kb',
  }),
);

app.use(helmet());
app.use(compression());

app.use(cors(config.cors));

app.get('/', (req, res) => {
  res.send('Hello World');
});

app.listen(config.port, () => {
  console.log(`Server is running on port ${config.port}`);
});
