// ARQUIVO: backend/server.js

const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

const createTable = async () => {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS guests (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      attendance BOOLEAN NOT NULL,
      confirmed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;
  await pool.query(createTableQuery);
};
createTable();

app.use(cors());
app.use(express.json());

// Rota pública para os convidados enviarem a confirmação. Permanece igual.
app.post('/api/rsvp', async (req, res) => {
    const { name, attendance } = req.body;
    if (!name) {
        return res.status(400).json({ message: 'O nome é obrigatório.' });
    }
    try {
        await pool.query('INSERT INTO guests (name, attendance) VALUES ($1, $2)', [name, attendance]);
        res.status(201).json({ message: 'Confirmação recebida com sucesso!' });
    } catch (error) {
        console.error('Erro ao salvar:', error);
        res.status(500).json({ message: 'Erro ao salvar a confirmação.' });
    }
});

// A ROTA PÚBLICA /api/guests FOI REMOVIDA.

// Nova rota segura para o administrador ver a lista.
app.get('/api/admin/guests', async (req, res) => {
    const { senha } = req.query; // Pega a senha da URL
    if (senha !== process.env.ADMIN_PASSWORD) { // Compara com a senha secreta
        return res.status(401).json({ message: 'Acesso não autorizado.' }); // Bloqueia se a senha estiver errada
    }
    try {
        const guests = await pool.query('SELECT name, attendance, confirmed_at FROM guests ORDER BY confirmed_at DESC');
        res.status(200).json(guests.rows); // Envia a lista se a senha estiver certa
    } catch (error) {
        console.error('Erro ao buscar (admin):', error);
        res.status(500).json({ message: 'Erro ao buscar convidados.' });
    }
});

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});