const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../models');
const Persona = db.Personas;
const Usuario = db.Usuarios;
const nodemailer = require('nodemailer');

// Configuración de nodemailer
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// Registro de usuario
exports.register = async (req, res) => {
  const transaction = await db.sequelize.transaction();
  
  try {
    const { 
      nombre, 
      apellido, 
      cedula, 
      email, 
      telefono, 
      direccion, 
      password, 
      tipo = 'representante' 
    } = req.body;
    
    // Verificar si el email ya está registrado
    const existingUser = await Usuario.findOne({ 
      where: { email },
      transaction
    });
    
    if (existingUser) {
      await transaction.rollback();
      return res.status(400).json({ message: 'El correo electrónico ya está registrado' });
    }
    
    // Crear persona
    const persona = await Persona.create({
      nombre,
      apellido,
      cedula,
      email,
      telefono,
      direccion,
      tipo
    }, { transaction });
    
    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Generar código de verificación
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Crear usuario
    const usuario = await Usuario.create({
      personaID: persona.id,
      email,
      password: hashedPassword,
      codigoVerificacion: verificationCode
    }, { transaction });
    
    // Enviar email de verificación
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Verificación de Correo - Brisas de Mamporal',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Verificación de Correo Electrónico</h2>
          <p>Gracias por registrarte en el Sistema de Gestión Escolar Brisas de Mamporal.</p>
          <p>Tu código de verificación es: <strong>${verificationCode}</strong></p>
          <p>Este código expirará en 24 horas.</p>
        </div>
      `
    };
    
    await transporter.sendMail(mailOptions);
    await transaction.commit();
    
    res.status(201).json({
      success: true,
      message: 'Usuario registrado correctamente. Por favor verifica tu correo electrónico.'
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Error en registro:', error);
    res.status(500).json({ message: 'Error al registrar usuario', error: error.message });
  }
};

// Verificación de email
exports.verifyEmail = async (req, res) => {
  try {
    const { email, verificationCode } = req.body;
    
    const usuario = await Usuario.findOne({ where: { email } });
    
    if (!usuario) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    
    if (usuario.codigoVerificacion !== verificationCode) {
      return res.status(400).json({ message: 'Código de verificación inválido' });
    }
    
    // Actualizar estado de verificación
    await usuario.update({
      verificado: true,
      codigoVerificacion: null
    });
    
    res.status(200).json({
      success: true,
      message: 'Correo electrónico verificado correctamente. Ahora puedes iniciar sesión.'
    });
  } catch (error) {
    console.error('Error en verificación:', error);
    res.status(500).json({ message: 'Error al verificar correo', error: error.message });
  }
};

// Login
exports.login = async (req, res) => {
  try {
    const { email, cedula, password } = req.body;
    
    let usuario;
    let persona;
    
    // Buscar por email o cédula
    if (email) {
      usuario = await Usuario.findOne({ where: { email } });
      if (usuario) {
        persona = await Persona.findByPk(usuario.personaID);
      }
    } else if (cedula) {
      persona = await Persona.findOne({ where: { cedula } });
      if (persona) {
        usuario = await Usuario.findOne({ where: { personaID: persona.id } });
      }
    } else {
      return res.status(400).json({ message: 'Debe proporcionar email o cédula' });
    }
    
    if (!usuario || !persona) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }
    
    // Verificar si el email está verificado
    if (!usuario.verificado) {
      return res.status(401).json({ message: 'Por favor verifica tu correo electrónico antes de iniciar sesión' });
    }
    
    // Verificar contraseña
    const isPasswordValid = await bcrypt.compare(password, usuario.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }
    
    // Actualizar último login
    await usuario.update({ ultimoLogin: new Date() });
    
    // Generar token
    const token = jwt.sign(
      { id: usuario.id, personaID: persona.id, tipo: persona.tipo },
      process.env.JWT_SECRET || 'secretkey',
      { expiresIn: '24h' }
    );
    
    res.status(200).json({
      token,
      user: {
        id: persona.id,
        nombre: persona.nombre,
        apellido: persona.apellido,
        cedula: persona.cedula,
        email: persona.email,
        tipo: persona.tipo
      }
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ message: 'Error al iniciar sesión', error: error.message });
  }
};

// Reenviar código de verificación
exports.resendVerification = async (req, res) => {
  try {
    const { email } = req.body;
    
    const usuario = await Usuario.findOne({ where: { email } });
    
    if (!usuario) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    
    if (usuario.verificado) {
      return res.status(400).json({ message: 'Este correo ya está verificado' });
    }
    
    // Generar nuevo código de verificación
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    await usuario.update({ codigoVerificacion: verificationCode });
    
    // Enviar email con nuevo código
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Nuevo Código de Verificación - Brisas de Mamporal',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Nuevo Código de Verificación</h2>
          <p>Has solicitado un nuevo código de verificación para tu cuenta en el Sistema de Gestión Escolar Brisas de Mamporal.</p>
          <p>Tu nuevo código de verificación es: <strong>${verificationCode}</strong></p>
          <p>Este código expirará en 24 horas.</p>
        </div>
      `
    };
    
    await transporter.sendMail(mailOptions);
    
    res.status(200).json({
      success: true,
      message: 'Se ha enviado un nuevo código de verificación a tu correo electrónico'
    });
  } catch (error) {
    console.error('Error al reenviar código:', error);
    res.status(500).json({ message: 'Error al reenviar código de verificación', error: error.message });
  }
};

