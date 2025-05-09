'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Grados extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Grados.belongsTo(models.Niveles, {
        foreignKey: 'nivelID',
        as: 'Niveles'
      });
      Grados.hasMany(models.Secciones, {
        foreignKey: 'gradoID',
        as: 'Secciones'
      });

      Grados.hasMany(models.Evaluaciones, {
        foreignKey: 'gradoID',
        as: 'evaluaciones'
      });
      
      // Relación muchos a muchos con Materias
      Grados.belongsToMany(models.Materias, {
        through: 'Grado_Materia',
        foreignKey: 'gradoID',
        otherKey: 'materiaID',
        as: 'Materias'
      });
      
      Grados.belongsToMany(models.Personas, {
        through: 'Grado_Personas',
        foreignKey: 'gradoID',
        otherKey: 'personaID',
        as: 'personas'
      });
    }
    static async getAllGrados() {
      return await Grados.findAll();
    }
    static async getGradoById(id) {
      return await Grados.findByPk(id);
    }

    static async getGradosByNivel(nivelID) {
      return await Grados.findAll({
        where: { nivelID }
      });
    }
    
    static async createGrado(gradoData) {
      return await Grados.create(gradoData);
    }
    static async deleteGrado(id) {
      return await Grados.destroy
      ({ where: { id } });
    }
    static async updateGrado(id, updatedData) {
      return await Grados.update(updatedData, { where: { id } });
    }

  }
  Grados.init({
    nombre_grado: DataTypes.STRING,
    nivelID: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Grados',
  });
  return Grados;
};