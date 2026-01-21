const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../models');
const Persona = db.Personas;
const Usuario = db.Usuarios;
const Permiso = db.Permiso;
const Usuario_Permiso = db.Usuario_Permiso;
const nodemailer = require('nodemailer');

// Configuración de nodemailer
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// Función helper para obtener permisos de un usuario
const obtenerPermisosUsuario = async (usuarioID, tipo) => {
  try {
    let permisos = [];

    // Si es owner o adminWeb, tiene acceso a TODO
    if (tipo === 'owner' || tipo === 'adminWeb') {
      const todosPermisos = await Permiso.findAll({
        attributes: ['id', 'nombre', 'categoria']
      });
      permisos = todosPermisos.map(p => ({ id: p.id, nombre: p.nombre, categoria: p.categoria }));
    } else if (tipo === 'administrativo') {
      // Solo usuarios administrativo tienen permisos personalizados
      const usuarioPermisos = await Usuario_Permiso.findAll({
        where: { usuarioID },
        include: [{
          model: Permiso,
          as: 'permiso',
          attributes: ['id', 'nombre', 'categoria']
        }]
      });

      permisos = usuarioPermisos
        .map(up => up.permiso)
        .filter(p => p !== null)
        .map(p => ({ id: p.id, nombre: p.nombre, categoria: p.categoria }));
    }

    return permisos;
  } catch (error) {
    console.error('Error al obtener permisos:', error);
    return [];
  }
};

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
      attachments: [
        {
          filename: 'logo.png',
          path: '../frontend/public/img/1.colegioLogo.png',
          cid: 'collegeLogo'
        }
      ],
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
            .code-section {
              background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
              padding: 30px;
              border-radius: 12px;
              text-align: center;
              margin: 30px 0;
              border-left: 4px solid #1e293b;
            }
            .code-label {
              font-size: 12px;
              font-weight: 700;
              color: #64748b;
              text-transform: uppercase;
              letter-spacing: 1px;
              margin-bottom: 12px;
            }
            .code {
              font-size: 32px;
              font-weight: 700;
              color: #1e293b;
              letter-spacing: 4px;
              font-family: 'Courier New', monospace;
              word-spacing: 8px;
            }
            .expiry {
              font-size: 12px;
              color: #94a3b8;
              margin-top: 12px;
              font-weight: 500;
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
            .security-note {
              background: #f1f5f9;
              border-left: 4px solid #1e293b;
              padding: 15px;
              border-radius: 6px;
              margin-top: 20px;
              font-size: 12px;
              color: #475569;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">
                <img src="cid:collegeLogo" alt="U.E.P. Brisas de Mamporal" />
              </div>
              <h1>Brisas En Línea</h1>
              <p>Sistema de Gestión Escolar</p>
            </div>
            
            <div class="content">
              <div class="greeting">¡Bienvenido a Brisas En Línea!</div>
              
              <div class="message">
                Gracias por registrarte en el Sistema de Gestión Escolar de la U.E.P. Brisas de Mamporal. Para completar tu registro y activar tu cuenta, debes verificar tu correo electrónico.
              </div>
              
              <div class="code-section">
                <div class="code-label">Tu Código de Verificación</div>
                <div class="code">${verificationCode}</div>
                <div class="expiry">⏱️ Válido por 24 horas</div>
              </div>
              
              <div class="message">
                Ingresa este código en la plataforma para verificar tu correo electrónico y acceder al sistema.
              </div>
              
              <div class="security-note">
                🔒 <strong>Nota de Seguridad:</strong> No compartas este código con nadie. El equipo de Brisas de Mamporal nunca te pedirá este código por teléfono o mensaje.
              </div>
              
              <div class="footer-message">
                Si no creaste esta cuenta, por favor ignora este correo.
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

    // Verificar estado del usuario - DESACTIVADO no puede iniciar sesión
    if (usuario.estado === 'desactivado') {
      return res.status(403).json({ 
        message: 'Tu cuenta ha sido desactivada. Por favor contacta al administrador.' 
      });
    }
    
    // Verificar contraseña
    const isPasswordValid = await bcrypt.compare(password, usuario.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }
    
    // Actualizar último login
    await usuario.update({ ultimoLogin: new Date() });
    
    // Obtener permisos del usuario
    const permisos = await obtenerPermisosUsuario(usuario.id, persona.tipo);
    
    // Generar token con permisos y estado
    const token = jwt.sign(
      { 
        id: usuario.id, 
        personaID: persona.id, 
        tipo: persona.tipo,
        estado: usuario.estado,
        permisos: permisos
      },
      process.env.JWT_SECRET || 'secretkey',
      { expiresIn: '24h' }
    );
    
    res.status(200).json({
      token,
      user: {
        id: usuario.id,
        personaID: persona.id,
        nombre: persona.nombre,
        apellido: persona.apellido,
        cedula: persona.cedula,
        email: persona.email,
        tipo: persona.tipo,
        estado: usuario.estado,
        suspendidoWarning: usuario.estado === 'suspendido' ? 'Tu cuenta está suspendida. Contacta al administrador.' : null,
        permisos: permisos
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
            .code-section {
              background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
              padding: 30px;
              border-radius: 12px;
              text-align: center;
              margin: 30px 0;
              border-left: 4px solid #1e293b;
            }
            .code-label {
              font-size: 12px;
              font-weight: 700;
              color: #64748b;
              text-transform: uppercase;
              letter-spacing: 1px;
              margin-bottom: 12px;
            }
            .code {
              font-size: 32px;
              font-weight: 700;
              color: #1e293b;
              letter-spacing: 4px;
              font-family: 'Courier New', monospace;
              word-spacing: 8px;
            }
            .expiry {
              font-size: 12px;
              color: #94a3b8;
              margin-top: 12px;
              font-weight: 500;
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
            .security-note {
              background: #f1f5f9;
              border-left: 4px solid #1e293b;
              padding: 15px;
              border-radius: 6px;
              margin-top: 20px;
              font-size: 12px;
              color: #475569;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">
                <img src="cid:collegeLogo" alt="U.E.P. Brisas de Mamporal" />
              </div>
              <h1>Brisas En Línea</h1>
              <p>Sistema de Gestión Escolar</p>
            </div>
            
            <div class="content">
              <div class="greeting">Nuevo Código de Verificación</div>
              
              <div class="message">
                Has solicitado un nuevo código de verificación para acceder a tu cuenta en el Sistema de Gestión Escolar Brisas de Mamporal.
              </div>
              
              <div class="code-section">
                <div class="code-label">Tu Nuevo Código de Verificación</div>
                <div class="code">${verificationCode}</div>
                <div class="expiry">⏱️ Válido por 24 horas</div>
              </div>
              
              <div class="message">
                Usa este código para completar tu verificación y acceder al sistema.
              </div>
              
              <div class="security-note">
                🔒 <strong>Nota de Seguridad:</strong> No compartas este código con nadie. El equipo de Brisas de Mamporal nunca te pedirá este código por teléfono o mensaje.
              </div>
              
              <div class="footer-message">
                Si no solicitaste este código, por favor ignora este correo.
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
    const usuario = await Usuario.findOne({ 
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
              color: rgba(254, 226, 226, 0.9);
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
            .code-section {
              background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
              padding: 30px;
              border-radius: 12px;
              text-align: center;
              margin: 30px 0;
              border-left: 4px solid #1e293b;
            }
            .code-label {
              font-size: 12px;
              font-weight: 700;
              color: #64748b;
              text-transform: uppercase;
              letter-spacing: 1px;
              margin-bottom: 12px;
            }
            .code {
              font-size: 32px;
              font-weight: 700;
              color: #1e293b;
              letter-spacing: 4px;
              font-family: 'Courier New', monospace;
              word-spacing: 8px;
            }
            .expiry {
              font-size: 12px;
              color: #94a3b8;
              margin-top: 12px;
              font-weight: 500;
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
            .security-note {
              background: #f1f5f9;
              border-left: 4px solid #1e293b;
              padding: 15px;
              border-radius: 6px;
              margin-top: 20px;
              font-size: 12px;
              color: #475569;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">
                <img src="cid:collegeLogo" alt="U.E.P. Brisas de Mamporal" />
              </div>
              <h1>Recuperación de Contraseña</h1>
              <p>Brisas En Línea - Sistema de Gestión Escolar</p>
            </div>
            
            <div class="content">
              <div class="greeting">Solicitud de Recuperación Recibida</div>
              
              <div class="message">
                Has solicitado restablecer tu contraseña en el Sistema de Gestión Escolar Brisas de Mamporal. Para continuar con este proceso de recuperación, utiliza el código a continuación.
              </div>
              
              <div class="code-section">
                <div class="code-label">Tu Código de Recuperación</div>
                <div class="code">${resetCode}</div>
                <div class="expiry">⏱️ Válido únicamente por 1 hora</div>
              </div>
              
              <div class="message">
                Ingresa este código en la plataforma para verificar tu identidad y establecer una nueva contraseña. Este código tiene una validez limitada por razones de seguridad.
              </div>
              
              <div class="security-note">
                🔒 <strong>Nota de Seguridad Importante:</strong><br>
                • No compartas este código con nadie<br>
                • El equipo de Brisas de Mamporal nunca pedirá tu código<br>
                • Si no solicitaste este cambio, cambia tu contraseña inmediatamente
              </div>
              
              <div class="footer-message">
                Si no solicitaste esta recuperación, puedes ignorar este correo. Tu contraseña permanecerá sin cambios.
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
    const usuario = await Usuario.findOne({ 
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

// Helper para registrar usuario para personal existente (profesor, empleado administrativo, etc)
const registrarUsuarioPersonal = async (personaID, email, password, tipoPersona, transaction) => {
  try {
    // Verificar que la persona exista
    const persona = await db.Personas.findOne({
      where: {
        id: personaID,
        tipo: tipoPersona
      },
      transaction
    });
    
    if (!persona) {
      await transaction.rollback();
      return { error: true, status: 404, message: `${tipoPersona} no encontrado` };
    }
    
    // Verificar si ya tiene un usuario
    const usuarioExistente = await db.Usuarios.findOne({
      where: { personaID: persona.id },
      transaction
    });
    
    if (usuarioExistente) {
      await transaction.rollback();
      return { error: true, status: 400, message: 'Este usuario ya tiene una cuenta registrada' };
    }
    
    // Verificar si el email ya está en uso
    const emailExistente = await db.Usuarios.findOne({
      where: { email },
      transaction
    });
    
    if (emailExistente) {
      await transaction.rollback();
      return { error: true, status: 400, message: 'Este correo electrónico ya está en uso' };
    }
    
    // Generar hash de la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Generar código de verificación
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Crear usuario
    const nuevoUsuario = await db.Usuarios.create({
      personaID: persona.id,
      email,
      password: hashedPassword,
      codigoVerificacion: verificationCode,
      verificado: false
    }, { transaction });
    
    // Actualizar email en la tabla Personas si es necesario
    if (!persona.email) {
      await persona.update({ email }, { transaction });
    }
    
    // Enviar email de verificación
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Verificación de Correo - Brisas de Mamporal',
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
            .code-section {
              background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
              padding: 30px;
              border-radius: 12px;
              text-align: center;
              margin: 30px 0;
              border-left: 4px solid #1e293b;
            }
            .code-label {
              font-size: 12px;
              font-weight: 700;
              color: #64748b;
              text-transform: uppercase;
              letter-spacing: 1px;
              margin-bottom: 12px;
            }
            .code {
              font-size: 32px;
              font-weight: 700;
              color: #1e293b;
              letter-spacing: 4px;
              font-family: 'Courier New', monospace;
              word-spacing: 8px;
            }
            .expiry {
              font-size: 12px;
              color: #94a3b8;
              margin-top: 12px;
              font-weight: 500;
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
            .security-note {
              background: #f1f5f9;
              border-left: 4px solid #1e293b;
              padding: 15px;
              border-radius: 6px;
              margin-top: 20px;
              font-size: 12px;
              color: #475569;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">
                <img src="cid:collegeLogo" alt="U.E.P. Brisas de Mamporal" />
              </div>
              <h1>Brisas En Línea</h1>
              <p>Sistema de Gestión Escolar</p>
            </div>
            
            <div class="content">
              <div class="greeting">¡Bienvenido a Brisas En Línea!</div>
              
              <div class="message">
                Gracias por registrarte en el Sistema de Gestión Escolar de la U.E.P. Brisas de Mamporal. Para completar tu registro y activar tu cuenta, debes verificar tu correo electrónico.
              </div>
              
              <div class="code-section">
                <div class="code-label">Tu Código de Verificación</div>
                <div class="code">${verificationCode}</div>
                <div class="expiry">⏱️ Válido por 24 horas</div>
              </div>
              
              <div class="message">
                Ingresa este código en la plataforma para verificar tu correo electrónico y acceder al sistema.
              </div>
              
              <div class="security-note">
                🔒 <strong>Nota de Seguridad:</strong> No compartas este código con nadie. El equipo de Brisas de Mamporal nunca te pedirá este código por teléfono o mensaje.
              </div>
              
              <div class="footer-message">
                Si no creaste esta cuenta, por favor ignora este correo.
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
    
    return { error: false, success: true };
    
  } catch (error) {
    console.error('Error en registrar usuario personal:', error);
    await transaction.rollback();
    return { error: true, status: 500, message: 'Error al registrar usuario', errorDetails: error.message };
  }
};

// Registrar usuario para un profesor existente
exports.registerProfesor = async (req, res) => {
  const transaction = await db.sequelize.transaction();
  
  try {
    const { personaID, email, password } = req.body;
    
    // Validar datos
    if (!personaID || !email || !password) {
      await transaction.rollback();
      return res.status(400).json({ message: 'Todos los campos son requeridos' });
    }
    
    const result = await registrarUsuarioPersonal(personaID, email, password, 'profesor', transaction);
    
    if (result.error) {
      return res.status(result.status).json({ message: result.message, error: result.errorDetails });
    }
    
    await transaction.commit();
    
    return res.status(201).json({
      success: true,
      message: 'Usuario registrado correctamente. Por favor verifica tu correo electrónico.'
    });
    
  } catch (error) {
    await transaction.rollback();
    console.error('Error al registrar profesor:', error);
    return res.status(500).json({ message: 'Error al registrar profesor', error: error.message });
  }
};

// Registrar usuario para un empleado administrativo existente
exports.registerEmpleadoAdmin = async (req, res) => {
  const transaction = await db.sequelize.transaction();
  
  try {
    const { personaID, email, password } = req.body;
    
    // Validar datos
    if (!personaID || !email || !password) {
      await transaction.rollback();
      return res.status(400).json({ message: 'Todos los campos son requeridos' });
    }
    
    const result = await registrarUsuarioPersonal(personaID, email, password, 'administrativo', transaction);
    
    if (result.error) {
      return res.status(result.status).json({ message: result.message, error: result.errorDetails });
    }
    
    await transaction.commit();
    
    return res.status(201).json({
      success: true,
      message: 'Usuario registrado correctamente. Por favor verifica tu correo electrónico.'
    });
    
  } catch (error) {
    await transaction.rollback();
    console.error('Error al registrar empleado administrativo:', error);
    return res.status(500).json({ message: 'Error al registrar empleado administrativo', error: error.message });
  }
};

// Helper para verificar personal por cédula (profesor, empleado administrativo, etc)
const verificarPersonalPorCedula = async (cedula, tipoPersona) => {
  try {
    if (!cedula) {
      return { error: true, status: 400, message: 'La cédula es requerida' };
    }
    
    // Buscar persona con el tipo especificado y la cédula proporcionada
    const persona = await db.Personas.findOne({
      where: {
        cedula,
        tipo: tipoPersona
      }
    });
    
    if (!persona) {
      return { 
        error: false,
        existe: false,
        message: `No se encontró un ${tipoPersona} con esta cédula` 
      };
    }
    
    // Verificar si ya tiene un usuario asociado
    const usuarioExistente = await db.Usuarios.findOne({
      where: { personaID: persona.id }
    });
    
    if (usuarioExistente) {
      return { 
        existe: true,
        yaRegistrado: true,
        message: 'Este usuario ya tiene una cuenta registrada' 
      };
    }
    
    // Devolver información básica
    return {
      existe: true,
      yaRegistrado: false,
      persona: {
        id: persona.id,
        nombre: persona.nombre,
        apellido: persona.apellido,
        email: persona.email || ''
      }
    };
    
  } catch (error) {
    console.error('Error al verificar personal:', error);
    return { error: true, status: 500, message: 'Error al verificar personal' };
  }
};

// Verificar si existe un profesor por cédula
exports.verificarProfesor = async (req, res) => {
  try {
    const { cedula } = req.params;
    const result = await verificarPersonalPorCedula(cedula, 'profesor');
    
    if (result.error) {
      return res.status(result.status).json(result);
    }
    
    return res.status(200).json(result);
    
  } catch (error) {
    console.error('Error al verificar profesor:', error);
    return res.status(500).json({ message: 'Error al verificar profesor' });
  }
};

// Verificar si existe personal (profesor, empleado administrativo, etc) por cédula
exports.verificarPersonal = async (req, res) => {
  try {
    const { cedula, tipo } = req.params;
    
    if (!tipo) {
      return res.status(400).json({ message: 'El tipo de personal es requerido' });
    }
    
    const result = await verificarPersonalPorCedula(cedula, tipo);
    
    if (result.error) {
      return res.status(result.status).json(result);
    }
    
    return res.status(200).json(result);
    
  } catch (error) {
    console.error('Error al verificar personal:', error);
    return res.status(500).json({ message: 'Error al verificar personal' });
  }
};

// Verificar si existe un estudiante por cédula
exports.verificarEstudiante = async (req, res) => {
  try {
    const { cedula } = req.params;
    const result = await verificarPersonalPorCedula(cedula, 'estudiante');
    
    if (result.error) {
      return res.status(result.status).json(result);
    }
    
    return res.status(200).json(result);
    
  } catch (error) {
    console.error('Error al verificar estudiante:', error);
    return res.status(500).json({ message: 'Error al verificar estudiante' });
  }
};

// Registrar usuario para un estudiante existente
exports.registerEstudiante = async (req, res) => {
  const transaction = await db.sequelize.transaction();
  
  try {
    const { personaID, email, password } = req.body;
    
    // Validar datos
    if (!personaID || !email || !password) {
      await transaction.rollback();
      return res.status(400).json({ message: 'Todos los campos son requeridos' });
    }
    
    const result = await registrarUsuarioPersonal(personaID, email, password, 'estudiante', transaction);
    
    if (result.error) {
      return res.status(result.status).json({ message: result.message, error: result.errorDetails });
    }
    
    await transaction.commit();
    
    return res.status(201).json({
      success: true,
      message: 'Usuario registrado correctamente. Por favor verifica tu correo electrónico.'
    });
    
  } catch (error) {
    await transaction.rollback();
    console.error('Error al registrar estudiante:', error);
    return res.status(500).json({ message: 'Error al registrar estudiante', error: error.message });
  }
};
