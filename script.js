// ===== DADOS GLOBAIS =====
let produtos = [];
let entradas = [];
let saidas = [];
let proximoIdProduto = 1;

// PAGINAÇÃO
const itemsPorPagina = 5;
let paginaAtual = {
  entradas: 1,
  produtos: 1,
  historicoEntradas: 1,
  historicoSaidas: 1,
  saidas: 1
};

let SQL;
let db;
const SQL_STORAGE_KEY = 'sqliteDb';
const LOGIN_USER = 'HMORAES';
const LOGIN_PASS = 'ESTOQUE2026';

function isLoggedIn() {
  return localStorage.getItem('isLoggedIn') === 'true';
}

function showLoginScreen() {
  document.body.classList.remove('logged-in');
  document.body.classList.add('logged-out');
  const loginScreen = document.getElementById('login-screen');
  if (loginScreen) loginScreen.style.display = 'flex';
}

function hideLoginScreen() {
  document.body.classList.remove('logged-out');
  document.body.classList.add('logged-in');
  const loginScreen = document.getElementById('login-screen');
  if (loginScreen) loginScreen.style.display = 'none';
}

function efetuarLogin(event) {
  event.preventDefault();
  const usuario = document.getElementById('login-usuario')?.value.trim();
  const senha = document.getElementById('login-senha')?.value;

  if (usuario.toUpperCase() === LOGIN_USER && senha === LOGIN_PASS) {
    localStorage.setItem('isLoggedIn', 'true');
    hideLoginScreen();
    mostrarNotificacao('Login realizado com sucesso!', 'success');
  } else {
    mostrarNotificacao('Usuário ou senha incorretos!', 'error');
  }
}

function initializeLogin() {
  if (isLoggedIn()) {
    hideLoginScreen();
  } else {
    showLoginScreen();
  }
}

function base64ToUint8Array(base64) {
  const raw = atob(base64);
  const array = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) {
    array[i] = raw.charCodeAt(i);
  }
  return array;
}

function uint8ArrayToBase64(uint8Array) {
  let binary = '';
  for (let i = 0; i < uint8Array.length; i++) {
    binary += String.fromCharCode(uint8Array[i]);
  }
  return btoa(binary);
}

function queryAll(sql, params = []) {
  const stmt = db.prepare(sql);
  stmt.bind(params);
  const results = [];
  while (stmt.step()) {
    results.push(stmt.getAsObject());
  }
  stmt.free();
  return results;
}

function executeSql(sql, params = []) {
  const stmt = db.prepare(sql);
  stmt.bind(params);
  stmt.step();
  stmt.free();
}

function createTables() {
  db.run("CREATE TABLE IF NOT EXISTS produtos (id INTEGER PRIMARY KEY AUTOINCREMENT, codigo TEXT UNIQUE, nome TEXT, estoque INTEGER, valorUnitario REAL)");
  db.run("CREATE TABLE IF NOT EXISTS entradas (id INTEGER PRIMARY KEY AUTOINCREMENT, codigo TEXT, nome TEXT, quantidade INTEGER, data TEXT, hora TEXT)");
  db.run("CREATE TABLE IF NOT EXISTS saidas (id INTEGER PRIMARY KEY AUTOINCREMENT, codigo TEXT, nome TEXT, quantidade INTEGER, data TEXT, hora TEXT)");
}

function persistDb() {
  const binary = db.export();
  localStorage.setItem(SQL_STORAGE_KEY, uint8ArrayToBase64(binary));
}

function migrateFromLocalStorage() {
  const produtosArmazenados = localStorage.getItem('produtos');
  const entradasArmazenadas = localStorage.getItem('entradas');
  const saidasArmazenadas = localStorage.getItem('saidas');
  let migrated = false;

  if (produtosArmazenados) {
    const produtosJson = JSON.parse(produtosArmazenados);
    produtosJson.forEach(produto => {
      db.run(
        "INSERT OR IGNORE INTO produtos (id, codigo, nome, estoque, valorUnitario) VALUES (?, ?, ?, ?, ?)",
        [produto.id, produto.codigo, produto.nome, produto.estoque, produto.valorUnitario || 0]
      );
    });
    migrated = true;
  }

  if (entradasArmazenadas) {
    const entradasJson = JSON.parse(entradasArmazenadas);
    entradasJson.forEach(entrada => {
      db.run(
        "INSERT OR IGNORE INTO entradas (id, codigo, nome, quantidade, data, hora) VALUES (?, ?, ?, ?, ?, ?)",
        [entrada.id, entrada.codigo, entrada.nome, entrada.quantidade, entrada.data, entrada.hora]
      );
    });
    migrated = true;
  }

  if (saidasArmazenadas) {
    const saidasJson = JSON.parse(saidasArmazenadas);
    saidasJson.forEach(saida => {
      db.run(
        "INSERT OR IGNORE INTO saidas (id, codigo, nome, quantidade, data, hora) VALUES (?, ?, ?, ?, ?, ?)",
        [saida.id, saida.codigo, saida.nome, saida.quantidade, saida.data, saida.hora]
      );
    });
    migrated = true;
  }

  return migrated;
}

function seedInitialData() {
  const initialProdutos = [
    { codigo: '7897076910905', nome: 'BOTINA 40', estoque: 8, valorUnitario: 120.00 },
    { codigo: '7896331700574', nome: 'CAPACETE', estoque: 5, valorUnitario: 98.50 },
    { codigo: '7897076910906', nome: 'BOTINA 41', estoque: 12, valorUnitario: 125.00 },
    { codigo: '7897076910907', nome: 'BOTINA 42', estoque: 3, valorUnitario: 125.00 }
  ];

  initialProdutos.forEach(produto => {
    db.run(
      "INSERT INTO produtos (codigo, nome, estoque, valorUnitario) VALUES (?, ?, ?, ?)",
      [produto.codigo, produto.nome, produto.estoque, produto.valorUnitario]
    );
  });

  const initialEntradas = [
    { codigo: '7897076910905', nome: 'BOTINA 40', quantidade: 1, data: '18/05/2026', hora: '20:00:01' },
    { codigo: '7897076910905', nome: 'BOTINA 40', quantidade: 1, data: '18/05/2026', hora: '20:00:02' },
    { codigo: '7897076910905', nome: 'BOTINA 40', quantidade: 1, data: '18/05/2026', hora: '20:00:03' },
    { codigo: '7897076910905', nome: 'BOTINA 40', quantidade: 1, data: '18/05/2026', hora: '20:00:04' },
    { codigo: '7897076910905', nome: 'BOTINA 40', quantidade: 1, data: '18/05/2026', hora: '20:00:04' },
    { codigo: '7897076910905', nome: 'BOTINA 40', quantidade: 1, data: '18/05/2026', hora: '20:00:05' },
    { codigo: '7897076910905', nome: 'BOTINA 40', quantidade: 1, data: '18/05/2026', hora: '20:00:05' },
    { codigo: '7896331700574', nome: 'CAPACETE', quantidade: 1, data: '18/05/2026', hora: '20:00:07' }
  ];

  initialEntradas.forEach(entrada => {
    db.run(
      "INSERT INTO entradas (codigo, nome, quantidade, data, hora) VALUES (?, ?, ?, ?, ?)",
      [entrada.codigo, entrada.nome, entrada.quantidade, entrada.data, entrada.hora]
    );
  });
}

