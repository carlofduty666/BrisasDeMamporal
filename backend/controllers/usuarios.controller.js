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
        attributes: ['id', 'personaID', 'email', 'verificado', 'ultimoLogin', 'createdAt', 'updatedAt']
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
        attributes: ['id', 'personaID', 'email', 'verificado', 'ultimoLogin', 'createdAt', 'updatedAt']
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
        attributes: ['id', 'personaID', 'email', 'verificado', 'ultimoLogin', 'createdAt', 'updatedAt']
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
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2>Contraseña Restablecida</h2>
              <p>Tu contraseña ha sido restablecida por un administrador.</p>
              <p><strong>Nueva Contraseña Temporal:</strong> ${passwordNueva}</p>
              <p>Se recomienda que cambies esta contraseña después de tu próximo inicio de sesión.</p>
            </div>
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