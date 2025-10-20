const config = require('./config/config.js');
const mysql = require('mysql2/promise');

(async () => {
  const connection = await mysql.createConnection({
    host: config.development.host,
    user: config.development.username,
    password: config.development.password,
    database: config.development.database
  });

  try {
    console.log('Ejecutando ALTER TABLE...');
    await connection.execute(`
      ALTER TABLE Profesor_Materia_Grados 
      MODIFY COLUMN gradoID INT NULL;
    `);
    console.log('✅ Columna gradoID ahora permite NULL');
    
    const [result] = await connection.execute(`
      DESC Profesor_Materia_Grados
    `);
    const gradoColumn = result.find(col => col.Field === 'gradoID');
    console.log('Estado actual de gradoID:', gradoColumn);
  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    await connection.end();
  }
})();