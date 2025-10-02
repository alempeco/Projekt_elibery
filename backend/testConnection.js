const sql = require('mssql/msnodesqlv8');

const config = {
  connectionString:
    'server=DESKTOP-KO3IBIE\\SQLEXPRESS01;Database=ElektronskaBiblioteka;Trusted_Connection=Yes;Driver={SQL Server Native Client 11.0}'
};

async function test() {
  try {
    let pool = await sql.connect(config);
    console.log('✅ Uspješna konekcija na bazu!');
    let result = await pool.request().query('SELECT name FROM sys.databases');
    console.log('📚 Liste baza na serveru:', result.recordset);
    await sql.close();
  } catch (err) {
    console.error('❌ Greška:', err);
  }
}

test();
