import mysql from 'mysql2/promise';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { username, email, password } = req.body;

  // Validate input
  if (!username || !email || !password) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    // ✅ Aiven MySQL connection
    const connection = await mysql.createConnection({
      host: 'mysql-26a658be-rupjyotibasu890-ce85.c.aivencloud.com',
      port: 17696,
      user: 'avnadmin',
      password: 'AVNS_wM0L6NMor3zsz1VoQED',
      database: 'defaultdb',
      ssl: { rejectUnauthorized: true }
    });

    // ✅ Create table if not exists
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(100),
        email VARCHAR(255),
        password VARCHAR(255)
      )
    `);

    // ✅ Insert user data using prepared statements
    const [result] = await connection.execute(
      'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
      [username, email, password]
    );

    await connection.end();

    return res.status(200).json({ message: 'Registration successful!' });
  } catch (error) {
    console.error('Database error:', error);
    return res.status(500).json({ message: 'Database connection failed', error: error.message });
  }
}
