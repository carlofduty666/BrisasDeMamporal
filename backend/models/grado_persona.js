'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Grado_Persona extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Grado_Persona.belongsTo(models.AnnoEscolar, {
        foreignKey: 'annoEscolarID',
        as: 'annoEscolar'
      })
    }
  }
  Grado_Persona.init({
    gradoID: { // Clave foránea a la tabla Grados
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true, // Especificar que es parte de la clave primaria
      references: {
        model: 'Grados', // Nombre de la tabla de referencia
        key: 'id' // Nombre de la columna de referencia
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    personaID: { // Clave foránea a la tabla Personas (estudiante o profesor)
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true, // Especificar que es parte de la clave primaria
      references: {
        model: 'Personas', // Nombre de la tabla de referencia
        key: 'id' // Nombre de la columna de referencia
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
    },
    sequelize,
    modelName: 'Grado_Persona',
    timestamps: false // Agregar esta línea para habilitar timestamps, lo cual es necesario para que las columnas createdAt y updatedAt se generen automáticamente
  });
  return Grado_Persona;
};