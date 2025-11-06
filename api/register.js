import mysql from "mysql2/promise";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    // ✅ Connect to Aiven MySQL
    const connection = await mysql.createConnection({
      host: process.env.MYSQLHOST,
      user: process.env.MYSQLUSER,
      password: process.env.MYSQLPASSWORD,
      database: process.env.MYSQLDATABASE,
      port: process.env.MYSQLPORT,
      ssl: { rejectUnauthorized: false } // required for Aiven
    });

    // ✅ Create table if it doesn’t exist
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS rupjyoti (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(100) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // ✅ Check for duplicate email
    const [existing] = await connection.execute(
      "SELECT * FROM rupjyoti WHERE email = ?",
      [email]
    );

    if (existing.length > 0) {
      await connection.end();
      return res.status(400).json({ message: "Email already registered" });
    }

    // ✅ Insert new user
    await connection.execute(
      "INSERT INTO rupjyoti (username, email, password) VALUES (?, ?, ?)",
      [username, email, password]
    );

    await connection.end();
    res.status(200).json({ message: "✅ Registration successful!" });
  } catch (error) {
    console.error("❌ Database error:", error);
    res.status(500).json({
      message: "❌ Server error",
      error: error.message
    });
  }
}
