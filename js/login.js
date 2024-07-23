function sha256(str) {
    if (typeof crypto !== 'undefined' && crypto.subtle && typeof crypto.subtle.digest === 'function') {
        return crypto.subtle.digest('SHA-256', new TextEncoder().encode(str))
            .then(hash => Array.from(new Uint8Array(hash))
                .map(byte => byte.toString(16).padStart(2, '0'))
                .join('')
            );
    } else {
        // Fallback to crypto-js
        return Promise.resolve(CryptoJS.SHA256(str).toString(CryptoJS.enc.Hex));
    }
}

let serverIP = "192.168.1.23:8080";

function login() {
    var Email = document.getElementById('Email').value;
    var password = document.getElementById('password').value;
    var errorMessage = document.getElementById('error-message');

    sha256(password)
        .then(hashedPassword => {
            fetch('https://api.ipify.org?format=json')
                .then(response => response.json())
                .then(data => {
                    var ip = data.ip;
                    var loginData = {
                        hash: hashedPassword,
                        IP: ip,
                        Email: Email,
                    };

                    console.log(loginData);

                    fetch(`http://${serverIP}/tryLogin/Login`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(loginData),
                    })
                        .then(response => {
                            if (!response.ok) {
                                throw new Error('Network response was not ok');
                            }
                            return response.json();
                        })
                        .then(data => {
                            if (data && data[0][0] !== 'Invalid Credentials') {
                                localStorage.setItem('token', data[0][0]);
                                window.location.href = '../html/general.html';
                            } else {
                                errorMessage.textContent = 'Invalid Credentials';
                                errorMessage.style.display = 'block';
                            }
                        })
                        .catch(error => {
                            console.error('Fetch error:', error);
                            errorMessage.textContent = 'An error occurred during login. Please try again.';
                            errorMessage.style.display = 'block';
                        });
                })
                .catch(error => {
                    console.error('Error getting IP address:', error);
                    errorMessage.textContent = 'An error occurred while fetching your IP address. Please try again.';
                    errorMessage.style.display = 'block';
                });
        })
        .catch(error => {
            console.error('Error hashing password:', error);
            errorMessage.textContent = 'An error occurred while processing your password. Please try again.';
            errorMessage.style.display = 'block';
        });
}
