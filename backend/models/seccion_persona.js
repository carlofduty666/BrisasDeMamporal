'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Seccion_Persona extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Seccion_Persona.belongsTo(models.AnnoEscolar, {
        foreignKey: 'annoEscolarID',
        as: 'annoEscolar'
      })
      Seccion_Persona.belongsTo(models.Seccion, {
        foreignKey: 'seccionID',
        as: 'seccion'
      })
      Seccion_Persona.belongsTo(models.Persona, {
        foreignKey: 'personaID',
        as: 'persona'
      })
    }
  }
  Seccion_Persona.init({
    seccionID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    personaID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
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
    modelName: 'Seccion_Persona',
    timestamps: false // Agregar esta línea para habilitar timestamps, lo cual es necesario para que las columnas createdAt y updatedAt se generen automáticamente
  });
  return Seccion_Persona;
};