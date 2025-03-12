'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Materias extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Materias.belongsTo(models.Grados, {
        foreignKey: 'gradoID',
        as: 'Grados'
      });
      Materias.hasMany(models.Evaluaciones, {  // Cambiamos 'Evaluacion' por 'Evaluaciones'
        foreignKey: 'materiaID',
        as: 'Evaluaciones'
      });
    }

    static async getAllMaterias() {
      return await Materias.findAll();
    }

    static async getMateriaById(materiaID) {
       return await Materias.findByPk(materiaID);
    }

    static async getMateriasByGrado(gradoID) {
      return await Materias.findAll({
        where: {
          gradoID: gradoID
        }
      });
    }

    static async getMateriasByProfesor(personaID) {
      return await Materias.findAll({
        where: {
          personaID: personaID
        }
      });
    }

    static async getMateriasByEstudiante(personaID) {
      return await Materias.findAll({
        where: {
          personaID: personaID
        }
      });
    }

    static async createMateria(materiaData) {
      return await Materias.create(materiaData);
    }

    static async deleteMateria(materiaID) {
      return await Materias.destroy({
        where: {
          materiaID: materiaID
        }
      });
    }

    static async updateMateria(materiaID, updatedData) {
      return await Materias.update(updatedData, {
        where: {
          materiaID: materiaID
        }
      });
    }

  
  }
  Materias.init({
    asignatura: DataTypes.STRING,
    gradoID: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Materias',
  });
  return Materias;
};