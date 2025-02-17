document.addEventListener('DOMContentLoaded', () => {
  const authContainer = document.querySelector('#authContainer');

  if (!authContainer) {
    console.error("❌ Auth container not found in the HTML.");
    return;
  }

  // Dynamically generate the form and insert it into the DOM
  authContainer.innerHTML = `
    <h3>Enter Credentials to Connect</h3>
    <form id="authForm">
      <div class="mb-3">
        <label for="consumerKey" class="form-label">OAuth Consumer Key</label>
        <input type="text" id="consumerKey" class="form-control" required>
      </div>
      <div class="mb-3">
        <label for="consumerSecret" class="form-label">OAuth Consumer Secret</label>
        <input type="password" id="consumerSecret" class="form-control" required>
      </div>
      <div class="mb-3">
        <label for="email" class="form-label">Email</label>
        <input type="email" id="email" class="form-control" required>
      </div>
      <div class="mb-3">
        <label for="password" class="form-label">Password</label>
        <input type="password" id="password" class="form-control" required>
      </div>
      <button type="submit" class="btn btn-primary">Connect</button>
    </form>
    <p id="connectionStatus" class="mt-3 text-info">Waiting for user input...</p>
  `;

  const authForm = document.querySelector('#authForm');
  const connectionStatus = document.querySelector('#connectionStatus');

  authForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const consumerKey = document.querySelector('#consumerKey').value;
    const consumerSecret = document.querySelector('#consumerSecret').value;
    const email = document.querySelector('#email').value;
    const password = document.querySelector('#password').value;

    const apiUrl = "https://api.dev.madglove.extrahorizon.io/auth/v2/oauth1/tokens";
    connectionStatus.textContent = 'Connecting to Extra Horizon...';

    try {
      const { token, tokenSecret } = await authenticate(
        apiUrl,
        consumerKey,
        consumerSecret,
        email,
        password
      );

      connectionStatus.textContent = 'Connected successfully!';
      connectionStatus.classList.remove('text-danger');
      connectionStatus.classList.add('text-success');

      console.log('🔑 Token:', token);
      console.log('🔒 Token Secret:', tokenSecret);
      alert(`Connected successfully!\nToken: ${token}\nSecret: ${tokenSecret}`);

      // Make token available globally
      window.currentToken = token;
      window.currentTokenSecret = tokenSecret;

      // Update the status bar
      window.updateBackendStatus('Logged in to backend');

    } catch (error) {
      console.error('❌ Connection failed:', error);
      connectionStatus.textContent = 'Connection failed. Check console for details.';
      connectionStatus.classList.remove('text-success');
      connectionStatus.classList.add('text-danger');

      // Update global status bar to reflect failure
      window.updateBackendStatus('Failed to login');
    }
  });

  async function authenticate(apiUrl, consumerKey, consumerSecret, email, password) {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        consumer_key: consumerKey,
        consumer_secret: consumerSecret,
        email: email,
        password: password
      })
    });

    const responseText = await response.text();

    if (!response.ok) {
      throw new Error(`Authentication failed: ${response.status} - ${responseText}`);
    }

    const data = JSON.parse(responseText);
    return { token: data.token, tokenSecret: data.tokenSecret };
  }
});
