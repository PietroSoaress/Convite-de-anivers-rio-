const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());

const db = new sqlite3.Database('./rsvp.db', (err) => {

    if (err) console.error(err.message);
    else console.log('Conectado ao SQLite.');
});

db.run(`
    CREATE TABLE IF NOT EXISTS rsvp (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        attendance BOOLEAN NOT NULL
    )
`);

app.post('/api/rsvp', (req, res) => {
    const { name, attendance } = req.body;

    if (!name) return res.status(400).json({ message: 'Nome é obrigatório' });

    const stmt = db.prepare('INSERT INTO rsvp (name, attendance) VALUES (?, ?)');
    stmt.run(name, attendance ? 1 : 0, function(err) {
        if (err) return res.status(500).json({ message: err.message });
        res.json({ message: 'Confirmação salva!', id: this.lastID });
    });
    stmt.finalize();
});

app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});
