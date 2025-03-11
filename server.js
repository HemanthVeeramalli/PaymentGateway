require("dotenv").config();
const express = require("express");
const mysql = require("mysql");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// ✅ Use MySQL Connection Pool (Better Performance)
const db = mysql.createPool({
  connectionLimit: 10,
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASS || "rolex",
  database: process.env.DB_NAME || "ecommerce_db",
  insecureAuth: true,
});

// ✅ Check Database Connection
db.getConnection((err, connection) => {
  if (err) {
    console.error("Database connection failed: " + err.message);
  } else {
    console.log("✅ Connected to MySQL database!");
    connection.release();
  }
});

/* ========================== ADDRESS APIs ========================== */

// ✅ Fetch all addresses
app.get("/api/addresses", (req, res) => {
  const sql = "SELECT * FROM addresses ORDER BY created_at DESC";

  db.query(sql, (err, results) => {
    if (err) {
      console.error("Error fetching addresses: " + err.message);
      return res.status(500).json({ error: "Failed to fetch addresses" });
    }
    res.status(200).json(results);
  });
});

// ✅ Add a new address (Changed to `/api/addresses`)
app.post("/api/addresses", (req, res) => {
  const { first_name, last_name, company_name, country, street_address, city, state, pin_code, phone, email } = req.body;

  if (!first_name || !last_name || !street_address || !city || !state || !pin_code || !phone) {
    return res.status(400).json({ error: "Missing required fields!" });
  }

  const sql = `
    INSERT INTO addresses (first_name, last_name, company_name, country, street_address, city, state, pin_code, phone, email) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  const values = [first_name, last_name, company_name, country, street_address, city, state, pin_code, phone, email];

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error("Error inserting address: " + err.message);
      return res.status(500).json({ error: "Database error" });
    }
    res.status(201).json({ message: "Address stored successfully!", address_id: result.insertId });
  });
});

// ✅ Edit an existing address
app.put("/api/addresses/:id", (req, res) => {
  const { id } = req.params;
  const { first_name, last_name, company_name, country, street_address, city, state, pin_code, phone, email } = req.body;

  if (!id) return res.status(400).json({ error: "Address ID is required!" });

  const sql = `
    UPDATE addresses 
    SET first_name=?, last_name=?, company_name=?, country=?, street_address=?, city=?, state=?, pin_code=?, phone=?, email=? 
    WHERE id=?
  `;
  const values = [first_name, last_name, company_name, country, street_address, city, state, pin_code, phone, email, id];

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error("Error updating address: " + err.message);
      return res.status(500).json({ error: "Failed to update address" });
    }
    res.status(200).json({ message: "Address updated successfully!" });
  });
});

// ✅ Delete an address
app.delete("/api/addresses/:id", (req, res) => {
  const { id } = req.params;

  if (!id) return res.status(400).json({ error: "Address ID is required!" });

  const sql = "DELETE FROM addresses WHERE id = ?";
  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error("Error deleting address: " + err.message);
      return res.status(500).json({ error: "Failed to delete address" });
    }
    res.status(200).json({ message: "Address deleted successfully!" });
  });
});

/* ========================== PAYMENT APIs ========================== */

// ✅ Store payment details
app.post("/api/payments", (req, res) => {
  const { address_id, product, subtotal, shipping, total, payment_method } = req.body;

  if (!address_id || !product || !total || !payment_method) {
    return res.status(400).json({ error: "Missing required fields!" });
  }

  const sql = `
    INSERT INTO payments (address_id, product, subtotal, shipping, total, payment_method) 
    VALUES (?, ?, ?, ?, ?, ?)
  `;
  const values = [address_id, product, subtotal, shipping, total, payment_method];

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error("Error inserting payment: " + err.message);
      return res.status(500).json({ error: "Database error" });
    }
    res.status(201).json({ message: "Payment details stored successfully!" });
  });
});

/* ========================== ORDER APIs ========================== */

// ✅ Get all orders (join addresses and payments)
app.get("/api/orders", (req, res) => {
  const sql = `
    SELECT a.*, p.product, p.subtotal, p.shipping, p.total, p.payment_method, p.created_at AS order_date
    FROM addresses a
    JOIN payments p ON a.id = p.address_id
    ORDER BY p.created_at DESC;
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error("Error fetching orders: " + err.message);
      return res.status(500).json({ error: "Failed to fetch orders" });
    }
    res.status(200).json(results);
  });
});

/* ========================== START SERVER ========================== */

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
