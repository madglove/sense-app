document.addEventListener('DOMContentLoaded', () => {
  const btnShowLogin = document.getElementById('btnShowLogin');
  const btnShowPatient = document.getElementById('btnShowPatient');
  const btnShowSession = document.getElementById('btnShowSession');

  const views = {
    loginView: document.getElementById('loginView'),
    patientView: document.getElementById('patientView'),
    sessionView: document.getElementById('sessionView'),
  };

  // 1. Make showView() global by assigning to window
  window.showView = function (viewId) {
    // Hide all views except the chosen one
    Object.keys(views).forEach((id) => {
      views[id].style.display = (id === viewId) ? 'block' : 'none';
    });

    // Update active nav link styling
    [btnShowLogin, btnShowPatient, btnShowSession].forEach((btn) => {
      btn.classList.remove('active');
    });
    if (viewId === 'loginView')  btnShowLogin.classList.add('active');
    if (viewId === 'patientView') btnShowPatient.classList.add('active');
    if (viewId === 'sessionView') btnShowSession.classList.add('active');
  };

  // 2. Attach click handlers that call window.showView(...)
  btnShowLogin.addEventListener('click', () => window.showView('loginView'));
  btnShowPatient.addEventListener('click', () => window.showView('patientView'));
  btnShowSession.addEventListener('click', () => window.showView('sessionView'));
});
