const nodemailer = require('nodemailer');
const config = require('../config/email.config');

// Crear transporter
const transporter = nodemailer.createTransport({
  host: config.host,
  port: config.port,
  secure: config.secure,
  auth: {
    user: config.user,
    pass: config.password
  }
});

// Enviar email de verificación
exports.sendVerificationEmail = async (email, code) => {
  try {
    const mailOptions = {
      from: `"Brisas de Mamporal" <${config.user}>`,
      to: email,
      subject: 'Verificación de Correo Electrónico',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4a5568;">Verificación de Correo Electrónico</h2>
          <p>Gracias por registrarte en el Sistema de Gestión Escolar Brisas de Mamporal.</p>
          <p>Tu código de verificación es: <strong style="font-size: 18px; color: #2b6cb0;">${code}</strong></p>
          <p>Este código expirará en 24 horas.</p>
          <p>Si no has solicitado este código, puedes ignorar este correo.</p>
          <p>Saludos,<br>Equipo de Brisas de Mamporal</p>
        </div>
      `
    };
    
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Error al enviar email de verificación:', error);
    throw error;
  }
};

// Enviar email de recuperación de contraseña
exports.sendPasswordResetEmail = async (email, code) => {
  try {
    const mailOptions = {
      from: `"Brisas de Mamporal" <${config.user}>`,
      to: email,
      subject: 'Recuperación de Contraseña',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4a5568;">Recuperación de Contraseña</h2>
          <p>Has solicitado restablecer tu contraseña en el Sistema de Gestión Escolar Brisas de Mamporal.</p>
          <p>Tu código de recuperación es: <strong style="font-size: 18px; color: #2b6cb0;">${code}</strong></p>
          <p>Este código expirará en 1 hora.</p>
          <p>Si no has solicitado este código, puedes ignorar este correo.</p>
          <p>Saludos,<br>Equipo de Brisas de Mamporal</p>
        </div>
      `
    };
    
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Error al enviar email de recuperación:', error);
    throw error;
  }
};
