module.exports = (sequelize, DataTypes) => {
  const Horarios = sequelize.define('Horarios', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    grado_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'grados',
        key: 'id'
      }
    },
    seccion_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'secciones',
        key: 'id'
      }
    },
    materia_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'materias',
        key: 'id'
      }
    },
    profesor_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'personas',
        key: 'id'
      }
    },
    dia_semana: {
      type: DataTypes.ENUM('lunes', 'martes', 'miércoles', 'jueves', 'viernes'),
      allowNull: false
    },
    hora_inicio: {
      type: DataTypes.TIME,
      allowNull: false
    },
    hora_fin: {
      type: DataTypes.TIME,
      allowNull: false
    },
    aula: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    anno_escolar_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'anno_escolar',
        key: 'id'
      }
    },
    activo: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    tableName: 'horarios',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  Horarios.associate = function(models) {
    // Asociaciones
    Horarios.belongsTo(models.Grados, {
      foreignKey: 'grado_id',
      as: 'grado'
    });

    Horarios.belongsTo(models.Secciones, {
      foreignKey: 'seccion_id',
      as: 'seccion'
    });

    Horarios.belongsTo(models.Materias, {
      foreignKey: 'materia_id',
      as: 'materia'
    });

    Horarios.belongsTo(models.Personas, {
      foreignKey: 'profesor_id',
      as: 'profesor'
    });

    Horarios.belongsTo(models.AnnoEscolar, {
      foreignKey: 'anno_escolar_id',
      as: 'annoEscolar'
    });
  };

  // Métodos estáticos para consultas
  Horarios.getHorariosByGradoSeccion = async function(gradoId, seccionId, annoEscolarId = null) {
    const whereClause = {
      grado_id: gradoId,
      seccion_id: seccionId,
      activo: true
    };

    if (annoEscolarId) {
      whereClause.anno_escolar_id = annoEscolarId;
    }

    return await this.findAll({
      where: whereClause,
      include: [
        {
          model: sequelize.models.Materias,
          as: 'materia',
          attributes: ['id', 'asignatura']
        },
        {
          model: sequelize.models.Personas,
          as: 'profesor',
          attributes: ['id', 'nombre', 'apellido']
        },
        {
          model: sequelize.models.Grados,
          as: 'grado',
          attributes: ['id', 'nombre_grado']
        },
        {
          model: sequelize.models.Secciones,
          as: 'seccion',
          attributes: ['id', 'nombre_seccion']
        }
      ],
      order: [
        ['dia_semana', 'ASC'],
        ['hora_inicio', 'ASC']
      ]
    });
  };

  Horarios.getClasesActuales = async function() {
    const now = new Date();
    const diasSemana = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
    const currentDay = diasSemana[now.getDay()];
    const currentTime = now.toTimeString().slice(0, 5); // HH:MM format

    // Obtener año escolar activo
    const annoEscolarActivo = await sequelize.models.AnnoEscolar.findOne({
      where: { activo: true }
    });

    if (!annoEscolarActivo) {
      return [];
    }

    return await this.findAll({
      where: {
        dia_semana: currentDay,
        hora_inicio: {
          [sequelize.Sequelize.Op.lte]: currentTime
        },
        hora_fin: {
          [sequelize.Sequelize.Op.gte]: currentTime
        },
        anno_escolar_id: annoEscolarActivo.id,
        activo: true
      },
      include: [
        {
          model: sequelize.models.Materias,
          as: 'materia',
          attributes: ['id', 'asignatura']
        },
        {
          model: sequelize.models.Personas,
          as: 'profesor',
          attributes: ['id', 'nombre', 'apellido']
        },
        {
          model: sequelize.models.Grados,
          as: 'grado',
          attributes: ['id', 'nombre_grado']
        },
        {
          model: sequelize.models.Secciones,
          as: 'seccion',
          attributes: ['id', 'nombre_seccion']
        }
      ]
    });
  };

  Horarios.getProximasClases = async function(limit = 5) {
    const now = new Date();
    const diasSemana = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
    const currentDay = diasSemana[now.getDay()];
    const currentTime = now.toTimeString().slice(0, 5); // HH:MM format

    // Obtener año escolar activo
    const annoEscolarActivo = await sequelize.models.AnnoEscolar.findOne({
      where: { activo: true }
    });

    if (!annoEscolarActivo) {
      return [];
    }

    return await this.findAll({
      where: {
        [sequelize.Sequelize.Op.or]: [
          {
            dia_semana: currentDay,
            hora_inicio: {
              [sequelize.Sequelize.Op.gt]: currentTime
            }
          },
          {
            dia_semana: {
              [sequelize.Sequelize.Op.ne]: currentDay
            }
          }
        ],
        anno_escolar_id: annoEscolarActivo.id,
        activo: true
      },
      include: [
        {
          model: sequelize.models.Materias,
          as: 'materia',
          attributes: ['id', 'asignatura']
        },
        {
          model: sequelize.models.Personas,
          as: 'profesor',
          attributes: ['id', 'nombre', 'apellido']
        },
        {
          model: sequelize.models.Grados,
          as: 'grado',
          attributes: ['id', 'nombre_grado']
        },
        {
          model: sequelize.models.Secciones,
          as: 'seccion',
          attributes: ['id', 'nombre_seccion']
        }
      ],
      order: [
        ['dia_semana', 'ASC'],
        ['hora_inicio', 'ASC']
      ],
      limit: limit
    });
  };

  return Horarios;
};