'use strict';
const { Model } = require('sequelize');
const moment = require('moment');

module.exports = (sequelize, DataTypes) => {
  class Personas extends Model {
    static associate(models) {
      Personas.hasMany(models.Documentos, {
        foreignKey: 'personaID',
        as: 'documentos'
      });
      Personas.belongsToMany(models.Secciones, {
        through: 'Seccion_Personas',
        foreignKey: 'personaID',
        as: 'secciones',
      });
      Personas.belongsToMany(models.Grados, {
        through: 'Grado_Personas',
        foreignKey: 'personaID',
        as: 'grados',
      });
      Personas.hasMany(models.PagoEstudiantes, {
        foreignKey: 'estudianteID',
        as: 'pagosEstudiantes'
      });
      Personas.hasMany(models.PagoEstudiantes, { 
        foreignKey: 'representanteID', 
        as: 'pagosRealizados'
      });
      Personas.hasMany(models.Grado_Personas, {
        foreignKey: 'personaID',
        as: 'gradoPersonas'
      });
      Personas.hasMany(models.Calificaciones, {
        foreignKey: 'personaID',
        as: 'calificaciones'
      });
    }

    static async getAllPersonas(filter = null) {
      try {
          if (filter) {
              return await this.findAll({ where: filter });
          } else {
              return await this.findAll();
          }
      } catch (error) {
          console.error('Error al obtener personas:', error);
          throw error;
      }
  }

    static async getPersonaBy(field, value) {
      try {
          if (field === 'id') {
              return await this.findByPk(value);
          } else {
              const whereClause = { [field]: value };
              return await this.findOne({ where: whereClause });
          }
      } catch (error) {
          console.error(`Error al buscar persona por ${field}:`, error);
          throw error;
      }
  }

    static async createPersona(personaData) {
      return await Personas.create(personaData);
    }

    static async deletePersona(id) {
      return await Personas.destroy({ where: { id } });
    }

    static async updatePersona(id, updatedData) {
      return await Personas.update(updatedData, { where: { id } });
    }

    
  }
  
  Personas.init({
    nombre: DataTypes.STRING,
    apellido: DataTypes.STRING,
    cedula: DataTypes.STRING,
    fechaNacimiento: {
      type: DataTypes.DATE,
      get() {
        return moment(this.getDataValue('fechaNacimiento')).format('DD-MM-YYYY');
      },
      set(value) {
        const fecha = moment(value, 'DD-MM-YYYY');
        if (fecha.isValid()) {
          this.setDataValue('fechaNacimiento', fecha.toDate());
        } else {
          throw new Error('Formato de fecha inválido');
        }
      }
    },
    telefono: DataTypes.STRING,
    email: DataTypes.STRING,
    tipo: DataTypes.ENUM('estudiante', 'representante', 'profesor', 'administrativo', 'obrero', 'owner', 'adminWeb'),
    username: DataTypes.STRING,
    password: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Personas'

  });
  
  return Personas;
};
