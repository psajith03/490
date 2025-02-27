// app/back/server.js
const app = require("./index");
const dotenv = require("dotenv");

dotenv.config();

if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;
