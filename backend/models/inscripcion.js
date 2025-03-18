'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Inscripciones extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Inscripciones.belongsTo(models.Personas, {
        foreignKey: 'estudianteID',
        as: 'estudiante'
      });
      Inscripciones.belongsTo(models.Personas, {
        foreignKey: 'representanteID',
        as: 'representante'
      });
      Inscripciones.belongsTo(models.AnnoEscolar, {
        foreignKey: 'annoEscolarID',
        as: 'annoEscolar'
      });
      Inscripciones.belongsTo(models.Grados, {
        foreignKey: 'gradoID',
        as: 'grado'
      });
      Inscripciones.belongsTo(models.Secciones, {
        foreignKey: 'seccionID',
        as: 'seccion'
      });
      Inscripciones.hasMany(models.PagoEstudiantes, {
        foreignKey: 'inscripcionID',
        as: 'pagos'
      });
    }
  }
  Inscripciones.init({
    estudianteID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Personas',
        key: 'id'
      }
    },
    representanteID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Personas',
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
      allowNull: true,
      references: {
        model: 'Secciones',
        key: 'id'
      }
    },
    fechaInscripcion: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    estado: {
      type: DataTypes.ENUM('pendiente', 'inscrito', 'retirado', 'graduado'),
      allowNull: false,
      defaultValue: 'pendiente'
    },
    documentosCompletos: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    pagoInscripcionCompletado: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    observaciones: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'Inscripciones',
  });
  return Inscripciones;
};