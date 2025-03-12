document.addEventListener('DOMContentLoaded', function() {
    // Inicializar dataLayer para GTM
    window.dataLayer = window.dataLayer || [];
    
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
        
        // Rastrear cliques nos botões e enviar dados para o n8n antes de redirecionar
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
            
            // Obter o parâmetro fbclid da URL
            const fbclid = getUrlParameter('fbclid');
            
            // Dados para enviar ao n8n
            const data = {
                expert: 'Felipe Cota',
                fbclid: fbclid
            };
            
            // Endpoint do n8n
            const n8nEndpoint = 'https://whkn8n.meumenu2023.uk/webhook/fbclid-landingpage';
            
            // Enviar dados para o n8n via POST apenas se houver fbclid
            if (fbclid) {
                fetch(n8nEndpoint, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(data),
                    mode: 'no-cors'
                })
                .then(response => {
                    // Redirecionar para o Telegram após o envio dos dados
                    window.location.href = telegramUrl;
                })
                .catch(error => {
                    // Em caso de erro, redirecionar mesmo assim
                    window.location.href = telegramUrl;
                });
            } else {
                // Se não houver fbclid, apenas redirecionar para o Telegram
                window.location.href = telegramUrl;
            }
        });
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
