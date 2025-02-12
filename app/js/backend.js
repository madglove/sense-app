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
            const { token, tokenSecret } = await authenticate(baseUrl, consumerKey, consumerSecret, email, password);
            
            connectionStatus.textContent = 'Connected successfully!';
            connectionStatus.classList.remove('text-danger');
            connectionStatus.classList.add('text-success');

            console.log('🔑 Token:', token);
            console.log('🔒 Token Secret:', tokenSecret);
            alert(`Connected successfully!\nToken: ${token}\nSecret: ${tokenSecret}`);

        } catch (error) {
            console.error('Connection failed:', error);
            connectionStatus.textContent = 'Connection failed. Check console for details.';
            connectionStatus.classList.remove('text-success');
            connectionStatus.classList.add('text-danger');
        }
    });

    async function authenticate(baseUrl, consumerKey, consumerSecret, email, password) {
        const response = await fetch(`${baseUrl}/auth/v2/oauth1/tokens`, {
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

        const responseText = await response.text(); // Read response as text for debugging

        if (!response.ok) {
            throw new Error(`Authentication failed: ${response.status} - ${responseText}`);
        }

        const data = JSON.parse(responseText); // Parse JSON if response is valid
        return { token: data.token, tokenSecret: data.tokenSecret };
    }
});
