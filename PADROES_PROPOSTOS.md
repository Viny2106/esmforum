# Proposta de Aplicação de Padrões de Projeto — ESM Forum

Proposta de 3 padrões de projeto para aplicar nas funcionalidades do
sistema, conforme a Tarefa 4 da Parte 3 do Projeto Final da disciplina de
Engenharia de Software.

- **Aluno:** Vinicius da Costa Chaves
- **Padrões escolhidos:** Observer, Adapter e Decorator — um para cada uma
  das 3 histórias de usuário definidas em `HISTORIAS.md` (votação, acesso
  a dados/busca e tags, respectivamente).

---

## 1. Observer

### a) Justificativa e Contexto

**Funcionalidade:** Sistema de Votação em Perguntas (História 1).

**Problema que resolve:** hoje, quando um voto é registrado (via
`modelo.cadastrar_pergunta`/futura `modelo.registrar_voto`), só quem fez a
requisição HTTP fica sabendo do novo total de votos — a resposta volta só
para aquele cliente. Se o forum evoluir para ter múltiplos usuários vendo
a mesma lista de perguntas ao mesmo tempo (ex.: via WebSocket, ou um cache
de "perguntas mais votadas" que precisa ser invalidado), seria necessário
colocar código de notificação/invalidação espalhado dentro de
`modelo.js`, misturando a responsabilidade de "registrar o voto" com "quem
mais precisa saber disso".

**Por que o Observer é adequado:** o Observer desacopla o "sujeito" (a
pergunta que mudou) de quem precisa reagir à mudança (observadores). Novos
interessados em mudanças de votação podem ser adicionados (ou removidos)
sem alterar a lógica de votação em si — resolve diretamente o problema
de extensibilidade sem modificar código existente.

### b) Proposta de Solução

**Classes/módulos:**
- `Observador` (interface): define o método `atualizar(pergunta)`.
- `PerguntaObservavel`: mantém a lista de observadores registrados e
  dispara `notificarObservadores(pergunta)` sempre que um voto é
  registrado.
- `NotificadorWebSocket`: um observador concreto que envia a atualização
  para clientes conectados via WebSocket.
- `InvalidadorDeCache`: outro observador concreto, que limpa um cache de
  "perguntas mais votadas" sempre que os votos mudam.

**Como interagem:** `modelo.js`, ao registrar um voto, chama
`perguntaObservavel.notificarObservadores(pergunta)`. A
`PerguntaObservavel` percorre sua lista interna de observadores e chama
`atualizar(pergunta)` em cada um, sem saber (nem precisar saber) quantos
existem ou o que cada um faz com essa informação.

**Diagrama de classes:** `diagramas_propostos/padrao_observer.mmd` /
`padrao_observer.png`.

### c) Exemplo de Código (pseudo-código)

```js
class PerguntaObservavel {
  constructor() {
    this.observadores = [];
  }
  registrarObservador(obs) {
    this.observadores.push(obs);
  }
  removerObservador(obs) {
    this.observadores = this.observadores.filter(o => o !== obs);
  }
  notificarObservadores(pergunta) {
    this.observadores.forEach(obs => obs.atualizar(pergunta));
  }
}

class NotificadorWebSocket {
  atualizar(pergunta) {
    websocket.broadcast({ tipo: 'voto_atualizado', pergunta });
  }
}

class InvalidadorDeCache {
  atualizar(pergunta) {
    cache.remover('perguntas_mais_votadas');
  }
}

// configuração, uma vez na inicialização do servidor
const perguntaObservavel = new PerguntaObservavel();
perguntaObservavel.registrarObservador(new NotificadorWebSocket());
perguntaObservavel.registrarObservador(new InvalidadorDeCache());

// dentro de modelo.js, ao registrar um voto:
function registrar_voto(id_pergunta, tipo_voto) {
  // ... lógica de persistir o voto no banco ...
  const perguntaAtualizada = get_pergunta(id_pergunta);
  perguntaObservavel.notificarObservadores(perguntaAtualizada);
  return perguntaAtualizada;
}
```

