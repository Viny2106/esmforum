# Padrões de Projeto Existentes — ESM Forum

Análise do código atual do backend, identificando padrões de projeto já
presentes (mesmo que parcialmente), conforme a Tarefa 3 da Parte 3 do
Projeto Final da disciplina de Engenharia de Software.

- **Aluno:** Vinicius da Costa Chaves

---

## 1. Facade

**Onde está aplicado:** `modelo.js`, em relação a `bd/bd_utils.js`.

`bd_utils.js` expõe uma interface genérica e de baixo nível para o SQLite
(`query`, `queryAll`, `exec`, recebendo SQL cru e parâmetros). `modelo.js`
não expõe essa complexidade para o resto do sistema: ele oferece uma
interface simplificada e orientada ao domínio do fórum
(`listar_perguntas`, `cadastrar_pergunta`, `cadastrar_resposta`,
`get_pergunta`, `get_respostas`, `get_num_respostas`, `buscar_perguntas`),
escondendo os detalhes de SQL, dos nomes de colunas e de como as tabelas
se relacionam.

```js
// server.js nunca vê SQL — só conversa com a "fachada" modelo.js
app.get('/', (req, res) => {
  const perguntas = modelo.listar_perguntas();
  res.send(perguntas);
});

// modelo.js esconde a complexidade de bd_utils.js atrás de funções simples
function listar_perguntas() {
  const perguntas = bd.queryAll('select * from perguntas', []);
  perguntas.forEach(pergunta => pergunta['num_respostas'] = get_num_respostas(pergunta['id_pergunta']));
  return perguntas;
}
```

**Completude:** a implementação é boa e consistente — nenhuma rota de
`server.js` acessa `bd_utils.js` diretamente, todas passam por `modelo.js`.
Poderia ser "mais completa" no sentido de agrupar `modelo.js` em uma
classe ou objeto formal (hoje é um conjunto de funções soltas exportadas),
mas o papel de fachada já é cumprido corretamente.

---

## 2. Singleton (implícito, via cache de módulos do Node.js)

**Onde está aplicado:** `bd/bd_utils.js`.

```js
const Database = require('better-sqlite3');
var bd = new Database('./bd/esmforum.db');
```

Todo `require('./bd/bd_utils.js')` feito em qualquer parte do projeto
recebe o **mesmo** objeto `bd`, porque o Node.js cacheia módulos: a
conexão com o banco SQLite é criada uma única vez, na primeira vez que o
módulo é carregado, e reaproveitada por todos os módulos que o importam
(no caso, apenas `modelo.js`). Isso garante uma única instância de conexão
com o banco em toda a aplicação, que é exatamente o objetivo do padrão
Singleton — apenas obtido "de graça" pelo próprio sistema de módulos do
Node, em vez de implementado explicitamente com uma classe e um método
estático `getInstance()`.

**Completude:** é uma aplicação **parcial/implícita** do padrão. Funciona
bem para o caso de uso atual, mas não é uma implementação SOLID/OO clássica
de Singleton — não há um mecanismo explícito impedindo alguém de escrever
`new Database(...)` em outro arquivo e criar uma segunda conexão
acidental. Também não existe um método de acesso controlado (`getInstance`)
— o acesso é implícito, via `require`.

---

## 3. Strategy

**Onde está aplicado:** `busca/estrategias.js` + `busca/buscador.js`
(implementados na Tarefa 2 da Parte 3).

```js
// busca/estrategias.js — cada função implementa o mesmo "contrato"
function buscaPorSubstring(perguntas, termo) { /* ... */ }
function buscaPorPrefixo(perguntas, termo) { /* ... */ }

// busca/buscador.js — recebe a estratégia como parâmetro
function criarBuscador(estrategia = buscaPorSubstring) {
  return {
    buscar(perguntas, termo) { /* delega para "estrategia" */ }
  };
}
```

O algoritmo de comparação de texto (a "estratégia" de busca) é
intercambiável em tempo de execução sem alterar quem o consome
(`modelo.buscar_perguntas`) — a definição clássica do padrão Strategy.

**Completude:** implementação completa e explícita do padrão, já com um
teste (`testes/busca.test.js`) comprovando a troca de estratégia em tempo
de execução. É o único padrão do projeto aplicado de forma deliberada e
com essa intenção declarada — os outros dois (Facade e Singleton) surgiram
mais como consequência natural da organização do código do que como uma
decisão consciente de aplicar o padrão.

---

## 4. Factory Method (uso pontual)

**Onde está aplicado:** a função `criarBuscador()` em `busca/buscador.js`.

```js
function criarBuscador(estrategia = buscaPorSubstring) {
  return {
    buscar(perguntas, termo) { /* ... */ }
  };
}
```

Em vez de instanciar diretamente um objeto buscador (por exemplo, com
`new Buscador(...)`), o código usa uma função fábrica que encapsula a
criação do objeto e já aplica um valor padrão sensato para a estratégia.
Isso é uma aplicação simples do padrão Factory Method: centralizar a
lógica de "como construir esse objeto" em um único lugar.

**Completude:** aplicação mínima/pontual — cumpre a função de uma fábrica
simples, mas não é uma fábrica no sentido mais elaborado do padrão GoF
(não escolhe entre múltiplas classes concretas a instanciar com base em
algum critério; sempre monta o mesmo tipo de objeto). Ainda assim, é um
exemplo válido do princípio por trás do Factory Method: isolar a
construção de objetos do código que os utiliza.

---

## Resumo

| Padrão | Onde | Deliberado ou incidental? | Completude |
|---|---|---|---|
| Facade | `modelo.js` sobre `bd_utils.js` | Incidental (resultado da separação em camadas) | Boa, consistente |
| Singleton | `bd_utils.js` (conexão única via cache de módulo) | Incidental (efeito colateral do `require` do Node) | Parcial/implícita |
| Strategy | `busca/estrategias.js` + `busca/buscador.js` | Deliberado (Tarefa 2 da Parte 3) | Completa |
| Factory Method | `criarBuscador()` | Deliberado, mas de escopo pequeno | Mínima/pontual |
