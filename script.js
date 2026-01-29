document.addEventListener('DOMContentLoaded', () => {
    // Mobile Navigation Toggle
    const mobileToggle = document.querySelector('.mobile-toggle');
    const nav = document.querySelector('.nav');

    if (mobileToggle) {
        mobileToggle.addEventListener('click', () => {
            nav.classList.toggle('active');
            // Animate hamburger icon
            const bars = mobileToggle.querySelectorAll('.bar');
            if (nav.classList.contains('active')) {
                bars[0].style.transform = 'rotate(-45deg) translate(-5px, 6px)';
                bars[1].style.opacity = '0';
                bars[2].style.transform = 'rotate(45deg) translate(-5px, -6px)';
            } else {
                bars[0].style.transform = 'none';
                bars[1].style.opacity = '1';
                bars[2].style.transform = 'none';
            }
        });
    }

    // Close mobile menu when clicking a link
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            nav.classList.remove('active');
            const bars = document.querySelectorAll('.bar');
            bars[0].style.transform = 'none';
            bars[1].style.opacity = '1';
            bars[2].style.transform = 'none';
        });
    });

    // Gallery Slider
    const sliderContainer = document.querySelector('.slider-container');
    const prevBtn = document.querySelector('.prev');
    const nextBtn = document.querySelector('.next');
    const items = document.querySelectorAll('.gallery-item');
    let currentIndex = 0;

    function updateSlider() {
        sliderContainer.style.transform = `translateX(-${currentIndex * 100}%)`;
    }

    if (prevBtn && nextBtn) {
        nextBtn.addEventListener('click', () => {
            currentIndex = (currentIndex + 1) % items.length;
            updateSlider();
        });

        prevBtn.addEventListener('click', () => {
            currentIndex = (currentIndex - 1 + items.length) % items.length;
            updateSlider();
        });

        // Auto-advance slider every 5 seconds
        setInterval(() => {
            currentIndex = (currentIndex + 1) % items.length;
            updateSlider();
        }, 5000);
    }

    // Chatbot Functionality
    const chatWidget = document.getElementById('chatbot-widget');
    const chatToggle = document.getElementById('chat-toggle');
    const closeChat = document.getElementById('close-chat');
    const chatInput = document.getElementById('chat-input');
    const chatMessages = document.getElementById('chat-messages');

    if (chatToggle) {
        chatToggle.addEventListener('click', () => {
            chatWidget.style.display = 'flex';
            chatToggle.style.display = 'none';
            // Focus input after opening
            setTimeout(() => chatInput.focus(), 300);
        });
    }

    if (closeChat) {
        closeChat.addEventListener('click', () => {
            chatWidget.style.display = 'none';
            chatToggle.style.display = 'block';
        });
    }

    // Expose functions globally for inline onclick handlers
    window.sendMessage = async function() {
        const message = chatInput.value.trim();
        if (message) {
            addMessage(message, 'user');
            chatInput.value = '';
            
            // Show typing indicator
            const typingId = addTypingIndicator();
            
            try {
                // Determine API URL based on environment
                // In production (Cloudflare Pages), use relative path /api/worker
                // For local development with Python server, this might need a proxied path or full URL
                // Here we assume standard relative path which works for both if configured correctly
                const response = await fetch('https://bitter-firefly-c994.cogniq-bharath.workers.dev/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ message: message })
                });

                removeTypingIndicator(typingId);

                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }

                const data = await response.json();
                addMessage(data.response, 'bot');
            } catch (error) {
                console.error('Error:', error);
                removeTypingIndicator(typingId);
                addMessage("I'm sorry, I'm having trouble connecting right now. Please try again later or contact the clinic directly.", 'bot');
            }
        }
    };

    window.handleKeyPress = function(event) {
        if (event.key === 'Enter') {
            window.sendMessage();
        }
    };

    window.sendChip = function(text) {
        chatInput.value = text;
        window.sendMessage();
    };

    function addMessage(text, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', `${sender}-message`);
        
        // Convert newlines to <br> for bot messages
        if (sender === 'bot') {
            text = text.replace(/\n/g, '<br>');
        }
        
        messageDiv.innerHTML = text;
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function addTypingIndicator() {
        const id = 'typing-' + Date.now();
        const indicatorDiv = document.createElement('div');
        indicatorDiv.classList.add('message', 'bot-message');
        indicatorDiv.id = id;
        indicatorDiv.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Typing...';
        chatMessages.appendChild(indicatorDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        return id;
    }

    function removeTypingIndicator(id) {
        const element = document.getElementById(id);
        if (element) {
            element.remove();
        }
    }

    // Booking Form Handling
    const bookingForm = document.getElementById('bookingForm');
    if (bookingForm) {
        bookingForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const btn = bookingForm.querySelector('button[type="submit"]');
            const originalText = btn.innerText;
            
            btn.innerText = 'Sending Request...';
            btn.disabled = true;
            
            // Simulate API call
            setTimeout(() => {
                btn.innerText = 'Request Sent!';
                btn.style.backgroundColor = '#4CAF50';
                
                // Show success message
                alert('Thank you for your booking request! Our team will contact you shortly to confirm your appointment.');
                
                bookingForm.reset();
                
                setTimeout(() => {
                    btn.innerText = originalText;
                    btn.disabled = false;
                    btn.style.backgroundColor = '';
                }, 3000);
            }, 1500);
        });
    }
});
