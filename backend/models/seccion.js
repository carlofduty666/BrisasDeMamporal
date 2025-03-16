'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Secciones extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Secciones.belongsTo(models.Grados, {
        foreignKey: 'gradoID',
        as: 'Grados'
      })
      Secciones.belongsToMany(models.Personas, {
        through: 'Seccion_Personas',
        foreignKey: 'seccionID',
        otherKey: 'personaID',
        as: 'personas',
      });
    }
    static async getSeccionesByGrado(gradoID) {
      return await this.findAll({
        where: { gradoID }
      });
    }
    
    static async getEstudiantesBySeccion(seccionID, annoEscolarID) {
      return await sequelize.models.Personas.findAll({
        include: [{
          model: this,
          as: 'secciones',
          through: {
            where: { annoEscolarID },
            attributes: []
          },
          where: { id: seccionID },
          required: true
        }],
        where: { tipo: 'estudiante' }
      });
    }
    
    static async getProfesoresBySeccion(seccionID, annoEscolarID) {
      return await sequelize.models.Personas.findAll({
        include: [{
          model: this,
          as: 'secciones',
          through: {
            where: { annoEscolarID },
            attributes: []
          },
          where: { id: seccionID },
          required: true
        }],
        where: { tipo: 'profesor' }
      });
    }

  }

    Secciones.init({
    nombre_seccion: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    gradoID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Grados',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    capacidad: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 30 // Capacidad por defecto
    },
    activo: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    sequelize,
    modelName: 'Secciones',
  });
  return Secciones;
};