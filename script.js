// ==========================================
// ESTADO E VARIÁVEIS GLOBAIS DO SISTEMA
// ==========================================
let transacoes = JSON.parse(localStorage.getItem('transacoes')) || [];
let dataAtual = new Date(); // Controla o período atual exibido
let graficoInstancia = null; // Guarda a referência do Chart.js para destruição/recriação

// ==========================================
// INICIALIZAÇÃO DA APLICAÇÃO
// ==========================================
window.addEventListener('DOMContentLoaded', () => {
  inicializarSeletorData();
  carregarPerfil();
  atualizarDashboard();
});

// Preenche e configura os seletores suspensos (Mês/Ano)
function inicializarSeletorData() {
  const selectMes = document.getElementById('selectMes');
  const selectAno = document.getElementById('selectAno');
  
  if (!selectMes || !selectAno) return;

  const anoCorrente = new Date().getFullYear();
  
  // Limpa o select de anos e cria opções (5 anos para trás, 2 para frente)
  selectAno.innerHTML = '';
  for (let i = anoCorrente - 5; i <= anoCorrente + 2; i++) {
    let option = document.createElement('option');
    option.value = i;
    option.text = i;
    selectAno.appendChild(option);
  }
  
  // Sincroniza o valor visual dos seletores com o estado real do app
  selectMes.value = dataAtual.getMonth();
  selectAno.value = dataAtual.getFullYear();
}

// Disparado quando o usuário altera o Mês ou Ano nos menus suspensos
function atualizarPeriodoPorSelect() {
  const mesSelecionado = parseInt(document.getElementById('selectMes').value);
  const anoSelecionado = parseInt(document.getElementById('selectAno').value);
  
  // Modifica nossa data global de controle
  dataAtual.setMonth(mesSelecionado);
  dataAtual.setFullYear(anoSelecionado);
  
  // Atualiza todo o painel com as novas datas
  atualizarDashboard();
}

// Garante o alinhamento visual caso o sistema force mudanças externas
function sincronizarSelectsVisuais() {
  const selectMes = document.getElementById('selectMes');
  const selectAno = document.getElementById('selectAno');
  if (selectMes && selectAno) {
    selectMes.value = dataAtual.getMonth();
    selectAno.value = dataAtual.getFullYear();
  }
}

// ==========================================
// CONTROLADORES DA VISÃO (RENDERIZAÇÃO)
// ==========================================
function atualizarDashboard() {
  sincronizarSelectsVisuais();

  // Filtra transações correspondentes ao mês e ano selecionados
  const transacoesFiltradas = transacoes.filter(t => {
    const dataT = new Date(t.data);
    return dataT.getMonth() === dataAtual.getMonth() && dataT.getFullYear() === dataAtual.getFullYear();
  });

  // Cálculos de Totais
  let entradas = 0;
  let saídas = 0;

  transacoesFiltradas.forEach(t => {
    const v = parseFloat(t.valor);
    if (t.tipo === 'entrada') entradas += v;
    else saídas += v;
  });

  const saldo = entradas - saídas;

  // Renderiza valores na tela
  document.getElementById('totalEntradas').innerText = entradas.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  document.getElementById('totalSaidas').innerText = saídas.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  document.getElementById('totalSaldo').innerText = saldo.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  renderizarTabela(transacoesFiltradas);
  renderizarGrafico(entradas, saídas);
}

