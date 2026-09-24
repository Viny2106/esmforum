// Estratégias de busca (padrão Strategy).
//
// Cada estratégia implementa o mesmo "contrato": uma função
// buscar(perguntas, termo) que recebe a lista de perguntas já carregada e
// devolve apenas as que casam com o termo buscado.
//
// Novas formas de buscar podem ser adicionadas criando uma nova função
// aqui (ou em outro arquivo) que respeite esse mesmo contrato, sem
// precisar alterar nada em buscador.js nem em modelo.js — isso é o
// Open/Closed Principle (OCP) na prática: o sistema de busca está aberto
// para extensão (novas estratégias) e fechado para modificação (o
// orquestrador não muda).

// Estratégia padrão: busca por substring, ignorando maiúsculas/minúsculas.
// Atende ao critério de aceitação da História 3 (HISTORIAS.md):
// "A busca retorna perguntas cujo texto contenha a palavra-chave digitada,
// ignorando maiúsculas/minúsculas."
function buscaPorSubstring(perguntas, termo) {
  const termoNormalizado = termo.toLowerCase();
  return perguntas.filter(
    pergunta => pergunta.texto.toLowerCase().includes(termoNormalizado)
  );
}

// Estratégia alternativa: busca apenas perguntas que começam com o termo.
// Existe aqui só para demonstrar a extensão via OCP (ver
// IMPLEMENTACAO_SOLID.md) — não é usada por padrão pela API.
function buscaPorPrefixo(perguntas, termo) {
  const termoNormalizado = termo.toLowerCase();
  return perguntas.filter(
    pergunta => pergunta.texto.toLowerCase().startsWith(termoNormalizado)
  );
}

exports.buscaPorSubstring = buscaPorSubstring;
exports.buscaPorPrefixo = buscaPorPrefixo;
