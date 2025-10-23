const app = require('./app');
const connectDB = require('./src/config/database');
require('dotenv').config();

const PORT = process.env.PORT || 3000;

// Connect to database
connectDB();

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;