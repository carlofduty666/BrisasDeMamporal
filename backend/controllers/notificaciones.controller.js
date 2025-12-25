const db = require('../models');
const { Notificaciones, NotificacionesUsuarios, Personas, Mensualidades, Usuarios } = require('../models');
const { Op } = require('sequelize');
const nodemailer = require('nodemailer');

const notificacionesController = {
  
  async obtenerDestinatarios(req, res) {
    try {
      const { tipo, filtros } = req.body;
      
      let personas = [];
      
      if (tipo === 'todos') {
        personas = await Personas.findAll({
          where: { email: { [Op.ne]: null } },
          attributes: ['id', 'nombre', 'apellido', 'email', 'tipo']
        });
      } 
      else if (tipo === 'estudiantes') {
        personas = await Personas.findAll({
          where: { 
            tipo: 'estudiante',
            email: { [Op.ne]: null }
          },
          attributes: ['id', 'nombre', 'apellido', 'email', 'tipo']
        });
      }
      else if (tipo === 'representantes') {
        personas = await Personas.findAll({
          where: { 
            tipo: 'representante',
            email: { [Op.ne]: null }
          },
          attributes: ['id', 'nombre', 'apellido', 'email', 'tipo']
        });
      }
      else if (tipo === 'profesores') {
        personas = await Personas.findAll({
          where: { 
            tipo: 'profesor',
            email: { [Op.ne]: null }
          },
          attributes: ['id', 'nombre', 'apellido', 'email', 'tipo']
        });
      }
      else if (tipo === 'empleados') {
        personas = await Personas.findAll({
          where: { 
            tipo: 'administrativo',
            email: { [Op.ne]: null }
          },
          attributes: ['id', 'nombre', 'apellido', 'email', 'tipo']
        });
      }
      else if (tipo === 'administradores') {
        personas = await Personas.findAll({
          where: { 
            tipo: { [Op.in]: ['adminWeb', 'owner'] },
            email: { [Op.ne]: null }
          },
          attributes: ['id', 'nombre', 'apellido', 'email', 'tipo']
        });
      }
      
      if (filtros) {
        if (filtros.pagosVencidos) {
          const mensualidadesVencidas = await Mensualidades.findAll({
            where: {
              estado: 'pendiente',
              fechaVencimiento: { [Op.lt]: new Date() }
            },
            attributes: ['representanteID'],
            group: ['representanteID']
          });
          
          const idsVencidos = mensualidadesVencidas.map(m => m.representanteID);
          personas = personas.filter(p => idsVencidos.includes(p.id));
        }
        
        if (filtros.gradoID) {
          const { Inscripciones } = require('../models');
          const inscripciones = await Inscripciones.findAll({
            where: { gradoID: filtros.gradoID },
            attributes: ['estudianteID']
          });
          const idsEstudiantes = inscripciones.map(i => i.estudianteID);
          personas = personas.filter(p => idsEstudiantes.includes(p.id));
        }
        
        if (filtros.seccionID) {
          const { Inscripciones } = require('../models');
          const inscripciones = await Inscripciones.findAll({
            where: { seccionID: filtros.seccionID },
            attributes: ['estudianteID']
          });
          const idsEstudiantes = inscripciones.map(i => i.estudianteID);
          personas = personas.filter(p => idsEstudiantes.includes(p.id));
        }

        if (filtros.profesoresDeGrado) {
          const { Profesor_Materia_Grados } = require('../models');
          const profesoresDeGrado = await Profesor_Materia_Grados.findAll({
            where: { gradoID: filtros.profesoresDeGrado },
            attributes: ['profesorID'],
            raw: true,
            group: ['profesorID']
          });
          const idsProfesores = profesoresDeGrado.map(p => p.profesorID);
          personas = personas.filter(p => idsProfesores.includes(p.id));
        }

        if (filtros.profesoresDeSeccion) {
          const { Seccion_Personas } = require('../models');
          const profesoresDeSeccion = await Seccion_Personas.findAll({
            where: { 
              seccionID: filtros.profesoresDeSeccion,
              rol: 'profesor'
            },
            attributes: ['personaID'],
            raw: true
          });
          const idsProfesores = profesoresDeSeccion.map(p => p.personaID);
          personas = personas.filter(p => idsProfesores.includes(p.id));
        }

        if (filtros.representantesDeGrado) {
          const { Inscripciones } = require('../models');
          const estudiantesEnGrado = await Inscripciones.findAll({
            where: { gradoID: filtros.representantesDeGrado },
            attributes: ['representanteID'],
            raw: true
          });
          const idsRepresentantes = [...new Set(estudiantesEnGrado.map(i => i.representanteID))];
          personas = personas.filter(p => idsRepresentantes.includes(p.id));
        }

        if (filtros.representantesDeSeccion) {
          const { Inscripciones } = require('../models');
          const estudiantesEnSeccion = await Inscripciones.findAll({
            where: { seccionID: filtros.representantesDeSeccion },
            attributes: ['representanteID'],
            raw: true
          });
          const idsRepresentantes = [...new Set(estudiantesEnSeccion.map(i => i.representanteID))];
          personas = personas.filter(p => idsRepresentantes.includes(p.id));
        }

        if (filtros.busqueda && filtros.busqueda.trim()) {
          const busqueda = filtros.busqueda.trim().toLowerCase();
          personas = personas.filter(p => {
            const nombre = (p.nombre || '').toLowerCase();
            const apellido = (p.apellido || '').toLowerCase();
            const cedula = (p.cedula || '').toLowerCase();
            return nombre.includes(busqueda) || apellido.includes(busqueda) || cedula.includes(busqueda);
          });
        }

        if (filtros.cargoProfesion && filtros.cargoProfesion.trim()) {
          personas = personas.filter(p => {
            const profesion = (p.profesion || '').toLowerCase();
            const filtro = filtros.cargoProfesion.toLowerCase();
            return profesion.includes(filtro);
          });
        }

      }
      
      res.json({
        total: personas.length,
        destinatarios: personas
      });
      
    } catch (error) {
      console.error('Error al obtener destinatarios:', error);
      res.status(500).json({ message: 'Error al obtener destinatarios' });
    }
  },

  async crear(req, res) {
    try {
      const {
        tipo,
        titulo,
        mensaje,
        canal,
        destinatariosTipo,
        destinatariosIDs,
        filtros,
        metadata,
        colorTema,
        icono
      } = req.body;

      const usuarioID = req.user?.id || null;

      const notificacion = await Notificaciones.create({
        tipo,
        titulo,
        mensaje,
        canal,
        destinatariosTipo,
        destinatariosIDs,
        filtros,
        metadata,
        colorTema,
        icono,
        creadoPor: usuarioID,
        estado: 'pendiente',
        totalDestinatarios: 0,
        exitosos: 0,
        fallidos: 0
      });

      res.status(201).json({
        message: 'Notificación creada exitosamente',
        notificacion
      });

    } catch (error) {
      console.error('Error al crear notificación:', error);
      res.status(500).json({ message: 'Error al crear notificación' });
    }
  },

  async enviar(req, res) {
    const transaction = await db.sequelize.transaction();
    
    try {
      const { id } = req.params;
      
      const notificacion = await Notificaciones.findByPk(id);
      if (!notificacion) {
        await transaction.rollback();
        return res.status(404).json({ message: 'Notificación no encontrada' });
      }

      if (notificacion.estado === 'enviado') {
        await transaction.rollback();
        return res.status(400).json({ message: 'Esta notificación ya fue enviada' });
      }

      await notificacion.update({ estado: 'enviando' }, { transaction });

      let destinatarios = [];
      
      if (notificacion.destinatariosTipo === 'personalizado' && notificacion.destinatariosIDs) {
        destinatarios = await Personas.findAll({
          where: {
            id: { [Op.in]: notificacion.destinatariosIDs },
            email: { [Op.ne]: null }
          },
          attributes: ['id', 'nombre', 'apellido', 'email']
        });
      } else {
        const whereClause = { email: { [Op.ne]: null } };
        
        if (notificacion.destinatariosTipo === 'estudiantes') {
          whereClause.tipo = 'estudiante';
        } else if (notificacion.destinatariosTipo === 'representantes') {
          whereClause.tipo = 'representante';
        } else if (notificacion.destinatariosTipo === 'profesores') {
          whereClause.tipo = 'profesor';
        } else if (notificacion.destinatariosTipo === 'empleados') {
          whereClause.tipo = 'administrativo';
        } else if (notificacion.destinatariosTipo === 'administradores') {
          whereClause.tipo = { [Op.in]: ['adminWeb', 'owner'] };
        }
        
        destinatarios = await Personas.findAll({
          where: whereClause,
          attributes: ['id', 'nombre', 'apellido', 'email']
        });
      }

      if (notificacion.filtros) {
        if (notificacion.filtros.pagosVencidos) {
          const mensualidadesVencidas = await Mensualidades.findAll({
            where: {
              estado: 'pendiente',
              fechaVencimiento: { [Op.lt]: new Date() }
            },
            attributes: ['representanteID'],
            group: ['representanteID']
          });
          const idsVencidos = mensualidadesVencidas.map(m => m.representanteID);
          destinatarios = destinatarios.filter(d => idsVencidos.includes(d.id));
        }
      }

      const registrosUsuarios = destinatarios.map(d => ({
        notificacionID: notificacion.id,
        personaID: d.id,
        leida: false,
        emailEnviado: false
      }));

      await NotificacionesUsuarios.bulkCreate(registrosUsuarios, { transaction });

      let exitosos = 0;
      let fallidos = 0;
      const errores = [];

      if (notificacion.canal === 'email' || notificacion.canal === 'ambos') {
        const transporter = nodemailer.createTransport({
          host: process.env.EMAIL_HOST || 'smtp.gmail.com',
          port: process.env.EMAIL_PORT || 587,
          secure: false,
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD
          }
        });

        for (const destinatario of destinatarios) {
          try {
            await transporter.sendMail({
              from: `"Brisas de Mamporal" <${process.env.EMAIL_USER}>`,
              to: destinatario.email,
              subject: notificacion.titulo,
              html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                  <h2 style="color: #333;">${notificacion.titulo}</h2>
                  <p style="color: #666; line-height: 1.6;">${notificacion.mensaje}</p>
                  <hr style="border: 1px solid #eee; margin: 20px 0;">
                  <p style="color: #999; font-size: 12px;">
                    Este es un mensaje automático del sistema de gestión escolar Brisas de Mamporal.
                  </p>
                </div>
              `
            });

            await NotificacionesUsuarios.update(
              {
                emailEnviado: true,
                emailFechaEnvio: new Date()
              },
              {
                where: {
                  notificacionID: notificacion.id,
                  personaID: destinatario.id
                },
                transaction
              }
            );

            exitosos++;
          } catch (emailError) {
            console.error(`Error al enviar email a ${destinatario.email}:`, emailError);
            
            await NotificacionesUsuarios.update(
              {
                emailError: emailError.message
              },
              {
                where: {
                  notificacionID: notificacion.id,
                  personaID: destinatario.id
                },
                transaction
              }
            );
            
            errores.push({
              destinatario: destinatario.email,
              error: emailError.message
            });
            fallidos++;
          }
        }
      } else {
        exitosos = destinatarios.length;
      }

      await notificacion.update({
        estado: 'enviado',
        fechaEnvio: new Date(),
        totalDestinatarios: destinatarios.length,
        exitosos,
        fallidos,
        errores: errores.length > 0 ? errores : null
      }, { transaction });

      await transaction.commit();

      res.json({
        message: 'Notificación enviada exitosamente',
        totalDestinatarios: destinatarios.length,
        exitosos,
        fallidos,
        errores: errores.length > 0 ? errores : null
      });

    } catch (error) {
      await transaction.rollback();
      console.error('Error al enviar notificación:', error);
      res.status(500).json({ message: 'Error al enviar notificación' });
    }
  },

  async listar(req, res) {
    try {
      const { tipo, estado, limit = 50, offset = 0 } = req.query;
      
      const where = {};
      if (tipo) where.tipo = tipo;
      if (estado) where.estado = estado;

      const notificaciones = await Notificaciones.findAll({
        where,
        include: [
          {
            model: Usuarios,
            as: 'creador',
            attributes: ['id', 'username'],
            include: [{
              model: Personas,
              as: 'persona',
              attributes: ['nombre', 'apellido']
            }]
          }
        ],
        order: [['createdAt', 'DESC']],
        limit: parseInt(limit),
        offset: parseInt(offset)
      });

      const total = await Notificaciones.count({ where });

      res.json({
        notificaciones,
        total,
        limit: parseInt(limit),
        offset: parseInt(offset)
      });

    } catch (error) {
      console.error('Error al listar notificaciones:', error);
      res.status(500).json({ message: 'Error al listar notificaciones' });
    }
  },

  async obtenerPorId(req, res) {
    try {
      const { id } = req.params;

      const notificacion = await Notificaciones.findByPk(id, {
        include: [
          {
            model: Usuarios,
            as: 'creador',
            attributes: ['id', 'username'],
            include: [{
              model: Personas,
              as: 'persona',
              attributes: ['nombre', 'apellido']
            }]
          },
          {
            model: NotificacionesUsuarios,
            as: 'notificacionesUsuarios',
            include: [{
              model: Personas,
              as: 'persona',
              attributes: ['id', 'nombre', 'apellido', 'email']
            }]
          }
        ]
      });

      if (!notificacion) {
        return res.status(404).json({ message: 'Notificación no encontrada' });
      }

      res.json(notificacion);

    } catch (error) {
      console.error('Error al obtener notificación:', error);
      res.status(500).json({ message: 'Error al obtener notificación' });
    }
  },

  async misNotificaciones(req, res) {
    try {
      const personaID = req.user?.personaID;
      
      if (!personaID) {
        return res.status(400).json({ message: 'No se encontró la persona asociada al usuario' });
      }

      const { leida, limit = 20, offset = 0 } = req.query;
      
      const where = { personaID };
      if (leida !== undefined) {
        where.leida = leida === 'true';
      }

      const notificaciones = await NotificacionesUsuarios.findAll({
        where,
        include: [{
          model: Notificaciones,
          as: 'notificacion',
          attributes: ['id', 'tipo', 'titulo', 'mensaje', 'colorTema', 'icono', 'createdAt']
        }],
        order: [['createdAt', 'DESC']],
        limit: parseInt(limit),
        offset: parseInt(offset)
      });

      const total = await NotificacionesUsuarios.count({ where });
      const noLeidas = await NotificacionesUsuarios.count({ 
        where: { personaID, leida: false } 
      });

      res.json({
        notificaciones,
        total,
        noLeidas,
        limit: parseInt(limit),
        offset: parseInt(offset)
      });

    } catch (error) {
      console.error('Error al obtener notificaciones del usuario:', error);
      res.status(500).json({ message: 'Error al obtener notificaciones' });
    }
  },

  async marcarComoLeida(req, res) {
    try {
      const { id } = req.params;
      const personaID = req.user?.personaID;

      if (!personaID) {
        return res.status(400).json({ message: 'No se encontró la persona asociada al usuario' });
      }

      const notificacionUsuario = await NotificacionesUsuarios.findOne({
        where: {
          id: parseInt(id),
          personaID
        }
      });

      if (!notificacionUsuario) {
        return res.status(404).json({ message: 'Notificación no encontrada' });
      }

      await notificacionUsuario.update({
        leida: true,
        fechaLectura: new Date()
      });

      res.json({
        message: 'Notificación marcada como leída',
        notificacion: notificacionUsuario
      });

    } catch (error) {
      console.error('Error al marcar notificación como leída:', error);
      res.status(500).json({ message: 'Error al marcar notificación como leída' });
    }
  },

  async eliminar(req, res) {
    try {
      const { id } = req.params;

      const notificacion = await Notificaciones.findByPk(id);
      
      if (!notificacion) {
        return res.status(404).json({ message: 'Notificación no encontrada' });
      }

      await notificacion.destroy();

      res.json({ message: 'Notificación eliminada exitosamente' });

    } catch (error) {
      console.error('Error al eliminar notificación:', error);
      res.status(500).json({ message: 'Error al eliminar notificación' });
    }
  }
};

module.exports = notificacionesController;
