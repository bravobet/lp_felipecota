// Função para gerar hash SHA-256
async function sha256(message) {
    // Codificar como UTF-8
    const msgBuffer = new TextEncoder().encode(message);
    
    // Hash o mensagem
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    
    // Converter ArrayBuffer para Array
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    
    // Converter bytes para string hexadecimal
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    
    return hashHex;
}

// Função para formatar número de telefone
function formatPhoneNumber(phoneNumber) {
    
    // Remover todos os caracteres não numéricos
    const cleaned = phoneNumber.replace(/\D/g, '');
    
    // Verificar o tamanho e aplicar a formatação adequada
    if (cleaned.length <= 2) {
        
        return cleaned;
    } else if (cleaned.length <= 7) {
        
        return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2)}`;
    } else if (cleaned.length <= 11) {
        
        return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
    } else {
        
        return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7, 11)}`;
    }
}

// Função para obter o cookie fbp do Facebook
function getFacebookBrowserId() {
    const cookies = document.cookie.split(';');
    
    for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i].trim();
        
        if (cookie.startsWith('_fbp=')) {
            return cookie.substring(5);
        }
    }
    
    return '';
}

// Função para obter o parâmetro fbc do Facebook
function getFacebookClickId() {
    // Verificar primeiro se existe o cookie _fbc
    const cookies = document.cookie.split(';');
    
    for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i].trim();
        
        if (cookie.startsWith('_fbc=')) {
            return cookie.substring(5);
        }
    }
    
    // Se não existir o cookie, construir o fbc a partir do fbclid da URL
    const fbclid = getUrlParameter('fbclid');
    
    if (fbclid) {
        // Formato correto: fb.1.{timestamp}.{fbclid}
        const timestamp = Math.floor(Date.now() / 1000);
        return `fb.1.${timestamp}.${fbclid}`;
    }
    
    return '';
}

