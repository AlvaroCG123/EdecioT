🏎️ API Garagem - Sistema de Gerenciamento de Frota e Segurança

Como testar as rotas (O Manual do Piloto)Para testar as requisições (no Postman ou Insomnia), siga a ordem abaixo para ligar o sistema corretamente.1. Cadastrar um Novo Piloto (Usuário)Cria um novo usuário no sistema. A senha passa por uma vistoria rigorosa e precisa ter letras maiúsculas, minúsculas, números, símbolos e no mínimo 8 caracteres. O sistema também barra o cadastro de e-mails duplicados.  Rota: POST /usuariosAcesso: Público (Não precisa de token)Corpo da Requisição (JSON):

JSON
{
  "nome": "Brian O'Conner",
  "email": "brian@skyline.com",
  "senha": "SenhaForte@123",
  "nivelAcesso": 3
}

Dica de Teste: Tente enviar uma senha fraca (ex: "123456") ou cadastrar o mesmo e-mail duas vezes para ver as travas de segurança em ação! O nivelAcesso: 3 define este usuário como Mecânico Chefe/Admin.

Ligar o Motor (Login)Valida as credenciais, gera o Token JWT e atualiza a data do último acesso no painel do usuário.  Rota: POST /loginAcesso: Público (Não precisa de token)Corpo da Requisição (JSON):

JSON
{
  "email": "brian@skyline.com",
  "senha": "SenhaForte@123"
}
Resposta de Sucesso:

JSON
{
  "mensagem": "Bem-vindo, Brian O'Conner! Seu último acesso ao sistema foi 2026-07-01T21:45:17.000Z",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}

ATENÇÃO: Copie o valor do "token" gerado nessa resposta. Você vai precisar dele para acessar as próximas rotas! No Postman/Insomnia, vá na aba Auth, selecione Bearer Token e cole essa chave lá.

Comprar um Veículo (Cadastrar Carro)Adiciona um veículo à frota. Esta rota exige que você esteja com a "chave" (Token) no contato.Rota: POST /carrosAcesso: Protegido (Exige Token JWT no Header)   Corpo da Requisição (JSON):

JSON
{
  "modelo": "Skyline GT-R R34",
  "marca": "Nissan",
  "placa": "O-CONNER"
}

Vistoriar a Frota (Listar Carros)Lista todos os carros do pátio. Graças ao recurso de segurança implementado, esta listagem ignora automaticamente os veículos que foram enviados para o ferro-velho (Soft Delete).  Rota: GET /carrosAcesso: Protegido (Exige Token JWT no Header)   Corpo da Requisição: (Não precisa enviar JSON)

Mandar para o Ferro-Velho (Deletar Carro)Remove o carro do pátio de forma lógica (Soft Delete - o registro não é apagado fisicamente do banco, apenas o campo deleted vira true).  Regra de Segurança: Apenas usuários com nivelAcesso: 3 conseguem realizar essa operação.  Rota: DELETE /carros/1 (Troque o "1" pelo ID numérico do carro)Acesso: Protegido e Restrito (Exige Token JWT de um Piloto Nível 3)   Corpo da Requisição: (Não precisa enviar JSON)

A Caixa Preta (Logs de Telemetria)Por debaixo do capô, a API possui uma rotina de monitoramento. As seguintes ações são gravadas silenciosamente na tabela de Logs do banco de dados, para auditoria de segurança:  Acesso Negado: Tentativas de login com senha incorreta.Ignição: Logins realizados com sucesso.Compra de Veículo: Registro de quando um novo carro é inserido no sistema.Violação de Acesso: Tentativas de deletar um carro feitas por usuários Nível 1.Baixa de Veículo: Confirmação de que um carro sofreu Soft Delete.