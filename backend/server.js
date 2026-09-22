const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { Pool } = require('pg');

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('../frontend'));  // Serve frontend files
app.use(express.json());


const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'student_db',
  password: 'Bandi@123',  // CHANGE THIS to your PostgreSQL password
  port: 5432,
});

// Test connection
pool.connect((err, client, release) => {
  if (err) {
    console.error('❌ Database error:', err.stack);
  } else {
    console.log('✅ Connected to PostgreSQL');
    release();
  }
});

// GET all students
app.get('/api/students', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM students ORDER BY id DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch students' });
  }
});

// CREATE student
app.post('/api/students', async (req, res) => {
  try {
    const { name, email, phone, age } = req.body;
    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email required' });
    }
    const result = await pool.query(
      'INSERT INTO students (name, email, phone, age) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, email, phone, age]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') {
      res.status(400).json({ error: 'Email already exists' });
    } else {
      res.status(500).json({ error: 'Failed to add student' });
    }
  }
});

// UPDATE student
app.put('/api/students/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, age } = req.body;
    const result = await pool.query(
      'UPDATE students SET name=$1, email=$2, phone=$3, age=$4 WHERE id=$5 RETURNING *',
      [name, email, phone, age, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Student not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update student' });
  }
});

// DELETE student
app.delete('/api/students/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM students WHERE id=$1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Student not found' });
    }
    res.json({ message: 'Student deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete student' });
  }
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});