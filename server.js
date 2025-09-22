const express = require('express');
const { Pool } = require('pg'); // Pacote novo para PostgreSQL
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Conecta ao banco de dados permanente usando a URL do Render
const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // <-- A MUDANÇA É AQUI
  ssl: {
    rejectUnauthorized: false
  }
});

// Função para criar a tabela se ela não existir
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

createTable(); // Executa a função na inicialização

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

app.use(express.json());

app.post('/api/rsvp', async (req, res) => {
    const { name, attendance } = req.body;

    if (!name) {
        return res.status(400).json({ message: 'O nome é obrigatório.' });
    }

    try {
        // A sintaxe muda de '?' para '$1, $2'
        const result = await pool.query(
            'INSERT INTO guests (name, attendance) VALUES ($1, $2) RETURNING id',
            [name, attendance]
        );
        res.status(201).json({ message: 'Confirmação recebida com sucesso!', id: result.rows[0].id });
    } catch (error) {
        console.error('Erro ao salvar:', error);
        res.status(500).json({ message: 'Erro ao salvar a confirmação.', error: error.message });
    }
});

app.get('/api/guests', async (req, res) => {
    try {
        const guests = await pool.query('SELECT name, attendance FROM guests ORDER BY confirmed_at DESC');
        res.status(200).json(guests.rows);
    } catch (error) {
        console.error('Erro ao buscar:', error);
        res.status(500).json({ message: 'Erro ao buscar convidados.', error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});