import mysql from "mysql2/promise";
import fs from "fs";
import path from "path";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ message: "All fields required" });
  }

  try {
    const caCertPath = path.join(process.cwd(), "ca.pem");
    const caCert = fs.readFileSync(caCertPath);

    const connection = await mysql.createConnection({
      host: process.env.MYSQLHOST,
      user: process.env.MYSQLUSER,
      password: process.env.MYSQLPASSWORD,
      database: process.env.MYSQLDATABASE,
      port: process.env.MYSQLPORT,
      ssl: {
        ca: caCert,
      },
    });

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS rupjyoti (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(100),
        email VARCHAR(100) UNIQUE,
        password VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await connection.execute(
      "INSERT INTO rupjyoti (username, email, password) VALUES (?, ?, ?)",
      [username, email, password]
    );

    await connection.end();

    return res.status(200).json({ message: "✅ Registration successful!" });
  } catch (error) {
    console.error("❌ Database error:", error);
    return res.status(500).json({
      message: "❌ Server error",
      error: error.message,
    });
  }
}
