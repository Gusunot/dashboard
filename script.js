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

// Inicialização do sistema
window.addEventListener('DOMContentLoaded', () => {
inicializarPeriodo();
carregarPerfil();
atualizarTela();
configurarTema();
inicializarPWA();
});

// Configuração de Tema (Claro / Escuro)
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

// Inicializa a estrutura de dados para o período atual
function inicializarPeriodo() {
if (!dados[anoAtual]) dados[anoAtual] = {};
if (!dados[anoAtual][mesAtual]) dados[anoAtual][mesAtual] = [];
document.getElementById('labelPeriodo').innerText = `${mesesNome[mesAtual]} ${anoAtual}`;
}

function calcularTotaisAno() {
  let totalEntradas = 0;
  let totalSaidas = 0;

  if (!dados[anoAtual]) return { totalEntradas, totalSaidas };

  for (let mes = 0; mes < 12; mes++) {
    if (dados[anoAtual][mes]) {
      dados[anoAtual][mes].forEach(item => {
        if (item.tipo === "entrada") {
          totalEntradas += item.valor;
        } else {
          totalSaidas += item.valor;
        }
      });
    }
  }


  return { totalEntradas, totalSaidas };
}

function atualizarPreviewIconeApp() {
  const foto = localStorage.getItem("user_photo");

  if (!foto) return;

  // preview visual (opcional)
  document.querySelector("link[rel='manifest']").href = "manifest.json";

  console.log("Preview do ícone atualizado (visual apenas)");

 atualizarPreviewIconeApp();
}

 
function atualizarResumoAnual() {
  const { totalEntradas, totalSaidas } = calcularTotaisAno();
  const saldo = totalEntradas - totalSaidas;

  console.log("Resumo do ano:", {
    entradas: totalEntradas,
    saidas: totalSaidas,
    saldo
  });
}

// Navegação entre meses
// Navegação entre meses (Limitada de 2026 até 2035)
function mudarMes(direcao) {
  let proximoMes = mesAtual + direcao;
  let proximoAno = anoAtual;

  if (proximoMes > 11) {
    proximoMes = 0;
    proximoAno++;
  }

  if (proximoMes < 0) {
    proximoMes = 11;
    proximoAno--;
  }

  // limite de anos
  if (proximoAno < 2026 || proximoAno > 2045) {
    console.log("Limite de data atingido (2026 - 2045)");
    return;
  }

  mesAtual = proximoMes;
  anoAtual = proximoAno;

  inicializarPeriodo();
  atualizarTela();
}

// Adiciona uma nova transação
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

// Salva os dados no localStorage
function salvar() {
localStorage.setItem('finandash_dados', JSON.stringify(dados));
}

// Renderiza a tabela e atualiza os cards de resumo
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
  const { totalEntradas, totalSaidas } = calcularTotaisAno();
const saldoAno = totalEntradas - totalSaidas;

document.getElementById('totalAno').innerText =
  `R$ ${saldoAno.toFixed(2)}`;
}

// Edita o nome/descrição de uma transação
function editar(index) {
const item = dados[anoAtual][mesAtual][index];
const novaDescricao = prompt('Editar descrição:', item.descricao);

if (novaDescricao !== null && novaDescricao.trim() !== "") {
item.descricao = novaDescricao;
salvar();
atualizarTela(); 
}
}

// Remove uma transação
function deletar(index) {
if(confirm("Tem certeza que deseja apagar essa transação?")) {
dados[anoAtual][mesAtual].splice(index, 1);
salvar();
atualizarTela();
}
}

// Controla o Gráfico (Respeitando a altura máxima do CSS)
// Controla o Gráfico
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
maintainAspectRatio: false, // Fundamental para obedecer a altura limite do CSS
maintainAspectRatio: false,
plugins: {
legend: { labels: { color: corTexto, font: { family: 'Poppins' } } }
}
}
});
}

// Carrega e manipula os dados do Perfil (Nome e Foto)
// Carrega e manipula os dados do Perfil
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

  if (file) {
    const reader = new FileReader();

    reader.onloadend = () => {
      imgFoto.src = reader.result;

      // só salva a imagem
      localStorage.setItem('user_photo', reader.result);
    };

    reader.readAsDataURL(file);
  }
});
}

// GESTÃO COMPLETA PWA (Correção Absoluta Mobile)
// GESTÃO COMPLETA PWA
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

// Só exibe se não tiver sido ocultado manualmente nesta sessão
// Só exibe se não foi ocultado na sessão atual
if (!sessionStorage.getItem('pwa_banner_oculto')) {
if (banner) banner.style.display = 'flex';
if (banner) banner.style.setProperty('display', 'flex', 'important');
}
});

// Ação do Botão de Instalar
// Ação de Instalação
const btnInstalar = document.getElementById('btn-instalar-app');
if (btnInstalar) {
btnInstalar.addEventListener('click', () => {
if (deferredPrompt) {
deferredPrompt.prompt();
deferredPrompt.userChoice.then((choiceResult) => {
if (choiceResult.outcome === 'accepted') {
console.log('App Instalado pelo usuário.');
console.log('App instalado.');
}
if (banner) banner.style.display = 'none';
if (banner) banner.style.setProperty('display', 'none', 'important');
deferredPrompt = null;
});
}
});
}

// Função interna unificada para fechar e sumir com o banner
// Função estrita de Fechamento do Banner
function fecharBannerPWA(e) {
if (e) {
e.preventDefault();
e.stopPropagation(); // Impede o clique de se espalhar para o botão de baixo
e.stopPropagation();
}
sessionStorage.setItem('pwa_banner_oculto', 'true');
if (banner) {
banner.style.display = 'none';
banner.style.setProperty('display', 'none', 'important');
}
sessionStorage.setItem('pwa_banner_oculto', 'true');
}

// Captura o fechamento manual aplicando tanto em cliques quanto em toques de tela diretos
const btnFechar = document.getElementById('btn-fechar-pwa');
if (btnFechar) {
btnFechar.addEventListener('click', fecharBannerPWA, { passive: false });
btnFechar.addEventListener('touchstart', fecharBannerPWA, { passive: false });
}
}
