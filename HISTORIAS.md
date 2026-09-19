# Histórias de Usuário — ESM Forum

Histórias de usuário para 3 das 5 funcionalidades solicitadas pelo cliente na
Parte 1, conforme a Tarefa 1 da Parte 2 do Projeto Final da disciplina de
Engenharia de Software.

- **Aluno:** Vinicius 
- **Funcionalidades escolhidas:** as mesmas 3 já priorizadas na Sprint 1 do
  `PROCESSO.md`  Sistema de votação, Categorização de perguntas e Busca por
  palavra-chave mantendo consistência entre o planejamento da Parte 1 e o
  detalhamento feito aqui.

---

## História 1: Sistema de Votação em Perguntas

**Como** usuário do fórum,
**Eu quero** votar em perguntas (upvote/downvote),
**Para** destacar perguntas úteis e relevantes para a comunidade.

**Critérios de Aceitação:**
- [ ] Cada pergunta deve exibir botões de upvote e downvote na listagem e na
      tela de detalhe.
- [ ] O contador de votos deve ser atualizado imediatamente após o clique,
      sem precisar recarregar a página.
- [ ] Usuários podem mudar seu voto (de upvote para downvote e vice-versa).
- [ ] Usuários não podem votar múltiplas vezes na mesma pergunta com o mesmo
      voto (cliques repetidos no mesmo botão não incrementam o contador
      indefinidamente).
- [ ] O contador de votos nunca fica negativo além do que reflete
      downvotes reais (não pode haver inconsistência entre votos registrados
      e o número exibido).

---

## História 2: Categorização de Perguntas por Tags

**Como** usuário do fórum,
**Eu quero** classificar minha pergunta com uma ou mais tags (ex:
tecnologia, carreira, dúvidas-gerais) ao cadastrá-la,
**Para** que outros usuários encontrem perguntas do assunto que procuram
mais facilmente.

**Critérios de Aceitação:**
- [ ] Ao cadastrar uma nova pergunta, o usuário pode selecionar pelo menos
      uma tag de uma lista pré-definida.
- [ ] Cada pergunta exibe suas tags na listagem principal e na tela de
      detalhe.
- [ ] O usuário pode filtrar a listagem de perguntas por tag.
- [ ] Uma pergunta pode ter mais de uma tag associada.
- [ ] Se nenhuma tag for selecionada, a pergunta recebe automaticamente a
      tag padrão "dúvidas-gerais".

---

## História 3: Busca de Perguntas por Palavra-chave

**Como** usuário do fórum,
**Eu quero** buscar perguntas digitando uma palavra-chave,
**Para** encontrar rapidamente se minha dúvida já foi respondida antes, sem
precisar rolar a lista inteira de perguntas.

**Critérios de Aceitação:**
- [ ] Existe um campo de busca visível na tela principal do fórum.
- [ ] A busca retorna perguntas cujo texto contenha a palavra-chave
      digitada, ignorando maiúsculas/minúsculas.
- [ ] Os resultados são atualizados sem a necessidade de recarregar a
      página inteira.
- [ ] Quando nenhuma pergunta corresponde à busca, o sistema exibe uma
      mensagem clara de "nenhum resultado encontrado", em vez de uma lista
      vazia sem explicação.

---

## Priorização

| Ordem | História | Justificativa |
|---|---|---|
| 1 | Busca de perguntas por palavra-chave | Funcionalidade isolada, sem dependência de nenhuma das outras, com alto valor de usabilidade imediato: qualquer usuário se beneficia dela desde o primeiro dia. |
| 2 | Categorização de perguntas por tags | Complementa diretamente a busca (filtrar por tag é uma forma alternativa de busca) e organiza a base de perguntas para as funcionalidades futuras (perfil de usuário, notificações). |
| 3 | Sistema de votação em perguntas | Agrega valor à comunidade a médio prazo (destacar conteúdo relevante), mas depende de já existir um volume razoável de perguntas cadastradas e categorizadas para fazer sentido na prática. |

Essa ordem é a mesma definida no `PROCESSO.md` para a Sprint 1, mantendo
coerência entre o planejamento ágil da Parte 1 e o detalhamento das
histórias aqui.
