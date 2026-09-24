// Buscador: coordena a busca de perguntas.
//
// Responsabilidade única (SRP): este módulo não sabe nada sobre HTTP
// (isso é responsabilidade de server.js) e não sabe nada sobre como os
// dados são persistidos (isso é responsabilidade de modelo.js e
// bd_utils.js). Ele só coordena "dado um termo e uma lista de perguntas,
// devolva as que combinam", delegando o algoritmo de comparação em si
// para uma estratégia.
//
// Inversão de dependência (DIP): em vez de embutir aqui o algoritmo de
// busca (ex.: chamar diretamente buscaPorSubstring), o buscador recebe a
// estratégia como parâmetro (injeção de dependência). Ele depende da
// abstração "uma função buscar(perguntas, termo)", não de uma
// implementação concreta específica. Isso também é o que permite trocar
// a estratégia em testes, sem tocar neste arquivo.
const { buscaPorSubstring } = require('./estrategias.js');

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

exports.criarBuscador = criarBuscador;
