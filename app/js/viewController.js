// app/js/viewController.js

document.addEventListener('DOMContentLoaded', () => {
  const btnShowLogin = document.getElementById('btnShowLogin');
  const btnShowPatient = document.getElementById('btnShowPatient');
  const btnShowSession = document.getElementById('btnShowSession');
  const btnShowCamera = document.getElementById('btnShowCamera');
  const btnShowHandModel = document.getElementById('btnShowHandModel'); 

  const views = {
      loginView: document.getElementById('loginView'),
      patientView: document.getElementById('patientView'),
      sessionView: document.getElementById('sessionView'),
      cameraView: document.getElementById('cameraView'),
      handModelView: document.getElementById('handModelView') 
  };

  window.showView = function (viewId) {
      console.log(`Switching to view: ${viewId}`);

      Object.keys(views).forEach((id) => {
          views[id].style.display = id === viewId ? 'block' : 'none';
      });

      [btnShowLogin, btnShowPatient, btnShowSession, btnShowCamera, btnShowHandModel].forEach((btn) => {
          btn.classList.remove('active');
      });

      if (viewId === 'loginView') btnShowLogin.classList.add('active');
      if (viewId === 'patientView') btnShowPatient.classList.add('active');
      if (viewId === 'sessionView') btnShowSession.classList.add('active');
      if (viewId === 'cameraView') btnShowCamera.classList.add('active');
      if (viewId === 'handModelView') btnShowHandModel.classList.add('active'); 

  };

  btnShowLogin.addEventListener('click', () => window.showView('loginView'));
  btnShowPatient.addEventListener('click', () => window.showView('patientView'));
  btnShowSession.addEventListener('click', () => window.showView('sessionView'));
  btnShowCamera.addEventListener('click', () => window.showView('cameraView'));
  btnShowHandModel.addEventListener('click', () => window.showView('handModelView')); 
  
});
