'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Mensualidades extends Model {
    static associate(models) {
      Mensualidades.belongsTo(models.Personas, { foreignKey: 'estudianteID', as: 'estudiante' });
      Mensualidades.belongsTo(models.Personas, { foreignKey: 'representanteID', as: 'representante' });
      Mensualidades.belongsTo(models.Inscripciones, { foreignKey: 'inscripcionID', as: 'inscripcion' });
      Mensualidades.belongsTo(models.AnnoEscolar, { foreignKey: 'annoEscolarID', as: 'annoEscolar' });
      Mensualidades.belongsTo(models.Aranceles, { foreignKey: 'arancelID', as: 'arancel' });
      Mensualidades.belongsTo(models.PagoEstudiantes, { foreignKey: 'pagoID', as: 'pago' });
    }
  }
  Mensualidades.init({
    estudianteID: { type: DataTypes.INTEGER, allowNull: false },
    representanteID: { type: DataTypes.INTEGER, allowNull: false },
    inscripcionID: { type: DataTypes.INTEGER, allowNull: true },
    annoEscolarID: { type: DataTypes.INTEGER, allowNull: false },
    arancelID: { type: DataTypes.INTEGER, allowNull: true },
    mes: { type: DataTypes.INTEGER, allowNull: false }, // 1..12
    anio: { type: DataTypes.INTEGER, allowNull: true },
    montoBase: { type: DataTypes.DECIMAL(10,2), allowNull: false, defaultValue: 0 },
    moraAcumulada: { type: DataTypes.DECIMAL(10,2), allowNull: false, defaultValue: 0 },
    estado: { type: DataTypes.ENUM('pendiente','reportado','pagado','anulado'), allowNull: false, defaultValue: 'pendiente' },
    pagoID: { type: DataTypes.INTEGER, allowNull: true },
    fechaVencimiento: { type: DataTypes.DATE, allowNull: true },
    observacionAdmin: { type: DataTypes.TEXT, allowNull: true },
  }, {
    sequelize,
    modelName: 'Mensualidades',
    tableName: 'Mensualidades',
  });
  return Mensualidades;
};