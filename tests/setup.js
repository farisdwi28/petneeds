const { sequelize } = require('../config/database');

// Setup test database
beforeAll(async () => {
  try {
    // Set test database for Sequelize
    sequelize.options.database = process.env.DB_NAME || 'petneeds_test';

    // Test database connection
    await sequelize.authenticate();
    console.log('Test database connection established');

    // Sync all models (create tables for testing)
    await sequelize.sync({ force: true });
    console.log('Test database synchronized');
  } catch (error) {
    console.error('Test database setup failed:', error);
    console.error('Make sure your test database exists and credentials are correct');
    console.error('You may need to create the database manually: CREATE DATABASE petneeds_test;');
    process.exit(1);
  }
});

// Clean up after each test
afterEach(async () => {
  // Clean all tables
  const models = Object.values(sequelize.models);
  for (const model of models) {
    await model.destroy({ where: {}, force: true });
  }
});

// Close database connection after all tests
afterAll(async () => {
  await sequelize.close();
  console.log('Test database connection closed');
});
