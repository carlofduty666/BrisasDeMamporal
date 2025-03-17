'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class NotasLapsos extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      NotasLapsos.belongsTo(models.Personas, {
        foreignKey: 'estudianteID',
        as: 'Estudiante'
      });
      
      NotasLapsos.belongsTo(models.Materias, {
        foreignKey: 'materiaID',
        as: 'Materia'
      });
      
      NotasLapsos.belongsTo(models.Grados, {
        foreignKey: 'gradoID',
        as: 'Grado'
      });
      
      NotasLapsos.belongsTo(models.Secciones, {
        foreignKey: 'seccionID',
        as: 'Seccion'
      });
      
      NotasLapsos.belongsTo(models.AnnoEscolar, {
        foreignKey: 'annoEscolarID',
        as: 'AnnoEscolar'
      });
    }
  }
  NotasLapsos.init({
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
    seccionID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Secciones',
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
    lapso: {
      type: DataTypes.ENUM('1', '2', '3'),
      allowNull: false
    },
    notaFinal: {
      type: DataTypes.FLOAT,
      allowNull: false,
      validate: {
        min: 0,
        max: 20
      }
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
    modelName: 'NotasLapsos',
    indexes: [
      {
        unique: true,
        fields: ['estudianteID', 'materiaID', 'lapso', 'annoEscolarID']
      }
    ]
  });
  return NotasLapsos;
};