# Análise de Design Simples — ESM Forum

Análise do código atual do backend (`server.js` e `modelo.js`) sob a ótica do
princípio de **Design Simples** e do **YAGNI** (*You Aren't Gonna Need It*),
conforme solicitado na Tarefa 3a do Projeto Final da disciplina de
Engenharia de Software.

- **Aluno:** Vinicius Costa Chaves
- **Nota sobre o enunciado:** o enunciado da tarefa menciona os arquivos
  `routes/perguntas.js` e `routes/respostas.js`. Essa estrutura de pastas
  **não existe** na versão atual do repositório (`jeffsantos/esmforum`, via
  fork `Viny2106/esmforum`). Nela, todas as rotas HTTP estão concentradas em
  um único arquivo, `server.js`, e o acesso ao banco SQLite está em
  `modelo.js`. Esta análise foi feita, portanto, sobre esses dois arquivos.

---

## 1. Aspectos que seguem Design Simples / YAGNI

### 1.1 Apenas duas camadas, sem abstrações desnecessárias

O sistema tem exatamente duas camadas: `server.js` (rotas HTTP / controle) e
`modelo.js` (acesso a dados). Não existe camada de "serviço" ou "repositório"
intermediária, nem um ORM completo — o acesso ao SQLite é direto. Para um
sistema do tamanho do ESM Forum (poucas entidades, poucas operações), isso é
exatamente o nível de complexidade necessário. Adicionar uma camada de
serviços ou um ORM completo agora seria complexidade especulativa: nenhuma
regra de negócio atual justifica esse investimento.

```javascript
const express = require('express')
const modelo = require('./modelo.js');
const app = express()
```

Duas dependências apenas (`express` e o módulo local `modelo.js`) para todo o
backend nenhuma biblioteca "para o caso de precisar depois".

### 1.2 Rotas HTTP mínimas, mapeadas 1 a 1 com as necessidades da interface

Existem exatamente 4 rotas:

```javascript
app.get('/', ...)              // lista perguntas
app.post('/perguntas', ...)    // cadastra pergunta
app.get('/respostas', ...)     // lista respostas de uma pergunta
app.post('/respostas', ...)    // cadastra resposta
```

Não há rotas "para o futuro" (como edição ou exclusão de perguntas, que não
foram pedidas pelo cliente na Parte 1). Isso é YAGNI bem aplicado: o sistema
implementa só o que a interface atual precisa, nada além disso.

### 1.3 Tratamento de erro consistente, sem generalização prematura

Todas as rotas seguem o mesmo padrão simples de tratamento de erro:

```javascript
try {
  // operação
}
catch(erro) {
  res.status(500).json(erro.message);
}
```

Não existe uma classe de erro customizada, nem um sistema de códigos de erro
próprios apenas a mensagem crua do erro é devolvida com status 500. Para um
sistema didático sem requisitos de tratamento de erro refinado, essa é a
solução mais simples que resolve o problema (comunicar ao cliente que algo
deu errado), sem construir uma infraestrutura de erros que ninguém pediu.

---

## 2. Oportunidades de simplificação (ou, neste caso, de melhoria sem violar YAGNI)

Vale registrar: por ser um sistema pequeno e didático, não há oportunidades
grandes de *simplificação* (o código já é simples). As oportunidades reais
aqui são pequenas violações do princípio **DRY** (Don't Repeat Yourself), que
é um princípio vizinho e complementar ao Design Simples  não se trata de
"fazer menos", mas de remover repetição sem adicionar complexidade nova.

### 2.1 O bloco try/catch se repete em todas as 4 rotas

O mesmo padrão de tratamento de erro aparece copiado e colado 4 vezes:

```javascript
app.get('/', (req, res) => {
  try {
    const perguntas = modelo.listar_perguntas();
    res.render('index', { perguntas: perguntas });
  }
  catch(erro) {
    res.status(500).json(erro.message);
  }
});
```

**Melhoria proposta:** mover esse tratamento para um *middleware* de erro do
Express, que centraliza a lógica em um único lugar:

```javascript
// as rotas passam a delegar o erro com next(erro)
app.get('/', (req, res, next) => {
  try {
    const perguntas = modelo.listar_perguntas();
    res.render('index', { perguntas: perguntas });
  }
  catch(erro) {
    next(erro);
  }
});

// um único middleware trata todos os erros
app.use((erro, req, res, next) => {
  res.status(500).json(erro.message);
});
```

Essa mudança remove a repetição sem adicionar nenhuma abstração nova ao
sistema  é o próprio mecanismo de middleware que o Express já oferece,
então continua alinhada ao YAGNI: nenhuma dependência ou camada nova é
introduzida.

### 2.2 A rota `/respostas` (GET) acessa o modelo antes do try/catch

```javascript
app.get('/respostas', (req, res) => {
  const id_pergunta = req.query.id_pergunta;
  const pergunta = modelo.get_pergunta(id_pergunta);
  const respostas = modelo.get_respostas(id_pergunta);
  try {
    res.render('respostas', { pergunta: pergunta, respostas: respostas });
  }
  catch(erro) {
    res.status(500).json(erro.message);
  }
});
```

Diferente das outras 3 rotas, aqui as chamadas a `modelo.get_pergunta()` e
`modelo.get_respostas()` ficam **fora** do bloco `try`. Se uma dessas duas
chamadas lançar um erro (por exemplo, um `id_pergunta` inválido), a exceção
não é capturada e o servidor devolve um erro genérico do Express em vez da
resposta JSON padronizada usada no resto do sistema.

**Melhoria proposta:** mover essas duas linhas para dentro do bloco `try`,
igualando o comportamento desta rota ao das demais — de novo, sem introduzir
nada novo, só corrigindo uma inconsistência pontual.

---

## 3. Conclusão

O código do ESM Forum é um exemplo razoavelmente fiel de Design Simples: duas
camadas, sem abstrações antecipadas, sem código para requisitos que não
existem. As duas oportunidades de melhoria identificadas são ajustes pequenos
de consistência (DRY e tratamento de erro), não sinais de over-engineering —
o que reforça que o sistema está no nível de complexidade adequado ao seu
propósito didático.
