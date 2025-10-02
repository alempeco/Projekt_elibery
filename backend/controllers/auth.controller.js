const sql = require('mssql');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Tajni ključ za JWT (stavi u .env)
const JWT_SECRET = process.env.JWT_SECRET || 'tajni_kljuc';

exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email i lozinka su obavezni' });
  }

  try {
    // Dohvati korisnika iz MSSQL baze
    const pool = await sql.connect();
    const result = await pool.request()
      .input('Email', sql.NVarChar, email)
      .query('SELECT * FROM dbo.Users WHERE Email = @Email');

    if (result.recordset.length === 0) {
      return res.status(401).json({ message: 'Pogrešan email ili lozinka' });
    }

    const user = result.recordset[0];

    // Provjeri password hash
    const isMatch = await bcrypt.compare(password, user.PasswordHash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Pogrešan email ili lozinka' });
    }

    // Kreiraj JWT
    const token = jwt.sign(
      {
        id: user.Id,
        role: user.Role,
        email: user.Email
      },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({
      token,
      user: {
        id: user.Id,
        firstName: user.FirstName,
        lastName: user.LastName,
        email: user.Email,
        role: user.Role,
        class: user.Class
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
