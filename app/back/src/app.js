const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());
const exerciseRoutes = require('./routes/exercise');
app.use('/api/exercise', exerciseRoutes);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something broke!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app; 