document.addEventListener('DOMContentLoaded', () => {
    const btnShowLogin = document.getElementById('btnShowLogin');
    const btnShowPatient = document.getElementById('btnShowPatient');
    const btnShowSession = document.getElementById('btnShowSession');
  
    const views = {
      loginView: document.getElementById('loginView'),
      patientView: document.getElementById('patientView'),
      sessionView: document.getElementById('sessionView'),
    };
  
    // Helper function to hide all views except the chosen one
    function showView(viewId) {
      Object.keys(views).forEach((id) => {
        views[id].style.display = id === viewId ? 'block' : 'none';
      });
      // Update active nav link styling
      [btnShowLogin, btnShowPatient, btnShowSession].forEach((btn) => {
        btn.classList.remove('active');
      });
      if (viewId === 'loginView') btnShowLogin.classList.add('active');
      if (viewId === 'patientView') btnShowPatient.classList.add('active');
      if (viewId === 'sessionView') btnShowSession.classList.add('active');
    }
  
    // Event listeners for nav buttons
    btnShowLogin.addEventListener('click', () => showView('loginView'));
    btnShowPatient.addEventListener('click', () => showView('patientView'));
    btnShowSession.addEventListener('click', () => showView('sessionView'));
  });
  