document.addEventListener('DOMContentLoaded', function() {
    
    // Inicializar dataLayer para GTM
    
    window.dataLayer = window.dataLayer || [];
    
    // Adicionar o HTML do popup ao body
    document.body.insertAdjacentHTML('beforeend', `
    <!-- Popup para coleta de telefone -->
    <div id="phone-popup" class="popup-container">
        <div class="popup-content">
            <div class="popup-header">
                <h3>Quase lá!</h3>
                <p>Adicione seu número de telefone para continuar</p>
            </div>
            <div class="popup-body">
                <div class="phone-input-container">
                    <input type="tel" id="phone-input" placeholder="(XX) XXXXX-XXXX" maxlength="15">
                    <button id="submit-phone">Continuar</button>
                </div>
                <div class="timer-container">
                    <p>Redirecionando em: <span id="countdown-timer">01:30</span></p>
                    <div class="progress-bar">
                        <div id="progress-fill"></div>
                    </div>
                </div>
            </div>
        </div>
    </div>`);
    
    // Adicionar os estilos do popup
    document.head.insertAdjacentHTML('beforeend', `
    <style>
    /* Estilos para o popup de telefone */
    .popup-container {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.8);
        display: none;
        justify-content: center;
        align-items: center;
        z-index: 1000;
        backdrop-filter: blur(5px);
    }
    
    .popup-content {
        background: linear-gradient(135deg, #111111 0%, #1a1a1a 100%);
        width: 90%;
        max-width: 400px;
        border-radius: 15px;
        padding: 25px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
        border: 1px solid rgba(255, 0, 0, 0.3);
        animation: popup-appear 0.3s ease-out;
    }
    
    @keyframes popup-appear {
        from {
            opacity: 0;
            transform: translateY(-20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    .popup-header {
        text-align: center;
        margin-bottom: 20px;
    }
    
    .popup-header h3 {
        font-size: 24px;
        color: #ffffff;
        margin-bottom: 10px;
    }
    
    .popup-header p {
        font-size: 16px;
        color: #cccccc;
    }
    
    .popup-body {
        display: flex;
        flex-direction: column;
        gap: 20px;
    }
    
    .phone-input-container {
        display: flex;
        gap: 10px;
    }
    
    #phone-input {
        flex: 1;
        padding: 12px 15px;
        border-radius: 8px;
        border: 1px solid rgba(255, 0, 0, 0.3);
        background-color: rgba(0, 0, 0, 0.2);
        color: #ffffff;
        font-size: 16px;
        outline: none;
        transition: border-color 0.3s;
    }
    
    #phone-input:focus {
        border-color: #ff0000;
        box-shadow: 0 0 10px rgba(255, 0, 0, 0.3);
    }
    
    #submit-phone {
        padding: 12px 20px;
        background: linear-gradient(135deg, #ff0000 0%, #cc0000 100%);
        border: none;
        border-radius: 8px;
        color: white;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
    }
    
    #submit-phone:hover {
        transform: translateY(-2px);
        box-shadow: 0 5px 15px rgba(255, 0, 0, 0.4);
    }
    
    .timer-container {
        text-align: center;
        margin-top: 10px;
    }
    
    .timer-container p {
        font-size: 14px;
        color: #aaaaaa;
        margin-bottom: 8px;
    }
    
    #countdown-timer {
        font-weight: 700;
        color: #ff0000;
    }
    
    .progress-bar {
        height: 6px;
        background-color: rgba(255, 255, 255, 0.1);
        border-radius: 3px;
        overflow: hidden;
    }
    
    #progress-fill {
        height: 100%;
        background: linear-gradient(90deg, #ff0000, #cc0000);
        width: 100%;
        transition: width 1s linear;
    }
    
    /* Responsividade */
    @media (max-width: 480px) {
        .popup-content {
            padding: 20px;
        }
        
        .phone-input-container {
            flex-direction: column;
        }
        
        #submit-phone {
            margin-top: 10px;
        }
    }
    </style>`);
    
    // Formatar o número de telefone enquanto o usuário digita
    const phoneInput = document.getElementById('phone-input');
    if (phoneInput) {
        phoneInput.addEventListener('input', function(e) {
            const formattedNumber = formatPhoneNumber(e.target.value);
            e.target.value = formattedNumber;
        });
    }
    // Add smooth scrolling for all links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Hover effects for feature boxes
    const featureBoxes = document.querySelectorAll('.feature-box');
    featureBoxes.forEach(box => {
        box.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-10px)';
            this.style.boxShadow = '0 15px 30px rgba(0, 0, 0, 0.3)';
        });
        
        box.addEventListener('mouseleave', function() {
            this.style.transform = '';
            this.style.boxShadow = '';
        });
        
        // Add touch events for mobile
        box.addEventListener('touchstart', function() {
            this.style.transform = 'translateY(-5px)';
            this.style.boxShadow = '0 10px 25px rgba(0, 0, 0, 0.3)';
        }, { passive: true });
        
        box.addEventListener('touchend', function() {
            this.style.transform = '';
            this.style.boxShadow = '';
        }, { passive: true });
    });
    
    // Hover effects for benefit cards
    const benefitCards = document.querySelectorAll('.benefit-card');
    benefitCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-10px)';
            this.style.boxShadow = '0 15px 30px rgba(0, 0, 0, 0.3)';
            const icon = this.querySelector('.benefit-icon');
            if (icon) {
                icon.style.transform = 'scale(1.1)';
            }
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = '';
            this.style.boxShadow = '';
            const icon = this.querySelector('.benefit-icon');
            if (icon) {
                icon.style.transform = '';
            }
        });
        
        // Add touch events for mobile
        card.addEventListener('touchstart', function() {
            this.style.transform = 'translateY(-5px)';
            this.style.boxShadow = '0 10px 25px rgba(0, 0, 0, 0.3)';
            const icon = this.querySelector('.benefit-icon');
            if (icon) {
                icon.style.transform = 'scale(1.05)';
            }
        }, { passive: true });
        
        card.addEventListener('touchend', function() {
            this.style.transform = '';
            this.style.boxShadow = '';
            const icon = this.querySelector('.benefit-icon');
            if (icon) {
                icon.style.transform = '';
            }
        }, { passive: true });
    });
    
    // Pulse effect for CTA buttons
    const ctaButtons = document.querySelectorAll('.cta-button');
    ctaButtons.forEach(button => {
        // Add pulse animation
        setInterval(() => {
            button.classList.add('pulse');
            setTimeout(() => {
                button.classList.remove('pulse');
            }, 1000);
        }, 3000);
        
        // Rastrear cliques nos botões e mostrar popup antes de redirecionar
        button.addEventListener('click', function(e) {
            e.preventDefault(); // Prevenir o comportamento padrão do link
            
            // URL de destino do Telegram
            const telegramUrl = this.getAttribute('href');
            
            // Rastrear evento de clique no Facebook Pixel (Lead)
            if (typeof fbq === 'function') {
                fbq('track', 'Lead', {
                    content_name: 'Felipe Cota - Grupo de Lives',
                    content_category: 'Telegram Subscription'
                });
            }
            
            // Mostrar o popup
            showPhonePopup(telegramUrl);
        });
        
        // Função para mostrar o popup e iniciar os contadores
        function showPhonePopup(telegramUrl) {
            const popup = document.getElementById('phone-popup');
            const progressFill = document.getElementById('progress-fill');
            const countdownTimer = document.getElementById('countdown-timer');
            const submitButton = document.getElementById('submit-phone');
            const phoneInput = document.getElementById('phone-input');
            
            if (!popup || !progressFill || !countdownTimer || !submitButton || !phoneInput) {
                console.error('Elementos do popup não encontrados');
                redirectToTelegram(telegramUrl);
                return;
            }
            
            // Mostrar o popup
            popup.style.display = 'flex';
            
            // Iniciar o contador visual (1:30)
            let visualMinutes = 1;
            let visualSeconds = 30;
            
            // Iniciar o contador real (20 segundos)
            let realSeconds = 20;
            
            // Calcular a largura inicial da barra de progresso
            const totalVisualTime = (visualMinutes * 60) + visualSeconds;
            
            // Atualizar o contador visual a cada segundo
            const visualInterval = setInterval(() => {
                if (visualSeconds === 0) {
                    if (visualMinutes === 0) {
                        clearInterval(visualInterval);
                        return;
                    }
                    visualMinutes--;
                    visualSeconds = 59;
                } else {
                    visualSeconds--;
                }
                
                // Atualizar o texto do contador
                countdownTimer.textContent = `${visualMinutes.toString().padStart(2, '0')}:${visualSeconds.toString().padStart(2, '0')}`;
                
                // Calcular o tempo restante em segundos
                const remainingTime = (visualMinutes * 60) + visualSeconds;
                
                // Atualizar a largura da barra de progresso
                const progressWidth = (remainingTime / totalVisualTime) * 100;
                progressFill.style.width = `${progressWidth}%`;
                
            }, 1000);
            
            // Contador real para redirecionamento automático
            const realInterval = setInterval(() => {
                realSeconds--;
                
                if (realSeconds <= 0) {
                    clearInterval(realInterval);
                    clearInterval(visualInterval);
                    
                    // Obter todos os parâmetros da URL
                    const params = getAllUrlParameters();
                    
                    // Dados para enviar ao n8n
                    const data = {
                        expert: 'COTA'
                    };
                    
                    // Adicionar o fbp do Facebook se disponível
                    const fbp = getFacebookBrowserId();
                    if (fbp) {
                        data.fbp = fbp;
                    }
                    
                    // Adicionar o fbc do Facebook se disponível
                    const fbc = getFacebookClickId();
                    if (fbc) {
                        data.fbc = fbc;
                        console.log('Facebook Click ID (fbc) capturado:', fbc);
                    }
                    
                    // Adicionar todos os parâmetros da URL ao objeto data (exceto fbclid)
                    for (const key in params) {
                        if (params.hasOwnProperty(key) && key !== 'fbclid') {
                            data[key] = params[key];
                            console.log(`Adicionando parâmetro ao objeto de dados: ${key}=${params[key]}`);
                        }
                    }
                    
                    // Enviar os dados e redirecionar
                    sendDataAndRedirect(data, telegramUrl);
                }
            }, 1000);
            
            // Lidar com o envio do número de telefone
            submitButton.addEventListener('click', async function() {
                const phoneNumber = phoneInput.value.replace(/\D/g, '');
                
                if (phoneNumber.length < 10) {
                    alert('Por favor, insira um número de telefone válido.');
                    return;
                }
                
                // Limpar os intervalos
                clearInterval(visualInterval);
                clearInterval(realInterval);
                
                // Obter todos os parâmetros da URL
                const params = getAllUrlParameters();
                
                // Dados para enviar ao n8n
                const data = {
                    expert: 'COTA'
                };
                
                // Adicionar o fbp do Facebook se disponível
                const fbp = getFacebookBrowserId();
                if (fbp) {
                    data.fbp = fbp;
                }
                
                // Adicionar o fbc do Facebook se disponível
                const fbc = getFacebookClickId();
                if (fbc) {
                    data.fbc = fbc;
                    console.log('Facebook Click ID (fbc) capturado:', fbc);
                }
                
                // Gerar o hash SHA-256 do número de telefone
                try {
                    const phoneHash = await sha256(phoneNumber);
                    data.phone_hash = phoneHash;
                    console.log('Phone hash gerado:', phoneHash);
                } catch (error) {
                    console.error('Erro ao gerar hash do telefone:', error);
                }
                
                // Adicionar todos os parâmetros da URL ao objeto data (exceto fbclid)
                for (const key in params) {
                    if (params.hasOwnProperty(key) && key !== 'fbclid') {
                        data[key] = params[key];
                        console.log(`Adicionando parâmetro ao objeto de dados: ${key}=${params[key]}`);
                    }
                }
                
                
                // Enviar os dados e redirecionar
                sendDataAndRedirect(data, telegramUrl);
            });
        }
        
        // Função para enviar dados e redirecionar
        function sendDataAndRedirect(data, telegramUrl) {
            console.log('Dados para enviar ao n8n:', data);
            
            // Endpoint do n8n
            const n8nEndpoint = 'https://whkn8n.meumenu2023.uk/webhook/fbclid-landingpage';
            
            // Converter para string JSON e registrar no console para depuração
            const jsonData = JSON.stringify(data);
            console.log('JSON a ser enviado:', jsonData);
            
            // Esconder o popup
            const popup = document.getElementById('phone-popup');
            if (popup) {
                popup.style.display = 'none';
            }
            
            // Enviar dados para o n8n via POST
            fetch(n8nEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'text/plain;charset=UTF-8',
                },
                body: jsonData,
                mode: 'no-cors'
            })
            .then(response => {
                console.log('Resposta do servidor recebida');
                // Redirecionar para o Telegram após o envio dos dados
                redirectToTelegram(telegramUrl);
            })
            .catch(error => {
                console.error('Erro ao enviar dados:', error);
                // Em caso de erro, redirecionar mesmo assim
                redirectToTelegram(telegramUrl);
            });
        }
        
        // Função para redirecionar para o Telegram
        function redirectToTelegram(telegramUrl) {
            window.location.href = telegramUrl;
        }
    });
    
    // Add animation to icons
    const icons = document.querySelectorAll('.feature-icon, .benefit-icon');
    icons.forEach(icon => {
        icon.style.transition = 'transform 0.3s ease, color 0.3s ease';
    });
    
    // Add floating animation to icons
    const allIcons = document.querySelectorAll('.feature-icon, .benefit-icon');
    allIcons.forEach((icon, index) => {
        // Add a slight delay to each icon for a staggered effect
        const delay = index * 0.2;
        icon.style.animation = `float 3s ease-in-out ${delay}s infinite`;
    });
    
    // Check if it's a mobile device
    const isMobile = window.matchMedia('(max-width: 768px)').matches;
    
    // Add touch events for mobile
    if (isMobile) {
        const touchElements = document.querySelectorAll('.feature-box, .benefit-card');
        touchElements.forEach(element => {
            element.addEventListener('touchstart', function() {
                this.classList.add('touch-active');
            }, { passive: true });
            
            element.addEventListener('touchend', function() {
                this.classList.remove('touch-active');
            }, { passive: true });
        });
    }
});

