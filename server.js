/* eslint-disable no-unused-vars */
/* eslint-disable no-console */
const dotenv = require('dotenv');

dotenv.config({ path: './config.env' });

const app = require('./app');

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`server is running on port ${port}...`);
});
