const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const path = require('path');

const app = express();
const PORT = 3000;

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

app.use(express.json());

let db;
(async () => {
    db = await open({
        filename: './database.db',
        driver: sqlite3.Database
    });

    await db.exec(`
        CREATE TABLE IF NOT EXISTS guests (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            attendance BOOLEAN NOT NULL,
            confirmed_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);
})();

app.post('/api/rsvp', async (req, res) => {
    const { name, attendance } = req.body;

    if (!name) {
        return res.status(400).json({ message: 'O nome é obrigatório.' });
    }

    try {
        const result = await db.run(
            'INSERT INTO guests (name, attendance) VALUES (?, ?)',
            [name, attendance]
        );
        res.status(201).json({ message: 'Confirmação recebida com sucesso!', id: result.lastID });
    } catch (error) {
        res.status(500).json({ message: 'Erro ao salvar a confirmação.', error: error.message });
    }
});

app.get('/api/guests', async (req, res) => {
    try {
        const guests = await db.all('SELECT name, attendance FROM guests ORDER BY confirmed_at DESC');
        res.status(200).json(guests);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao buscar convidados.', error: error.message });
    }
});


app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});