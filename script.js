let users = [
    { id: 1, name: "Администратор", email: "admin@test.com", password: "admin123", role: "admin", avatar: "A" },
    { id: 2, name: "Менеджер", email: "manager@test.com", password: "manager123", role: "manager", avatar: "M" },
    { id: 3, name: "Иван Иванов", email: "client@test.com", password: "client123", role: "client", avatar: "И" },
    { id: 4, name: "Руслан Русланович", email: "gg@test.com", password: "gg123456", role: "admin", avatar: "P" }
];

let orders = [
    { id: 1, userId: 3, userName: "Иван Иванов", product: "Brawl Pass+", price: 1499, date: "15.10.2023", status: "completed" },
    { id: 2, userId: 3, userName: "Руслан Р", product: "Brawl Pass", price: 699, date: "18.10.2023", status: "pending" },
    { id: 3, userId: 2, userName: "Менеджер", product: "2 сезона", price: 1120, date: "20.10.2023", status: "completed" }
];

let currentUser = null;
let currentFilter = 'all';

document.addEventListener('DOMContentLoaded', function() {
    loadUser();
    updateUI();
    updateDashboard();
    
    // Добавляем обработчики событий
    document.getElementById('searchOrders')?.addEventListener('input', function(e) {
        updateOrdersList(currentFilter, e.target.value);
    });
    
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal')) {
            closeAuthModal();
        }
    });
});

function openAuthModal() {
    document.getElementById('authModal').classList.add('active');
    showLogin();
}

function closeAuthModal() {
    document.getElementById('authModal').classList.remove('active');
}

function showLogin() {
    document.getElementById('loginForm').classList.remove('hidden');
    document.getElementById('registerForm').classList.add('hidden');
}

function showRegister() {
    document.getElementById('loginForm').classList.add('hidden');
    document.getElementById('registerForm').classList.remove('hidden');
}

function login() {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const role = document.getElementById('loginRole').value;
    
    const user = users.find(u => 
        u.email === email && 
        u.password === password && 
        u.role === role
    );
    
    if (user) {
        currentUser = user;
        saveUser();
        closeAuthModal();
        updateUI();
        updateDashboard();
        
        if (user.role === 'admin' || user.role === 'manager') {
            showDashboard();
        }
        
        showNotification('Успешный вход!', 'success');
    } else {
        showNotification('Неверные данные', 'error');
    }
}

function register() {
    const name = document.getElementById('registerName').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const confirm = document.getElementById('registerConfirm').value;
    
    if (!name || !email || !password) {
        showNotification('Заполните все поля', 'error');
        return;
    }
    
    if (password.length < 6) {
        showNotification('Пароль должен быть не менее 6 символов', 'error');
        return;
    }
    
    if (password !== confirm) {
        showNotification('Пароли не совпадают', 'error');
        return;
    }
    
    if (users.some(u => u.email === email)) {
        showNotification('Пользователь уже существует', 'error');
        return;
    }
    
    const newUser = {
        id: users.length + 1,
        name: name,
        email: email,
        password: password,
        role: 'client',
        avatar: name.charAt(0).toUpperCase()
    };
    
    users.push(newUser);
    currentUser = newUser;
    saveUser();
    closeAuthModal();
    updateUI();
    showNotification('Регистрация успешна!', 'success');
}

function logout() {
    currentUser = null;
    saveUser();
    closeUserPanel();
    updateUI();
    showNotification('Вы вышли из системы', 'info');
}

function updateUI() {
    const userName = document.getElementById('userName');
    const userRole = document.getElementById('userRole');
    const userAvatar = document.getElementById('userAvatar');
    const orderBadge = document.getElementById('orderBadge');
    const chatToggle = document.getElementById('chatToggle');
    
    if (currentUser) {
        userName.textContent = currentUser.name;
        userRole.textContent = currentUser.role === 'admin' ? 'Администратор' : 
                              currentUser.role === 'manager' ? 'Менеджер' : 'Клиент';
        userAvatar.textContent = currentUser.avatar;
        
        const userOrders = orders.filter(o => o.userId === currentUser.id);
        const pendingOrders = userOrders.filter(o => o.status === 'pending').length;
        
        if (pendingOrders > 0) {
            orderBadge.textContent = pendingOrders;
            orderBadge.classList.remove('hidden');
        } else {
            orderBadge.classList.add('hidden');
        }
        
        chatToggle.style.display = 'flex';
        updateUserOrders();
    } else {
        userName.textContent = 'Гость';
        userRole.textContent = 'Не авторизован';
        userAvatar.textContent = '?';
        orderBadge.classList.add('hidden');
        chatToggle.style.display = 'none';
    }
}

function updateUserOrders() {
    const userOrdersContainer = document.getElementById('userOrders');
    if (!currentUser) {
        userOrdersContainer.innerHTML = '<p>Войдите в систему, чтобы увидеть заказы</p>';
        return;
    }
    
    const userOrders = orders.filter(o => o.userId === currentUser.id);
    
    if (userOrders.length === 0) {
        userOrdersContainer.innerHTML = '<p>У вас пока нет заказов</p>';
        return;
    }
    
    let html = '';
    userOrders.forEach(order => {
        let statusClass = '';
        let statusText = '';
        
        switch(order.status) {
            case 'completed':
                statusClass = 'status-completed';
                statusText = 'Выполнен';
                break;
            case 'pending':
                statusClass = 'status-pending';
                statusText = 'В обработке';
                break;
            case 'cancelled':
                statusClass = 'status-cancelled';
                statusText = 'Отменен';
                break;
        }
        
        html += `
            <div class="order-item">
                <div class="order-header">
                    <strong>${order.product}</strong>
                    <span class="status-badge ${statusClass}">${statusText}</span>
                </div>
                <div class="order-details">
                    <div>Дата: ${order.date}</div>
                    <div>Цена: ${order.price} ₽</div>
                </div>
            </div>
        `;
    });
    
    userOrdersContainer.innerHTML = html;
}

