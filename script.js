import { initializeApp }
  leitor.readAsDataURL(arquivo);
});

document.getElementById('toggleTema')
.onclick = ()=>{

  document.body.classList.toggle('light');

  salvarFirestore();
};

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

window.registrar = registrar;

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

window.login = login;

onAuthStateChanged(auth,(user)=>{

  if(user){

    document
    .getElementById('loginTela')
    .style.display = 'none';

    carregarDadosFirestore(user.uid);

  }else{

    document
    .getElementById('loginTela')
    .style.display = 'flex';
  }
});

iniciarMeses();

atualizarTela();
