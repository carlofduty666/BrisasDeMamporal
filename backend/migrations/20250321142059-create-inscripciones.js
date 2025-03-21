'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // await queryInterface.createTable('Inscripcioness', {
    //   id: {
    //     allowNull: false,
    //     autoIncrement: true,
    //     primaryKey: true,
    //     type: Sequelize.INTEGER
    //   },
    //   estudianteID: {
    //     type: Sequelize.INTEGER,
    //     allowNull: false,
    //     references: {
    //       model: 'Personas',
    //       key: 'id'
    //     }
    //   },
    //   representanteID: {
    //     type: Sequelize.INTEGER,
    //     allowNull: false,
    //     references: {
    //       model: 'Personas',
    //       key: 'id'
    //     }
    //   },
    //   gradoID: {
    //     type: Sequelize.INTEGER,
    //     allowNull: false,
    //     references: {
    //       model: 'Grados',
    //       key: 'id'
    //     }
    //   },
    //   seccionID: {
    //     type: Sequelize.INTEGER,
    //     allowNull: true,
    //     references: {
    //       model: 'Secciones',
    //       key: 'id'
    //     }
    //   },
    //   annoEscolarID: {
    //     type: Sequelize.INTEGER,
    //     allowNull: false,
    //     references: {
    //       model: 'AnnoEscolar',
    //       key: 'id'
    //     }
    //   },
    //   fechaInscripcion: {
    //     type: Sequelize.DATE,
    //     allowNull: false,
    //     defaultValue: Sequelize.NOW
    //   },
    //   estado: {
    //     type: Sequelize.ENUM('pendiente', 'aprobada', 'rechazada'),
    //     allowNull: false,
    //     defaultValue: 'pendiente',
    //   },
    //   observaciones: {
    //     type: Sequelize.TEXT,
    //     allowNull: true
    //   },
    //   montoinscripcion: {
    //     type: Sequelize.DECIMAL(10, 2),
    //     allowNull: false
    //   },
    //   pagado: {
    //     type: Sequelize.BOOLEAN,
    //     allowNull: false,
    //     defaultValue: false
    //   },
    //   createdAt: {
    //     allowNull: false,
    //     type: Sequelize.DATE
    //   },
    //   updatedAt: {
    //     allowNull: false,
    //     type: Sequelize.DATE
    //   }
    // });
  },
  async down(queryInterface, Sequelize) {
    // await queryInterface.dropTable('Inscripcioness');
  }
};