'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Cupos extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      // Relación con Grados
      Cupos.belongsTo(models.Grados, {
        foreignKey: 'gradoID',
        as: 'grado'
      });
      
      // Relación con Secciones
      Cupos.belongsTo(models.Secciones, {
        foreignKey: 'seccionID',
        as: 'Secciones'
      });
      
      // Relación con Año Escolar
      Cupos.belongsTo(models.AnnoEscolar, {
        foreignKey: 'annoEscolarID',
        as: 'annoEscolar'
      });
    }
  }

  Cupos.init({
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
    capacidad: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 30
    },
    ocupados: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    disponibles: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 30
    }
  }, {
    sequelize,
    modelName: 'Cupos',
    tableName: 'Cupos',
    freezeTableName: true
  });
  return Cupos;
};