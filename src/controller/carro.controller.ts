// controllers/CarroController.ts

import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.Middleware.js';
import { prisma } from '../../lib/prisma.js';
import { registrarLog } from '../utils/logger.js';

export class CarroController {

  async criar(req: AuthRequest, res: Response) {
    const { modelo, marca, placa } = req.body;
    const donoId = req.usuarioId!;

    try {
      const carro = await prisma.carro.create({
        data: { modelo, marca, placa, donoId }
      });
      
      // Log: Novo carro na frota
      await registrarLog(donoId, `Adicionou o veículo placa ${placa} à frota.`);
      
      return res.status(201).json(carro);
    } catch (error) {
      return res.status(400).json({ erro: 'Placa já cadastrada ou erro de fabricação.' });
    }
  }

  async listar(req: AuthRequest, res: Response) {
    // Retorna apenas registros não deletados [cite: 35]
    const carros = await prisma.carro.findMany({
      where: { deleted: false }
    });
    return res.status(200).json(carros);
  }

  async deletar(req: AuthRequest, res: Response) {
    const carroId = Number(req.params.id);
    const nivel = req.nivelAcesso!; 
    const usuarioId = req.usuarioId!;

    // Testando os níveis [cite: 26]
    if (nivel < 3) {
      // Log: Tentativa de acesso não autorizada
      await registrarLog(usuarioId, `Tentou dar baixa no veículo ID ${carroId} sem permissão (Nível ${nivel}).`);
      return res.status(403).json({ 
        erro: 'Acesso negado! Só o Mecânico Chefe (Nível 3) pode dar baixa em veículos.' 
      });
    }

    try {
      await prisma.carro.update({
        where: { id: carroId },
        data: { 
          deleted: true,
          deletedAt: new Date()
        }
      });
      
      // Log: Soft Delete aplicado com sucesso
      await registrarLog(usuarioId, `Realizou o Soft Delete (baixa) no veículo ID ${carroId}.`);
      
      return res.status(200).json({ mensagem: 'Veículo baixado da frota (Soft Delete aplicado).' });
    } catch (error) {
      return res.status(404).json({ erro: 'Carro não encontrado no pátio.' });
    }
  }
}