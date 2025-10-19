import type { NextApiRequest, NextApiResponse } from 'next';
import mysql from 'mysql2/promise';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '', // your password here
      database: 'dental_clinic',
    });

    const [rows] = await connection.execute('SELECT * FROM cases');
    await connection.end();

    res.status(200).json(rows);
  } catch (error) {
    console.error('MySQL error:', error);
    res.status(500).json({ error: 'Database connection failed' });
  }
}