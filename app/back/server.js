const express = require('express');
const app = express();
const port = process.env.PORT || 5000;

// Default route for testing
app.get('/', (req, res) => {
  res.send('Backend is up and running!');
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