async function initDatabase() {
  SQL = await initSqlJs({
    locateFile: file => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/${file}`
  });

  const savedDb = localStorage.getItem(SQL_STORAGE_KEY);
  if (savedDb) {
    db = new SQL.Database(base64ToUint8Array(savedDb));
    createTables();
  } else {
    db = new SQL.Database();
    createTables();
    const migrated = migrateFromLocalStorage();
    if (!migrated) {
      seedInitialData();
    }
    persistDb();
  }
}

// ===== INICIALIZAÇÃO =====
window.addEventListener('load', function() {
  console.log('Página carregada - inicializando...');

  initializeLogin();

  initDatabase()
    .then(() => {
      carregarDados();
      preencherSelects();
      carregarDashboard();
      atualizarTabelaProdutos();
      atualizarTabelaEntradas();
      atualizarTabelaSaidas();
    })
    .catch(error => console.error('Erro ao inicializar a base SQLite:', error));
  
  // Verificar tema salvo
  const temaDark = localStorage.getItem('darkMode') === 'true';
  if (temaDark) {
    document.body.classList.add('dark-mode');
  }
  
  // Setup menu
  setupMenuEventListeners();
  
  // Setup atalhos de teclado
  setupAtalhosTeclado();
});

// ===== ATALHOS DE TECLADO =====
function setupAtalhosTeclado() {
  document.addEventListener('keydown', function(event) {
    // ESC para fechar modais
    if (event.key === 'Escape') {
      document.getElementById('modal-edicao')?.style.display === 'flex' && cancelarEdicao();
      document.getElementById('modal-edicao-entrada')?.style.display === 'flex' && cancelarEdicaoEntrada();
      document.getElementById('modal-edicao-saida')?.style.display === 'flex' && cancelarEdicaoSaida();
      document.getElementById('modal-confirmacao')?.style.display === 'flex' && cancelarConfirmacao();
    }
    
    // Ctrl+S para salvar (previne o comportamento padrão)
    if ((event.ctrlKey || event.metaKey) && event.key === 's') {
      event.preventDefault();
      mostrarNotificacao('Dados salvos automaticamente!', 'info');
    }
  });
}

// ===== SQLITE DB =====
function salvarDados() {
  try {
    persistDb();
    carregarDados();
    carregarDashboard();
  } catch(e) {
    console.error('Erro ao salvar dados:', e);
  }
}

function carregarDados() {
  try {
    produtos = queryAll('SELECT id, codigo, nome, estoque, valorUnitario FROM produtos ORDER BY id').map(produto => ({
      id: produto.id,
      codigo: produto.codigo,
      nome: produto.nome,
      estoque: Number(produto.estoque),
      valorUnitario: Number(produto.valorUnitario || 0)
    }));

    entradas = queryAll('SELECT id, codigo, nome, quantidade, data, hora FROM entradas ORDER BY id').map(entrada => ({
      id: entrada.id,
      codigo: entrada.codigo,
      nome: entrada.nome,
      quantidade: Number(entrada.quantidade),
      data: entrada.data,
      hora: entrada.hora
    }));

    saidas = queryAll('SELECT id, codigo, nome, quantidade, data, hora FROM saidas ORDER BY id').map(saida => ({
      id: saida.id,
      codigo: saida.codigo,
      nome: saida.nome,
      quantidade: Number(saida.quantidade),
      data: saida.data,
      hora: saida.hora
    }));
  } catch(e) {
    console.error('Erro ao carregar dados:', e);
  }
}

// ===== NOTIFICAÇÕES =====
function mostrarNotificacao(mensagem, tipo = 'success') {
  const container = document.getElementById('notification-container');
  if (!container) return;
  
  const toast = document.createElement('div');
  toast.className = `toast ${tipo}`;
  
  let icon = '';
  switch(tipo) {
    case 'success': icon = '<i class="fas fa-check-circle"></i>'; break;
    case 'error': icon = '<i class="fas fa-times-circle"></i>'; break;
    case 'info': icon = '<i class="fas fa-info-circle"></i>'; break;
    case 'warning': icon = '<i class="fas fa-exclamation-circle"></i>'; break;
  }
  
  toast.innerHTML = icon + '<span>' + mensagem + '</span>';
  container.appendChild(toast);
  
  setTimeout(() => {
    toast.classList.add('fade-out');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// ===== DARK MODE =====
function toggleDarkMode() {
  document.body.classList.toggle('dark-mode');
  const isDark = document.body.classList.contains('dark-mode');
  localStorage.setItem('darkMode', isDark.toString());
  mostrarNotificacao('Tema alterado', 'info');
}

// ===== MODAL DE CONFIRMAÇÃO =====
let confirmacaoCallback = null;

function pedirConfirmacao(mensagem, callback) {
  document.getElementById('confirmacao-mensagem').textContent = mensagem;
  confirmacaoCallback = callback;
  document.getElementById('modal-confirmacao').style.display = 'flex';
}

function executarConfirmacao() {
  if (confirmacaoCallback) {
    confirmacaoCallback();
  }
  cancelarConfirmacao();
}

function cancelarConfirmacao() {
  document.getElementById('modal-confirmacao').style.display = 'none';
  confirmacaoCallback = null;
}

// ===== MENU =====
function setupMenuEventListeners() {
  const menuItems = document.querySelectorAll('.menu-item');
  console.log('Total de itens de menu encontrados:', menuItems.length);
  
  menuItems.forEach(item => {
    item.addEventListener('click', function(e) {
      e.preventDefault();
      
      const page = this.getAttribute('data-page');
      console.log('Menu clicado - navegando para:', page);
      
      if (page) {
        navegarPara(page);
        
        // Atualizar menu ativo
        menuItems.forEach(m => m.classList.remove('active'));
        this.classList.add('active');
      }
    });
  });
}

function navegarPara(pageName) {
  console.log('Navegando para página:', pageName);
  
  const pages = document.querySelectorAll('.page');
  pages.forEach(page => page.style.display = 'none');
  
  const pageElement = document.getElementById('page-' + pageName);
  if (pageElement) {
    pageElement.style.display = 'block';
    
    // Carregar conteúdo específico
    switch(pageName) {
      case 'dashboard':
        carregarDashboard();
        break;
      case 'produtos':
        atualizarTabelaProdutos();
        preencherSelects();
        break;
      case 'filtro-entradas':
        atualizarTabelaEntradasFiltro();
        break;
      case 'entradas':
        preencherSelects();
        atualizarTabelaEntradas();
        break;
      case 'saidas':
        preencherSelects();
        atualizarTabelaSaidas();
        break;
      case 'filtro-saidas':
        atualizarTabelaSaidasFiltro();
        break;
      case 'relatorio':
        gerarRelatorio();
        break;
    }
  } else {
    console.error('Elemento da página não encontrado:', 'page-' + pageName);
  }
}

// ===== DASHBOARD =====
function carregarDashboard() {
  const totalProdutos = produtos.length;
  const totalEntradas = entradas.length;
  const totalSaidas = saidas.length;
  const totalValor = produtos.reduce((sum, produto) => sum + (produto.estoque * (produto.valorUnitario || 0)), 0);
  
  const elem1 = document.getElementById('total-produtos');
  const elem2 = document.getElementById('total-entradas');
  const elem3 = document.getElementById('total-saidas');
  const elem4 = document.getElementById('valor-total');
  
  if (elem1) elem1.textContent = totalProdutos;
  if (elem2) elem2.textContent = totalEntradas;
  if (elem3) elem3.textContent = totalSaidas;
  if (elem4) elem4.textContent = 'R$ ' + totalValor.toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2});
}

// ===== PRODUTOS =====
function adicionarProduto() {
  const codigo = document.getElementById('novo-codigo')?.value.trim();
  const nome = document.getElementById('novo-nome')?.value.trim();
  const estoque = parseInt(document.getElementById('novo-estoque')?.value) || 0;
  const valorUnitario = parseFloat(document.getElementById('novo-valor-unitario')?.value);
  
  // Validações melhoradas
  if (!codigo || !nome || isNaN(valorUnitario)) {
    mostrarNotificacao('Preencha todos os campos!', 'error');
    return;
  }
  
  if (estoque < 0) {
    mostrarNotificacao('Estoque não pode ser negativo!', 'error');
    return;
  }
  
  if (valorUnitario < 0) {
    mostrarNotificacao('Valor unitário não pode ser negativo!', 'error');
    return;
  }
  
  if (estoque > 999999) {
    mostrarNotificacao('Estoque muito alto! Máximo: 999.999', 'error');
    return;
  }
  
  if (valorUnitario > 9999999.99) {
    mostrarNotificacao('Valor unitário muito alto! Máximo: 9.999.999,99', 'error');
    return;
  }
  
  const codigoExiste = queryAll('SELECT id FROM produtos WHERE codigo = ?', [codigo]);
  if (codigoExiste.length > 0) {
    mostrarNotificacao('Este código de produto já existe!', 'error');
    return;
  }
  
  if (nome.length < 3) {
    mostrarNotificacao('Nome do produto deve ter pelo menos 3 caracteres!', 'error');
    return;
  }
  
  if (nome.length > 100) {
    mostrarNotificacao('Nome do produto muito longo! Máximo: 100 caracteres', 'error');
    return;
  }

  db.run(
    'INSERT INTO produtos (codigo, nome, estoque, valorUnitario) VALUES (?, ?, ?, ?)',
    [codigo, nome, estoque, valorUnitario]
  );

  document.getElementById('novo-codigo').value = '';
  document.getElementById('novo-nome').value = '';
  document.getElementById('novo-estoque').value = '';
  document.getElementById('novo-valor-unitario').value = '';
  
  salvarDados();
  atualizarTabelaProdutos();
  preencherSelects();
  mostrarNotificacao('Produto adicionado com sucesso!', 'success');
}

function atualizarTabelaProdutos() {
  const tbody = document.getElementById('tabela-produtos');
  if (!tbody) return;
  
  const inicio = (paginaAtual.produtos - 1) * itemsPorPagina;
  const fim = inicio + itemsPorPagina;
  const dados = produtos.slice(inicio, fim);
  
  tbody.innerHTML = '';
  let totalEstoque = 0;
  
  dados.forEach(produto => {
    totalEstoque += produto.estoque;
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${produto.id}</td>
      <td>${produto.codigo}</td>
      <td>${produto.nome}</td>
      <td>${produto.estoque}</td>
      <td>R$ ${produto.valorUnitario.toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
      <td>
        <button class="action-btn edit-btn" onclick="editarProduto(${produto.id})">✎ Editar</button>
        <button class="action-btn delete-btn" onclick="deletarProduto(${produto.id})">✕ Deletar</button>
      </td>
    `;
    tbody.appendChild(row);
  });
  
  // Adicionar linha de total
  const rowTotal = document.createElement('tr');
  rowTotal.style.backgroundColor = '#f0f0f0';
  rowTotal.style.fontWeight = 'bold';
  rowTotal.innerHTML = `
    <td colspan="4" style="text-align: right; padding-right: 20px;">TOTAL ESTOQUE:</td>
    <td style="border-top: 2px solid #1abc9c;">${totalEstoque}</td>
    <td></td>
  `;
  tbody.appendChild(rowTotal);
  
  atualizarPaginacao('produtos', produtos.length);
}

