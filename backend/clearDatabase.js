const mongoose = require('mongoose');
require('dotenv').config();

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connected to', process.env.MONGO_URI);
    await mongoose.connection.dropDatabase();
    console.log('Database dropped successfully.');
    await mongoose.disconnect();
  } catch (error) {
    console.error('Error dropping database:', error);
    process.exit(1);
  }
})();