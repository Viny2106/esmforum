var bd = require('./bd/bd_utils.js');
const { criarBuscador } = require('./busca/buscador.js');

// usada pelo teste de unidade
// para que o modelo passe a usar uma versão "mockada" de bd
function reconfig_bd(mock_bd) {
  bd = mock_bd;
}

// buscador usado por buscar_perguntas(). Recebe a estratégia padrão de
// busca/estrategias.js, mas pode ser substituído por reconfig_buscador
// (ex.: nos testes, ou futuramente por uma estratégia diferente) sem
// precisar alterar a função buscar_perguntas em si (DIP + OCP).
var buscador = criarBuscador();

function reconfig_buscador(novo_buscador) {
  buscador = novo_buscador;
}

// listar_perguntas retorna um array de objetos com os seguintes campos:
// { id_pergunta: int
//   texto: int
//   id_usuario: int
//   num_respostas: int 
// }
function listar_perguntas() {
  const perguntas = bd.queryAll('select * from perguntas', []);
  perguntas.forEach(pergunta => pergunta['num_respostas'] = get_num_respostas(pergunta['id_pergunta']));
  return perguntas;
}

function cadastrar_pergunta(texto) {
  const params = [texto, 1];
  const result = bd.exec('INSERT INTO perguntas (texto, id_usuario) VALUES(?, ?) RETURNING id_pergunta', params);
  return result.lastInsertRowid;
}

function cadastrar_resposta(id_pergunta, texto) {
  const params = [id_pergunta, texto];
  const result = bd.exec('INSERT INTO respostas (id_pergunta, texto) VALUES(?, ?) RETURNING id_resposta', params);
  return result.lastInsertRowid;
}

function get_pergunta(id_pergunta) {
  return bd.query('select * from perguntas where id_pergunta = ?', [id_pergunta]);
}

function get_respostas(id_pergunta) {
  return bd.queryAll('select * from respostas where id_pergunta = ?', [id_pergunta]);
}

function get_num_respostas(id_pergunta) {
  const resultado = bd.query('select count(*) from respostas where id_pergunta = ?', [id_pergunta]);
  return resultado['count(*)'];
}

// busca perguntas cujo texto contenha o termo informado (ignorando
// maiúsculas/minúsculas), conforme os critérios de aceitação da História 3
// (HISTORIAS.md). A lógica de comparação em si não está aqui: ela é
// delegada ao buscador (SRP) configurado acima.
function buscar_perguntas(termo) {
  const perguntas = listar_perguntas();
  return buscador.buscar(perguntas, termo);
}

exports.reconfig_bd = reconfig_bd;
exports.reconfig_buscador = reconfig_buscador;
exports.listar_perguntas = listar_perguntas;
exports.cadastrar_pergunta = cadastrar_pergunta;
exports.cadastrar_resposta = cadastrar_resposta;
exports.get_pergunta = get_pergunta;
exports.get_respostas = get_respostas;
exports.get_num_respostas = get_num_respostas;
exports.buscar_perguntas = buscar_perguntas;