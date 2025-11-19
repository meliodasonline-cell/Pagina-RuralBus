document.addEventListener('DOMContentLoaded', () => { 
    const registroForm = document.getElementById('registroForm');
    const passwordInput = document.getElementById('password');
    // Asegúrate de que el botón de toggle tenga la clase 'toggle-password'
    const togglePassword = document.querySelector('.toggle-password'); 
    const serverUrl = 'http://localhost:3000/registro';

    // --- Funcionalidad de Mostrar / Ocultar Contraseña ---
    if (togglePassword && passwordInput) {
        togglePassword.addEventListener('click', () => {
            const isHidden = passwordInput.type === 'password';
            passwordInput.type = isHidden ? 'text' : 'password';
            // Alterna la clase 'visible' para cambiar el ícono si usas CSS para ello
            togglePassword.classList.toggle('visible', isHidden);
            togglePassword.textContent = isHidden ? '🙈' : '👁️';
        });
    }

    // --- Envío de formulario ---
    if (registroForm) {
        registroForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            const username = document.getElementById('username').value.trim();
            const password = passwordInput.value.trim();

            // Validaciones de Frontend
            if (!username || !password) {
                // Usamos un modal de mensaje simple, ya que 'alert' está prohibido en este entorno.
                showMessage('Por favor completa ambos campos.', 'error');
                return;
            }

            if (username.length < 3) {
                showMessage('El nombre de usuario debe tener al menos 3 caracteres.', 'error');
                return;
            }

            if (password.length < 6) {
                showMessage('La contraseña debe tener al menos 6 caracteres.', 'error');
                return;
            }

            if (!/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) {
                showMessage('La contraseña debe contener al menos una letra y un número.', 'error');
                return;
            }

            try {
                // Deshabilitar botón para evitar envíos múltiples
                const submitButton = registroForm.querySelector('.btn-registro');
                submitButton.disabled = true;
                submitButton.textContent = 'Registrando...';
                
                const response = await fetch(serverUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, password })
                });

                const data = await response.json();

                if (response.ok) { // Éxito (código 201)
                    showMessage('✅ Registro exitoso. Ahora puedes iniciar sesión.', 'success');
                    // Esperamos 1.5s antes de redirigir
                    setTimeout(() => {
                        window.location.href = 'index.html';
                    }, 1500);
                } else { // Error de servidor (código 400, 409, 500)
                    // Usamos el mensaje de error que nos manda el servidor (server.cjs)
                    showMessage(data.message || '❌ Error desconocido al registrar usuario.', 'error');
                }
            } catch (error) {
                console.error('Error al conectar con el servidor:', error);
                showMessage('⚠️ No se pudo conectar con el servidor. Verifica que Node.js esté activo.', 'error');
            } finally {
                 // Habilitar botón al finalizar
                const submitButton = registroForm.querySelector('.btn-registro');
                submitButton.disabled = false;
                submitButton.textContent = 'Registrar';
            }
        });
    }
    
    // Función de reemplazo para 'alert()'
    // Crea un modal simple para mostrar mensajes al usuario
    function showMessage(message, type = 'info') {
        const existingMessage = document.getElementById('app-message-box');
        if (existingMessage) existingMessage.remove();

        const msgBox = document.createElement('div');
        msgBox.id = 'app-message-box';
        msgBox.textContent = message;
        
        // Define el estilo basado en el tipo de mensaje
        let bgColor = '#333';
        if (type === 'success') bgColor = '#4CAF50';
        else if (type === 'error') bgColor = '#F44336';
        
        msgBox.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            padding: 15px 25px;
            background-color: ${bgColor};
            color: white;
            border-radius: 8px;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
            z-index: 1000;
            opacity: 0;
            transition: opacity 0.3s ease-in-out;
        `;
        
        document.body.appendChild(msgBox);

        // Muestra el mensaje con una pequeña animación
        setTimeout(() => msgBox.style.opacity = 1, 10);

        // Oculta el mensaje después de 4 segundos
        setTimeout(() => {
            msgBox.style.opacity = 0;
            setTimeout(() => msgBox.remove(), 300);
        }, 4000);
    }
});