'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ConfiguracionCalificaciones extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      ConfiguracionCalificaciones.belongsTo(models.AnnoEscolar, {
        foreignKey: 'annoEscolarID',
        as: 'AnnoEscolar'
      });
      
      ConfiguracionCalificaciones.belongsTo(models.Grados, {
        foreignKey: 'gradoID',
        as: 'Grado'
      });
    }
  }
  ConfiguracionCalificaciones.init({
    annoEscolarID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'AnnoEscolar',
        key: 'id'
      }
    },
    gradoID: {
      type: DataTypes.INTEGER,
      allowNull: true, // Puede ser null para configuración global
      references: {
        model: 'Grados',
        key: 'id'
      }
    },
    // Ponderación de cada lapso para la nota definitiva
    ponderacionLapso1: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 33.33,
      validate: {
        min: 0,
        max: 100
      }
    },
    ponderacionLapso2: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 33.33,
      validate: {
        min: 0,
        max: 100
      }
    },
    ponderacionLapso3: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 33.34,
      validate: {
        min: 0,
        max: 100
      }
    },
    // Nota mínima aprobatoria
    notaMinima: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 10.0,
      validate: {
        min: 0,
        max: 20
      }
    },
    // Reglas adicionales
    redondearNotas: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    decimalesRedondeo: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      validate: {
        min: 0,
        max: 2
      }
    },
    // Regla para aprobación por lapsos
    aprobarPorLapsos: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    // Número mínimo de lapsos que deben aprobarse
    minimoLapsosAprobados: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 2,
      validate: {
        min: 1,
        max: 3
      }
    },
    // Regla para recuperación
    permitirRecuperacion: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    // Nota máxima en recuperación
    notaMaximaRecuperacion: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 10.0,
      validate: {
        min: 0,
        max: 20
      }
    },
    // Descripción de la configuración
    descripcion: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    // Fecha de creación y actualización
    fechaCreacion: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    activo: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    }
  }, {
    sequelize,
    modelName: 'ConfiguracionCalificaciones',
    indexes: [
      {
        unique: true,
        fields: ['annoEscolarID', 'gradoID']
      }
    ]
  });
  return ConfiguracionCalificaciones;
};