// controllers/UsuarioController.ts

import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../../lib/prisma.js';
import { registrarLog } from '../utils/logger.js';
import { transporter } from '../utils/email.js';

export class UsuarioController {

  async listar(req: Request, res: Response) {
    try {
      const usuarios = await prisma.usuario.findMany({
        select: {
          id: true,
          nome: true,
          email: true,
          nivelAcesso: true,
          ultimoLogin: true,
        }
      });
      return res.status(200).json(usuarios);
    } catch (error) {
      return res.status(500).json({ erro: 'Falha ao listar os pilotos.' });
    }
  }
  
  async registrar(req: Request, res: Response) {
    const { nome, email, senha, nivelAcesso } = req.body;

    const regexSenha = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    // Impedir inclusão com senha fraca [cite: 16]
    if (!regexSenha.test(senha)) {
      return res.status(400).json({ 
        erro: 'A senha é muito fraca! Precisa de 8 caracteres, maiúsculas, minúsculas, números e símbolos.' 
      });
    }

    try {
      // Criptografando a senha [cite: 13]
      const senhaHash = await bcrypt.hash(senha, 10);

      const novoUsuario = await prisma.usuario.create({
        data: {
          nome,
          email,
          senha: senhaHash,
          nivelAcesso: nivelAcesso || 1
        }
      });

      return res.status(201).json({ mensagem: 'Piloto cadastrado com sucesso!', id: novoUsuario.id });
      
    } catch (error: any) {
      // Impedir 2 usuários com o mesmo email [cite: 14]
      if (error.code === 'P2002') {
        return res.status(400).json({ erro: 'Este e-mail já está rodando na nossa base!' });
      }
      return res.status(500).json({ erro: 'Falha no motor interno.' });
    }
  }

  async login(req: Request, res: Response) {
    const { email, senha } = req.body;

    const usuario = await prisma.usuario.findUnique({ where: { email } });

    if (!usuario) {
      return res.status(401).json({ erro: 'Credenciais inválidas.' });
    }

    const senhaConfere = await bcrypt.compare(senha, usuario.senha);

    if (!senhaConfere) {
      // Log: Falha na senha
      await registrarLog(usuario.id, 'Tentativa de login falhou: Senha incorreta.');
      return res.status(401).json({ erro: 'Credenciais inválidas.' });
    }

    // Log: Login sucesso
    await registrarLog(usuario.id, 'Login realizado com sucesso.');

    // Registrar data/hora do último login 
    await prisma.usuario.update({
      where: { id: usuario.id },
      data: { ultimoLogin: new Date() }
    });

    const token = jwt.sign(
      { id: usuario.id, nivel: usuario.nivelAcesso },
      process.env.JWT_SECRET as string,
      { expiresIn: '1d' }
    );

    const mensagemUltimoAcesso = usuario.ultimoLogin 
      ? `Seu último acesso ao sistema foi ${usuario.ultimoLogin}`
      : "Este é o seu primeiro acesso ao sistema";

    return res.status(200).json({ 
      mensagem: `Bem-vindo, ${usuario.nome}! ${mensagemUltimoAcesso}`,
      token 
    });
  }

  async esqueciSenha(req: Request, res: Response) {
    const { email } = req.body;

    const usuario = await prisma.usuario.findUnique({ where: { email } });

    if (!usuario) {
      return res.status(404).json({ erro: 'Nenhum piloto encontrado com este e-mail.' });
    }

    const codigo = Math.floor(100000 + Math.random() * 900000).toString();

    await prisma.usuario.update({
      where: { id: usuario.id },
      data: { codigoRecuperacao: codigo }
    });

    try {
      await transporter.sendMail({
        from: '"Garagem do Edécio" <oficina@garagem.com>',
        to: email,
        subject: 'Socorro Mecânico - Recuperação de Senha',
        text: `Olá ${usuario.nome}! Seu código de ignição reserva é: ${codigo}. Use-o para cadastrar uma nova senha.`
      });

      await registrarLog(usuario.id, 'Solicitou código de recuperação de senha por e-mail.');

      return res.status(200).json({ mensagem: 'O guincho foi acionado! Código enviado para o seu e-mail.' });
    } catch (error) {
      return res.status(500).json({ erro: 'Falha na comunicação de rádio. E-mail não enviado.' });
    }
  }

  async resetarSenha(req: Request, res: Response) {
    const { email, codigo, novaSenha } = req.body;

    const usuario = await prisma.usuario.findUnique({ where: { email } });

    if (!usuario || usuario.codigoRecuperacao !== codigo) {
      return res.status(400).json({ erro: 'Código inválido ou e-mail incorreto.' });
    }

    const regexSenha = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!regexSenha.test(novaSenha)) {
      return res.status(400).json({ 
        erro: 'Nova senha fraca! Precisa de 8 caracteres, maiúsculas, minúsculas, números e símbolos.' 
      });
    }

    const senhaHash = await bcrypt.hash(novaSenha, 10);

    await prisma.usuario.update({
      where: { id: usuario.id },
      data: { 
        senha: senhaHash,
        codigoRecuperacao: null 
      }
    });

    await registrarLog(usuario.id, 'Redefiniu a senha com sucesso via código de recuperação.');

    return res.status(200).json({ mensagem: 'Chave trocada com sucesso! Pode dar a partida com a nova senha.' });
  }
}