// Solicitar recuperación de contraseña
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    
    // Buscar el usuario por email
    const usuario = await db.Usuario.findOne({ 
      where: { email } 
    });
    
    if (!usuario) {
      // Por seguridad, no revelamos si el email existe o no
      return res.status(200).json({ 
        success: true, 
        message: 'Si el correo existe, recibirás un código de recuperación' 
      });
    }
    
    // Generar código de recuperación de 6 dígitos
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Establecer expiración (1 hora)
    const expiracion = new Date();
    expiracion.setHours(expiracion.getHours() + 1);
    
    // Actualizar usuario con el código y la expiración
    await usuario.update({
      codigoRecuperacion: resetCode,
      expiracionCodigoRecuperacion: expiracion
    });
    
    // Configurar nodemailer (asumiendo que ya tienes las variables de entorno configuradas)
    const transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE || 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });
    
    // Enviar email con el código
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Recuperación de Contraseña - Brisas de Mamporal',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Recuperación de Contraseña</h2>
          <p>Has solicitado restablecer tu contraseña en el Sistema de Gestión Escolar Brisas de Mamporal.</p>
          <p>Tu código de recuperación es: <strong>${resetCode}</strong></p>
          <p>Este código expirará en 1 hora.</p>
          <p>Si no solicitaste este cambio, puedes ignorar este correo.</p>
        </div>
      `
    };
    
    await transporter.sendMail(mailOptions);
    
    res.status(200).json({
      success: true,
      message: 'Si el correo existe, recibirás un código de recuperación'
    });
  } catch (error) {
    console.error('Error en recuperación de contraseña:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al procesar la solicitud' 
    });
  }
};

// Restablecer contraseña
exports.resetPassword = async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;
    
    // Validar datos
    if (!email || !code || !newPassword) {
      return res.status(400).json({ 
        success: false, 
        message: 'Todos los campos son requeridos' 
      });
    }
    
    // Buscar usuario
    const usuario = await db.Usuario.findOne({ 
      where: { email } 
    });
    
    if (!usuario) {
      return res.status(404).json({ 
        success: false, 
        message: 'Usuario no encontrado' 
      });
    }
    
    // Verificar código
    if (usuario.codigoRecuperacion !== code) {
      return res.status(400).json({ 
        success: false, 
        message: 'Código de recuperación inválido' 
      });
    }
    
    // Verificar expiración
    if (!usuario.expiracionCodigoRecuperacion || 
        new Date() > new Date(usuario.expiracionCodigoRecuperacion)) {
      return res.status(400).json({ 
        success: false, 
        message: 'El código de recuperación ha expirado' 
      });
    }
    
    // Hash de la nueva contraseña
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Actualizar contraseña y limpiar códigos
    await usuario.update({
      password: hashedPassword,
      codigoRecuperacion: null,
      expiracionCodigoRecuperacion: null
    });
    
    res.status(200).json({
      success: true,
      message: 'Contraseña actualizada correctamente'
    });
  } catch (error) {
    console.error('Error al restablecer contraseña:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al procesar la solicitud' 
    });
  }
};

