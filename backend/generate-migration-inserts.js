const fs = require('fs');
const path = require('path');

// Ruta a la carpeta de migraciones
const migrationsPath = path.join(__dirname, 'migrations');

// Lee todos los archivos de la carpeta de migraciones
fs.readdir(migrationsPath, (err, files) => {
  if (err) {
    console.error('Error al leer la carpeta de migraciones:', err);
    return;
  }

  // Filtra solo los archivos JavaScript (migraciones)
  const migrationFiles = files.filter(file => file.endsWith('.js'));

  // Genera la sentencia SQL para insertar todos los nombres de migraciones
  let sqlInsert = "INSERT INTO `SequelizeMeta` (`name`) VALUES\n";
  
  migrationFiles.forEach((file, index) => {
    sqlInsert += `('${file}')`;
    if (index < migrationFiles.length - 1) {
      sqlInsert += ",\n";
    } else {
      sqlInsert += ";\n";
    }
  });

  console.log(sqlInsert);

  // Opcional: guardar en un archivo
  fs.writeFileSync(path.join(__dirname, 'migration-inserts.sql'), sqlInsert);
  console.log('SQL guardado en migration-inserts.sql');
});
