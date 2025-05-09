'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Seccion_Personas extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Seccion_Personas.belongsTo(models.AnnoEscolar, {
        foreignKey: 'annoEscolarID',
        as: 'annoEscolar'
      })
      Seccion_Personas.belongsTo(models.Secciones, {
        foreignKey: 'seccionID',
        as: 'secciones'
      })
      Seccion_Personas.belongsTo(models.Personas, {
        foreignKey: 'personaID',
        as: 'personas'
      })
    }
  }
  Seccion_Personas.init({
    seccionID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'Secciones',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    personaID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'Personas',
        key: 'id'
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
    rol: {
      type: DataTypes.ENUM('estudiante', 'profesor'),
      allowNull: false,
      defaultValue: 'estudiante'
    },
    materiaID: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Materias',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    }
  }, {
    sequelize,
    modelName: 'Seccion_Personas',
    timestamps: false // Agregar esta línea para habilitar timestamps, lo cual es necesario para que las columnas createdAt y updatedAt se generen automáticamente
  });
  return Seccion_Personas;
};