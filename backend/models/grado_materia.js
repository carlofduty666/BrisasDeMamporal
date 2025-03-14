'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Grado_Materia extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Grado_Materia.belongsTo(models.AnnoEscolar, {
        foreignKey: 'annoEscolarID',
        as: 'annoEscolar'
      });
      
    }
  }
  Grado_Materia.init({
    gradoID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      references: {
        model: 'Grados',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    materiaID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      references: {
        model: 'Materias',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    annoEscolarID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'AnnoEscolar',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    }
  }, {
    sequelize,
    modelName: 'Grado_Materia',
    tableName: 'Grado_Materia',
    timestamps: false
  });
  return Grado_Materia;
};