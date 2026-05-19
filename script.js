// CONFIGURAÇÃO DE DATA GLOBAL
let dataAtual = new Date();
let mesAtual = dataAtual.getMonth();
let anoAtual = dataAtual.getFullYear();

const mesesNome = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

// ESTRUTURA DOS DADOS NA MEMÓRIA
let dados = JSON.parse(localStorage.getItem('finandash_dados')) || {};
let graficoInstancia = null;

// INICIALIZADOR DO APP
window.addEventListener('DOMContentLoaded', () => {
  inicializarPeriodo();
  carregarPerfil();
  atualizarTela();
  configurarTema();
  inicializarPWA();
});

// ALTERNAR TEMA (DARK / LIGHT)
function configurarTema() {
  const btnTema = document.getElementById('btn-tema');
  const iconTema = document.getElementById('icon-tema');
  
  if(localStorage.getItem('theme') === 'light') {
    document.body.classList.remove('dark-theme');
    document.body.classList.add('light-theme');
    iconTema.innerText = 'dark_mode';
  }

  btnTema.addEventListener('click', () => {
    if(document.body.classList.contains('dark-theme')) {
      document.body.classList.remove('dark-theme');
      document.body.classList.add('light-theme');
      iconTema.innerText = 'dark_mode';
      localStorage.setItem('theme', 'light');
    } else {
      document.body.classList.remove('light-theme');
      document.body.classList.add('dark-theme');
      iconTema.innerText = 'light_mode';
      localStorage.setItem('theme', 'dark');
    }
    atualizarGrafico(); // Redesenha o gráfico para ajustar cores de linhas guia
  });
}

// CONTROLE DO PERÍODO (MÊS/ANO)
function inicializarPeriodo() {
  if (!dados[anoAtual]) dados[anoAtual] = {};
  if (!dados[anoAtual][mesAtual]) dados[anoAtual][mesAtual] = [];
  document.getElementById('labelPeriodo').innerText = `${mesesNome[mesAtual]} ${anoAtual}`;
}

function mudarMes(direcao) {
  mesAtual += direcao;
  if (mesAtual > 11) { mesAtual = 0; anoAtual++; }
  if (mesAtual < 0) { mesAtual = 11; anoAtual--; }
  inicializarPeriodo();
  atualizarTela();
}

// ADICIONAR TRANSAÇÃO
function adicionarTransacao(e) {
  e.preventDefault();
  const descricao = document.getElementById('descricao').value;
  const valor = parseFloat(document.getElementById('valor').value);
  const tipo = document.getElementById('tipo').value;
  const categoria = document.getElementById('categoria').value;

  const novaTransacao = { descricao, valor, tipo, categoria, id: Date.now() };
  dados[anoAtual][mesAtual].push(novaTransacao);

  salvar();
  atualizarTela();
  document.getElementById('formTransacao').reset();
}

// SALVAR NO LOCALSTORAGE
function salvar() {
  localStorage.setItem('finandash_dados', JSON.stringify(dados));
}

// REFRESH TOTAL DA TELA (CALCULOS, TABELA E GRÁFICO)
function atualizarTela() {
  const transacoes = dados[anoAtual][mesAtual] || [];
  let entradas = 0;
  let saidas = 0;
  const tabelaCorpo = document.getElementById('tabelaCorpo');
  tabelaCorpo.innerHTML = '';

  transacoes.forEach((item, index) => {
    if(item.tipo === 'entrada') entradas += item.valor;
    else saidas += item.valor;

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${item.descricao}</td>
      <td><span class="tag-cat">${item.categoria}</span></td>
      <td class="${item.tipo}">${item.tipo === 'entrada' ? '+' : '-'} R$ ${item.valor.toFixed(2)}</td>
      <td>
        <button class="btn-acao edit" onclick="editar(${index})"><span class="material-icons-round">edit</span></button>
        <button class="btn-acao delete" onclick="deletar(${index})"><span class="material-icons-round">delete</span></button>
      </td>
    `;
    tabelaCorpo.appendChild(tr);
  });

  const saldo = entradas - saidas;
  document.getElementById('totalEntradas').innerText = `R$ ${entradas.toFixed(2)}`;
  document.getElementById('totalSaidas').innerText = `R$ ${saidas.toFixed(2)}`;
  document.getElementById('totalSaldo').innerText = `R$ ${saldo.toFixed(2)}`;

  atualizarGrafico(entradas, saidas);
}

// CORRIGIDO: FUNÇÃO EDITAR COM FEEDBACK EM TEMPO REAL
function editar(index) {
  const item = dados[anoAtual][mesAtual][index];
  const novaDescricao = prompt('Editar descrição:', item.descricao);

  if (novaDescricao !== null && novaDescricao.trim() !== "") {
    item.descricao = novaDescricao;
    salvar();
    atualizarTela(); 
  }
}

// EXCLUIR TRANSAÇÃO
function deletar(index) {
  if(confirm("Tem certeza que deseja apagar essa transação?")) {
    dados[anoAtual][mesAtual].splice(index, 1);
    salvar();
    atualizarTela();
  }
}

// ATUALIZAR GRÁFICO (CHART.JS)
function atualizarGrafico(entradas = 0, saidas = 0) {
  const ctx = document.getElementById('graficoFinanceiro').getContext('2d');
  const corTexto = document.body.classList.contains('dark-theme') ? '#e1e1e6' : '#363f5f';

  if (graficoInstancia) {
    graficoInstancia.destroy();
  }

  graficoInstancia = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Receitas', 'Despesas'],
      datasets: [{
        data: [entradas, saidas],
        backgroundColor: ['#00b37e', '#f75a68'],
        borderWidth: 0
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { labels: { color: corTexto, font: { family: 'Poppins' } } }
      }
    }
  });
}

// GESTÃO DO PERFIL
function carregarPerfil() {
  const nomeSalvo = localStorage.getItem('user_name');
  const fotoSalva = localStorage.getItem('user_photo');
  const inputNome = document.getElementById('nomeUsuario');
  const imgFoto = document.getElementById('fotoPerfil');
  const inputFoto = document.getElementById('inputFoto');

  if(nomeSalvo) inputNome.value = nomeSalvo;
  if(fotoSalva) imgFoto.src = fotoSalva;

  inputNome.addEventListener('change', () => localStorage.setItem('user_name', inputNome.value));
  
  inputFoto.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if(file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        imgFoto.src = reader.result;
        localStorage.setItem('user_photo', reader.result);
      }
      reader.readAsDataURL(file);
    }
  });
}

// INSTALAÇÃO E REGISTRO DO SERVICE WORKER (PWA)
let deferredPrompt;
function inicializarPWA() {
  if ('serviceWorker' in navigator) {
    // Registra o Service Worker assumindo que ele está na mesma pasta raiz do projeto
    navigator.serviceWorker.register('sw.js')
      .then(() => console.log('Service Worker Registrado com Sucesso!'))
      .catch(err => console.error('Falha ao registrar Service Worker:', err));
  }

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    document.getElementById('pwa-install-banner').style.display = 'flex';
  });

  document.getElementById('btn-instalar-app').addEventListener('click', () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('Usuário aceitou a instalação do App');
        }
        document.getElementById('pwa-install-banner').style.display = 'none';
        deferredPrompt = null;
      });
    }
  });
}
