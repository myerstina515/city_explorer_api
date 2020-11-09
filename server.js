'use strict';

const express = require('express');
const app = express();
const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`server up: ${PORT}`) || 3000;
})
