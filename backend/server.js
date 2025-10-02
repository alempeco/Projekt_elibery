const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const sql = require('mssql/msnodesqlv8');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const dbConfig = {
  connectionString:
    'server=DESKTOP-KO3IBIE\\SQLEXPRESS01;Database=eLibery;Trusted_Connection=Yes;Driver={SQL Server Native Client 11.0}'
};

// TEST ruta
app.get('/', (req, res) => res.send('Backend radi!'));

// LOGIN ruta
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: 'Email i lozinka su obavezni' });

  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request()
      .input('Email', sql.NVarChar, email)
      .query('SELECT * FROM Users WHERE Email = @Email');

    if (result.recordset.length === 0) return res.status(401).json({ message: 'Nepostojeći korisnik' });

    const user = result.recordset[0];
    const isMatch = await bcrypt.compare(password, user.PasswordHash);
    if (!isMatch) return res.status(401).json({ message: 'Pogrešna lozinka' });

    // Generišemo JWT token
    const token = jwt.sign({ id: user.Id, role: user.Role }, 'tajni-kljuc', { expiresIn: '1h' });

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

    await sql.close();
  } catch (err) {
    console.error('❌ Greška:', err);
    res.status(500).json({ message: 'Greška na serveru' });
  }
});

const PORT = 3000;
app.listen(PORT, () => console.log(`Server pokrenut na portu ${PORT}`));
