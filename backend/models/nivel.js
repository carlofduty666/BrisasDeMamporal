'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Niveles extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Niveles.hasMany(models.Grados, {
        foreignKey: 'nivelID',
        as: 'Grados'
      })
    }
    static async getAllNiveles() {
      return await Niveles.findAll();
    }

    static async getNivelById(id) {
      return await Niveles.findByPk(id);
    }

    static async createNivel(nivelData) {
      return await Niveles.create(nivelData);
    }

    static async deleteNivel(id) {
      return await Niveles.destroy({ where: { id } });
    }
    
    static async updateNivel(id, updatedData) {
      return await Niveles.update(updatedData, { where: { id } });
    }

  }
  Niveles.init({
    nombre_nivel: {
      type: DataTypes.ENUM('primaria', 'secundaria'),
      allowNull: false

    }
    
  }, {
    sequelize,
    modelName: 'Niveles',
    tableName: 'Niveles',
    freezeTableName: true
  });
  return Niveles;
};