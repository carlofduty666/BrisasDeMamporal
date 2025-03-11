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
    }
  }
  PagoEstudiantes.init({
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
    modelName: 'PagoEstudiantes',
  });
  return PagoEstudiantes;
};