function editarProduto(id) {
  const produto = produtos.find(p => p.id === id);
  if (!produto) {
    mostrarNotificacao('Produto não encontrado!', 'error');
    return;
  }
  
  document.getElementById('edicao-id').value = produto.id;
  document.getElementById('edicao-codigo').value = produto.codigo;
  document.getElementById('edicao-nome').value = produto.nome;
  document.getElementById('edicao-estoque').value = produto.estoque;
  document.getElementById('edicao-valor-unitario').value = produto.valorUnitario != null ? produto.valorUnitario : 0;
  
  document.getElementById('modal-edicao').style.display = 'flex';
}

function cancelarEdicao() {
  document.getElementById('modal-edicao').style.display = 'none';
}

function salvarEdicaoProduto(event) {
  event.preventDefault();
  
  const id = parseInt(document.getElementById('edicao-id').value);
  const codigo = document.getElementById('edicao-codigo').value.trim();
  const nome = document.getElementById('edicao-nome').value.trim();
  const estoque = parseInt(document.getElementById('edicao-estoque').value);
  const valorUnitario = parseFloat(document.getElementById('edicao-valor-unitario').value);
  
  if (!codigo || !nome || isNaN(valorUnitario)) {
    mostrarNotificacao('Preencha todos os campos!', 'error');
    return;
  }
  
  if (estoque < 0) {
    mostrarNotificacao('Estoque não pode ser negativo!', 'error');
    return;
  }
  
  if (valorUnitario < 0) {
    mostrarNotificacao('Valor unitário não pode ser negativo!', 'error');
    return;
  }

  db.run(
    'UPDATE produtos SET codigo = ?, nome = ?, estoque = ?, valorUnitario = ? WHERE id = ?',
    [codigo, nome, estoque, valorUnitario, id]
  );
  
  salvarDados();
  atualizarTabelaProdutos();
  preencherSelects();
  cancelarEdicao();
  mostrarNotificacao('Produto atualizado com sucesso!', 'success');
}

function deletarProduto(id) {
  pedirConfirmacao('Tem certeza que deseja deletar este produto?', () => {
    db.run('DELETE FROM produtos WHERE id = ?', [id]);
    salvarDados();
    atualizarTabelaProdutos();
    preencherSelects();
    mostrarNotificacao('Produto deletado com sucesso!', 'success');
  });
}

