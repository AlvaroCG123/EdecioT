

import nodemailer from 'nodemailer';

export const transporter = nodemailer.createTransport({
  host: 'smtp.ethereal.email',
  port: 587,
  auth: {
    user: 'seu_usuario_ethereal@ethereal.email',
    pass: 'sua_senha_ethereal'
  }
});