---

## 2. Adapter

### a) Justificativa e Contexto

**Funcionalidade:** camada de acesso a dados, usada por todas as 3
histórias (votação, tags e busca dependem de `modelo.js`, que depende de
`bd_utils.js`).

**Problema que resolve:** esse é exatamente o ponto levantado como
violação de DIP em `ANALISE_SOLID.md` — `modelo.js` importa
`bd_utils.js` diretamente, e `bd_utils.js` está fortemente acoplado ao
`better-sqlite3`. Se o projeto precisar trocar de SQLite para outro banco
(ex.: PostgreSQL, para suportar múltiplos usuários simultâneos com mais
robustez), seria necessário reescrever `bd_utils.js` e reconferir todo o
`modelo.js`.

**Por que o Adapter é adequado:** o Adapter permite que `modelo.js`
converse com uma interface abstrata e estável (`query`, `queryAll`,
`exec`), enquanto cada banco de dados diferente tem seu próprio adaptador
que traduz essas chamadas para a API específica daquele banco. Trocar de
banco vira uma questão de trocar qual adaptador é injetado, não de
reescrever a lógica de negócio.

### b) Proposta de Solução

**Classes/módulos:**
- `RepositorioDados` (interface): define o contrato
  `query`/`queryAll`/`exec`.
- `SQLiteAdapter`: implementa `RepositorioDados` usando `better-sqlite3`
  (é, essencialmente, o `bd_utils.js` atual reorganizado atrás dessa
  interface).
- `PostgresAdapter`: implementação alternativa (proposta, não
  implementada), usando um driver de PostgreSQL, traduzindo os mesmos
  métodos para a API daquele driver.
- `Modelo`: passa a depender apenas de `RepositorioDados` (a abstração),
  recebendo a implementação concreta por injeção — resolvendo também a
  violação de DIP apontada anteriormente.

**Como interagem:** no início da aplicação, escolhe-se qual adaptador
instanciar (`SQLiteAdapter` ou `PostgresAdapter`) e ele é passado para
`modelo.js`. Todo o resto do código de `modelo.js` permanece idêntico,
porque só conhece a interface `RepositorioDados`.

**Diagrama de classes:** `diagramas_propostos/padrao_adapter.mmd` /
`padrao_adapter.png`.

### c) Exemplo de Código (pseudo-código)

```js
// SQLiteAdapter — adapta a API do better-sqlite3 para o contrato RepositorioDados
class SQLiteAdapter {
  constructor(caminhoArquivo) {
    this.bd = new Database(caminhoArquivo);
  }
  query(sql, params) {
    return this.bd.prepare(sql).get(params);
  }
  queryAll(sql, params) {
    return this.bd.prepare(sql).all(params);
  }
  exec(sql, params) {
    return this.bd.prepare(sql).run(params);
  }
}

// PostgresAdapter — mesma interface, implementação diferente por trás
class PostgresAdapter {
  constructor(pool) {
    this.pool = pool;
  }
  query(sql, params) {
    return this.pool.query(sql, params).rows[0];
  }
  queryAll(sql, params) {
    return this.pool.query(sql, params).rows;
  }
  exec(sql, params) {
    return this.pool.query(sql, params);
  }
}

// modelo.js passa a receber o repositório por injeção (DIP)
function criarModelo(repositorio) {
  return {
    listar_perguntas() {
      return repositorio.queryAll('select * from perguntas', []);
    },
    cadastrar_pergunta(texto) {
      return repositorio.exec(
        'INSERT INTO perguntas (texto, id_usuario) VALUES(?, ?)',
        [texto, 1]
      );
    }
  };
}

// na inicialização do servidor:
const repositorio = new SQLiteAdapter('./bd/esmforum.db');
const modelo = criarModelo(repositorio); // trocar para PostgresAdapter não muda mais nada aqui
```

---

## 3. Decorator

### a) Justificativa e Contexto

**Funcionalidade:** Categorização de Perguntas por Tags (História 2), e
possíveis variações futuras como "pergunta em destaque" (mais votada).