function buyProduct(product, price) {
    if (!currentUser) {
        openAuthModal();
        showNotification('Пожалуйста, войдите в систему', 'warning');
        return;
    }
    
    const newOrder = {
        id: orders.length + 1,
        userId: currentUser.id,
        userName: currentUser.name,
        product: product,
        price: price,
        date: new Date().toLocaleDateString('ru-RU'),
        status: 'pending'
    };
    
    orders.push(newOrder);
    updateUI();
    updateDashboard();
    
    showNotification(`Заказ "${product}" оформлен!`, 'success');
    
    if (currentUser.role === 'admin' || currentUser.role === 'manager') {
        showDashboard();
    }
}

function showDashboard() {
    document.getElementById('dashboard').classList.add('active');
    document.getElementById('mainContent').style.display = 'none';
    updateDashboard();
}

function backToShop() {
    document.getElementById('dashboard').classList.remove('active');
    document.getElementById('mainContent').style.display = 'block';
}

function updateDashboard() {
    if (!currentUser || (currentUser.role !== 'admin' && currentUser.role !== 'manager')) {
        return;
    }
    
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, order) => sum + order.price, 0);
    const pendingOrders = orders.filter(o => o.status === 'pending').length;
    const completedOrders = orders.filter(o => o.status === 'completed').length;
    
    document.getElementById('totalOrders').textContent = totalOrders;
    document.getElementById('totalRevenue').textContent = totalRevenue + ' ₽';
    document.getElementById('pendingOrders').textContent = pendingOrders;
    document.getElementById('completedOrders').textContent = completedOrders;
    
    updateOrdersList();
}

function updateOrdersList(filter = currentFilter, search = '') {
    const ordersList = document.getElementById('ordersList');
    let filteredOrders = orders;
    
    if (filter !== 'all') {
        filteredOrders = orders.filter(o => o.status === filter);
    }
    
    if (search) {
        filteredOrders = filteredOrders.filter(o => 
            o.userName.toLowerCase().includes(search.toLowerCase()) ||
            o.product.toLowerCase().includes(search.toLowerCase())
        );
    }
    
    if (filteredOrders.length === 0) {
        ordersList.innerHTML = '<div class="table-row" style="text-align: center; padding: 2rem;">Заказы не найдены</div>';
        return;
    }
    
    let html = '';
    filteredOrders.forEach(order => {
        let statusClass = '';
        let statusText = '';
        
        switch(order.status) {
            case 'completed':
                statusClass = 'status-completed';
                statusText = 'Выполнен';
                break;
            case 'pending':
                statusClass = 'status-pending';
                statusText = 'В обработке';
                break;
            case 'cancelled':
                statusClass = 'status-cancelled';
                statusText = 'Отменен';
                break;
        }
        
        html += `
            <div class="table-row">
                <div>#${order.id}</div>
                <div>${order.userName}</div>
                <div>${order.product}</div>
                <div>${order.price} ₽</div>
                <div>
                    <span class="status-badge ${statusClass}">${statusText}</span>
                </div>
                <div>
                    ${order.status === 'pending' ? `
                        <button class="action-btn btn-complete" onclick="completeOrder(${order.id})">✓</button>
                        <button class="action-btn btn-cancel" onclick="cancelOrder(${order.id})">✕</button>
                    ` : ''}
                </div>
            </div>
        `;
    });
    
    ordersList.innerHTML = html;
}

function filterOrders(status) {
    currentFilter = status;
    const search = document.getElementById('searchOrders').value;
    updateOrdersList(status, search);
}

function completeOrder(orderId) {
    const order = orders.find(o => o.id === orderId);
    if (order) {
        order.status = 'completed';
        updateUI();
        updateDashboard();
        showNotification('Заказ выполнен', 'success');
    }
}

function cancelOrder(orderId) {
    const order = orders.find(o => o.id === orderId);
    if (order) {
        order.status = 'cancelled';
        updateUI();
        updateDashboard();
        showNotification('Заказ отменен', 'info');
    }
}

function openUserPanel() {
    document.getElementById('userPanel').classList.add('active');
    updateUserOrders();
}

function closeUserPanel() {
    document.getElementById('userPanel').classList.remove('active');
}

function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

function saveUser() {
    if (currentUser) {
        localStorage.setItem('melodieShopUser', JSON.stringify(currentUser));
    } else {
        localStorage.removeItem('melodieShopUser');
    }
}

function loadUser() {
    const saved = localStorage.getItem('melodieShopUser');
    if (saved) {
        try {
            currentUser = JSON.parse(saved);
        } catch (e) {
            currentUser = null;
        }
    }
}

function scrollToProducts() {
    document.getElementById('products').scrollIntoView({ behavior: 'smooth' });
}
