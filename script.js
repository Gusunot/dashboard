const meses=[
'Jan','Fev','Mar','Abr','Mai','Jun',
'Jul','Ago','Set','Out','Nov','Dez'
];

let ano=new Date().getFullYear();
let mes=new Date().getMonth();

let dados=JSON.parse(localStorage.getItem("fin"))||{};

/* PERFIL */
const nome=document.getElementById("nomeUsuario");

nome.value=localStorage.getItem("nome")||"";

nome.oninput=()=>{
localStorage.setItem("nome",nome.value);
};

/* FOTO */
document.getElementById("inputFoto").onchange=(e)=>{
let r=new FileReader();
r.onload=()=>{
document.getElementById("fotoPerfil").src=r.result;
localStorage.setItem("foto",r.result);
};
r.readAsDataURL(e.target.files[0]);
};

/* BASE */
function get(){
if(!dados[ano])dados[ano]={};
if(!dados[ano][mes])dados[ano][mes]=[];
return dados[ano][mes];
}

/* ADD */
function adicionarTransacao(){
get().push({
desc:descricao.value,
valor:+valor.value,
tipo:tipo.value,
cat:categoria.value
});
save();
update();
}

/* SAVE */
function save(){
localStorage.setItem("fin",JSON.stringify(dados));
}

/* DELETE */
function del(i){
get().splice(i,1);
save();
update();
}

/* UPDATE */
function update(){

let lista=get();

let ent=0,sai=0,maior=0;

tabela.innerHTML="";

lista.forEach((x,i)=>{

if(x.tipo=="entrada")ent+=x.valor;
else sai+=x.valor;

if(x.valor>maior)maior=x.valor;

tabela.innerHTML+=`
<tr>
<td>${x.desc}</td>
<td>${x.cat}</td>
<td>${x.tipo}</td>
<td>${x.valor}</td>
<td><button onclick="del(${i})">X</button></td>
</tr>`;
});

receitas.innerText=ent;
despesas.innerText=sai;
saldo.innerText=ent-sai;
quantidade.innerText=lista.length;
maiorGasto.innerText=maior;
}

update();

/* BACKUP */
function exportarDados(){
let blob=new Blob([JSON.stringify(dados)],{type:"application/json"});
let a=document.createElement("a");
a.href=URL.createObjectURL(blob);
a.download="backup.json";
a.click();
}