// ===== ENTRADAS =====
function registrarEntrada() {
  const produtoId = parseInt(document.getElementById('entrada-produto')?.value);
  const quantidade = parseInt(document.getElementById('entrada-quantidade')?.value);
  
  if (!produtoId || !quantidade || quantidade <= 0) {
    mostrarNotificacao('Selecione um produto e quantidade válida!', 'error');
    return;
  }
  
  const produto = produtos.find(p => p.id === produtoId);
  if (!produto) {
    mostrarNotificacao('Produto não encontrado!', 'error');
    return;
  }
  
  const agora = new Date();
  const data = agora.toLocaleDateString('pt-BR');
  const hora = agora.toLocaleTimeString('pt-BR');
  
  db.run(
    'INSERT INTO entradas (codigo, nome, quantidade, data, hora) VALUES (?, ?, ?, ?, ?)',
    [produto.codigo, produto.nome, quantidade, data, hora]
  );
  
  db.run(
    'UPDATE produtos SET estoque = estoque + ? WHERE id = ?',
    [quantidade, produtoId]
  );
  
  document.getElementById('entrada-produto').value = '';
  document.getElementById('entrada-quantidade').value = '';
  
  salvarDados();
  atualizarTabelaEntradas();
  mostrarNotificacao('Entrada registrada com sucesso!', 'success');
}

function atualizarTabelaEntradas() {
  const tbody = document.getElementById('tabela-historico-entradas');
  if (!tbody) return;
  
  const inicio = (paginaAtual.historicoEntradas - 1) * itemsPorPagina;
  const fim = inicio + itemsPorPagina;
  const dados = entradas.slice(inicio, fim);
  
  tbody.innerHTML = '';
  let totalQuantidade = 0;
  
  dados.forEach(entrada => {
    totalQuantidade += entrada.quantidade;
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${entrada.id}</td>
      <td>${entrada.codigo}</td>
      <td>${entrada.nome}</td>
      <td>${entrada.quantidade}</td>
      <td>${entrada.data}</td>
      <td>${entrada.hora}</td>
    `;
    tbody.appendChild(row);
  });
  
  // Adicionar linha de total
  const rowTotal = document.createElement('tr');
  rowTotal.style.backgroundColor = '#f0f0f0';
  rowTotal.style.fontWeight = 'bold';
  rowTotal.innerHTML = `
    <td colspan="3" style="text-align: right; padding-right: 20px;">TOTAL:</td>
    <td style="border-top: 2px solid #1abc9c;">${totalQuantidade}</td>
    <td colspan="2"></td>
  `;
  tbody.appendChild(rowTotal);
  
  atualizarPaginacao('historicoEntradas', entradas.length);
}

// ===== SAÍDAS =====
function registrarSaida() {
  const produtoId = parseInt(document.getElementById('saida-produto')?.value);
  const quantidade = parseInt(document.getElementById('saida-quantidade')?.value);
  
  if (!produtoId || !quantidade || quantidade <= 0) {
    mostrarNotificacao('Selecione um produto e quantidade válida!', 'error');
    return;
  }
  
  const produto = produtos.find(p => p.id === produtoId);
  if (!produto) {
    mostrarNotificacao('Produto não encontrado!', 'error');
    return;
  }
  
  if (produto.estoque < quantidade) {
    mostrarNotificacao('Estoque insuficiente! Disponível: ' + produto.estoque, 'error');
    return;
  }
  
  const agora = new Date();
  const data = agora.toLocaleDateString('pt-BR');
  const hora = agora.toLocaleTimeString('pt-BR');
  
  db.run(
    'INSERT INTO saidas (codigo, nome, quantidade, data, hora) VALUES (?, ?, ?, ?, ?)',
    [produto.codigo, produto.nome, quantidade, data, hora]
  );
  
  db.run(
    'UPDATE produtos SET estoque = estoque - ? WHERE id = ?',
    [quantidade, produtoId]
  );
  
  document.getElementById('saida-produto').value = '';
  document.getElementById('saida-quantidade').value = '';
  
  salvarDados();
  atualizarTabelaSaidas();
  mostrarNotificacao('Saída registrada com sucesso!', 'success');
}

function atualizarTabelaSaidas() {
  const tbody = document.getElementById('tabela-historico-saidas');
  if (!tbody) return;
  
  const inicio = (paginaAtual.historicoSaidas - 1) * itemsPorPagina;
  const fim = inicio + itemsPorPagina;
  const dados = saidas.slice(inicio, fim);
  
  tbody.innerHTML = '';
  let totalQuantidade = 0;
  
  dados.forEach(saida => {
    totalQuantidade += saida.quantidade;
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${saida.id}</td>
      <td>${saida.codigo}</td>
      <td>${saida.nome}</td>
      <td>${saida.quantidade}</td>
      <td>${saida.data}</td>
      <td>${saida.hora}</td>
    `;
    tbody.appendChild(row);
  });
  
  // Adicionar linha de total
  const rowTotal = document.createElement('tr');
  rowTotal.style.backgroundColor = '#f0f0f0';
  rowTotal.style.fontWeight = 'bold';
  rowTotal.innerHTML = `
    <td colspan="3" style="text-align: right; padding-right: 20px;">TOTAL:</td>
    <td style="border-top: 2px solid #1abc9c;">${totalQuantidade}</td>
    <td colspan="2"></td>
  `;
  tbody.appendChild(rowTotal);
  
  atualizarPaginacao('historicoSaidas', saidas.length);
  atualizarTabelaSaidasFiltro();
}

function deletarSaida(id) {
  pedirConfirmacao('Tem certeza que deseja deletar esta saída?', () => {
    const saida = queryAll('SELECT codigo, quantidade FROM saidas WHERE id = ?', [id])[0];
    if (saida) {
      db.run('UPDATE produtos SET estoque = estoque + ? WHERE codigo = ?', [saida.quantidade, saida.codigo]);
    }
    db.run('DELETE FROM saidas WHERE id = ?', [id]);
    salvarDados();
    atualizarTabelaSaidas();
    mostrarNotificacao('Saída deletada com sucesso!', 'success');
  });
}

// ===== SELECTS =====
function preencherSelects() {
  const selects = ['filtro-produto', 'entrada-produto', 'saida-produto', 'filtro-produto-saida'];
  
  selects.forEach(id => {
    const select = document.getElementById(id);
    if (select) {
      const valor = select.value;
      select.innerHTML = '<option value="">Selecione um Produto</option>';
      
      produtos.forEach(produto => {
        const option = document.createElement('option');
        option.value = produto.id;
        option.textContent = `${produto.codigo} - ${produto.nome}`;
        select.appendChild(option);
      });
      
      if (valor) select.value = valor;
    }
  });
}

