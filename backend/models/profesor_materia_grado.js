'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Profesor_Materia_Grados extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Profesor_Materia_Grados.belongsTo(models.Personas, {
        foreignKey: 'profesorID',
        as: 'profesor'
      });
      
      Profesor_Materia_Grados.belongsTo(models.Materias, {
        foreignKey: 'materiaID',
        as: 'materia'
      });
      
      Profesor_Materia_Grados.belongsTo(models.Grados, {
        foreignKey: 'gradoID',
        as: 'grado'
      });
      
      Profesor_Materia_Grados.belongsTo(models.AnnoEscolar, {
        foreignKey: 'annoEscolarID',
        as: 'annoEscolar'
      });
    }
  }
  
  Profesor_Materia_Grados.init({
    profesorID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Personas',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    materiaID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Materias',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    gradoID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Grados',
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
    modelName: 'Profesor_Materia_Grados',
    tableName: 'Profesor_Materia_Grados',
    freezeTableName: true,
    timestamps: false
  });
  return Profesor_Materia_Grados;
};