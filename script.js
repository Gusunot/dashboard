// CONFIGURAÇÃO DE DATA GLOBAL
let dataAtual = new Date();
let mesAtual = dataAtual.getMonth();
let anoAtual = dataAtual.getFullYear();

const mesesNome = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

let dados = JSON.parse(localStorage.getItem('finandash_dados')) || {};
let graficoInstancia = null;

window.addEventListener('DOMContentLoaded', () => {
  inicializarPeriodo();
  carregarPerfil();
  atualizarTela();
  configurarTema();
  inicializarPWA();
});

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
    atualizarGrafico();
  });
}

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

function salvar() {
  localStorage.setItem('finandash_dados', JSON.stringify(dados));
}

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

function editar(index) {
  const item = dados[anoAtual][mesAtual][index];
  const novaDescricao = prompt('Editar descrição:', item.descricao);

  if (novaDescricao !== null && novaDescricao.trim() !== "") {
    item.descricao = novaDescricao;
    salvar();
    atualizarTela(); 
  }
}

function deletar(index) {
  if(confirm("Tem certeza que deseja apagar essa transação?")) {
    dados[anoAtual][mesAtual].splice(index, 1);
    salvar();
    atualizarTela();
  }
}

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
      maintainAspectRatio: false, // Permite que ele obedeça a altura máxima do contêiner CSS
      plugins: {
        legend: { labels: { color: corTexto, font: { family: 'Poppins' } } }
      }
    }
  });
}

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

// GESTÃO PWA ATUALIZADA (Com ação de fechar)
// GESTÃO PWA ATUALIZADA (Correção do botão fechar)
let deferredPrompt;
function inicializarPWA() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js')
      .then(() => console.log('Service Worker Ativo'))
      .catch(err => console.error('Erro SW:', err));
  }

  const banner = document.getElementById('pwa-install-banner');

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    
    // Só mostra o banner se o usuário não tiver fechado ele nesta sessão atual
    if (!sessionStorage.getItem('pwa_banner_oculto')) {
      banner.style.display = 'flex';
    }
  });

  // Ação de Instalar
  const btnInstalar = document.getElementById('btn-instalar-app');
  if (btnInstalar) {
    btnInstalar.addEventListener('click', () => {
      if (deferredPrompt) {
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then((choiceResult) => {
          if (choiceResult.outcome === 'accepted') {
            console.log('App Instalado pelo usuário.');
          }
          banner.style.display = 'none';
          deferredPrompt = null;
        });
      }
    });
  }

  // Ação de fechar o banner manual (Garantida)
  const btnFechar = document.getElementById('btn-fechar-pwa');
  if (btnFechar) {
    btnFechar.onclick = function(e) {
      e.preventDefault();
      e.stopPropagation();
      banner.style.display = 'none';
      sessionStorage.setItem('pwa_banner_oculto', 'true');
    };
  }
}
