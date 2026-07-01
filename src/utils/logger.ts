import { prisma } from "../../lib/prisma.js";

export const registrarLog = async (usuarioId: number, acao: string) => {
  try {
    await prisma.log.create({
      data: {
        acao,
        usuarioId,
      }
    });
  } catch (error) {
    console.error('Falha ao gravar na caixa preta:', error);
  }
};