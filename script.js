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
        <div class="card" onclick="openModal(${index})" style="animation-delay: ${index * 0.1}s">
            <div class="card-recipient">${escapeHtml(card.recipient)}</div>
            <div class="card-message">${escapeHtml(card.message)}</div>
            <div class="card-from">${escapeHtml(card.from)}</div>
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

function openModal(cardIndex) {
    const card = cardsData[cardIndex];
    const modal = document.getElementById('cardModal');
    
    document.getElementById('modalRecipient').textContent = card.recipient;
    document.getElementById('modalMessage').textContent = card.message;
    document.getElementById('modalFrom').textContent = card.from;
    
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    const modal = document.getElementById('cardModal');
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';
}

document.addEventListener('DOMContentLoaded', function() {
    createFloatingHearts();
    loadCardsData();
    
    document.getElementById('modalClose').addEventListener('click', closeModal);
    document.querySelector('.modal-overlay').addEventListener('click', closeModal);
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeModal();
        }
    });
});
