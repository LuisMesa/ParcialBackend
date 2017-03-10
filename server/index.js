// server/index.js
'use strict';

const app = require('./app');

const PORT = process.env.PORT || 1337;

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}!`);
});
