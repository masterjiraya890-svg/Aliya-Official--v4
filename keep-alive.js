const express = require('express');
const app = express();
const PORT = process.env.PORT || 8000;

app.get('/', (req, res) => {
  res.send('Aliya Official v4 is running and alive!');
});

app.listen(PORT, () => {
  console.log(`Keep-alive server for Aliya v4 is running on port ${PORT}`);
});
