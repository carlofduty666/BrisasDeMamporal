'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Evaluaciones extends Model {
    static associate(models) {
      Evaluaciones.belongsTo(models.Materias, {
        foreignKey: 'materiaID',
        as: 'Materias'
      });
      // Corregimos el nombre del modelo a 'Evaluaciones'
      Evaluaciones.hasMany(models.Calificaciones, {
        foreignKey: 'evaluacionID',
        as: 'Calificaciones'
      });
      Evaluaciones.belongsTo(models.Grados, {
        foreignKey: 'gradoID',
        as: 'Grado'
      });
      
      Evaluaciones.belongsTo(models.Secciones, {
        foreignKey: 'seccionID',
        as: 'Seccion'
      });
      
      Evaluaciones.belongsTo(models.AnnoEscolar, {
        foreignKey: 'annoEscolarID',
        as: 'AnnoEscolar'
      });
      
      Evaluaciones.belongsTo(models.Personas, {
        foreignKey: 'profesorID',
        as: 'Profesor'
      });
      
      // Para archivos adjuntos
      Evaluaciones.hasMany(models.ArchivosEvaluaciones, {
        foreignKey: 'evaluacionID',
        as: 'Archivos'
      });
    }
  }
  
  Evaluaciones.init({
    nombreEvaluacion: {
      type: DataTypes.STRING,
      allowNull: false
    },
    tipoEvaluacion: {
      type: DataTypes.ENUM('examen', 'quiz', 'tarea', 'proyecto', 'participacion'),
      allowNull: false
    },
    porcentaje: {
      type: DataTypes.FLOAT,
      allowNull: false,
      validate: {
        min: 0,
        max: 100
      }
    },
    lapso: {
      type: DataTypes.ENUM('1', '2', '3'),
      allowNull: false
    },
    materiaID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Materias',
        key: 'id'
      }
    },
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
    profesorID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Personas',
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
    descripcion: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    fechaEvaluacion: {
      type: DataTypes.DATE,
      allowNull: true
    },
    // Para evaluaciones que requieren entrega
    requiereEntrega: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    fechaLimiteEntrega: {
      type: DataTypes.DATE,
      allowNull: true
    },
    // Para archivos adjuntos directamente en la evaluación
    archivoURL: {
      type: DataTypes.STRING,
      allowNull: true
    },
    nombreArchivo: {
      type: DataTypes.STRING,
      allowNull: true
    },
    tipoArchivo: {
      type: DataTypes.STRING,
      allowNull: true
    },
    tamanoArchivo: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'Evaluaciones',
  });
  
  return Evaluaciones;
};