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
