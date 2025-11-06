import mysql from "mysql2/promise";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).send("Method Not Allowed");
  }

  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).send("All fields required");
  }

  try {
    const conn = await mysql.createConnection({
      host: process.env.AIVEN_HOST,
      user: process.env.AIVEN_USER,
      password: process.env.AIVEN_PASSWORD,
      database: process.env.AIVEN_DB,
      port: process.env.AIVEN_PORT,
      ssl: { rejectUnauthorized: true }
    });

    const query = "INSERT INTO users (username, email, password) VALUES (?, ?, ?)";
    await conn.execute(query, [username, email, password]);

    await conn.end();

    return res.status(200).send("Registration successful!");
  } catch (error) {
    return res.status(500).send("Error: " + error.message);
  }
}