**Problema que resolve:** se tags, destaque, e futuras características
(ex.: "pergunta resolvida", "pergunta fixada") forem todas adicionadas
como campos fixos numa única classe/objeto `Pergunta`, essa classe cresce
sem parar e vira uma "classe inchada", violando o SRP e o OCP — toda nova
característica exige alterar a classe já existente.

**Por que o Decorator é adequado:** o Decorator permite compor
características adicionais em torno de uma pergunta "base", sem alterar a
classe original e sem precisar de uma explosão de subclasses (uma
`PerguntaComTagsEDestaque`, outra `PerguntaComTagsSemDestaque`, etc.).
Cada característica vira uma camada opcional que "embrulha" a pergunta.

### b) Proposta de Solução

**Classes/módulos:**
- `Pergunta` (interface): define `obterTexto()` e `obterMetadados()`.
- `PerguntaBase`: implementação concreta simples (texto + contagem de
  votos), o "núcleo" sem nenhuma característica extra.
- `PerguntaDecorator` (abstrata): implementa `Pergunta`, guarda uma
  referência à pergunta que está decorando, e por padrão delega as
  chamadas a ela.
- `PerguntaComTags`: decorator concreto que adiciona a lista de tags aos
  metadados.
- `PerguntaEmDestaque`: decorator concreto que marca a pergunta como
  destaque quando o número de votos ultrapassa um limite.

**Como interagem:** ao montar a resposta da API, o código parte de uma
`PerguntaBase` e vai envolvendo-a com os decorators necessários
(`PerguntaComTags` se houver tags cadastradas, `PerguntaEmDestaque` se a
pergunta tiver muitos votos), compondo o resultado final sem que nenhuma
dessas classes precise conhecer as outras.

**Diagrama de classes:** `diagramas_propostos/padrao_decorator.mmd` /
`padrao_decorator.png`.

### c) Exemplo de Código (pseudo-código)

```js
class PerguntaBase {
  constructor(texto, votos) {
    this.texto = texto;
    this.votos = votos;
  }
  obterTexto() { return this.texto; }
  obterMetadados() { return { votos: this.votos }; }
}

class PerguntaDecorator {
  constructor(perguntaDecorada) {
    this.perguntaDecorada = perguntaDecorada;
  }
  obterTexto() { return this.perguntaDecorada.obterTexto(); }
  obterMetadados() { return this.perguntaDecorada.obterMetadados(); }
}

class PerguntaComTags extends PerguntaDecorator {
  constructor(perguntaDecorada, tags) {
    super(perguntaDecorada);
    this.tags = tags;
  }
  obterMetadados() {
    return { ...super.obterMetadados(), tags: this.tags };
  }
}

class PerguntaEmDestaque extends PerguntaDecorator {
  obterMetadados() {
    return { ...super.obterMetadados(), destaque: true };
  }
}

// montagem, ao formatar a resposta da API
function montarPerguntaParaResposta(dadosPergunta) {
  let pergunta = new PerguntaBase(dadosPergunta.texto, dadosPergunta.votos);

  if (dadosPergunta.tags && dadosPergunta.tags.length > 0) {
    pergunta = new PerguntaComTags(pergunta, dadosPergunta.tags);
  }
  if (dadosPergunta.votos > 10) {
    pergunta = new PerguntaEmDestaque(pergunta);
  }

  return {
    texto: pergunta.obterTexto(),
    ...pergunta.obterMetadados()
  };
}
```

---

## Resumo

| Padrão | Funcionalidade | Problema resolvido |
|---|---|---|
| Observer | Votação (História 1) | Desacoplar "voto registrado" de "quem precisa reagir a isso" |
| Adapter | Acesso a dados (base das 3 histórias) | Resolve a violação de DIP entre `modelo.js` e `bd_utils.js` identificada em `ANALISE_SOLID.md` |
| Decorator | Tags (História 2) | Evita uma classe `Pergunta` inchada com toda característica opcional embutida |
