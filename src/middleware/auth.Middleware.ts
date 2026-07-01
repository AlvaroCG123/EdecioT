import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  usuarioId?: number;
  nivelAcesso?: number;
}

export const verificaToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ erro: 'Acesso negado. Cadê a chave (token)?' });
  }

  const token = authHeader.split(" ")[1]!

  try {
    const secret = process.env.JWT_SECRET || 'minha_chave_mestra_super_secreta'; 

    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
      id: number,
      nivel: number
    }


    req.usuarioId = decoded.id;
    req.nivelAcesso = decoded.nivel;


    return next();
  } catch (error) {
    return res.status(401).json({ erro: 'Token inválido ou expirado. Chave falsa!' });
  }
};