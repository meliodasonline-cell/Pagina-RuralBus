document.addEventListener('DOMContentLoaded', () => { 
    const loginForm = document.getElementById('loginForm');
    const passwordInput = document.getElementById('password');
    // Asegúrate de que el botón de toggle tenga la clase 'toggle-password' si existe en tu HTML
    const togglePassword = document.querySelector('.toggle-password'); 
    // Puerto 4000 confirmado, donde corre el backend
    const serverUrl = 'http://localhost:3000/login'; 

    // Limpia sesión si alguien llega al login (buena práctica de seguridad)
    localStorage.removeItem('usuarioActivo');

    // --- Funcionalidad de Mostrar / Ocultar Contraseña (si tienes el ícono 👁️) ---
    if (togglePassword && passwordInput) {
        togglePassword.addEventListener('click', () => {
            const isHidden = passwordInput.type === 'password';
            passwordInput.type = isHidden ? 'text' : 'password';
            togglePassword.classList.toggle('visible', isHidden);
            togglePassword.textContent = isHidden ? '🙈' : '👁️';
        });
    }

    // --- Envío de formulario ---
    if (loginForm) {
        loginForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            const username = document.getElementById('username').value.trim();
            const password = passwordInput.value.trim();

            if (!username || !password) {
                showMessage('Por favor ingresa tu usuario y contraseña.', 'error');
                return;
            }

            // Deshabilitar botón mientras se procesa la petición
            const submitButton = loginForm.querySelector('.btn-registro');
            if (submitButton) {
                submitButton.disabled = true;
                submitButton.textContent = 'Verificando...';
            }
            
            try {
                const response = await fetch(serverUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, password })
                });

                // response.ok es true para códigos de estado 200-299 (éxito)
                if (!response.ok) {
                    let errorMessage = '❌ Error al intentar iniciar sesión.';
                    
                    try {
                        // Intenta leer el mensaje de error JSON del servidor (ej: "Credenciales inválidas.")
                        const errorData = await response.json();
                        errorMessage = errorData.message || errorMessage;
                    } catch (parseError) {
                        // Si falla la lectura del JSON, muestra un error con el código de estado
                        console.error('Error al parsear la respuesta de error:', parseError);
                        errorMessage = `❌ Error en la respuesta del servidor (Estado: ${response.status}).`;
                    }
                    
                    // Mostrar el error real del servidor (ej: "Credenciales inválidas")
                    showMessage(errorMessage, 'error');
                    return; 
                }
                
                // Si la respuesta es OK (200), leemos el JSON de éxito
                const data = await response.json();
                
                // Guardar usuario en sesión local y notificar éxito
                localStorage.setItem('usuarioActivo', data.username);
                showMessage(`✅ ¡Bienvenido, ${data.username}! Sesión iniciada. Redirigiendo...`, 'success');
                
                // Redirección a la página principal del usuario
                setTimeout(() => {
                    window.location.href = 'reservas.html'; 
                }, 1500);


            } catch (error) {
                // Este bloque solo se ejecuta si hay un error de red o de CORS, lo que significa que el servidor está apagado
                console.error('Error al conectar con el servidor:', error);
                showMessage('⚠️ No se pudo conectar con el servidor. Verifica que Node.js esté activo.', 'error');
            } finally {
                 // Habilitar botón al finalizar (éxito o fallo)
                const submitButton = loginForm.querySelector('.btn-registro');
                if (submitButton) {
                    submitButton.disabled = false;
                    submitButton.textContent = 'Entrar';
                }
            }
        });
    }
    
    // Función para mostrar mensajes personalizados (Reemplazo de alert())
    function showMessage(message, type = 'info') {
        const existingMessage = document.getElementById('app-message-box');
        if (existingMessage) existingMessage.remove();

        const msgBox = document.createElement('div');
        msgBox.id = 'app-message-box';
        msgBox.textContent = message;
        
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

        setTimeout(() => msgBox.style.opacity = 1, 10);

        setTimeout(() => {
            msgBox.style.opacity = 0;
            setTimeout(() => msgBox.remove(), 300);
        }, 4000);
    }
});