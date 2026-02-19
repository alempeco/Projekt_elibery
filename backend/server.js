const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mysql = require('mysql2/promise'); 
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const createCRUDRoutes = require('./crud'); // 👈 Importujemo tvoj novi CRUD

const app = express();
app.use(cors());
app.use(bodyParser.json());

// 🔑 MySQL Pool konekcija (bolje nego createConnection)
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '11skolaskola',
  database: 'eLibery',
  waitForConnections: true,
  connectionLimit: 10
});

// 🧪 TEST ruta
app.get('/', (req, res) => res.send('✅ Backend radi s MySQL bazom eLibery!'));

// 🔐 LOGIN i REGISTER rute (ostaju specifične zbog hashiranja i tokena)
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const [rows] = await pool.execute('SELECT * FROM Users WHERE Email = ?', [email]);
        if (rows.length === 0) return res.status(401).json({ message: 'Nepostojeći korisnik' });
        
        const user = rows[0];
        const isMatch = await bcrypt.compare(password, user.PasswordHash);
        if (!isMatch) return res.status(401).json({ message: 'Pogrešna lozinka' });

        const token = jwt.sign({ id: user.Id, role: user.Role }, 'tajni-kljuc', { expiresIn: '1h' });
        res.json({ user, token });
    } catch (err) {
        res.status(500).json({ message: 'Greška na serveru' });
    }
});

app.post('/api/register', async (req, res) => {
    const { firstName, lastName, email, password, role = 'student' } = req.body;
    try {
        const passwordHash = await bcrypt.hash(password, 10);
        const [result] = await pool.execute(
            `INSERT INTO Users (FirstName, LastName, Email, PasswordHash, Role) VALUES (?, ?, ?, ?, ?)`,
            [firstName, lastName, email, passwordHash, role]
        );
        res.status(201).json({ id: result.insertId, email });
    } catch (err) {
        res.status(500).json({ message: 'Greška pri registraciji' });
    }
});

// --- 🛠️ AUTOMATSKI CRUD ZA TABELE ---

app.use('/api/categories', createCRUDRoutes('categories', pool));
app.use('/api/notifications', createCRUDRoutes('notifications', pool));
app.use('/api/reservations', createCRUDRoutes('reservations', pool));
app.use('/api/loans', createCRUDRoutes('loans', pool));
app.use('/api/users', createCRUDRoutes('users', pool));

// 📚 KNJIGE: Prvo definišemo ovaj GET da dobijemo CategoryName
app.get('/api/books', async (req, res) => {
    try {
        const [rows] = await pool.execute(`
            SELECT b.*, c.Name AS CategoryName 
            FROM books b 
            LEFT JOIN categories c ON b.CategoryId = c.Id
        `);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ message: 'Greška pri dohvaćanju knjiga s kategorijama', error: err.message });
    }
});

// Zatim dopuštamo univerzalnom CRUD-u da hendla POST, PUT i DELETE na /api/books
app.use('/api/books', createCRUDRoutes('books', pool));
// 🚀 Pokretanje servera
const PORT = 3000;
app.listen(PORT, () => console.log(`✅ Server pokrenut na portu ${PORT}`));