# Planejamento de Pair Programming — ESM Forum

Documento de planejamento da prática de Extreme Programming (XP) de **Pair
Programming**, adaptada para o contexto de trabalho individual, conforme a
Tarefa 3b do Projeto Final da disciplina de Engenharia de Software.

- **Aluno:** Vinicius Costa Chaves
- **Modalidade:** individual 

---

## 1. Adaptação da prática para trabalho individual

Como o projeto é desenvolvido sozinho, não há um segundo desenvolvedor para
ocupar o papel de par. Este documento descreve, portanto, **como a prática
de Pair Programming seria aplicada caso eu tivesse um par**, e também como
alguns dos seus benefícios centrais são simulados no trabalho individual.

O Pair Programming tradicional divide o trabalho entre dois papéis:

- **Driver**: a pessoa que está efetivamente digitando o código, focada nos
  detalhes de sintaxe e implementação imediata da tarefa corrente.
- **Navigator**: a pessoa que observa o código sendo escrito, pensa um passo
  à frente, aponta erros, sugere alternativas de design e mantém a visão do
  problema como um todo.

---

## 2. Como a dupla trabalharia nas funcionalidades do ESM Forum

### 2.1 Ferramentas que seriam utilizadas

| Ferramenta | Uso |
|---|---|
| **VS Code Live Share** | Compartilhamento de tela e edição simultânea do mesmo arquivo em tempo real, permitindo que o Navigator veja exatamente o cursor e as edições do Driver. |
| **Discord** (chamada de voz + compartilhamento de tela) | Canal de comunicação contínuo durante a sessão, para o Navigator comentar em voz alta sem precisar digitar. |
| **GitHub (branch + Pull Request)** | Ao final de cada sessão de pair, o código é commitado em uma branch e revisado via Pull Request antes de ir para `main` — uma forma adicional de revisão, complementar ao pair em si. |

### 2.2 Rotação de papéis

Para evitar que uma pessoa fique presa ao papel de Driver (ou de Navigator)
a sessão inteira, a rotação seguiria uma regra simples baseada em tempo:

- **Blocos de 25 minutos** (inspirado na técnica Pomodoro): ao fim de cada
  bloco, Driver e Navigator trocam de papel.
- A troca acontece em um ponto de parada natural do código (ex: depois de um
  teste passando, não no meio de uma função incompleta), para não perder o
  contexto do que estava sendo feito.

### 2.3 Como cada funcionalidade seria dividida entre a dupla

Tomando como exemplo a implementação do **Sistema de votação em perguntas**
(uma das 5 funcionalidades da Parte 1):

1. **Sessão 1 — Modelagem (Navigator define, Driver implementa):**
   o par discute juntos a alteração no schema do banco (nova tabela ou
   coluna de votos) antes de qualquer código ser escrito. O Navigator guia a
   decisão de design; o Driver traduz em SQL/código.
2. **Sessão 2 — Rota da API:** o Driver implementa a nova rota
   (`POST /perguntas/:id/voto`) seguindo o padrão já existente no
   `server.js`; o Navigator confere se o tratamento de erro está consistente
   com as demais rotas (ver `DESIGN_SIMPLES.md`).
3. **Troca de papéis:** na metade da Sessão 2, os dois trocam — quem estava
   navegando passa a digitar o teste automatizado da nova rota, enquanto o
   outro observa e sugere casos de teste que talvez tenham sido esquecidos
   (ex: votar duas vezes na mesma pergunta).

---

## 3. Benefícios esperados, mesmo trabalhando sozinho

Mesmo sem um par de verdade, alguns hábitos do Pair Programming foram
mantidos durante o desenvolvimento individual deste projeto, como forma de
simular parcialmente seus benefícios:

- **Revisão antes de commitar**: antes de cada commit, o código é relido
  como se estivesse "explicando para um par" o que foi feito — a mesma
  lógica por trás da técnica do "pato de borracha" (rubber duck debugging).
- **Documentação do raciocínio**: decisões que normalmente seriam discutidas
  em voz alta com um Navigator foram registradas por escrito (como em
  `INSTALACAO.md` e `DESIGN_SIMPLES.md`), garantindo que o raciocínio por
  trás de cada escolha fique explícito, e não só na cabeça de quem
  programou.
- **Testes como "segundo par de olhos"**: na ausência de um Navigator
  humano, os testes automatizados (`npm test`) cumprem parcialmente o papel
  de apontar erros que passariam despercebidos numa revisão apressada.

---

## 4. Limitações desta adaptação

É importante reconhecer que essas práticas substitutas **não reproduzem**
todos os benefícios do Pair Programming real, em especial:

- A troca de ideias em tempo real, que frequentemente gera soluções que
  nenhuma das duas pessoas teria sozinha.
- A correção imediata de pequenos erros de digitação ou lógica, que um
  Navigator pega no mesmo instante em que acontecem.
- O compartilhamento de conhecimento entre os membros da dupla, que não
  existe quando há apenas uma pessoa no projeto.
