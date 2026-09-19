# Processo de Desenvolvimento — ESM Forum

Documento de justificativa do processo ágil escolhido para o desenvolvimento
das 5 novas funcionalidades solicitadas pelo cliente, conforme a Tarefa 2 do
Projeto Final da disciplina de Engenharia de Software.

- **Aluno:** Vinicius Costa Chaves
- **Modalidade:** individual
- **Processo escolhido:** **Scrum**

---

## 1. Por que Scrum, e não Kanban

Scrum e Kanban são dois processos ágeis com características bem diferentes, e
a escolha entre eles depende do formato do trabalho a ser feito. Neste
projeto, três características do escopo pesaram a favor do Scrum:

### 1.1 Escopo fechado e conhecido de antemão

O cliente já entregou uma lista fechada de **5 funcionalidades** a serem
desenvolvidas. Não se trata de um fluxo contínuo de demandas chegando aos
poucos (o caso de uso clássico do Kanban), e sim de um **conjunto de trabalho
delimitado**, que pode ser planejado, estimado e dividido em blocos de tempo
fixos. Esse é justamente o cenário em que o Scrum, com sua lógica de
Sprints, funciona melhor: dá para planejar com antecedência o que será
entregue em cada ciclo.

### 1.2 Prazo com data final definida

O trabalho tem um prazo de entrega fechado (final da Semana 3). Scrum
organiza o trabalho em iterações de duração fixa, cada uma terminando com um
incremento entregável — o que cria checkpoints naturais dentro do prazo e
facilita perceber cedo se o ritmo está adequado. Em um projeto sem prazo
rígido, o fluxo contínuo do Kanban seria mais natural; aqui, ciclos com início
e fim ajudam a não deixar tudo para a última semana.

### 1.3 Necessidade de priorização explícita

As 5 funcionalidades têm complexidades diferentes (por exemplo, "busca por
palavra-chave" tende a ser mais simples que "sistema de notificação"). O
Scrum exige que o Product Backlog seja **ordenado por prioridade** antes do
início de cada Sprint, o que obriga a pensar, desde já, em que ordem entregar
valor ao cliente — decisão que o board por si só não tomaria por mim.

### 1.4 Sobre a adaptação para trabalho individual

O Scrum tradicional pressupõe uma equipe (Product Owner, Scrum Master, Dev
Team). Como o trabalho é feito individualmente, os três papéis foram
acumulados por mim:

| Papel Scrum | Quem assume | Responsabilidade adaptada |
|---|---|---|
| Product Owner | Eu (com base no enunciado do cliente) | Interpretar os requisitos do cliente e definir prioridades do Backlog |
| Scrum Master | Eu | Garantir que o processo seja seguido e remover impedimentos técnicos |
| Development Team | Eu | Implementar cada item do Backlog |

As cerimônias também foram simplificadas: em vez de reuniões diárias de
Daily Scrum, o acompanhamento é feito por atualização direta dos cards no
board a cada sessão de trabalho; a Sprint Review e a Retrospectiva são
registradas como anotações escritas ao final de cada Sprint, em vez de
reuniões faladas.

---

## 2. Estrutura das Sprints

O prazo total (até o final da Semana 3) foi dividido em **2 Sprints**:

| Sprint | Duração | Foco |
|---|---|---|
| Sprint 1 | Semana 2 | Funcionalidades de maior prioridade e menor complexidade |
| Sprint 2 | Semana 3 | Funcionalidades restantes + revisão final |

> Ajuste as datas conforme o calendário real da sua turma antes de entregar.

---

## 3. Estrutura do Board no GitHub Projects

O board segue o modelo de um **Sprint Board** estilo Scrum, com colunas que
representam o ciclo de vida de um item dentro de uma Sprint:

| Coluna | Significado |
|---|---|
| **Product Backlog** | Itens ainda não planejados para nenhuma Sprint |
| **Sprint Backlog** | Itens selecionados para a Sprint atual, prontos para começar |
| **Em Andamento** | Itens sendo implementados no momento |
| **Em Revisão** | Itens implementados, aguardando revisão de código/testes |
| **Concluído** | Itens finalizados e testados |

Essa estrutura difere de um board Kanban típico (que normalmente não separa
"Backlog" de "Sprint Backlog", pois no Kanban os itens entram no fluxo sob
demanda, não em blocos planejados por iteração).

---

## 4. Cards iniciais e priorização

Os 5 cards abaixo foram criados no Product Backlog e depois movidos para a
Sprint Backlog correspondente, na ordem de prioridade definida:

| Prioridade | Funcionalidade | Sprint | Justificativa da prioridade |
|---|---|---|---|
| 1 | Busca de perguntas por palavra-chave | Sprint 1 | Funcionalidade isolada, baixo acoplamento com o restante do sistema, alto valor imediato de usabilidade |
| 2 | Categorização de perguntas (tags) | Sprint 1 | Complementa a busca (buscar por tag) e é pré-requisito natural para ordenar/filtrar perguntas |
| 3 | Sistema de votação em perguntas (upvote/downvote) | Sprint 1 | Funcionalidade autocontida, mexe no modelo de dados mas não depende das demais |
| 4 | Perfil de usuário com histórico | Sprint 2 | Depende de perguntas e respostas já existirem com mais metadados (tags, votos) para fazer sentido no histórico |
| 5 | Notificação de novas respostas | Sprint 2 | Maior complexidade técnica (precisa de um mecanismo de aviso), e depende conceitualmente do perfil de usuário já existir |

> Ao criar os cards de verdade no GitHub Projects, adicione a cada um: uma
> descrição curta da funcionalidade, o rótulo da Sprint (`sprint-1` /
> `sprint-2`) e, se o board permitir, um campo de prioridade numérica igual
> à tabela acima.

---

## 5. Definição de Pronto (Definition of Done)

Um item só é movido para "Concluído" quando:

1. O código foi implementado e testado manualmente.
2. Testes automatizados (quando aplicável) foram escritos e passam.
3. O código foi commitado no repositório com uma mensagem descritiva.
4. A funcionalidade foi validada rodando o sistema localmente, ponta a ponta
   (backend + frontend).

---

## 6. Referências

- Documentação oficial do Scrum: [Scrum Guide](https://scrumguides.org/)
- Repositório do backend: <https://github.com/jeffsantos/esmforum>
- Repositório do frontend: <https://github.com/jeffsantos/esmforum-react>
