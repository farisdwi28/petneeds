// Test script to verify environment variables are loading
require('dotenv').config({
  path: process.env.NODE_ENV === 'test' ? '.env.test' : '.env'
});

console.log('Environment Variables Test:');
console.log('==========================');

console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('PORT:', process.env.PORT);
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_NAME:', process.env.DB_NAME);
console.log('DB_USER:', process.env.DB_USER);
console.log('JWT_SECRET exists:', !!process.env.JWT_SECRET);
console.log('JWT_SECRET length:', process.env.JWT_SECRET ? process.env.JWT_SECRET.length : 0);
console.log('MIDTRANS_SERVER_KEY exists:', !!process.env.MIDTRANS_SERVER_KEY);
console.log('MIDTRANS_SANDBOX:', process.env.MIDTRANS_SANDBOX);

console.log('\nEnvironment file loaded successfully!');

// Test database connection
const { testConnection } = require('./config/database');

console.log('\nTesting database connection...');
testConnection().then(() => {
  console.log('Database connection test completed.');
  process.exit(0);
}).catch((error) => {
  console.error('Database connection test failed:', error.message);
  process.exit(1);
});