function renderizarTabela(lista) {
  const corpo = document.getElementById('corpoTabela');
  corpo.innerHTML = '';

  if (lista.length === 0) {
    corpo.innerHTML = `<tr><td colspan="4" style="text-align:center; color:var(--text-muted);">Nenhuma transação registrada neste período.</td></tr>`;
    return;
  }

  lista.forEach(t => {
    const tr = document.createElement('tr');
    const valorFormatado = parseFloat(t.valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    
    tr.innerHTML = `
      <td>${t.descricao}</td>
      <td class="${t.tipo}">${t.tipo === 'entrada' ? '+' : '-'} ${valorFormatado}</td>
      <td>${t.categoria || 'Outros'}</td>
      <td>
        <button class="btn-acao delete" onclick="removerTransacao('${t.id}')">
          <span class="material-symbols-outlined" style="font-size: 1.2rem;">delete</span>
        </button>
      </td>
    `;
    corpo.appendChild(tr);
  });
}

function renderizarGrafico(entradas, saidas) {
  const ctx = document.getElementById('graficoFinancas');
  if (!ctx) return;

  // Destrói gráfico existente para evitar fantasmas ou bugs visuais ao atualizar dados
  if (graficoInstancia) {
    graficoInstancia.destroy();
  }

  // Se não houver dados, exibe um gráfico vazio equilibrado
  const temDados = entradas > 0 || saidas > 0;

  graficoInstancia = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: temDados ? ['Entradas', 'Saídas'] : ['Sem Dados'],
      datasets: [{
        data: temDados ? [entradas, saidas] : [1, 0],
        backgroundColor: temDados ? ['#00b37e', '#f75a68'] : ['#323238'],
        borderWidth: 0
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: { color: document.body.classList.contains('light-theme') ? '#363f5f' : '#e1e1e6' }
        }
      }
    }
  });
}

// ==========================================
// OPERAÇÕES DO BANCO DE DADOS (LOCALSTORAGE)
// ==========================================
function adicionarTransacao(event) {
  event.preventDefault();

  const descInput = document.getElementById('descTransacao');
  const valorInput = document.getElementById('valorTransacao');
  const tipoSelect = document.getElementById('tipoTransacao');
  const catSelect = document.getElementById('categoriaTransacao');

  // Cria o objeto da nova transação baseada estritamente no mês/ano do seletor ativo
  const nova = {
    id: String(Date.now()),
    descricao: descInput.value,
    valor: parseFloat(valorInput.value),
    tipo: tipoSelect.value,
    categoria: catSelect.value,
    // Registra o dia de hoje caso coincida com o mês, se não, salva no dia 1º daquele mês selecionado
    data: new Date(dataAtual.getFullYear(), dataAtual.getMonth(), new Date().getDate()).toISOString()
  };

  transacoes.push(nova);
  localStorage.setItem('transacoes', JSON.stringify(transacoes));
  
  // Limpa inputs e atualiza a UI
  descInput.value = '';
  valorInput.value = '';
  
  atualizarDashboard();
}

function removerTransacao(id) {
  transacoes = transacoes.filter(t => t.id !== id);
  localStorage.setItem('transacoes', JSON.stringify(transacoes));
  atualizarDashboard();
}

// ==========================================
// TEMA E COSTUMIZAÇÃO DE PERFIL
// ==========================================
function alternarTema() {
  document.body.classList.toggle('light-theme');
  const temaSalvo = document.body.classList.contains('light-theme') ? 'light' : 'dark';
  localStorage.setItem('temaFinanceiro', temaSalvo);
  atualizarDashboard(); // Força o gráfico a adaptar as cores da legenda
}

function carregarPerfil() {
  // Carrega Tema
  if (localStorage.getItem('temaFinanceiro') === 'light') {
    document.body.classList.add('light-theme');
  }

  // Carrega Usuário e Foto
  const nome = localStorage.getItem('perfilNome') || 'Seu Nome';
  const foto = localStorage.getItem('perfilFoto') || 'https://via.placeholder.com/90';
  
  document.getElementById('nomeUsuario').value = nome;
  document.getElementById('fotoPerfil').src = foto;
}

function salvarNomeUsuario(nome) {
  localStorage.setItem('perfilNome', nome);
}

function atualizarFotoPerfil(input) {
  if (input.files && input.files[0]) {
    const reader = new FileReader();
    reader.onload = function(e) {
      document.getElementById('fotoPerfil').src = e.target.result;
      localStorage.setItem('perfilFoto', e.target.result);
    };
    reader.readAsDataURL(input.files[0]);
  }
}
