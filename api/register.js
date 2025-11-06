import mysql from "mysql2/promise";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).send("Method Not Allowed");
  }

  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).send("All fields are required.");
  }

  try {
    // ✅ Connect to Aiven MySQL
    const conn = await mysql.createConnection({
      host: process.env.AIVEN_HOST,
      user: process.env.AIVEN_USER,
      password: process.env.AIVEN_PASSWORD,
      database: process.env.AIVEN_DB,
      port: process.env.AIVEN_PORT,
      ssl: { rejectUnauthorized: true }
    });

    // ✅ Create table automatically if not exists
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(100) NOT NULL,
        email VARCHAR(100) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
    await conn.execute(createTableSQL);

    // ✅ Insert new user securely (Prepared Statement)
    const insertSQL = `INSERT INTO users (username, email, password) VALUES (?, ?, ?)`;
    await conn.execute(insertSQL, [username, email, password]);

    await conn.end();

    return res.status(200).send("Registration successful!");
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).send("Database error: " + error.message);
  }
}
