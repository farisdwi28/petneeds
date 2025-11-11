require('dotenv').config({
  path: process.env.NODE_ENV === 'test' ? '.env.test' : '.env'
});

const { sequelize } = require('../config/database');
const fs = require('fs');
const path = require('path');

const runMigrations = async () => {
  try {
    console.log('Starting database migrations...');

    const migrationsPath = path.join(__dirname, '../migrations');
    const migrationFiles = fs.readdirSync(migrationsPath)
      .filter(file => file.endsWith('.js'))
      .sort();

    for (const file of migrationFiles) {
      console.log(`Running migration: ${file}`);
      const migration = require(path.join(migrationsPath, file));

      if (migration.up) {
        await migration.up(sequelize.getQueryInterface(), sequelize.Sequelize);
        console.log(`✓ Migration ${file} completed`);
      }
    }

    console.log('All migrations completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
};

const rollbackMigrations = async (steps = 1) => {
  try {
    console.log(`Rolling back ${steps} migration(s)...`);

    const migrationsPath = path.join(__dirname, '../migrations');
    const migrationFiles = fs.readdirSync(migrationsPath)
      .filter(file => file.endsWith('.js'))
      .sort()
      .reverse()
      .slice(0, steps);

    for (const file of migrationFiles) {
      console.log(`Rolling back migration: ${file}`);
      const migration = require(path.join(migrationsPath, file));

      if (migration.down) {
        await migration.down(sequelize.getQueryInterface(), sequelize.Sequelize);
        console.log(`✓ Rollback ${file} completed`);
      }
    }

    console.log('Rollback completed successfully!');
  } catch (error) {
    console.error('Rollback failed:', error);
    process.exit(1);
  }
};

module.exports = {
  runMigrations,
  rollbackMigrations
};