// Função para obter parâmetros da URL
function getUrlParameter(name) {
    name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    const regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
    const results = regex.exec(location.search);
    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
}

// Função para obter todos os parâmetros da URL de uma vez
function getAllUrlParameters() {
    const params = {};
    
    try {
        // Obter a string de consulta da URL
        const queryString = window.location.search.substring(1);
        
        // Log para depuração
        console.log('Query string completa:', queryString);
        
        if (queryString) {
            // Dividir a string de consulta em pares de chave=valor
            const pairs = queryString.split('&');
            
            // Log para depuração
            console.log('Número de parâmetros encontrados:', pairs.length);
            
            // Processar cada par
            for (let i = 0; i < pairs.length; i++) {
                try {
                    // Dividir o par em chave e valor
                    const pair = pairs[i].split('=');
                    
                    // Decodificar a chave
                    const key = decodeURIComponent(pair[0]);
                    
                    // Decodificar o valor (se existir)
                    const value = pair.length > 1 ? decodeURIComponent(pair[1].replace(/\+/g, ' ')) : '';
                    
                    // Adicionar ao objeto de parâmetros
                    params[key] = value;
                    
                    // Log para depuração
                    console.log(`Parâmetro capturado: ${key} = ${value}`);
                } catch (pairError) {
                    console.error('Erro ao processar par de parâmetros:', pairs[i], pairError);
                }
            }
        }
    } catch (error) {
        console.error('Erro ao processar parâmetros da URL:', error);
    }
    
    // Verificar se algum parâmetro UTM está presente
    const utmParams = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'fbclid', 'lp'];
    let utmFound = false;
    
    utmParams.forEach(param => {
        if (params[param]) {
            console.log(`Parâmetro ${param} encontrado: ${params[param]}`);
            utmFound = true;
        }
    });
    
    if (!utmFound) {
        console.warn('Nenhum parâmetro UTM ou fbclid encontrado na URL');
    }
    
    // Log final com todos os parâmetros
    console.log('Todos os parâmetros capturados:', JSON.stringify(params));
    
    return params;
}

