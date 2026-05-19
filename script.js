import { initializeApp }
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut
}
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
  getFirestore,
  doc,
  setDoc,
  getDoc
}
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {

  apiKey: "SUA_API_KEY",

  authDomain: "SEU_AUTH_DOMAIN",

  projectId: "SEU_PROJECT_ID",

  storageBucket: "SEU_BUCKET",

  messagingSenderId: "SEU_ID",

  appId: "SEU_APP_ID"
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

const db = getFirestore(app);

const meses = [

  'Janeiro','Fevereiro','Março','Abril',
  'Maio','Junho','Julho','Agosto',
  'Setembro','Outubro','Novembro','Dezembro'
];

/* DATA */

let anoAtual = new Date().getFullYear();

let mesAtual = new Date().getMonth();

/* DADOS */

let dados =
JSON.parse(localStorage.getItem('financePro')) || {};

/* ELEMENTOS */

const tabela =
document.getElementById('tabela');

const receitas =
document.getElementById('receitas');

const despesas =
document.getElementById('despesas');

const saldo =
document.getElementById('saldo');

const quantidade =
document.getElementById('quantidade');

const tituloMes =
document.getElementById('tituloMes');

const anoTexto =
document.getElementById('anoAtual');

const toast =
document.getElementById('toast');

/* PERFIL */

const nomeUsuario =
document.getElementById('nomeUsuario');

const fotoPerfil =
document.getElementById('fotoPerfil');

const inputFoto =
document.getElementById('inputFoto');

/* CARREGAR PERFIL */

nomeUsuario.value =
localStorage.getItem('nomeUsuario')
|| 'digite seu nome aqui';

nomeUsuario.addEventListener('input', ()=>{

  localStorage.setItem(
    'nomeUsuario',
    nomeUsuario.value
  );
});

const fotoSalva =
localStorage.getItem('fotoPerfil');

if(fotoSalva){

  fotoPerfil.src = fotoSalva;
}

inputFoto.addEventListener('change',(e)=>{

  const arquivo = e.target.files[0];

  const leitor = new FileReader();

  leitor.onload = ()=>{

    fotoPerfil.src = leitor.result;

    localStorage.setItem(
      'fotoPerfil',
      leitor.result
    );
  };

  leitor.readAsDataURL(arquivo);
});

/* MESES */

function iniciarMeses(){

  const lista =
  document.getElementById('listaMeses');

  lista.innerHTML = '';

  meses.forEach((mes,index)=>{

    const botao =
    document.createElement('button');

    botao.innerHTML = mes;

    if(index === mesAtual){

      botao.classList.add('ativo');
    }

    botao.onclick = ()=>{

      mesAtual = index;

      iniciarMeses();

      atualizarTela();
    };

    lista.appendChild(botao);
  });
}

/* TROCAR ANO */

function trocarAno(valor){

  anoAtual += valor;

  atualizarTela();
}

/* SALVAR */

function salvar(){

  localStorage.setItem(
    'financePro',
    JSON.stringify(dados)
  );
}

/* TOAST */

function mostrarToast(texto){

  toast.innerHTML = texto;

  toast.classList.add('show');

  setTimeout(()=>{

    toast.classList.remove('show');

  },2500);
}

/* GARANTIR ANO/MES */

function garantirEstrutura(){

  if(!dados[anoAtual]){

    dados[anoAtual] = {};
  }

  if(!dados[anoAtual][mesAtual]){

    dados[anoAtual][mesAtual] = [];
  }
}

/* ADICIONAR */

function adicionarTransacao(){

  garantirEstrutura();

  const descricao =
  document.getElementById('descricao').value;

  const valor = parseFloat(
    document.getElementById('valor').value
  );

  const tipo =
  document.getElementById('tipo').value;

  const categoria =
  document.getElementById('categoria').value;

  if(descricao === '' || isNaN(valor)){

    mostrarToast('Preencha os campos');

    return;
  }

  dados[anoAtual][mesAtual].push({

    descricao,
    valor,
    tipo,
    categoria
  });

  salvar();

  document.getElementById('descricao').value = '';

  document.getElementById('valor').value = '';

  mostrarToast('Transação adicionada');

  atualizarTela();
}

/* REMOVER */

function remover(index){

  dados[anoAtual][mesAtual]
  .splice(index,1);

  salvar();

  mostrarToast('Transação removida');

  atualizarTela();
}

/* EDITAR */

function editar(index){

  const item =
  dados[anoAtual][mesAtual][index];

  const novaDescricao =
  prompt('Editar descrição',item.descricao);

  if(novaDescricao !== null){

    item.descricao = novaDescricao;
  }

  salvar();

  atualizarTela();
}

/* TEMA */

document.getElementById('toggleTema')
.onclick = ()=>{

  document.body.classList.toggle('light');

  localStorage.setItem(
    'temaClaro',
    document.body.classList.contains('light')
  );
};

if(localStorage.getItem('temaClaro') === 'true'){

  document.body.classList.add('light');
}

/* GRAFICOS */

let pizza;
let linha;

function atualizarGraficos(entrada,saida){

  if(pizza) pizza.destroy();
  if(linha) linha.destroy();

  pizza = new Chart(

    document.getElementById('graficoPizza'),

    {
      type:'doughnut',

      data:{

        labels:['Receitas','Despesas'],

        datasets:[{

          data:[entrada,saida],

          backgroundColor:[
            '#22c55e',
            '#ef4444'
          ],

          borderWidth:0
        }]
      },

      options:{

        responsive:true,

        maintainAspectRatio:false
      }
    }
  );

  const saldoAnual = [];

  for(let i=0;i<12;i++){

    let saldoMes = 0;

    if(
      dados[anoAtual] &&
      dados[anoAtual][i]
    ){

      dados[anoAtual][i]
      .forEach(item=>{

        if(item.tipo === 'entrada'){

          saldoMes += item.valor;

        }else{

          saldoMes -= item.valor;
        }
      });
    }

    saldoAnual.push(saldoMes);
  }

  linha = new Chart(

    document.getElementById('graficoLinha'),

    {
      type:'line',

      data:{

        labels:meses,

        datasets:[{

          label:'Saldo',

          data:saldoAnual,

          borderColor:'#38bdf8',

          backgroundColor:
          'rgba(56,189,248,0.1)',

          fill:true,

          tension:0.4
        }]
      },

      options:{

        responsive:true,

        maintainAspectRatio:false
      }
    }
  );
}

/* ATUALIZAR */

function atualizarTela(){

  garantirEstrutura();

  tabela.innerHTML = '';

  anoTexto.innerHTML = anoAtual;

  tituloMes.innerHTML =
  `${meses[mesAtual]} / ${anoAtual}`;

  let entrada = 0;
  let saida = 0;

  const pesquisa =
  document.getElementById('pesquisa')
  .value.toLowerCase();

  const filtroCategoria =
  document.getElementById('filtroCategoria')
  .value;

  const lista =
  dados[anoAtual][mesAtual]
  .filter(item=>{

    const pesquisaOk =
    item.descricao.toLowerCase()
    .includes(pesquisa);

    const categoriaOk =
    filtroCategoria === 'todos' ||
    item.categoria === filtroCategoria;

    return pesquisaOk && categoriaOk;
  });

  lista.forEach((item,index)=>{

    const linha =
    document.createElement('tr');

    linha.innerHTML = `

      <td>${item.descricao}</td>

      <td>${item.categoria}</td>

      <td>${item.tipo}</td>

      <td>
        R$ ${item.valor.toFixed(2)}
      </td>

      <td>

        <button class="editar"
        onclick="editar(${index})">

          Editar

        </button>

        <button class="excluir"
        onclick="remover(${index})">

          Excluir

        </button>

      </td>
    `;

    tabela.appendChild(linha);

    if(item.tipo === 'entrada'){

      entrada += item.valor;

    }else{

      saida += item.valor;
    }
  });

  receitas.innerHTML =
  `R$ ${entrada.toFixed(2)}`;

  despesas.innerHTML =
  `R$ ${saida.toFixed(2)}`;

  saldo.innerHTML =
  `R$ ${(entrada - saida).toFixed(2)}`;

  quantidade.innerHTML =
  lista.length;

  atualizarGraficos(entrada,saida);
}

/* EVENTOS */

document.getElementById('pesquisa')
.addEventListener('input', atualizarTela);

document.getElementById('filtroCategoria')
.addEventListener('change', atualizarTela);

/* INICIAR */

iniciarMeses();

atualizarTela();

async function registrar(){

  const email =
  document.getElementById('email').value;

  const senha =
  document.getElementById('senha').value;

  try{

    await createUserWithEmailAndPassword(
      auth,
      email,
      senha
    );

    mostrarToast('Conta criada');

  }catch(error){

    alert(error.message);
  }
}

async function login(){

  const email =
  document.getElementById('email').value;

  const senha =
  document.getElementById('senha').value;

  try{

    await signInWithEmailAndPassword(
      auth,
      email,
      senha
    );

  }catch(error){

    alert(error.message);
  }
}

onAuthStateChanged(auth,(user)=>{

  if(user){

    document
    .getElementById('loginTela')
    .style.display = 'none';

  }else{

    document
    .getElementById('loginTela')
    .style.display = 'flex';
  }
});
