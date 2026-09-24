# Análise SOLID — ESM Forum

Análise do código atual do backend (`server.js`, `modelo.js` e `bd/bd_utils.js`),
conforme a Tarefa 1 da Parte 3 do Projeto Final da disciplina de Engenharia de
Software.

- **Aluno:** Vinicius da Costa Chaves

> **Nota sobre a estrutura do projeto:** o enunciado fala em pastas
> `routes/` e `models/`, mas o ESM Forum organiza o backend de forma mais
> simples e flat: `server.js` concentra as rotas HTTP, `modelo.js` concentra
> as regras de acesso a dados, e `bd/bd_utils.js` concentra o acesso bruto
> ao banco SQLite. A análise abaixo usa essa estrutura real do projeto.

---

## a) Pontos Positivos — Princípios Respeitados

### 1. Single Responsibility Principle (SRP) — separação em três camadas

O projeto já divide responsabilidades em três arquivos com papéis bem
distintos:

- `server.js`: só lida com HTTP (rotas, request/response, status codes).
- `modelo.js`: só lida com regras de acesso a dados (perguntas, respostas).
- `bd/bd_utils.js`: só lida com a execução bruta de SQL no SQLite.

```js
// server.js — só conhece HTTP, delega tudo pro modelo
app.get('/', (req, res) => {
  try {
    const perguntas = modelo.listar_perguntas();
    res.send(perguntas);
  }
  catch(erro) {
    res.status(500).json(erro.message);
  }
});

// modelo.js — só conhece regras de negócio/dados, não conhece Express
function listar_perguntas() {
  const perguntas = bd.queryAll('select * from perguntas', []);
  perguntas.forEach(pergunta => pergunta['num_respostas'] = get_num_respostas(pergunta['id_pergunta']));
  return perguntas;
}
```

**Por que respeita o SRP:** `server.js` nunca escreve uma query SQL, e
`modelo.js` nunca lida com `req`/`res` ou códigos de status HTTP. Cada
camada tem um único motivo para mudar: `server.js` muda se a API mudar,
`modelo.js` muda se as regras de negócio mudarem.

---

### 2. Single Responsibility Principle (SRP) — funções pequenas e coesas em `modelo.js`

Cada função de `modelo.js` faz exatamente uma coisa, sem misturar
responsabilidades:

```js
function cadastrar_pergunta(texto) {
  const params = [texto, 1];
  const result = bd.exec('INSERT INTO perguntas (texto, id_usuario) VALUES(?, ?) RETURNING id_pergunta', params);
  return result.lastInsertRowid;
}

function get_num_respostas(id_pergunta) {
  const resultado = bd.query('select count(*) from respostas where id_pergunta = ?', [id_pergunta]);
  return resultado['count(*)'];
}
```

**Por que respeita o SRP:** não existe uma função "faz-tudo" que cadastra
pergunta, conta respostas e formata resposta HTTP ao mesmo tempo. Isso
facilita testar e reaproveitar cada função isoladamente (como já é feito em
`testes/modelo.test.js`).

---

### 3. Dependency Inversion Principle (DIP) — parcialmente aplicado via `reconfig_bd`

`modelo.js` não trabalha diretamente com o SQLite; ele conversa com o
banco através da variável `bd`, que pode ser trocada em tempo de execução:

```js
var bd = require('./bd/bd_utils.js');

// usada pelo teste de unidade
// para que o modelo passe a usar uma versão "mockada" de bd
function reconfig_bd(mock_bd) {
  bd = mock_bd;
}
```

**Por que respeita o DIP (parcialmente):** ao expor `reconfig_bd`, o
`modelo.js` permite que os testes injetem uma implementação "mock" de banco
de dados no lugar da implementação real, em vez de ficar preso a uma única
implementação concreta. Isso é a essência do DIP: o módulo de alto nível
(`modelo.js`) não fica 100% amarrado a um detalhe de baixo nível (o SQLite
real). Chamo de "parcial" porque a dependência inicial (linha 1) ainda é
uma importação direta e concreta — ver Violação 1 abaixo, que detalha essa
limitação.

---

## b) Oportunidades de Melhoria — Princípios Violados

### 1. Dependency Inversion Principle (DIP) violado — dependência concreta por padrão

Apesar do mecanismo `reconfig_bd` (ponto positivo 3), a dependência
*padrão* de `modelo.js` ainda é uma importação direta do módulo concreto,
e esse módulo concreto por sua vez cria uma conexão real com um arquivo
específico do SQLite, já na primeira linha executada:

```js
// modelo.js
var bd = require('./bd/bd_utils.js');   // depende diretamente da implementação concreta

// bd/bd_utils.js
var bd = new Database('./bd/esmforum.db');  // caminho do arquivo "hardcoded"
```

**Por que viola o DIP:** o princípio diz que módulos de alto nível devem
depender de abstrações, não de implementações concretas. Aqui, `modelo.js`
(alto nível) depende diretamente de `bd_utils.js` (baixo nível, uma
implementação específica em SQLite via `better-sqlite3`). Não existe uma
interface/abstração formal entre eles — o `reconfig_bd` é um "remendo"
usado só nos testes, não uma inversão de dependência real usada em
produção. Se um dia o projeto precisar trocar de SQLite para PostgreSQL,
seria necessário reescrever `bd_utils.js` inteiro e reconferir se
`modelo.js` continua funcionando, em vez de simplesmente trocar qual
implementação concreta é injetada.

**Como poderia ser melhorado:** definir uma interface abstrata (ex.: um
"contrato" com os métodos `query`, `queryAll`, `exec`) e injetar a
implementação concreta de fora (via parâmetro de função, construtor de
classe, ou um container de dependências), em vez de `modelo.js` importar
`bd_utils.js` diretamente com `require`.

---

### 2. Open/Closed Principle (OCP) violado — tratamento de erro duplicado em cada rota

Todas as rotas de `server.js` repetem o mesmo bloco `try/catch` na
íntegra, sem nenhuma abstração compartilhada:

```js
app.get('/', (req, res) => {
  try {
    const perguntas = modelo.listar_perguntas();
    res.send(perguntas);
  }
  catch(erro) {
    res.status(500).json(erro.message);
  }
});

app.post('/perguntas', (req, res) => {
  try {
    const id_pergunta = modelo.cadastrar_pergunta(req.body.pergunta);
    res.json({id_pergunta: id_pergunta});
  }
  catch(erro) {
    res.status(500).json(erro.message);
  }
});
```

**Por que viola o OCP:** o princípio diz que o código deve estar aberto
para extensão, mas fechado para modificação. Aqui, qualquer mudança no
comportamento de tratamento de erro (por exemplo, adicionar um log
estruturado, diferenciar erro 400 de erro 500, ou formatar a resposta de
erro de um jeito novo) exige abrir e editar **todas** as rotas, uma por
uma, em vez de estender um único ponto central. O mesmo vale para adicionar
uma nova rota: é preciso copiar e colar o mesmo `try/catch` de novo.

**Como poderia ser melhorado:** extrair um middleware de erro do Express
(`app.use((err, req, res, next) => {...})`) ou uma função de ordem
superior (`function comTratamentoDeErro(handler) {...}`) que envolva os
handlers de rota. Assim, para mudar o tratamento de erro de todas as rotas
de uma vez, bastaria estender esse ponto único, sem tocar em cada rota
individualmente.
