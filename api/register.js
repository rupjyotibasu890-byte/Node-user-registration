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
    // Connect to Aiven MySQL using environment variables
    const connection = await mysql.createConnection({
      host: process.env.AIVEN_HOST,
      port: process.env.AIVEN_PORT,
      user: process.env.AIVEN_USER,
      password: process.env.AIVEN_PASSWORD,
      database: process.env.AIVEN_DATABASE,
      ssl: { rejectUnauthorized: true },
    });

    // Create the users table if it doesn’t exist
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(100),
        email VARCHAR(255) UNIQUE,
        password VARCHAR(255)
      )
    `);

    // Insert data securely using prepared statements
    await connection.execute(
      "INSERT INTO users (username, email, password) VALUES (?, ?, ?)",
      [username, email, password]
    );

    await connection.end();

    return res.status(200).json({ message: "✅ Registration successful!" });
  } catch (err) {
    console.error("Database Error:", err);
    return res
      .status(500)
      .json({ message: "❌ Database connection failed.", error: err.message });
  }
}
