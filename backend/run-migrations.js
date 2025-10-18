const { exec } = require('child_process');
const path = require('path');

// Ejecutar migraciones
exec('npx sequelize-cli db:migrate', {
  cwd: path.join(__dirname)
}, (error, stdout, stderr) => {
  if (error) {
    console.error('Error ejecutando migraciones:', error);
    console.error(stderr);
    process.exit(1);
  }
  console.log('Migraciones ejecutadas:');
  console.log(stdout);
  process.exit(0);
});