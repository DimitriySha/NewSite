// Registration page logic
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('register-form');
    if (form) {
        form.addEventListener('submit', handleRegister);
    }
});

async function handleRegister(event) {
    event.preventDefault();
    const form = event.target;
    const resultDiv = document.getElementById('register-result');

    const formData = new FormData(form);
    const userData = {
        full_name: formData.get('full_name'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        password_hash: formData.get('password'), // In production, hash this!
    };

    try {
        resultDiv.innerHTML = '<div class="loading">Регистрация...</div>';

        // TODO: Replace with actual registration API endpoint
        // For now, simulate success
        await new Promise(resolve => setTimeout(resolve, 1000));

        resultDiv.innerHTML = `
            <div class="success-message">
                <strong>✅ Регистрация прошла успешно!</strong><br>
                Добро пожаловать, ${userData.full_name}!<br>
                <a href="../index.html" class="btn" style="margin-top: 10px; display: inline-block;">Перейти на главную</a>
            </div>
        `;
        form.reset();
    } catch (error) {
        console.error('Registration error:', error);
        resultDiv.innerHTML = '<div class="error-message">Ошибка регистрации. Попробуйте позже.</div>';
    }
}
