'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    console.log('✅ Ruta column already exists in Permisos table (created in initial migration)');
  },

  down: async (queryInterface, Sequelize) => {
    console.log('⏮️ No changes to revert - ruta column was created in initial migration');
  }
};