// ===== FILTROS ENTRADAS =====
function aplicarFiltro() {
  const dataInicial = document.getElementById('data-inicial')?.value;
  const dataFinal = document.getElementById('data-final')?.value;
  const codigo = document.getElementById('filtro-codigo')?.value.toLowerCase();
  const produtoId = document.getElementById('filtro-produto')?.value;
  
  let entradasFiltradas = entradas.slice();
  
  if (dataInicial) {
    const data = new Date(dataInicial);
    entradasFiltradas = entradasFiltradas.filter(e => {
      const dataParts = e.data.split('/');
      const dataEntrada = new Date(dataParts[2], dataParts[1] - 1, dataParts[0]);
      return dataEntrada >= data;
    });
  }
  
  if (dataFinal) {
    const data = new Date(dataFinal);
    entradasFiltradas = entradasFiltradas.filter(e => {
      const dataParts = e.data.split('/');
      const dataEntrada = new Date(dataParts[2], dataParts[1] - 1, dataParts[0]);
      return dataEntrada <= data;
    });
  }
  
  if (codigo) {
    entradasFiltradas = entradasFiltradas.filter(e => e.codigo.toLowerCase().includes(codigo));
  }
  
  if (produtoId) {
    const produto = produtos.find(p => p.id === parseInt(produtoId));
    if (produto) {
      entradasFiltradas = entradasFiltradas.filter(e => e.codigo === produto.codigo);
    }
  }
  
  paginaAtual.entradas = 1;
  exibirTabelaFiltrada('entradas', entradasFiltradas);
  mostrarNotificacao('Filtro aplicado!', 'success');
}

function limparFiltro() {
  if (document.getElementById('data-inicial')) document.getElementById('data-inicial').value = '';
  if (document.getElementById('data-final')) document.getElementById('data-final').value = '';
  if (document.getElementById('filtro-codigo')) document.getElementById('filtro-codigo').value = '';
  if (document.getElementById('filtro-produto')) document.getElementById('filtro-produto').value = '';
  
  atualizarTabelaEntradasFiltro();
  mostrarNotificacao('Filtro limpo!', 'info');
}

function atualizarTabelaEntradasFiltro() {
  paginaAtual.entradas = 1;
  exibirTabelaFiltrada('entradas', entradas);
}

function exibirTabelaFiltrada(tipo, dados) {
  const tbody = document.getElementById('tabela-' + tipo);
  if (!tbody) return;
  
  const inicio = (paginaAtual[tipo] - 1) * itemsPorPagina;
  const fim = inicio + itemsPorPagina;
  const paginados = dados.slice(inicio, fim);
  
  tbody.innerHTML = '';
  paginados.forEach(item => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${item.id}</td>
      <td>${item.codigo}</td>
      <td>${item.nome}</td>
      <td>${item.quantidade}</td>
      <td>${item.data}</td>
      <td>${item.hora}</td>
      <td>
        <button class="action-btn edit-btn" onclick="editarEntrada(${item.id})">✎ Editar</button>
        <button class="action-btn delete-btn" onclick="deletarEntrada(${item.id})">✕ Deletar</button>
      </td>
    `;
    tbody.appendChild(row);
  });
  
  atualizarPaginacao(tipo, dados.length);
}

// ===== FILTROS SAÍDAS =====
function aplicarFiltroSaida() {
  const dataInicial = document.getElementById('data-inicial-saida')?.value;
  const dataFinal = document.getElementById('data-final-saida')?.value;
  const codigo = document.getElementById('filtro-codigo-saida')?.value.toLowerCase();
  const produtoId = document.getElementById('filtro-produto-saida')?.value;
  
  let saidasFiltradas = saidas.slice();
  
  if (dataInicial) {
    const data = new Date(dataInicial);
    saidasFiltradas = saidasFiltradas.filter(s => {
      const dataParts = s.data.split('/');
      const dataSaida = new Date(dataParts[2], dataParts[1] - 1, dataParts[0]);
      return dataSaida >= data;
    });
  }
  
  if (dataFinal) {
    const data = new Date(dataFinal);
    saidasFiltradas = saidasFiltradas.filter(s => {
      const dataParts = s.data.split('/');
      const dataSaida = new Date(dataParts[2], dataParts[1] - 1, dataParts[0]);
      return dataSaida <= data;
    });
  }
  
  if (codigo) {
    saidasFiltradas = saidasFiltradas.filter(s => s.codigo.toLowerCase().includes(codigo));
  }
  
  if (produtoId) {
    const produto = produtos.find(p => p.id === parseInt(produtoId));
    if (produto) {
      saidasFiltradas = saidasFiltradas.filter(s => s.codigo === produto.codigo);
    }
  }
  
  paginaAtual.saidas = 1;
  exibirTabelaSaidasFiltrada(saidasFiltradas);
  mostrarNotificacao('Filtro aplicado!', 'success');
}

function limparFiltroSaida() {
  if (document.getElementById('data-inicial-saida')) document.getElementById('data-inicial-saida').value = '';
  if (document.getElementById('data-final-saida')) document.getElementById('data-final-saida').value = '';
  if (document.getElementById('filtro-codigo-saida')) document.getElementById('filtro-codigo-saida').value = '';
  if (document.getElementById('filtro-produto-saida')) document.getElementById('filtro-produto-saida').value = '';
  
  atualizarTabelaSaidasFiltro();
  mostrarNotificacao('Filtro limpo!', 'info');
}

function atualizarTabelaSaidasFiltro() {
  paginaAtual.saidas = 1;
  exibirTabelaSaidasFiltrada(saidas);
}

function exibirTabelaSaidasFiltrada(dados) {
  const tbody = document.getElementById('tabela-saidas');
  if (!tbody) return;
  
  const inicio = (paginaAtual.saidas - 1) * itemsPorPagina;
  const fim = inicio + itemsPorPagina;
  const paginados = dados.slice(inicio, fim);
  
  tbody.innerHTML = '';
  paginados.forEach(saida => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${saida.id}</td>
      <td>${saida.codigo}</td>
      <td>${saida.nome}</td>
      <td>${saida.quantidade}</td>
      <td>${saida.data}</td>
      <td>${saida.hora}</td>
      <td>
        <button class="action-btn edit-btn" onclick="editarSaida(${saida.id})">✎ Editar</button>
        <button class="action-btn delete-btn" onclick="deletarSaida(${saida.id})">✕ Deletar</button>
      </td>
    `;
    tbody.appendChild(row);
  });
  
  atualizarPaginacao('saidas', dados.length);
}

// ===== PAGINAÇÃO =====
function editarEntrada(id) {
  const entrada = entradas.find(e => e.id === id);
  if (!entrada) {
    mostrarNotificacao('Entrada não encontrada!', 'error');
    return;
  }
  
  document.getElementById('edicao-entrada-id').value = entrada.id;
  document.getElementById('edicao-entrada-produto').value = entrada.nome;
  document.getElementById('edicao-entrada-quantidade').value = entrada.quantidade;
  
  document.getElementById('modal-edicao-entrada').style.display = 'flex';
}

function cancelarEdicaoEntrada() {
  document.getElementById('modal-edicao-entrada').style.display = 'none';
}

