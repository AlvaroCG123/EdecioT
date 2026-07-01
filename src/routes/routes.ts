// routes.ts

import { Router } from 'express';
import { verificaToken } from '../middleware/auth.Middleware.js';
import { CarroController } from '../controller/carro.controller.js';
import { UsuarioController } from '../controller/usuario.controller.js';

const router = Router();
const carroController = new CarroController();
const usuarioController = new UsuarioController();

// === ROTAS PÚBLICAS (A vitrine, qualquer um vê) ===
router.post('/usuarios', usuarioController.registrar);
router.post('/login', usuarioController.login);
router.post('/esqueci-senha', usuarioController.esqueciSenha);
router.post('/resetar-senha', usuarioController.resetarSenha);

// === ROTAS PROTEGIDAS (O pedágio "verificaToken" está ativado) ===
router.post('/carros', verificaToken, carroController.criar);
router.get('/carros', verificaToken, carroController.listar);
router.delete('/carros/:id', verificaToken, carroController.deletar);

export default router;