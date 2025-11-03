const mysql = require('mysql2/promise');

(async () => {
  const connection = await mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: '',
    database: 'brisasdemamporaldb'
  });

  try {
    const [rows] = await connection.execute('DESCRIBE Usuario_Permisos');
    console.log('=== ESTRUCTURA DE Usuario_Permisos ===');
    console.table(rows);
  } catch (error) {
    console.error('Error:', error.message);
  }

  await connection.end();
})();