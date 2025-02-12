document.addEventListener('DOMContentLoaded', () => {
    const authForm = document.querySelector('#authForm');
    const connectionStatus = document.querySelector('#connectionStatus');

    // 🔥 Fix: Ensure elements exist before accessing them
    if (!authForm || !connectionStatus) {
        console.error("❌ Form or status element not found! Make sure your HTML is loaded.");
        return;
    }

    authForm.addEventListener('submit', async (event) => {
        event.preventDefault();  // Prevent form from submitting the traditional way

        // Get values from form inputs
        const consumerKeyInput = document.querySelector('#consumerKey');
        const consumerSecretInput = document.querySelector('#consumerSecret');
        const emailInput = document.querySelector('#email');
        const passwordInput = document.querySelector('#password');

        // 🔥 Fix: Ensure inputs exist before accessing their values
        if (!consumerKeyInput || !consumerSecretInput || !emailInput || !passwordInput) {
            console.error("❌ One or more input fields are missing in the HTML.");
            return;
        }

        const consumerKey = consumerKeyInput.value;
        const consumerSecret = consumerSecretInput.value;
        const email = emailInput.value;
        const password = passwordInput.value;

        // Fixed API URL
        const apiUrl = "https://api.dev.madglove.extrahorizon.io/auth/v2/oauth1/tokens";

        connectionStatus.textContent = 'Connecting to Extra Horizon...';

        try {
            const { token, tokenSecret } = await authenticate(apiUrl, consumerKey, consumerSecret, email, password);
            
            connectionStatus.textContent = 'Connected successfully!';
            connectionStatus.classList.remove('text-danger');
            connectionStatus.classList.add('text-success');

            console.log('🔑 Token:', token);
            console.log('🔒 Token Secret:', tokenSecret);
            alert(`Connected successfully!\nToken: ${token}\nSecret: ${tokenSecret}`);

        } catch (error) {
            console.error('❌ Connection failed:', error);
            connectionStatus.textContent = 'Connection failed. Check console for details.';
            connectionStatus.classList.remove('text-success');
            connectionStatus.classList.add('text-danger');
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

        const responseText = await response.text(); // Read response as text for debugging

        if (!response.ok) {
            throw new Error(`Authentication failed: ${response.status} - ${responseText}`);
        }

        const data = JSON.parse(responseText); // Parse JSON if response is valid
        return { token: data.token, tokenSecret: data.tokenSecret };
    }
});