// Create particle effect
function createParticles() {
    const particleContainer = document.createElement('div');
    particleContainer.className = 'particle-container';
    document.body.appendChild(particleContainer);
    
    // Create particles
    for (let i = 0; i < 50; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        
        // Random position
        const posX = Math.random() * 100;
        const posY = Math.random() * 100;
        
        // Random size
        const size = Math.random() * 5 + 2;
        
        // Random opacity
        const opacity = Math.random() * 0.5 + 0.3;
        
        // Random animation duration
        const duration = Math.random() * 20 + 10;
        
        // Set styles
        particle.style.left = `${posX}%`;
        particle.style.top = `${posY}%`;
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        particle.style.opacity = opacity;
        particle.style.animation = `float ${duration}s linear infinite`;
        
        particleContainer.appendChild(particle);
    }
}

// Create particle effect
createParticles();

// Add CSS for animations
document.head.insertAdjacentHTML('beforeend', `
<style>
@keyframes pulse {
    0% {
        box-shadow: 0 0 0 0 rgba(0, 123, 255, 0.7);
    }
    70% {
        box-shadow: 0 0 0 10px rgba(0, 123, 255, 0);
    }
    100% {
        box-shadow: 0 0 0 0 rgba(0, 123, 255, 0);
    }
}

@keyframes float {
    0%, 100% {
        transform: translateY(0);
    }
    50% {
        transform: translateY(-10px);
    }
}

.particle-container {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: -1;
}

.particle {
    position: absolute;
    background-color: rgba(255, 255, 255, 0.5);
    border-radius: 50%;
    pointer-events: none;
}

.touch-active {
    transform: translateY(-5px) !important;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3) !important;
}
</style>
`);
