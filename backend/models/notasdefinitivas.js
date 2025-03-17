'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class NotasDefinitivas extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      NotasDefinitivas.belongsTo(models.Personas, {
        foreignKey: 'estudianteID',
        as: 'Estudiante'
      });
      
      NotasDefinitivas.belongsTo(models.Materias, {
        foreignKey: 'materiaID',
        as: 'Materia'
      });
      
      NotasDefinitivas.belongsTo(models.Grados, {
        foreignKey: 'gradoID',
        as: 'Grado'
      });
      
      NotasDefinitivas.belongsTo(models.AnnoEscolar, {
        foreignKey: 'annoEscolarID',
        as: 'AnnoEscolar'
      });
    }
  }
  NotasDefinitivas.init({
    estudianteID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Personas',
        key: 'id'
      }
    },
    materiaID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Materias',
        key: 'id'
      }
    },
    gradoID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Grados',
        key: 'id'
      }
    },
    annoEscolarID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'AnnoEscolar',
        key: 'id'
      }
    },
    notaDefinitiva: {
      type: DataTypes.FLOAT,
      allowNull: false,
      validate: {
        min: 0,
        max: 20
      }
    },
    aprobado: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    },
    observaciones: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    fechaRegistro: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
    
  }, {
    sequelize,
    modelName: 'NotasDefinitivas',
    indexes: [
      {
        unique: true,
        fields: ['estudianteID', 'materiaID', 'annoEscolarID']
      }
    ]
  });
  return NotasDefinitivas;
};