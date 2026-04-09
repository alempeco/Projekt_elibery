const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mysql = require('mysql2/promise'); 
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const createCRUDRoutes = require('./crud'); 

const app = express();
app.use(cors());
app.use(bodyParser.json());

// 🔑 MySQL Pool konekcija
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

// 🔐 LOGIN ruta
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

// 🔐 REGISTER ruta - ISPRAVLJENA
app.post('/api/register', async (req, res) => {
    // 1. Dodaj 'Class' (pazi na velika/mala slova da se slažu sa frontendom)
    const { firstName, lastName, email, password, role = 'student', Class } = req.body; 
    
    try {
        const passwordHash = await bcrypt.hash(password, 10);
        
        // 2. Dodaj kolonu 'Class' u INSERT listu i još jedan upitnik (?)
        const [result] = await pool.execute(
            `INSERT INTO Users (FirstName, LastName, Email, PasswordHash, Role, Class) VALUES (?, ?, ?, ?, ?, ?)`,
            [firstName, lastName, email, passwordHash, role, Class] // 3. Dodaj vrijednost u niz
        );
        
        res.status(201).json({ id: result.insertId, email });
    } catch (err) {
        console.error(err); // Dobra praksa da vidiš tačnu grešku u konzoli servera
        res.status(500).json({ message: 'Greška pri registraciji' });
    }
});

// --- 📖 SPECIJALNA LOGIKA ZA POSUDBE (Transakcija) ---
// Ova ruta mora biti IZNAD app.use('/api/loans', ...) 

app.post('/api/loans', async (req, res) => {
    const { UserId, BookId, LoanDate, DueDate, Status } = req.body;
    
    // Uzimamo posebnu konekciju iz pool-a za transakciju
    const connection = await pool.getConnection();
    
    try {
        await connection.beginTransaction();

        // 1. Umetanje u tabelu loans
        const [loanResult] = await connection.execute(
            'INSERT INTO loans (UserId, BookId, LoanDate, DueDate, Status) VALUES (?, ?, ?, ?, ?)',
            [UserId, BookId, LoanDate, DueDate, Status || 'Active']
        );

        // 2. Smanjivanje AvailableCopies u tabeli books
        // Uslov 'AvailableCopies > 0' osigurava da ne odemo u minus
        const [updateResult] = await connection.execute(
            'UPDATE books SET AvailableCopies = AvailableCopies - 1 WHERE Id = ? AND AvailableCopies > 0',
            [BookId]
        );

        // Ako nijedan red nije ažuriran, znači da knjige nema na stanju
        if (updateResult.affectedRows === 0) {
            throw new Error('Knjiga trenutno nije dostupna na stanju!');
        }

        await connection.commit();
        res.status(201).json({ 
            message: 'Posudba uspješno evidentirana', 
            loanId: loanResult.insertId 
        });

    } catch (err) {
        await connection.rollback();
        res.status(400).json({ 
            message: 'Posudba nije uspjela', 
            error: err.message 
        });
    } finally {
        connection.release();
    }
});
// Ova ruta "povezuje" tabele da bi dobio imena umjesto brojeva
app.get('/api/reservations-details', async (req, res) => {
    try {
        const [rows] = await pool.execute(`
            SELECT 
                r.Id, 
                r.ReservationDate, 
                r.Status,
                b.Title AS BookTitle, 
                u.FirstName, 
                u.LastName,
                r.UserId,
                r.BookId
            FROM reservations r
            JOIN books b ON r.BookId = b.Id
            JOIN users u ON r.UserId = u.Id
            ORDER BY r.ReservationDate DESC
        `);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ message: 'Greška pri dohvaćanju detalja', error: err.message });
    }
});

// TVOJI UNIVERZALNI CRUD-ovi ostaju isti


// --- 🛠️ AUTOMATSKI CRUD ZA TABELE ---

app.use('/api/categories', createCRUDRoutes('categories', pool));
app.use('/api/notifications', createCRUDRoutes('notifications', pool));
app.use('/api/reservations', createCRUDRoutes('reservations', pool));
app.use('/api/loans', createCRUDRoutes('loans', pool)); // Hendla GET, PUT, DELETE
app.use('/api/users', createCRUDRoutes('users', pool));
app.use('/api/reservations', createCRUDRoutes('reservations', pool));

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
        res.status(500).json({ message: 'Greška pri dohvaćanju knjiga', error: err.message });
    }
});

app.use('/api/books', createCRUDRoutes('books', pool));

// 🚀 Pokretanje servera
const PORT = 3000;
app.listen(PORT, () => console.log(`✅ Server pokrenut na portu ${PORT}`));