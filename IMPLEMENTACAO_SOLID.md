# Implementação com SOLID — Busca de Perguntas por Palavra-chave

Documentação da Tarefa 2 da Parte 3 do Projeto Final da disciplina de
Engenharia de Software.

- **Aluno:** Vinicius da Costa Chaves
- **Funcionalidade implementada:** História 3 — Busca de Perguntas por
  Palavra-chave (`HISTORIAS.md`), escolhida por ser a de menor complexidade
  de schema entre as 3 funcionalidades priorizadas na Parte 1/2 (não exige
  criar tabelas novas), permitindo focar o esforço na aplicação correta dos
  princípios SOLID.

---

## O que foi implementado

Um novo endpoint HTTP, `GET /perguntas/busca?termo=<palavra>`, que retorna
as perguntas cujo texto contém o termo pesquisado, ignorando
maiúsculas/minúsculas — atendendo ao critério de aceitação principal da
História 3.

**Arquivos novos:**
- `busca/estrategias.js` — algoritmos de comparação de texto (estratégias
  de busca).
- `busca/buscador.js` — orquestrador que aplica uma estratégia de busca a
  uma lista de perguntas.
- `testes/busca.test.js` — 5 testes unitários cobrindo a funcionalidade.

**Arquivos alterados:**
- `modelo.js` — nova função `buscar_perguntas(termo)` e o mecanismo de
  injeção do buscador.
- `server.js` — nova rota `GET /perguntas/busca`.

---

## Como cada princípio SOLID foi aplicado

### 1. Single Responsibility Principle (SRP)

A funcionalidade de busca foi dividida em módulos com uma única
responsabilidade cada, em vez de colocar tudo dentro de `modelo.js`:

- **`busca/estrategias.js`** — responsabilidade única: saber *como* comparar
  um texto com um termo de busca (o algoritmo em si). Não sabe de onde
  vieram as perguntas, nem para onde vão os resultados.
- **`busca/buscador.js`** — responsabilidade única: coordenar a chamada da
  estratégia escolhida sobre uma lista de perguntas (inclusive o caso de
  termo vazio). Não sabe SQL, não sabe HTTP.
- **`modelo.js`** — continua com sua responsabilidade original (acesso a
  dados): busca a lista completa de perguntas no banco e delega a
  filtragem ao buscador.
- **`server.js`** — continua só traduzindo a query string `?termo=` em uma
  chamada de função e o resultado em JSON.

```js
// busca/estrategias.js — só sabe comparar texto
function buscaPorSubstring(perguntas, termo) {
  const termoNormalizado = termo.toLowerCase();
  return perguntas.filter(
    pergunta => pergunta.texto.toLowerCase().includes(termoNormalizado)
  );
}
```

```js
// modelo.js — só orquestra dados, delega a comparação
function buscar_perguntas(termo) {
  const perguntas = listar_perguntas();
  return buscador.buscar(perguntas, termo);
}
```

Cada um desses arquivos tem um único motivo para mudar: `estrategias.js`
muda se o algoritmo de comparação mudar; `buscador.js` muda se a forma de
coordenar as estratégias mudar; `modelo.js` muda se a forma de buscar os
dados brutos mudar.

---

### 2. Dependency Inversion Principle (DIP)

`modelo.js` não depende de uma implementação concreta e fixa do algoritmo
de busca. Em vez disso, ele depende de uma abstração: "algo com um método
`.buscar(perguntas, termo)`", que é injetado através de
`criarBuscador(estrategia)`:

```js
// busca/buscador.js
function criarBuscador(estrategia = buscaPorSubstring) {
  return {
    buscar(perguntas, termo) {
      if (!termo || termo.trim() === '') {
        return perguntas;
      }
      return estrategia(perguntas, termo);
    }
  };
}
```

```js
// modelo.js
var buscador = criarBuscador();       // implementação padrão injetada
function reconfig_buscador(novo_buscador) {
  buscador = novo_buscador;           // permite injetar outra implementação
}
```

Isso é o que permite ao teste `testes/busca.test.js` trocar a estratégia
de busca em tempo de execução (usando `buscaPorPrefixo` em vez da
substring padrão) sem alterar uma linha sequer de `modelo.js` ou
`buscador.js`:

```js
// testes/busca.test.js
modelo.reconfig_buscador(criarBuscador(buscaPorPrefixo));
const resultados = modelo.buscar_perguntas('Como');
```

Essa é exatamente a mesma ideia do `reconfig_bd` que já existia no
projeto (ver `ANALISE_SOLID.md`, ponto positivo 3) — só que agora aplicada
de forma mais explícita, com uma função de fábrica (`criarBuscador`) em
vez de uma importação direta.

---

### 3. Open/Closed Principle (OCP)

O sistema de busca está **aberto para extensão**: para adicionar uma nova
forma de buscar (por exemplo, busca por prefixo, que já está implementada
em `estrategias.js` como demonstração), basta escrever uma nova função que
receba `(perguntas, termo)` e devolva o array filtrado — sem precisar abrir
`buscador.js`, `modelo.js` ou `server.js` para editá-los:

```js
// busca/estrategias.js — nova estratégia, sem tocar em nenhum outro arquivo
function buscaPorPrefixo(perguntas, termo) {
  const termoNormalizado = termo.toLowerCase();
  return perguntas.filter(
    pergunta => pergunta.texto.toLowerCase().startsWith(termoNormalizado)
  );
}
```

O teste `'Estratégia de busca pode ser trocada sem alterar modelo.js nem
buscador.js (OCP)'` em `testes/busca.test.js` comprova isso na prática:
ele troca a estratégia usada e o restante do sistema continua funcionando
sem qualquer modificação.

Isso contrasta diretamente com a violação de OCP identificada em
`ANALISE_SOLID.md` (o `try/catch` duplicado em cada rota de `server.js`):
lá, estender o comportamento exige editar código existente; aqui, estender
o comportamento (uma nova forma de buscar) só exige adicionar código novo.

---

## Resultado dos testes

```
PASS testes/busca.test.js
PASS testes/listar_perguntas.test.js
PASS testes/modelo.test.js

Test Suites: 3 passed, 3 total
Tests:       8 passed, 8 total
```

Os 5 testes novos em `testes/busca.test.js` cobrem:
1. Busca ignora maiúsculas/minúsculas (critério de aceitação da História 3).
2. Termo vazio retorna todas as perguntas.
3. Termo sem correspondência retorna lista vazia.
4. Troca de estratégia de busca sem alterar `modelo.js`/`buscador.js` (OCP).
5. A estratégia de busca funciona isoladamente, sem depender do `modelo.js` (SRP).

---

## Como testar manualmente (com o servidor rodando)

```
GET http://localhost:5000/perguntas/busca?termo=capital
```

Retorna todas as perguntas cujo texto contém "capital" (ou "Capital",
"CAPITAL" etc.), no formato JSON já usado pelas outras rotas do projeto.

---

## Observação sobre escopo

A filtragem acontece em memória (JavaScript), depois de carregar todas as
perguntas via `listar_perguntas()`, em vez de usar `WHERE texto LIKE ?` no
SQL. Para o tamanho atual do projeto (fórum de estudo, poucas perguntas)
isso é adequado e deixa o padrão Strategy mais didático e fácil de
demonstrar. Em um cenário de produção com muitas perguntas, a próxima
evolução natural seria mover a filtragem para o banco de dados, mantendo a
mesma abstração de estratégia (agora recebendo uma query em vez de um
array em memória) — sem precisar alterar a camada HTTP.