function salvarEdicaoEntrada(event) {
  event.preventDefault();
  
  const id = parseInt(document.getElementById('edicao-entrada-id').value);
  const quantidade = parseInt(document.getElementById('edicao-entrada-quantidade').value);
  
  if (quantidade <= 0) {
    mostrarNotificacao('Quantidade deve ser maior que zero!', 'error');
    return;
  }
  
  const entrada = queryAll('SELECT codigo, quantidade FROM entradas WHERE id = ?', [id])[0];
  if (entrada) {
    const diferencaQtd = quantidade - entrada.quantidade;
    db.run('UPDATE entradas SET quantidade = ? WHERE id = ?', [quantidade, id]);
    db.run('UPDATE produtos SET estoque = estoque + ? WHERE codigo = ?', [diferencaQtd, entrada.codigo]);
    salvarDados();
    atualizarTabelaEntradasFiltro();
    cancelarEdicaoEntrada();
    mostrarNotificacao('Entrada atualizada com sucesso!', 'success');
  } else {
    mostrarNotificacao('Entrada não encontrada!', 'error');
  }
}

function deletarEntrada(id) {
  pedirConfirmacao('Tem certeza que deseja deletar esta entrada?', () => {
    const entrada = queryAll('SELECT codigo, quantidade FROM entradas WHERE id = ?', [id])[0];
    if (entrada) {
      db.run('UPDATE produtos SET estoque = estoque - ? WHERE codigo = ?', [entrada.quantidade, entrada.codigo]);
      db.run('DELETE FROM entradas WHERE id = ?', [id]);
      salvarDados();
      atualizarTabelaEntradasFiltro();
      mostrarNotificacao('Entrada deletada com sucesso!', 'success');
    } else {
      mostrarNotificacao('Entrada não encontrada!', 'error');
    }
  });
}

function editarSaida(id) {
  const saida = saidas.find(s => s.id === id);
  if (!saida) {
    mostrarNotificacao('Saída não encontrada!', 'error');
    return;
  }
  
  document.getElementById('edicao-saida-id').value = saida.id;
  document.getElementById('edicao-saida-produto').value = saida.nome;
  document.getElementById('edicao-saida-quantidade').value = saida.quantidade;
  
  document.getElementById('modal-edicao-saida').style.display = 'flex';
}

function cancelarEdicaoSaida() {
  document.getElementById('modal-edicao-saida').style.display = 'none';
}

function salvarEdicaoSaida(event) {
  event.preventDefault();
  
  const id = parseInt(document.getElementById('edicao-saida-id').value);
  const quantidade = parseInt(document.getElementById('edicao-saida-quantidade').value);
  
  if (quantidade <= 0) {
    mostrarNotificacao('Quantidade deve ser maior que zero!', 'error');
    return;
  }
  
  const saida = queryAll('SELECT codigo, quantidade FROM saidas WHERE id = ?', [id])[0];
  if (saida) {
    const diferencaQtd = saida.quantidade - quantidade; // inverte porque saída diminui estoque
    const produto = queryAll('SELECT id, estoque FROM produtos WHERE codigo = ?', [saida.codigo])[0];
    if (produto) {
      if (produto.estoque + diferencaQtd < 0) {
        mostrarNotificacao('Estoque insuficiente para esta alteração!', 'error');
        return;
      }
      db.run('UPDATE produtos SET estoque = estoque + ? WHERE id = ?', [diferencaQtd, produto.id]);
    }
    db.run('UPDATE saidas SET quantidade = ? WHERE id = ?', [quantidade, id]);
    salvarDados();
    atualizarTabelaSaidasFiltro();
    cancelarEdicaoSaida();
    mostrarNotificacao('Saída atualizada com sucesso!', 'success');
  } else {
    mostrarNotificacao('Saída não encontrada!', 'error');
  }
}

function atualizarPaginacao(tipo, totalItens) {
  const totalPaginas = Math.ceil(totalItens / itemsPorPagina);
  const paginacaoId = 'paginacao-' + tipo;
  const container = document.getElementById(paginacaoId);
  
  if (!container) return;
  
  container.innerHTML = '';
  
  if (totalPaginas <= 1) return;
  
  if (paginaAtual[tipo] > 1) {
    const btn = document.createElement('button');
    btn.textContent = '← Anterior';
    btn.onclick = () => {
      paginaAtual[tipo]--;
      atualizarTabelaPorTipo(tipo);
    };
    container.appendChild(btn);
  }
  
  for (let i = 1; i <= totalPaginas; i++) {
    const btn = document.createElement('button');
    btn.textContent = i;
    if (i === paginaAtual[tipo]) btn.classList.add('active');
    btn.onclick = () => {
      paginaAtual[tipo] = i;
      atualizarTabelaPorTipo(tipo);
    };
    container.appendChild(btn);
  }
  
  if (paginaAtual[tipo] < totalPaginas) {
    const btn = document.createElement('button');
    btn.textContent = 'Próximo →';
    btn.onclick = () => {
      paginaAtual[tipo]++;
      atualizarTabelaPorTipo(tipo);
    };
    container.appendChild(btn);
  }
  
  const span = document.createElement('span');
  span.textContent = ` Página ${paginaAtual[tipo]} de ${totalPaginas}`;
  container.appendChild(span);
}

function atualizarTabelaPorTipo(tipo) {
  switch(tipo) {
    case 'produtos': atualizarTabelaProdutos(); break;
    case 'historicoEntradas': atualizarTabelaEntradas(); break;
    case 'historicoSaidas': atualizarTabelaSaidas(); break;
    case 'entradas': atualizarTabelaEntradasFiltro(); break;
    case 'saidas': atualizarTabelaSaidasFiltro(); break;
  }
}

