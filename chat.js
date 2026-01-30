let chatMessages = [
    {
        id: 1,
        sender: "Поддержка",
        message: "Добро пожаловать в Melodie Shop! Чем могу помочь?",
        time: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
        type: "support"
    }
];

let supportTyping = false;

document.addEventListener('DOMContentLoaded', function() {
    loadChatMessages();
    simulateSupportActivity();
});

function toggleChat() {
    const chatWindow = document.getElementById('chatWindow');
    const chatToggle = document.getElementById('chatToggle');
    
    chatWindow.classList.toggle('active');
    chatToggle.classList.toggle('active');
    
    if (chatWindow.classList.contains('active')) {
        scrollChatToBottom();
    }
}

function sendMessage() {
    const input = document.getElementById('chatInput');
    const message = input.value.trim();
    
    if (!message) return;
    
    if (!currentUser) {
        showNotification('Пожалуйста, войдите в систему, чтобы писать в чат', 'warning');
        return;
    }
    
    const time = new Date().toLocaleTimeString('ru-RU', { 
        hour: '2-digit', 
        minute: '2-digit' 
    });
    
    const newMessage = {
        id: chatMessages.length + 1,
        sender: currentUser.name,
        message: message,
        time: time,
        type: "user"
    };
    
    chatMessages.push(newMessage);
    saveChatMessages();
    addMessageToChat(newMessage);
    
    input.value = '';
    scrollChatToBottom();
    
    simulateSupportResponse(message);
}

function handleChatInput(event) {
    if (event.key === 'Enter') {
        sendMessage();
    }
}

function addMessageToChat(message) {
    const chatMessagesEl = document.getElementById('chatMessages');
    const noMessagesEl = document.getElementById('noMessages');
    
    if (noMessagesEl) {
        noMessagesEl.style.display = 'none';
    }
    
    const messageEl = document.createElement('div');
    messageEl.className = `message ${message.type === 'user' ? 'message-user' : 'message-support'}`;
    
    messageEl.innerHTML = `
        <div class="message-sender">${message.sender}</div>
        <div>${message.message}</div>
        <div class="message-time">${message.time}</div>
    `;
    
    chatMessagesEl.appendChild(messageEl);
}

function loadChatMessages() {
    const saved = localStorage.getItem('melodieShopChat');
    if (saved) {
        try {
            const loaded = JSON.parse(saved);
            if (Array.isArray(loaded)) {
                chatMessages = loaded;
            }
        } catch (e) {
            console.error('Ошибка загрузки чата:', e);
        }
    }
    
    const chatMessagesEl = document.getElementById('chatMessages');
    chatMessagesEl.innerHTML = '';
    
    if (chatMessages.length === 0) {
        const noMessagesEl = document.getElementById('noMessages');
        if (noMessagesEl) {
            noMessagesEl.style.display = 'block';
        }
        return;
    }
    
    chatMessages.forEach(message => {
        addMessageToChat(message);
    });
    
    scrollChatToBottom();
}

function saveChatMessages() {
    localStorage.setItem('melodieShopChat', JSON.stringify(chatMessages));
}

function scrollChatToBottom() {
    const chatMessagesEl = document.getElementById('chatMessages');
    if (chatMessagesEl) {
        chatMessagesEl.scrollTop = chatMessagesEl.scrollHeight;
    }
}

function simulateSupportActivity() {
    setInterval(() => {
        const statusEl = document.getElementById('supportStatus');
        const isOnline = Math.random() > 0.1;
        
        if (isOnline) {
            statusEl.className = 'support-status';
            statusEl.innerHTML = '<i class="fas fa-circle"></i><span>Онлайн</span>';
        } else {
            statusEl.className = 'support-status offline';
            statusEl.innerHTML = '<i class="fas fa-circle"></i><span>Офлайн</span>';
        }
    }, 30000);
}

function simulateSupportResponse(userMessage) {
    if (supportTyping) return;
    
    supportTyping = true;
    
    const chatMessagesEl = document.getElementById('chatMessages');
    const typingIndicator = document.createElement('div');
    typingIndicator.className = 'message message-support typing-indicator';
    typingIndicator.innerHTML = `
        <div class="message-sender">Поддержка печатает...</div>
        <div>
            <span></span>
            <span></span>
            <span></span>
        </div>
    `;
    chatMessagesEl.appendChild(typingIndicator);
    scrollChatToBottom();
    
    const responses = [
        "Спасибо за ваш вопрос! Как я могу помочь вам с покупкой Brawl Pass?",
        "Для активации пропуска вам необходимо отправить данные аккаунта менеджеру в личном кабинете.",
        "Среднее время доставки составляет 5-15 минут после подтверждения оплаты.",
        "У нас есть три тарифа: Brawl Pass (699 ₽), Brawl Pass+ (1499 ₽) и Pro Pass (2000 ₽).",
        "Если у вас возникли проблемы с оплатой, пожалуйста, обратитесь к менеджеру через панель управления.",
        "Да, мы гарантируем возврат средств в течение 24 часов, если возникнут проблемы с активацией.",
        "Для получения скидки на следующий сезон оставьте отзыв о нашей работе!",
        "Вы можете отслеживать статус заказа в личном кабинете во вкладке 'Мои заказы'."
    ];
    
    const message = userMessage.toLowerCase();
    let response = responses[Math.floor(Math.random() * responses.length)];
    
    if (message.includes('цена') || message.includes('стоимость') || message.includes('сколько')) {
        response = "У нас три тарифа: Brawl Pass - 699 ₽, Brawl Pass+ - 1499 ₽, Pro Pass - 2000 ₽. Какой вас интересует?";
    } else if (message.includes('время') || message.includes('доставк') || message.includes('скоро')) {
        response = "Доставка происходит в течение 5-15 минут после подтверждения оплаты. Иногда может занять до 30 минут.";
    } else if (message.includes('оплат') || message.includes('деньг') || message.includes('купи')) {
        response = "Оплата происходит через безопасную платежную систему. После оплаты ваш заказ поступает в обработку.";
    } else if (message.includes('аккаунт') || message.includes('данные') || message.includes('логин')) {
        response = "Для активации необходимо отправить данные аккаунта менеджеру через личный кабинет после оплаты.";
    } else if (message.includes('проблем') || message.includes('ошибк') || message.includes('не работ')) {
        response = "Если у вас возникли проблемы, пожалуйста, обратитесь к менеджеру через панель управления или напишите на support@melodieshop.ru";
    }
    
    setTimeout(() => {
        typingIndicator.remove();
        
        const time = new Date().toLocaleTimeString('ru-RU', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
        
        const supportMessage = {
            id: chatMessages.length + 1,
            sender: "Поддержка",
            message: response,
            time: time,
            type: "support"
        };
        
        chatMessages.push(supportMessage);
        saveChatMessages();
        addMessageToChat(supportMessage);
        scrollChatToBottom();
        
        supportTyping = false;
        
        if (!document.getElementById('chatWindow').classList.contains('active')) {
            showNotification('Новое сообщение от поддержки', 'info');
        }
    }, 1500 + Math.random() * 2000);
}
