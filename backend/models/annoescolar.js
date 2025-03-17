'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class AnnoEscolar extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      AnnoEscolar.hasMany(models.Grado_Personas, {
        foreignKey: 'annoEscolarID',
        as: 'gradoPersonas'
      });
      
      AnnoEscolar.hasMany(models.Grado_Materia, {
        foreignKey: 'annoEscolarID',
        as: 'gradoMaterias'
      });
      
      AnnoEscolar.hasMany(models.Profesor_Materia_Grados, {
        foreignKey: 'annoEscolarID',
        as: 'profesorMateriaGrados'
      });
      
      AnnoEscolar.hasMany(models.Calificaciones, {
        foreignKey: 'annoEscolarID',
        as: 'calificaciones'
      });

      AnnoEscolar.hasMany(models.Evaluaciones, {
        foreignKey: 'annoEscolarID',
        as: 'evaluaciones'
      });

    }

  static async getAllAnnoEscolares() {
    return await this.findAll();
  }
  
  static async getAnnoEscolarById(id) {
    return await this.findByPk(id);
  }
  
  static async getAnnoEscolarActual() {
    return await this.findOne({
      where: { activo: true }
    });
  }
  
  static async createAnnoEscolar(data) {
    return await this.create(data);
  }
  
  static async updateAnnoEscolar(id, data) {
    const annoEscolar = await this.findByPk(id);
    if (annoEscolar) {
      return await annoEscolar.update(data);
    }
    return null;
  }
  
  static async deleteAnnoEscolar(id) {
    return await this.destroy({
      where: { id }
    });
  }
  
  static async setAnnoEscolarActivo(id) {
    // Primero desactivamos todos los años escolares
    await this.update(
      { activo: false },
      { where: {} }
    );
    
    // Luego activamos el año escolar específico
    return await this.update(
      { activo: true },
      { where: { id } }
    );
  }
}
  AnnoEscolar.init({
    periodo: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
        is: /^\d{4}-\d{4}$/ // Validar formato YYYY-YYYY
      }
    },
    activo: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  }, {
    sequelize,
    modelName: 'AnnoEscolar',
    tableName: 'AnnoEscolar', // Asegúrate de que el nombre de la tabla sea correcto
    freezeTableName: true
  });
  return AnnoEscolar;
};