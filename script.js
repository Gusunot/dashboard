const meses = [
'Janeiro','Fevereiro','Março','Abril',
'Maio','Junho','Julho','Agosto',
'Setembro','Outubro','Novembro','Dezembro'
];

let anoAtual = new Date().getFullYear();
let mesAtual = new Date().getMonth();

/* DADOS */
let dados = JSON.parse(localStorage.getItem('financePro')) || {};

/* ELEMENTOS */
const tabela = document.getElementById('tabela');
const receitas = document.getElementById('receitas');
const despesas = document.getElementById('despesas');
const saldo = document.getElementById('saldo');
const quantidade = document.getElementById('quantidade');
const tituloMes = document.getElementById('tituloMes');
const anoTexto = document.getElementById('anoAtual');

/* PERFIL */
const nomeUsuario = document.getElementById('nomeUsuario');
const fotoPerfil = document.getElementById('fotoPerfil');
const inputFoto = document.getElementById('inputFoto');

/* INPUTS */
const descricao = document.getElementById('descricao');
const valor = document.getElementById('valor');
const tipo = document.getElementById('tipo');
const categoria = document.getElementById('categoria');
const pesquisa = document.getElementById('pesquisa');
const filtroCategoria = document.getElementById('filtroCategoria');

/* TOAST */
const toast = document.getElementById('toast');

/* =========================
   PERFIL
========================= */

nomeUsuario.value = localStorage.getItem('nomeUsuario') || '';

nomeUsuario.addEventListener('input', () => {
localStorage.setItem('nomeUsuario', nomeUsuario.value);
});

const fotoSalva = localStorage.getItem('fotoPerfil');

if (fotoSalva) {
fotoPerfil.src = fotoSalva;
}

inputFoto.addEventListener('change', (e) => {
const file = e.target.files[0];
const reader = new FileReader();

reader.onload = () => {
fotoPerfil.src = reader.result;
localStorage.setItem('fotoPerfil', reader.result);
};

reader.readAsDataURL(file);
});

/* =========================
   ESTRUTURA
========================= */

function garantirEstrutura() {
if (!dados[anoAtual]) dados[anoAtual] = {};
if (!dados[anoAtual][mesAtual]) dados[anoAtual][mesAtual] = [];
}

function getMes() {
garantirEstrutura();
return dados[anoAtual][mesAtual];
}

/* =========================
   SALVAR
========================= */

function salvar() {
localStorage.setItem('financePro', JSON.stringify(dados));
}

/* =========================
   TOAST
========================= */

function mostrarToast(msg) {
toast.innerText = msg;
toast.classList.add('show');

setTimeout(() => {
toast.classList.remove('show');
}, 2000);
}

/* =========================
   ADICIONAR
========================= */

function adicionarTransacao() {

if (!descricao.value || !valor.value) {
mostrarToast('Preencha os campos');
return;
}

getMes().push({
descricao: descricao.value,
valor: parseFloat(valor.value),
tipo: tipo.value,
categoria: categoria.value
});

descricao.value = '';
valor.value = '';

salvar();
atualizarTela();

mostrarToast('Adicionado!');
}

/* =========================
   REMOVER
========================= */

function remover(index) {
getMes().splice(index, 1);
salvar();
atualizarTela();
mostrarToast('Removido!');
}

/* =========================
   EDITAR
========================= */

function editar(index) {
let item = getMes()[index];

let novo = prompt('Editar descrição', item.descricao);

if (novo !== null) {
item.descricao = novo;
salvar();
atualizarTela();
}
}

/* =========================
   ANO / MES
========================= */

function trocarAno(v) {
anoAtual += v;
atualizarTela();
}

function iniciarMeses() {
const lista = document.getElementById('listaMeses');
lista.innerHTML = '';

meses.forEach((m, i) => {

const btn = document.createElement('button');
btn.innerText = m;

if (i === mesAtual) btn.classList.add('ativo');

btn.onclick = () => {
mesAtual = i;
atualizarTela();
};

lista.appendChild(btn);
});
}

/* =========================
   GRAFICOS
========================= */

let pizza;
let linha;

function atualizarGraficos(entrada, saida) {

if (!pizza) {
pizza = new Chart(document.getElementById('graficoPizza'), {
type: 'doughnut',
data: {
labels: ['Receitas', 'Despesas'],
datasets: [{
data: [entrada, saida],
backgroundColor: ['#22c55e', '#ef4444']
}]
},
options: { responsive: true, maintainAspectRatio: false }
});
} else {
pizza.data.datasets[0].data = [entrada, saida];
pizza.update();
}

let saldoMeses = Array(12).fill(0);

for (let i = 0; i < 12; i++) {
if (dados[anoAtual]?.[i]) {
dados[anoAtual][i].forEach(t => {
saldoMeses[i] += t.tipo === 'entrada' ? t.valor : -t.valor;
});
}
}

if (!linha) {
linha = new Chart(document.getElementById('graficoLinha'), {
type: 'line',
data: {
labels: meses,
datasets: [{
label: 'Saldo',
data: saldoMeses,
borderColor: '#38bdf8',
fill: true
}]
},
options: { responsive: true, maintainAspectRatio: false }
});
} else {
linha.data.datasets[0].data = saldoMeses;
linha.update();
}
}

/* =========================
   TELA
========================= */

function atualizarTela() {

garantirEstrutura();

let lista = getMes();

let entrada = 0;
let saida = 0;

tabela.innerHTML = '';

const filtro = pesquisa.value.toLowerCase();
const cat = filtroCategoria.value;

lista
.filter(t => {
return (
t.descricao.toLowerCase().includes(filtro) &&
(cat === 'todos' || t.categoria === cat)
);
})
.forEach((t, i) => {

if (t.tipo === 'entrada') entrada += t.valor;
else saida += t.valor;

tabela.innerHTML += `
<tr>
<td>${t.descricao}</td>
<td>${t.categoria}</td>
<td>${t.tipo}</td>
<td>R$ ${t.valor.toFixed(2)}</td>
<td>
<button onclick="editar(${i})">Editar</button>
<button onclick="remover(${i})">Excluir</button>
</td>
</tr>
`;
});

receitas.innerText = `R$ ${entrada.toFixed(2)}`;
despesas.innerText = `R$ ${saida.toFixed(2)}`;
saldo.innerText = `R$ ${(entrada - saida).toFixed(2)}`;
quantidade.innerText = lista.length;

anoTexto.innerText = anoAtual;
tituloMes.innerText = `${meses[mesAtual]} / ${anoAtual}`;

atualizarGraficos(entrada, saida);
}

/* =========================
   EVENTOS
========================= */

pesquisa.addEventListener('input', atualizarTela);
filtroCategoria.addEventListener('change', atualizarTela);

/* =========================
   EXPORT / IMPORT
========================= */

function exportarDados() {
let blob = new Blob([JSON.stringify(dados)], { type: 'application/json' });
let a = document.createElement('a');
a.href = URL.createObjectURL(blob);
a.download = 'backup.json';
a.click();
}

document.getElementById('importar').addEventListener('change', (e) => {
let r = new FileReader();

r.onload = () => {
dados = JSON.parse(r.result);
salvar();
atualizarTela();
};

r.readAsText(e.target.files[0]);
});

/* =========================
   INIT
========================= */

iniciarMeses();
atualizarTela();
