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

function signup() {
    var newFullName = document.getElementById('newFullName').value; // Get full name input
    var newEmail = document.getElementById('newEmail').value;
    var newPassword = document.getElementById('newPassword').value;
    var confirmPassword = document.getElementById('confirmPassword').value;

    if (newPassword !== confirmPassword) {
        alert("Passwords do not match!");
        return;
    }

    sha256(newPassword)
        .then(hashedPassword => {
            var signupData = {
                Name: newFullName, // Include full name in signupData
                email: newEmail,
                password: hashedPassword,
            };

            console.log(signupData);

            fetch(`http://${serverIP}/users/CreateUser`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(signupData),
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    showConfirmationMessage("Sign up successful! You can now login with your credentials.");

                    return response.json();
                });
        })
        .catch(error => {
            console.error('Error hashing password:', error);
        });
}

function showConfirmationMessage(message) {
    var confirmationMessageElement = document.getElementById('confirmationMessage');
    confirmationMessageElement.textContent = message;
    // You can also add CSS classes or styles to style the message container
}
