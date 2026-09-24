const modelo = require('../modelo.js');
const { criarBuscador } = require('../busca/buscador.js');
const { buscaPorSubstring, buscaPorPrefixo } = require('../busca/estrategias.js');

// mock de bd, sempre retorna as mesmas 3 perguntas
var mock_bd = {};

mock_bd.queryAll = jest.fn().mockReturnValue(
  [
    { "id_pergunta": 1, "texto": "Qual a capital de MG?", "id_usuario": 1 },
    { "id_pergunta": 2, "texto": "Como instalar o Node?", "id_usuario": 1 },
    { "id_pergunta": 3, "texto": "Qual a diferença entre let e var?", "id_usuario": 1 },
  ]
);

mock_bd.query = jest.fn().mockReturnValue({ 'count(*)': 0 });

beforeEach(() => {
  modelo.reconfig_bd(mock_bd);
  modelo.reconfig_buscador(criarBuscador()); // volta pra estratégia padrão antes de cada teste
});

test('Busca ignora maiúsculas/minúsculas (critério de aceitação da História 3)', () => {
  const resultados = modelo.buscar_perguntas('QUAL');
  expect(resultados.length).toBe(2);
  expect(resultados[0].texto).toBe('Qual a capital de MG?');
  expect(resultados[1].texto).toBe('Qual a diferença entre let e var?');
});

test('Busca com termo vazio retorna todas as perguntas', () => {
  const resultados = modelo.buscar_perguntas('');
  expect(resultados.length).toBe(3);
});

test('Busca sem nenhum resultado retorna lista vazia', () => {
  const resultados = modelo.buscar_perguntas('inexistente');
  expect(resultados.length).toBe(0);
});

test('Estratégia de busca pode ser trocada sem alterar modelo.js nem buscador.js (OCP)', () => {
  modelo.reconfig_buscador(criarBuscador(buscaPorPrefixo));
  const resultados = modelo.buscar_perguntas('Como');
  expect(resultados.length).toBe(1);
  expect(resultados[0].texto).toBe('Como instalar o Node?');
});

test('buscaPorSubstring, isolada, funciona sem depender do modelo (SRP)', () => {
  const perguntas = [{ texto: 'Teste A' }, { texto: 'Teste B' }, { texto: 'Outra coisa' }];
  const resultados = buscaPorSubstring(perguntas, 'teste');
  expect(resultados.length).toBe(2);
});
