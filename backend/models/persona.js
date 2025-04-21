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
      Personas.belongsToMany(models.Materias, {
        through: 'Profesor_Materia_Grados',
        foreignKey: 'profesorID',
        as: 'materiasImpartidas'
      });

      Personas.belongsToMany(models.Roles, {
        through: 'Persona_Roles',
        foreignKey: 'personaID',
        otherKey: 'rolID',
        as: 'roles'
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

      Personas.hasMany(models.Evaluaciones, {
        foreignKey: 'profesorID',
        as: 'evaluacionesCreadas'
      });

      Personas.hasMany(models.Inscripciones, {
        foreignKey: 'estudianteID',
        as: 'inscripciones'
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
      type: DataTypes.DATEONLY,
      get() {
        const rawValue = this.getDataValue('fechaNacimiento');
        return rawValue ? moment(rawValue).format('YYYY-MM-DD') : null;
      },
      set(value) {
        if (!value) {
          this.setDataValue('fechaNacimiento', null);
          return;
        }
        
        // Parsear la fecha manteniendo el día exacto sin ajustes de zona horaria
        let fecha;
        if (typeof value === 'string' && value.includes('-')) {
          const parts = value.split('-');
          // Detectar si es DD-MM-YYYY o YYYY-MM-DD
          if (parts[0].length === 4) {
            // Es YYYY-MM-DD
            fecha = value;
          } else {
            // Es DD-MM-YYYY, convertir a YYYY-MM-DD
            fecha = `${parts[2]}-${parts[1]}-${parts[0]}`;
          }
        } else {
          fecha = value;
        }
        
        this.setDataValue('fechaNacimiento', fecha);
      }
    },
    telefono: DataTypes.STRING,
    email: DataTypes.STRING,
    tipo: DataTypes.ENUM('estudiante', 'representante', 'profesor', 'administrativo', 'obrero', 'owner', 'adminWeb'),
    username: DataTypes.STRING,
    password: DataTypes.STRING,
    profesion: DataTypes.STRING,
    genero: DataTypes.ENUM('M', 'F'),
    observaciones: DataTypes.TEXT,
    direccion: DataTypes.TEXT,
  }, {
    sequelize,
    modelName: 'Personas'

  });
  
  return Personas;
};
