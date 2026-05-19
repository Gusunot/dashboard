const meses=[
'Jan','Fev','Mar','Abr','Mai','Jun',
'Jul','Ago','Set','Out','Nov','Dez'
];

let ano=new Date().getFullYear();
let mes=new Date().getMonth();

let dados=JSON.parse(localStorage.getItem("fin"))||{};

/* PERFIL */
const nome=document.getElementById("nome");

nome.value=localStorage.getItem("nome")||"";

nome.oninput=()=>{
localStorage.setItem("nome",nome.value);
};

/* FOTO */
document.getElementById("fotoInput").onchange=(e)=>{
let r=new FileReader();
r.onload=()=>{
fotoPerfil.src=r.result;
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
function add(){
get().push({
d:desc.value,
v:+valor.value,
t:tipo.value,
c:cat.value
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

let l=get();

let ent=0,sai=0;

table.innerHTML="";

l.forEach((x,i)=>{

if(x.t=="entrada")ent+=x.v;
else sai+=x.v;

table.innerHTML+=`
<tr>
<td>${x.d}</td>
<td>${x.c}</td>
<td>${x.t}</td>
<td>${x.v}</td>
<td><button onclick="del(${i})">X</button></td>
</tr>`;
});

receitas.innerText=ent;
despesas.innerText=sai;
saldo.innerText=ent-sai;
qtd.innerText=l.length;

graf(ent,sai);
}

/* GRAFICO */
let p,l;

function graf(ent,sai){

if(p)p.destroy();
if(l)l.destroy();

p=new Chart(pizza,{
type:'doughnut',
data:{labels:['E','S'],datasets:[{data:[ent,sai]}]}
});

l=new Chart(linha,{
type:'line',
data:{labels:meses,
datasets:[{data:Array(12).fill(0)}]}
});
}

/* EXPORT */
function exportar(){
let blob=new Blob([JSON.stringify(dados)],{type:"application/json"});
let a=document.createElement("a");
a.href=URL.createObjectURL(blob);
a.download="backup.json";
a.click();
}

/* IMPORT */
document.getElementById("importar").onchange=(e)=>{
let r=new FileReader();
r.onload=()=>{
dados=JSON.parse(r.result);
save();
update();
};
r.readAsText(e.target.files[0]);
};

update();
