const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mysql = require('mysql2/promise'); 
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// 🔑 MySQL konekcija
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '11skolaskola',
  database: 'eLibery'
};

// 🧪 TEST ruta
app.get('/', (req, res) => res.send('✅ Backend radi s MySQL bazom eLibery!'));

// 🔐 LOGIN ruta
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ message: 'Email i lozinka su obavezni' });

  let connection;
  try {
    // Povezivanje na MySQL
    connection = await mysql.createConnection(dbConfig);

    // Dohvati korisnika prema emailu
    const [rows] = await connection.execute(
      'SELECT * FROM Users WHERE Email = ?',
      [email]
    );

    if (rows.length === 0)
      return res.status(401).json({ message: 'Nepostojeći korisnik' });

    const user = rows[0];

    // Provjera lozinke
     const isMatch = await bcrypt.compare(password, user.PasswordHash);
     if (!isMatch) return res.status(401).json({ message: 'Pogrešna lozinka' });


    // Generisanje JWT tokena
    const token = jwt.sign(
      { id: user.Id, role: user.Role },
      'tajni-kljuc', // preporuka: koristi .env
      { expiresIn: '1h' }
    );

    // Odgovor frontendu
    res.json({
      user: {
        id: user.Id,
        firstName: user.FirstName,
        lastName: user.LastName,
        email: user.Email,
        role: user.Role,
        class: user.Class
      },
      token
    });

    await connection.end();
  } catch (err) {
    console.error('❌ Greška:', err);
    res.status(500).json({ message: 'Greška na serveru' });
    if (connection) await connection.end();
  }
});

// 🚀 Pokretanje servera
const PORT = 3000;
app.listen(PORT, () => console.log(`✅ Server pokrenut na portu ${PORT}`));
