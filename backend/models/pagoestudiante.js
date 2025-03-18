'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class PagoEstudiantes extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      PagoEstudiantes.belongsTo(models.Personas, {
        foreignKey: 'estudianteID',
        as: 'estudiantes'
      })
      PagoEstudiantes.belongsTo(models.Personas, {
        foreignKey: 'representanteID',
        as: 'representantes'
      })
      PagoEstudiantes.belongsTo(models.MetodoPagos, {
        foreignKey: 'metodoPagoID',
        as: 'metodoPagos'
      })
      PagoEstudiantes.belongsTo(models.Aranceles, {
        foreignKey: 'arancelID',
        as: 'aranceles'
      })
      PagoEstudiantes.belongsTo(models.Inscripciones, {
        foreignKey: 'inscripcionID',
        as: 'inscripciones'
      });
      PagoEstudiantes.belongsTo(models.AnnoEscolar, {
        foreignKey: 'annoEscolarID',
        as: 'annoEscolar'
      });
    }
  }
  PagoEstudiantes.init({
    estudianteID: DataTypes.INTEGER,
    representanteID: DataTypes.INTEGER,
    metodoPagoID: DataTypes.INTEGER,
    arancelID: DataTypes.INTEGER,
    inscripcionID: DataTypes.INTEGER,
    annoEscolarID: DataTypes.INTEGER,
    monto: DataTypes.DECIMAL(10,2),
    montoMora: {
      type: DataTypes.DECIMAL(10,2),
      defaultValue: 0
    },
    descuento: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0
    },
    montoTotal: DataTypes.DECIMAL,
    mesPago: DataTypes.STRING,
    fechaPago: DataTypes.DATE,
    fechaVencimiento: DataTypes.DATE,
    referencia: DataTypes.STRING,
    comprobante: DataTypes.STRING,
    estado: {
      type: DataTypes.ENUM('pendiente', 'pagado', 'vencido', 'anulado'),
      defaultValue: 'pendiente'
    },
    stripeSessionID: DataTypes.STRING,
    stripePaymentID: DataTypes.STRING,
    observaciones: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'PagoEstudiantes',
  });
  return PagoEstudiantes;
};