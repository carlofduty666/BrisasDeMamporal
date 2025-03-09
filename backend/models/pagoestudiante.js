'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class PagoEstudiante extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      PagoEstudiante.belongsTo(models.Persona, {
        foreignKey: 'estudianteID',
        as: 'estudiante'
      })
      PagoEstudiante.belongsTo(models.Persona, {
        foreignKey: 'representanteID',
        as: 'representante'
      })
      PagoEstudiante.belongsTo(models.MetodoPago, {
        foreignKey: 'metodoPagoID',
        as: 'metodoPago'
      })
      PagoEstudiante.belongsTo(models.Arancel, {
        foreignKey: 'arancelID',
        as: 'arancel'
      })
    }
  }
  PagoEstudiante.init({
    estudianteID: DataTypes.INTEGER,
    representanteID: DataTypes.INTEGER,
    metodoPagoID: DataTypes.INTEGER,
    arancelID: DataTypes.INTEGER,
    monto: DataTypes.DECIMAL,
    fechaPago: DataTypes.DATE,
    referencia: DataTypes.STRING,
    stripePaymentID: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'PagoEstudiante',
  });
  return PagoEstudiante;
};