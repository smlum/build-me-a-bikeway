// reset-password.js
const resetPasswordForm = document.getElementById('resetPasswordForm');

resetPasswordForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    // Get the token from the URL
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const newPassword = document.getElementById('newPassword').value;

    if (!token || !newPassword) {
        alert('Invalid or missing token/password.');
        return;
    }

    try {
        const response = await axios.post('http://localhost:3000/api/reset-password', {
            token,
            newPassword
        });

        alert('Password has been successfully reset! You can now log in with your new password.');
        window.location.href = '/'; // Redirect to the homepage

    } catch (error) {
        alert('Password reset failed: ' + (error.response ? error.response.data.message : 'Server error'));
    }
});