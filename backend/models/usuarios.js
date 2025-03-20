'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Usuarios extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Usuarios.belongsTo(models.Personas, {
        foreignKey: 'personaID',
        as: 'persona'
      });
    }
  }
  Usuarios.init({
    personaID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Personas',
        key: 'id'
      }
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    verificado: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    codigoVerificacion: {
      type: DataTypes.STRING,
      allowNull: true
    },
    codigoRecuperacion: {
      type: DataTypes.STRING,
      allowNull: true
    },
    expiracionCodigoRecuperacion: {
      type: DataTypes.DATE,
      allowNull: true
    },
    ultimoLogin: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'Usuarios',
  });
  return Usuarios;
};