const mysql = require('mysql2');

// Create a connection pool
const pool = mysql.createPool({
  host: 'localhost', // Replace with your MySQL host
  user: 'root', // Replace with your MySQL username
  password: 'rolex', // Replace with your MySQL password
  database: 'payment_gateway', // Replace with your database name
  waitForConnections: true,
  connectionLimit: 10, // Adjust based on your application's needs
  queueLimit: 0, // Unlimited queueing
});

// Export the pool for use in other files
module.exports = pool.promise(); // Use promise() for async/await support