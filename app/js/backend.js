document.addEventListener('DOMContentLoaded', () => {
    const authForm = document.querySelector('#authForm');
    const connectionStatus = document.querySelector('#connectionStatus');

    authForm.addEventListener('submit', async (event) => {
        event.preventDefault();  // Prevent form from submitting the traditional way

        // Get values from form inputs
        const host = document.querySelector('#host').value;
        const consumerKey = document.querySelector('#consumerKey').value;
        const consumerSecret = document.querySelector('#consumerSecret').value;
        const email = document.querySelector('#email').value;
        const password = document.querySelector('#password').value;

        // Construct the full base URL
        const baseUrl = `https://${host}`;

        connectionStatus.textContent = 'Connecting to Extra Horizon...';

        try {
            const accessToken = await authenticate(baseUrl, consumerKey, consumerSecret, email, password);
            connectionStatus.textContent = 'Connected successfully!';
            connectionStatus.classList.remove('text-danger');
            connectionStatus.classList.add('text-success');
        } catch (error) {
            console.error('Connection failed:', error);
            connectionStatus.textContent = 'Connection failed. Check console for details.';
            connectionStatus.classList.remove('text-success');
            connectionStatus.classList.add('text-danger');
        }
    });

    async function authenticate(baseUrl, consumerKey, consumerSecret, email, password) {
        const response = await fetch(`${baseUrl}/auth/v2/oauth/token`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                consumer_key: consumerKey,
                consumer_secret: consumerSecret,
                email: email,
                password: password,
                grant_type: 'password'
            })
        });

        if (!response.ok) {
            throw new Error(`Authentication failed: ${response.statusText}`);
        }

        const data = await response.json();
        console.log('Authentication successful:', data);
        return data.access_token;
    }
});