// ===== BUSCA GLOBAL =====
function buscarGlobal() {
  const termo = document.getElementById('busca-global')?.value.toLowerCase().trim();
  
  if (!termo) {
    atualizarTabelaProdutos();
    atualizarTabelaEntradas();
    atualizarTabelaSaidas();
    return;
  }
  
  // Buscar em produtos
  const produtosFiltrados = produtos.filter(p => 
    p.nome.toLowerCase().includes(termo) || 
    p.codigo.toLowerCase().includes(termo)
  );
  
  // Buscar em entradas
  const entradasFiltradas = entradas.filter(e =>
    e.nome.toLowerCase().includes(termo) ||
    e.codigo.toLowerCase().includes(termo)
  );
  
  // Buscar em saídas
  const saidasFiltradas = saidas.filter(s =>
    s.nome.toLowerCase().includes(termo) ||
    s.codigo.toLowerCase().includes(termo)
  );
  
  const totalResultados = produtosFiltrados.length + entradasFiltradas.length + saidasFiltradas.length;
  
  if (totalResultados === 0) {
    mostrarNotificacao('Nenhum resultado para: "' + termo + '"', 'info');
  } else {
    mostrarNotificacao(`${totalResultados} resultado(s) encontrado(s) - Produtos: ${produtosFiltrados.length} | Entradas: ${entradasFiltradas.length} | Saídas: ${saidasFiltradas.length}`, 'info');
  }
  
  // Atualizar tabela de produtos
  const tbodyProdutos = document.getElementById('tabela-produtos');
  if (tbodyProdutos) {
    tbodyProdutos.innerHTML = '';
    produtosFiltrados.forEach(p => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${p.id}</td>
        <td><strong>${p.codigo}</strong></td>
        <td>${p.nome}</td>
        <td>${p.estoque}</td>
        <td>R$ ${p.valorUnitario.toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
        <td>
          <button class="action-btn edit-btn" onclick="editarProduto(${p.id})">✎ Editar</button>
          <button class="action-btn delete-btn" onclick="deletarProduto(${p.id})">✕ Deletar</button>
        </td>
      `;
      tbodyProdutos.appendChild(row);
    });
  }
  
  // Atualizar tabela de entradas
  const tbodyEntradas = document.getElementById('tabela-entradas');
  if (tbodyEntradas) {
    tbodyEntradas.innerHTML = '';
    entradasFiltradas.forEach(e => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${e.id}</td>
        <td>${e.codigo}</td>
        <td>${e.nome}</td>
        <td>${e.quantidade}</td>
        <td>${e.data}</td>
        <td>${e.hora}</td>
        <td>
          <button class="action-btn edit-btn" onclick="editarEntrada(${e.id})">✎ Editar</button>
          <button class="action-btn delete-btn" onclick="deletarEntrada(${e.id})">✕ Deletar</button>
        </td>
      `;
      tbodyEntradas.appendChild(row);
    });
  }
  
  // Atualizar tabela de saídas
  const tBodySaidas = document.getElementById('tabela-saidas');
  if (tBodySaidas) {
    tBodySaidas.innerHTML = '';
    saidasFiltradas.forEach(s => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${s.id}</td>
        <td>${s.codigo}</td>
        <td>${s.nome}</td>
        <td>${s.quantidade}</td>
        <td>${s.data}</td>
        <td>${s.hora}</td>
        <td>
          <button class="action-btn edit-btn" onclick="editarSaida(${s.id})">✎ Editar</button>
          <button class="action-btn delete-btn" onclick="deletarSaida(${s.id})">✕ Deletar</button>
        </td>
      `;
      tBodySaidas.appendChild(row);
    });
  }
}

// ===== EXPORTAÇÃO PDF =====
function exportarPDF() {
  const tabela = document.getElementById('tabela-entradas');
  if (!tabela) {
    mostrarNotificacao('Tabela não encontrada', 'error');
    return;
  }
  
  try {
    // Criar elemento para o PDF
    const element = document.createElement('div');
    element.style.padding = '20px';
    element.innerHTML = `
      <h1 style="text-align: center; margin-bottom: 10px;">CONTROLE DE ESTOQUE</h1>
      <h2 style="text-align: center; margin-bottom: 10px;">ENTRADAS</h2>
      <p style="text-align: center; margin-bottom: 20px;">Data: ${new Date().toLocaleDateString('pt-BR')}</p>
      ${tabela.outerHTML}
    `;
    
    // Opções do html2pdf
    const options = {
      margin: 10,
      filename: `entradas_${new Date().getTime()}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { orientation: 'landscape', unit: 'mm', format: 'a4' }
    };
    
    // Gerar PDF
    html2pdf().set(options).from(element).save();
    mostrarNotificacao('PDF de entradas gerado com sucesso!', 'success');
  } catch (erro) {
    console.error('Erro ao gerar PDF:', erro);
    mostrarNotificacao('Erro ao gerar PDF. Tente novamente.', 'error');
  }
}

