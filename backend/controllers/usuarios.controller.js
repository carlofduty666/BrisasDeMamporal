const db = require('../models');
const Usuario = db.Usuarios;
const Personas = db.Personas;
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');

// Configuración de nodemailer
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

const usuariosController = {
  // Obtener todos los usuarios con sus datos de persona
  getAllUsuarios: async (req, res) => {
    try {
      const usuarios = await Usuario.findAll({
        include: [{
          model: Personas,
          as: 'persona',
          attributes: ['id', 'nombre', 'apellido', 'cedula', 'email', 'telefono', 'tipo']
        }],
        attributes: ['id', 'personaID', 'email', 'verificado', 'estado', 'ultimoLogin', 'createdAt', 'updatedAt']
      });
      res.json(usuarios);
    } catch (err) {
      console.error('Error al obtener usuarios:', err);
      res.status(500).json({ message: err.message });
    }
  },

  // Obtener usuario por ID
  getUsuarioById: async (req, res) => {
    try {
      const usuario = await Usuario.findByPk(req.params.id, {
        include: [{
          model: Personas,
          as: 'persona',
          attributes: ['id', 'nombre', 'apellido', 'cedula', 'email', 'telefono', 'tipo']
        }],
        attributes: ['id', 'personaID', 'email', 'verificado', 'estado', 'ultimoLogin', 'createdAt', 'updatedAt']
      });
      
      if (usuario) {
        res.json(usuario);
      } else {
        res.status(404).json({ message: 'Usuario no encontrado' });
      }
    } catch (err) {
      console.error('Error al obtener usuario:', err);
      res.status(500).json({ message: err.message });
    }
  },

  // Obtener usuario por email
  getUsuarioByEmail: async (req, res) => {
    try {
      const { email } = req.params;
      const usuario = await Usuario.findOne({
        where: { email },
        include: [{
          model: Personas,
          as: 'persona',
          attributes: ['id', 'nombre', 'apellido', 'cedula', 'email', 'telefono', 'tipo']
        }],
        attributes: ['id', 'personaID', 'email', 'verificado', 'estado', 'ultimoLogin', 'createdAt', 'updatedAt']
      });
      
      if (usuario) {
        res.json(usuario);
      } else {
        res.status(404).json({ message: 'Usuario no encontrado' });
      }
    } catch (err) {
      console.error('Error al obtener usuario:', err);
      res.status(500).json({ message: err.message });
    }
  },

  // Actualizar usuario
  updateUsuario: async (req, res) => {
    try {
      const { id } = req.params;
      const { email, verificado } = req.body;
      
      const usuario = await Usuario.findByPk(id);
      if (!usuario) {
        return res.status(404).json({ message: 'Usuario no encontrado' });
      }
      
      // Verificar si el nuevo email ya existe (si es diferente)
      if (email && email !== usuario.email) {
        const existingUser = await Usuario.findOne({ where: { email } });
        if (existingUser) {
          return res.status(400).json({ message: 'El email ya está registrado' });
        }
      }
      
      const updateData = {};
      if (email) updateData.email = email;
      if (verificado !== undefined) updateData.verificado = verificado;
      
      await usuario.update(updateData);
      
      const usuarioActualizado = await Usuario.findByPk(id, {
        include: [{
          model: Personas,
          as: 'persona',
          attributes: ['id', 'nombre', 'apellido', 'cedula', 'email', 'telefono', 'tipo']
        }]
      });
      
      res.json(usuarioActualizado);
    } catch (err) {
      console.error('Error al actualizar usuario:', err);
      res.status(400).json({ message: err.message });
    }
  },

  // Cambiar contraseña del usuario
  cambiarPassword: async (req, res) => {
    try {
      const { id } = req.params;
      const { passwordActual, passwordNueva } = req.body;
      
      if (!passwordActual || !passwordNueva) {
        return res.status(400).json({ message: 'Se requieren ambas contraseñas' });
      }
      
      const usuario = await Usuario.findByPk(id);
      if (!usuario) {
        return res.status(404).json({ message: 'Usuario no encontrado' });
      }
      
      // Verificar contraseña actual
      const passwordMatch = await bcrypt.compare(passwordActual, usuario.password);
      if (!passwordMatch) {
        return res.status(401).json({ message: 'La contraseña actual es incorrecta' });
      }
      
      // Hash de la nueva contraseña
      const hashedPassword = await bcrypt.hash(passwordNueva, 10);
      
      await usuario.update({ password: hashedPassword });
      
      res.json({ message: 'Contraseña actualizada correctamente' });
    } catch (err) {
      console.error('Error al cambiar contraseña:', err);
      res.status(400).json({ message: err.message });
    }
  },

  // Restablecer contraseña (por admin)
  restablecerPassword: async (req, res) => {
    try {
      const { id } = req.params;
      const { passwordNueva } = req.body;
      
      if (!passwordNueva) {
        return res.status(400).json({ message: 'Se requiere la nueva contraseña' });
      }
      
      const usuario = await Usuario.findByPk(id);
      if (!usuario) {
        return res.status(404).json({ message: 'Usuario no encontrado' });
      }
      
      // Hash de la nueva contraseña
      const hashedPassword = await bcrypt.hash(passwordNueva, 10);
      
      await usuario.update({ password: hashedPassword });
      
      // Optionalmente, enviar email notificando el cambio
      const persona = await Personas.findByPk(usuario.personaID);
      if (persona && persona.email) {
        const mailOptions = {
          from: process.env.EMAIL_USER,
          to: persona.email,
          subject: 'Contraseña Restablecida - Brisas de Mamporal',
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <style>
                body {
                  margin: 0;
                  padding: 0;
                  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                  background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
                  min-height: 100vh;
                }
                .container {
                  max-width: 600px;
                  margin: 0 auto;
                  background: white;
                  border-radius: 16px;
                  overflow: hidden;
                  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
                }
                .header {
                  background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
                  padding: 40px 20px;
                  text-align: center;
                  position: relative;
                  overflow: hidden;
                }
                .header::before {
                  content: '';
                  position: absolute;
                  top: -50%;
                  right: -50%;
                  width: 200%;
                  height: 200%;
                  background: radial-gradient(circle, rgba(71, 85, 105, 0.3) 0%, transparent 70%);
                }
                .logo {
                  width: 80px;
                  height: 80px;
                  margin: 0 auto 15px;
                  background: rgba(255, 255, 255, 0.95);
                  border-radius: 12px;
                  padding: 8px;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
                  position: relative;
                  z-index: 1;
                }
                .logo img {
                  width: 100%;
                  height: 100%;
                  object-fit: contain;
                }
                .header h1 {
                  margin: 0;
                  color: white;
                  font-size: 28px;
                  font-weight: 700;
                  letter-spacing: 0.5px;
                  position: relative;
                  z-index: 1;
                }
                .header p {
                  margin: 8px 0 0 0;
                  color: rgba(226, 232, 240, 0.8);
                  font-size: 14px;
                  position: relative;
                  z-index: 1;
                }
                .content {
                  padding: 40px;
                  color: #1e293b;
                }
                .greeting {
                  font-size: 18px;
                  font-weight: 600;
                  color: #1e293b;
                  margin-bottom: 15px;
                  text-align: center;
                }
                .message {
                  font-size: 14px;
                  line-height: 1.6;
                  color: #475569;
                  margin-bottom: 30px;
                  text-align: center;
                }
                .password-section {
                  background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
                  padding: 30px;
                  border-radius: 12px;
                  text-align: center;
                  margin: 30px 0;
                  border-left: 4px solid #1e293b;
                }
                .password-label {
                  font-size: 12px;
                  font-weight: 700;
                  color: #64748b;
                  text-transform: uppercase;
                  letter-spacing: 1px;
                  margin-bottom: 12px;
                }
                .password-value {
                  font-size: 28px;
                  font-weight: 700;
                  color: #1e293b;
                  letter-spacing: 2px;
                  font-family: 'Courier New', monospace;
                  word-break: break-all;
                  padding: 15px;
                  background: rgba(255, 255, 255, 0.7);
                  border-radius: 8px;
                }
                .warning-box {
                  background: #f1f5f9;
                  border-left: 4px solid #1e293b;
                  padding: 20px;
                  border-radius: 8px;
                  margin: 20px 0;
                }
                .warning-title {
                  font-size: 13px;
                  font-weight: 700;
                  color: #475569;
                  margin-bottom: 10px;
                }
                .warning-text {
                  font-size: 13px;
                  line-height: 1.6;
                  color: #475569;
                  margin: 5px 0;
                }
                .footer-message {
                  font-size: 13px;
                  line-height: 1.6;
                  color: #64748b;
                  margin-top: 30px;
                  padding-top: 20px;
                  border-top: 1px solid #e2e8f0;
                  text-align: center;
                }
                .footer {
                  background: #f8fafc;
                  padding: 30px 40px;
                  text-align: center;
                  border-top: 1px solid #e2e8f0;
                }
                .footer p {
                  margin: 0;
                  font-size: 12px;
                  color: #94a3b8;
                  line-height: 1.6;
                }
                .footer a {
                  color: #1e293b;
                  text-decoration: none;
                  font-weight: 600;
                }
                .footer a:hover {
                  text-decoration: underline;
                }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <div class="logo">
                    <img src="cid:collegeLogo" alt="U.E.P. Brisas de Mamporal" />
                  </div>
                  <h1>Contraseña Restablecida</h1>
                  <p>Brisas En Línea - Sistema de Gestión Escolar</p>
                </div>
                
                <div class="content">
                  <div class="greeting">Tu Contraseña ha Sido Restablecida</div>
                  
                  <div class="message">
                    Tu contraseña en el Sistema de Gestión Escolar Brisas de Mamporal ha sido restablecida por un administrador. Se te ha asignado una nueva contraseña temporal que aparece a continuación.
                  </div>
                  
                  <div class="password-section">
                    <div class="password-label">Tu Nueva Contraseña Temporal</div>
                    <div class="password-value">${passwordNueva}</div>
                  </div>
                  
                  <div class="warning-box">
                    <div class="warning-title">⚠️ Importante - Lee Cuidadosamente:</div>
                    <div class="warning-text">
                      • <strong>Copia</strong> esta contraseña temporal de forma segura<br>
                      • <strong>Cambia tu contraseña</strong> inmediatamente después de tu próximo inicio de sesión<br>
                      • <strong>No</strong> compartas esta contraseña con nadie<br>
                      • Usa una contraseña fuerte y única cuando la cambies
                    </div>
                  </div>
                  
                  <div class="message">
                    Usa esta contraseña temporal para acceder a tu cuenta. Por razones de seguridad, se recomienda crear una nueva contraseña personal en tu próxima sesión.
                  </div>
                  
                  <div class="footer-message">
                    Si no esperabas este cambio o tienes dudas, contacta al administrador del sistema.
                  </div>
                </div>
                
                <div class="footer">
                  <p>© 2024 U.E.P. Brisas de Mamporal • Miranda, Venezuela</p>
                  <p><a href="https://brisasenmamporal.com">Visita Nuestro Sitio Web</a></p>
                </div>
              </div>
            </body>
            </html>
          `
        };
        
        await transporter.sendMail(mailOptions);
      }
      
      res.json({ message: 'Contraseña restablecida correctamente' });
    } catch (err) {
      console.error('Error al restablecer contraseña:', err);
      res.status(400).json({ message: err.message });
    }
  },

  // Verificar usuario
  verificarUsuario: async (req, res) => {
    try {
      const { id } = req.params;
      
      const usuario = await Usuario.findByPk(id);
      if (!usuario) {
        return res.status(404).json({ message: 'Usuario no encontrado' });
      }
      
      await usuario.update({ verificado: true, codigoVerificacion: null });
      
      res.json({ message: 'Usuario verificado correctamente' });
    } catch (err) {
      console.error('Error al verificar usuario:', err);
      res.status(400).json({ message: err.message });
    }
  },

  // Cambiar estado del usuario
  cambiarEstadoUsuario: async (req, res) => {
    try {
      const { id } = req.params;
      const { estado } = req.body;

      // Validar que el estado sea válido
      const estadosValidos = ['activo', 'suspendido', 'desactivado', 'inactivo'];
      if (!estadosValidos.includes(estado)) {
        return res.status(400).json({ 
          message: `Estado inválido. Debe ser uno de: ${estadosValidos.join(', ')}` 
        });
      }

      const usuario = await Usuario.findByPk(id);
      if (!usuario) {
        return res.status(404).json({ message: 'Usuario no encontrado' });
      }

      const estadoAnterior = usuario.estado;
      await usuario.update({ estado });

      // Obtener usuario actualizado con datos de persona
      const usuarioActualizado = await Usuario.findByPk(id, {
        include: [{
          model: Personas,
          as: 'persona',
          attributes: ['id', 'nombre', 'apellido', 'cedula', 'email', 'telefono', 'tipo']
        }],
        attributes: ['id', 'personaID', 'email', 'verificado', 'estado', 'ultimoLogin', 'createdAt', 'updatedAt']
      });

      res.json({ 
        message: `Estado del usuario cambió de ${estadoAnterior} a ${estado}`,
        usuario: usuarioActualizado 
      });
    } catch (err) {
      console.error('Error al cambiar estado del usuario:', err);
      res.status(500).json({ message: err.message });
    }
  },

  // Eliminar usuario
  deleteUsuario: async (req, res) => {
    const t = await db.sequelize.transaction();
    try {
      const { id } = req.params;
      
      const usuario = await Usuario.findByPk(id, { transaction: t });
      if (!usuario) {
        await t.rollback();
        return res.status(404).json({ message: 'Usuario no encontrado' });
      }
      
      // Eliminar el usuario y opcionalmente la persona asociada
      await usuario.destroy({ transaction: t });
      
      await t.commit();
      
      res.json({ message: 'Usuario eliminado correctamente' });
    } catch (err) {
      await t.rollback();
      console.error('Error al eliminar usuario:', err);
      res.status(500).json({ message: err.message });
    }
  }
};

module.exports = usuariosController;