# Caso de Uso — ESM Forum

Detalhamento em Caso de Uso da História 1 (`HISTORIAS.md`), conforme a
Tarefa 2 da Parte 2 do Projeto Final da disciplina de Engenharia de
Software.

- **Aluno:** Vinicius da Costa Chaves
- **História detalhada:** Sistema de Votação em Perguntas (escolhida por
  ser a mais rica em fluxos alternativos, especialmente o cenário em que o
  usuário já votou anteriormente e decide trocar seu voto).

---

## Caso de Uso: Votar em Pergunta

**Atores:** Usuário do fórum (não é necessário estar autenticado, já que o
ESM Forum atual não possui sistema de login/cadastro de usuários).

**Pré-condições:**
- O sistema está em execução (backend e frontend).
- A pergunta que receberá o voto já existe no banco de dados.
- A tela de listagem de perguntas (ou a tela de detalhe da pergunta) está
  carregada no navegador do usuário.

**Fluxo Principal:**
1. Sistema exibe a lista de perguntas, cada uma com seu contador de votos e
   os botões de upvote e downvote.
2. Usuário seleciona o botão de upvote em uma pergunta.
3. Sistema valida se o usuário já votou anteriormente nesta pergunta.
4. Sistema registra o voto no banco de dados, associado a essa pergunta.
5. Sistema recalcula o total de votos da pergunta.
6. Sistema (frontend) atualiza o contador de votos exibido, sem recarregar a
   página inteira.
7. Sistema exibe uma confirmação visual do voto (por exemplo, destacando o
   botão de upvote como selecionado).

**Fluxos Alternativos:**

**Fluxo Alternativo 1: Usuário seleciona downvote em vez de upvote**
2a. Usuário clica no botão de downvote em vez do de upvote.
2b. O fluxo segue normalmente a partir do passo 3, registrando um voto
    negativo em vez de positivo.

**Fluxo Alternativo 2: Usuário já votou anteriormente nesta pergunta**
3a. Sistema detecta, no passo 3, que já existe um voto anterior deste
    usuário para esta pergunta (por exemplo, um upvote registrado antes, e
    agora ele clica em downvote).
3b. Sistema remove o voto anterior antes de registrar o novo.
3c. Sistema registra o novo voto.
3d. Retorna ao passo 5 do fluxo principal, recalculando o total já com a
    troca refletida.

**Fluxo Alternativo 3: Falha de comunicação com o servidor**
4a. A requisição de voto falha ao tentar persistir no banco de dados (por
    exemplo, servidor backend fora do ar).
4b. Sistema exibe uma mensagem de erro ao usuário, informando que o voto não
    foi registrado.
4c. O contador de votos exibido permanece inalterado (sem incrementar de
    forma otimista antes da confirmação do servidor).

**Pós-condições:**
- O voto do usuário está persistido no banco de dados SQLite.
- O contador de votos exibido na interface reflete corretamente o total
  atualizado.
- Caso o usuário recarregue a página ou reinicie o servidor, o voto
  continua contabilizado (dado persistente, não apenas em memória).
