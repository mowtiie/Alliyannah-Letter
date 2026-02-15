function createFloatingHearts() {
    const heartsContainer = document.getElementById('heartsBackground');
    const hearts = ['❤️', '💕', '💖', '💝', '💗', '💓'];
    
    for (let i = 0; i < 15; i++) {
        const heart = document.createElement('div');
        heart.className = 'heart-float';
        heart.textContent = hearts[Math.floor(Math.random() * hearts.length)];
        heart.style.left = Math.random() * 100 + '%';
        heart.style.animationDelay = Math.random() * 15 + 's';
        heart.style.animationDuration = (15 + Math.random() * 10) + 's';
        heartsContainer.appendChild(heart);
    }
}

async function loadCards() {
    try {
        const response = await fetch('cards.json');
        const cards = await response.json();
        renderCards(cards);
    } catch (error) {
        console.error('Error loading cards:', error);
        document.getElementById('cardsGrid').innerHTML = `
            <div class="empty-state">
                Error loading cards. Please make sure cards.json is in the same directory.
            </div>
        `;
    }
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function renderCards(cards) {
    const cardsGrid = document.getElementById('cardsGrid');
    
    if (cards.length === 0) {
        cardsGrid.innerHTML = '<div class="empty-state">No cards found in cards.json</div>';
        return;
    }

    cardsGrid.innerHTML = cards.map((card, index) => `
        <div class="card" onclick="toggleCard(${index})" style="animation-delay: ${index * 0.1}s">
            <div class="card-header">
                <div class="card-recipient">${escapeHtml(card.recipient)}</div>
                <div class="card-from">${escapeHtml(card.from)}</div>
            </div>
            <div class="card-content" id="card-content-${index}">
                <div class="card-message">${escapeHtml(card.message)}</div>
            </div>
            <div class="card-toggle-icon">▼</div>
        </div>
    `).join('');
}

let cardsData = [];
async function loadCardsData() {
    try {
        const response = await fetch('cards.json');
        cardsData = await response.json();
        renderCards(cardsData);
    } catch (error) {
        console.error('Error loading cards:', error);
        document.getElementById('cardsGrid').innerHTML = `
            <div class="empty-state">
                Error loading cards. Please make sure cards.json is in the same directory.
            </div>
        `;
    }
}

function toggleCard(cardIndex) {
    const cardContent = document.getElementById(`card-content-${cardIndex}`);
    const card = cardContent.closest('.card');
    const icon = card.querySelector('.card-toggle-icon');
    
    // Close all other cards
    document.querySelectorAll('.card').forEach((otherCard, index) => {
        if (index !== cardIndex && otherCard.classList.contains('expanded')) {
            otherCard.classList.remove('expanded');
            const otherContent = document.getElementById(`card-content-${index}`);
            const otherIcon = otherCard.querySelector('.card-toggle-icon');
            if (otherContent) otherContent.style.maxHeight = '0';
            if (otherIcon) otherIcon.style.transform = 'rotate(0deg)';
        }
    });
    
    // Toggle current card
    const isExpanded = card.classList.contains('expanded');
    
    if (isExpanded) {
        card.classList.remove('expanded');
        cardContent.style.maxHeight = '0';
        icon.style.transform = 'rotate(0deg)';
    } else {
        card.classList.add('expanded');
        cardContent.style.maxHeight = cardContent.scrollHeight + 'px';
        icon.style.transform = 'rotate(180deg)';
    }
}

function initThemeToggle() {
    const themeToggle = document.getElementById('themeToggle');
    const themeIcon = document.querySelector('.theme-icon');
    
    const currentTheme = localStorage.getItem('theme') || 'light';
    document.body.classList.toggle('dark-mode', currentTheme === 'dark');
    themeIcon.textContent = currentTheme === 'dark' ? '☀️' : '🌙';
    
    themeToggle.addEventListener('click', function() {
        document.body.classList.toggle('dark-mode');
        const isDark = document.body.classList.contains('dark-mode');
        
        themeIcon.style.transform = 'rotate(360deg) scale(0)';
        
        setTimeout(() => {
            themeIcon.textContent = isDark ? '☀️' : '🌙';
            themeIcon.style.transform = 'rotate(0deg) scale(1)';
        }, 200);
        
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
    });
}

const stickyHeader = document.getElementById('stickyHeader');
window.addEventListener('scroll', () => {
    if (window.scrollY > 100) {
        stickyHeader.classList.add('visible');
    } else {
        stickyHeader.classList.remove('visible');
    }
});

document.addEventListener('DOMContentLoaded', function() {
    createFloatingHearts();
    loadCardsData();
    initThemeToggle();
});