function exportarPDFSaida() {
  const tabela = document.getElementById('tabela-saidas');
  if (!tabela) {
    mostrarNotificacao('Tabela não encontrada', 'error');
    return;
  }
  
  try {
    // Criar elemento para o PDF
    const element = document.createElement('div');
    element.style.padding = '20px';
    element.innerHTML = `
      <h1 style="text-align: center; margin-bottom: 10px;">CONTROLE DE ESTOQUE</h1>
      <h2 style="text-align: center; margin-bottom: 10px;">SAÍDAS</h2>
      <p style="text-align: center; margin-bottom: 20px;">Data: ${new Date().toLocaleDateString('pt-BR')}</p>
      ${tabela.outerHTML}
    `;
    
    // Opções do html2pdf
    const options = {
      margin: 10,
      filename: `saidas_${new Date().getTime()}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { orientation: 'landscape', unit: 'mm', format: 'a4' }
    };
    
    // Gerar PDF
    html2pdf().set(options).from(element).save();
    mostrarNotificacao('PDF de saídas gerado com sucesso!', 'success');
  } catch (erro) {
    console.error('Erro ao gerar PDF:', erro);
    mostrarNotificacao('Erro ao gerar PDF. Tente novamente.', 'error');
  }
}

// ===== EXPORTAÇÃO EXCEL =====
function exportarExcel() {
  const tabela = document.getElementById('tabela-entradas');
  if (!tabela) {
    mostrarNotificacao('Tabela não encontrada', 'error');
    return;
  }
  
  // Converter tabela para array
  let dados = [];
  const headers = [];
  
  // Headers
  tabela.querySelectorAll('thead th').forEach(header => {
    headers.push(header.textContent.trim());
  });
  dados.push(headers);
  
  // Dados
  tabela.querySelectorAll('tbody tr').forEach(row => {
    const rowData = [];
    row.querySelectorAll('td').forEach((cell, index) => {
      if (index < headers.length) {
        rowData.push(cell.textContent.trim());
      }
    });
    if (rowData.length > 0) dados.push(rowData);
  });
  
  // Criar workbook
  const worksheet = XLSX.utils.aoa_to_sheet(dados);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Entradas');
  
  // Salvar
  XLSX.writeFile(workbook, `entradas_${new Date().getTime()}.xlsx`);
  mostrarNotificacao('Arquivo Excel de entradas gerado com sucesso!', 'success');
}

function exportarExcelSaida() {
  const tabela = document.getElementById('tabela-saidas');
  if (!tabela) {
    mostrarNotificacao('Tabela não encontrada', 'error');
    return;
  }
  
  // Converter tabela para array
  let dados = [];
  const headers = [];
  
  // Headers
  tabela.querySelectorAll('thead th').forEach(header => {
    headers.push(header.textContent.trim());
  });
  dados.push(headers);
  
  // Dados
  tabela.querySelectorAll('tbody tr').forEach(row => {
    const rowData = [];
    row.querySelectorAll('td').forEach((cell, index) => {
      if (index < headers.length) {
        rowData.push(cell.textContent.trim());
      }
    });
    if (rowData.length > 0) dados.push(rowData);
  });
  
  // Criar workbook
  const worksheet = XLSX.utils.aoa_to_sheet(dados);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Saídas');
  
  // Salvar
  XLSX.writeFile(workbook, `saidas_${new Date().getTime()}.xlsx`);
  mostrarNotificacao('Arquivo Excel de saídas gerado com sucesso!', 'success');
}

// ===== RELATÓRIO =====
function gerarRelatorio() {
  const totalProdutos = produtos.length;
  const totalEstoque = produtos.reduce((sum, p) => sum + p.estoque, 0);
  const totalEntradas = entradas.reduce((sum, e) => sum + e.quantidade, 0);
  const totalSaidas = saidas.reduce((sum, s) => sum + s.quantidade, 0);
  
  const relatorioHTML = `
    <h3>Resumo Geral</h3>
    <p><strong>Total de Produtos:</strong> ${totalProdutos}</p>
    <p><strong>Total em Estoque:</strong> ${totalEstoque} unidades</p>
    <p><strong>Total de Entradas:</strong> ${totalEntradas} unidades</p>
    <p><strong>Total de Saídas:</strong> ${totalSaidas} unidades</p>
    <p><strong>Saldo Líquido:</strong> ${totalEstoque} unidades</p>
    
    <h3>Produtos em Estoque</h3>
    <table class="data-table">
      <thead>
        <tr>
          <th>Código</th>
          <th>Produto</th>
          <th>Quantidade</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        ${produtos.map(p => `
          <tr>
            <td>${p.codigo}</td>
            <td>${p.nome}</td>
            <td>${p.estoque}</td>
            <td>${p.estoque > 5 ? '✓ OK' : p.estoque > 0 ? '⚠ Baixo' : '✕ Zerado'}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
  
  const elem = document.getElementById('relatorio-conteudo');
  if (elem) elem.innerHTML = relatorioHTML;
}

function imprimirRelatorio() {
  const elemento = document.getElementById('relatorio-container');
  if (!elemento) {
    mostrarNotificacao('Relatório não encontrado', 'error');
    return;
  }
  
  const conteudo = elemento.innerHTML;
  const tela_impressao = window.open('', 'PRINT', 'height=400,width=600');
  
  tela_impressao.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Relatório de Estoque</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          h1, h3 { color: #1a1a2e; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
          th { background-color: #1abc9c; color: white; }
          p { line-height: 1.8; }
        </style>
      </head>
      <body>
        <h1>RELATÓRIO DE ESTOQUE</h1>
        <p><strong>Data:</strong> ${new Date().toLocaleDateString('pt-BR')} ${new Date().toLocaleTimeString('pt-BR')}</p>
        ${conteudo}
      </body>
    </html>
  `);
  
  tela_impressao.document.close();
  tela_impressao.print();
}

function exportarRelatorioPDF() {
  const totalProdutos = produtos.length;
  const totalEstoque = produtos.reduce((sum, p) => sum + p.estoque, 0);
  const totalEntradas = entradas.reduce((sum, e) => sum + e.quantidade, 0);
  const totalSaidas = saidas.reduce((sum, s) => sum + s.quantidade, 0);
  
  try {
    // Criar elemento para o PDF
    const element = document.createElement('div');
    element.style.padding = '20px';
    element.style.fontFamily = 'Arial, sans-serif';
    element.innerHTML = `
      <h1 style="text-align: center; margin-bottom: 10px;">RELATÓRIO DE ESTOQUE</h1>
      <p style="text-align: center; margin-bottom: 20px;">Data: ${new Date().toLocaleDateString('pt-BR')} ${new Date().toLocaleTimeString('pt-BR')}</p>
      
      <h2>Resumo Geral</h2>
      <p><strong>Total de Produtos:</strong> ${totalProdutos}</p>
      <p><strong>Total em Estoque:</strong> ${totalEstoque} unidades</p>
      <p><strong>Total de Entradas:</strong> ${totalEntradas} unidades</p>
      <p><strong>Total de Saídas:</strong> ${totalSaidas} unidades</p>
      <p><strong>Saldo Líquido:</strong> ${totalEstoque} unidades</p>
      
      <h2>Produtos em Estoque</h2>
      <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
        <thead>
          <tr style="background-color: #1abc9c; color: white;">
            <th style="border: 1px solid #ddd; padding: 10px; text-align: left;">Código</th>
            <th style="border: 1px solid #ddd; padding: 10px; text-align: left;">Produto</th>
            <th style="border: 1px solid #ddd; padding: 10px; text-align: left;">Quantidade</th>
            <th style="border: 1px solid #ddd; padding: 10px; text-align: left;">Status</th>
          </tr>
        </thead>
        <tbody>
          ${produtos.map(p => `
            <tr>
              <td style="border: 1px solid #ddd; padding: 10px;">${p.codigo}</td>
              <td style="border: 1px solid #ddd; padding: 10px;">${p.nome}</td>
              <td style="border: 1px solid #ddd; padding: 10px;">${p.estoque}</td>
              <td style="border: 1px solid #ddd; padding: 10px;">${p.estoque > 5 ? '✓ OK' : p.estoque > 0 ? '⚠ Baixo' : '✕ Zerado'}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
    
    // Opções do html2pdf
    const options = {
      margin: 10,
      filename: `relatorio_estoque_${new Date().getTime()}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { orientation: 'portrait', unit: 'mm', format: 'a4' }
    };
    
    // Gerar PDF
    html2pdf().set(options).from(element).save();
    mostrarNotificacao('Relatório exportado para PDF com sucesso!', 'success');
  } catch (erro) {
    console.error('Erro ao gerar PDF:', erro);
    mostrarNotificacao('Erro ao gerar PDF. Tente novamente.', 'error');
  }
}

// ===== BACKUP E RESTAURAÇÃO =====
function exportarBackup() {
  try {
    const backup = {
      dataExportacao: new Date().toISOString(),
      produtos: produtos,
      entradas: entradas,
      saidas: saidas,
      proximoIdProduto: proximoIdProduto
    };
    
    const json = JSON.stringify(backup, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `backup_estoque_${new Date().getTime()}.json`;
    link.click();
    URL.revokeObjectURL(url);
    
    mostrarNotificacao('Backup exportado com sucesso!', 'success');
  } catch (erro) {
    console.error('Erro ao exportar backup:', erro);
    mostrarNotificacao('Erro ao exportar backup. Tente novamente.', 'error');
  }
}

function abrirSeletorArquivo() {
  document.getElementById('arquivo-upload').click();
}

function importarBackup(event) {
  const arquivo = event.target.files[0];
  if (!arquivo) return;
  
  const leitor = new FileReader();
  leitor.onload = function(e) {
    try {
      const backup = JSON.parse(e.target.result);
      
      // Validar estrutura do backup
      if (!backup.produtos || !backup.entradas || !backup.saidas) {
        mostrarNotificacao('Arquivo de backup inválido!', 'error');
        return;
      }
      
      // Pedir confirmação
      pedirConfirmacao(
        'Tem certeza que deseja restaurar este backup? Os dados atuais serão substituídos.',
        () => {
          produtos = backup.produtos || [];
          entradas = backup.entradas || [];
          saidas = backup.saidas || [];
          proximoIdProduto = backup.proximoIdProduto || 1;
          
          salvarDados();
          atualizarTabelaProdutos();
          atualizarTabelaEntradas();
          atualizarTabelaSaidas();
          preencherSelects();
          carregarDashboard();
          
          mostrarNotificacao('Backup restaurado com sucesso!', 'success');
          event.target.value = '';
        }
      );
    } catch (erro) {
      console.error('Erro ao importar backup:', erro);
      mostrarNotificacao('Erro ao ler arquivo. Verifique se é um JSON válido.', 'error');
      event.target.value = '';
    }
  };
  leitor.readAsText(arquivo);
}
