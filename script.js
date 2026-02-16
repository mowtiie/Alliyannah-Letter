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

    const regularCards = cards.map((card, index) => `
        <div class="card" onclick="toggleCard(${index})" style="animation-delay: ${index * 0.1}s">
            <div class="card-header">
                <div class="card-title">${escapeHtml(card.title)}</div>
                <div class="card-date">${escapeHtml(card.date)}</div>
            </div>
            <div class="card-content" id="card-content-${index}">
                <div class="card-message">${escapeHtml(card.message)}</div>
            </div>
            <div class="card-toggle-icon">▼</div>
        </div>
    `).join('');

    const lockedCard = `
        <div class="card locked-card" style="animation-delay: ${cards.length * 0.1}s">
            <div class="locked-card-content">
                <div class="locked-icon">🎁</div>
                <div class="locked-title">Special Gift</div>
                <div class="locked-subtitle">Enter passcode to unlock</div>
                <div class="locked-lock">🔒</div>
            </div>
        </div>
    `;

    cardsGrid.innerHTML = regularCards + lockedCard;
    
    setTimeout(() => {
        const lockedCardElement = document.querySelector('.locked-card');
        if (lockedCardElement) {
            lockedCardElement.addEventListener('click', openLockedCard);
        }
    }, 100);
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
    
    document.querySelectorAll('.card').forEach((otherCard, index) => {
        if (index !== cardIndex && otherCard.classList.contains('expanded')) {
            otherCard.classList.remove('expanded');
            const otherContent = document.getElementById(`card-content-${index}`);
            const otherIcon = otherCard.querySelector('.card-toggle-icon');
            if (otherContent) otherContent.style.maxHeight = '0';
            if (otherIcon) otherIcon.style.transform = 'rotate(0deg)';
        }
    });
    
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

const PASSCODE = '112425'; 
let isLockedCardUnlocked = false;

function openLockedCard(event) {
    if (event) {
        event.stopPropagation();
    }
    
    if (isLockedCardUnlocked) {
        toggleLockedCardContent();
        return;
    }

    const passcodeModal = document.getElementById('passcodeModal');
    passcodeModal.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    setTimeout(() => {
        document.getElementById('digit-0').focus();
    }, 100);
}

function closePasscodeModal() {
    const passcodeModal = document.getElementById('passcodeModal');
    passcodeModal.classList.remove('active');
    document.body.style.overflow = 'auto';
    
    for (let i = 0; i < 6; i++) {
        document.getElementById(`digit-${i}`).value = '';
    }
    
    document.getElementById('passcodeError').style.display = 'none';
}

function handleDigitInput(index) {
    const input = document.getElementById(`digit-${index}`);
    const value = input.value;
    
    if (value && !/^\d$/.test(value)) {
        input.value = '';
        return;
    }
    
    if (value && index < 5) {
        document.getElementById(`digit-${index + 1}`).focus();
    }
    
    if (index === 5 && value) {
        checkPasscode();
    }
}

function handleDigitKeydown(index, event) {
    const input = document.getElementById(`digit-${index}`);
    
    if (event.key === 'Backspace' && !input.value && index > 0) {
        document.getElementById(`digit-${index - 1}`).focus();
    }
    
    if (event.key === 'v' && (event.ctrlKey || event.metaKey)) {
        event.preventDefault();
        navigator.clipboard.readText().then(text => {
            const digits = text.replace(/\D/g, '').slice(0, 6);
            for (let i = 0; i < digits.length && i < 6; i++) {
                document.getElementById(`digit-${i}`).value = digits[i];
            }
            if (digits.length === 6) {
                checkPasscode();
            }
        });
    }
}

function checkPasscode() {
    let enteredCode = '';
    for (let i = 0; i < 6; i++) {
        enteredCode += document.getElementById(`digit-${i}`).value;
    }
    
    const errorElement = document.getElementById('passcodeError');
    
    if (enteredCode === PASSCODE) {
        isLockedCardUnlocked = true;
        closePasscodeModal();
        unlockCard();
    } else {
        errorElement.textContent = 'Incorrect passcode. Try again!';
        errorElement.style.display = 'block';
        
        const passcodeInputs = document.querySelector('.passcode-inputs');
        passcodeInputs.style.animation = 'shake 0.5s';
        setTimeout(() => {
            passcodeInputs.style.animation = '';
        }, 500);
        
        for (let i = 0; i < 6; i++) {
            document.getElementById(`digit-${i}`).value = '';
        }
        document.getElementById('digit-0').focus();
    }
}

function unlockCard() {
    const lockedCard = document.querySelector('.locked-card');
    
    lockedCard.removeEventListener('click', openLockedCard);
    
    lockedCard.classList.add('unlocked');
    
    const lockedCardData = {
        title: "So Ali won't forget",
        message: "️I know that you've been struggling with your short-term memory, Ali. So I made something for you, a simple application that will help you quickly and easily write down your thoughts. 🩵",
        date: "From Vrix",
        downloadLink: "./faithful.apk",
        downloadText: "Faithful"
    };
    
    setTimeout(() => {
        lockedCard.innerHTML = `
            <div class="card-header">
                <div class="card-title">${escapeHtml(lockedCardData.title)}</div>
                <div class="card-date">${escapeHtml(lockedCardData.date)}</div>
            </div>
            <div class="card-content" id="card-content-locked" style="max-height: 0;">
                <div class="card-message">${escapeHtml(lockedCardData.message)}</div>
                <div class="card-download">
                    <a href="${lockedCardData.downloadLink}" class="download-link" download>
                        <span class="download-icon">📦</span>
                        <span class="download-text">${escapeHtml(lockedCardData.downloadText)}</span>
                        <span class="download-arrow">→</span>
                    </a>
                </div>
            </div>
            <div class="card-toggle-icon">▼</div>
        `;
        
        lockedCard.addEventListener('click', function(e) {
            if (!e.target.closest('.download-link')) {
                toggleLockedCardContent();
            }
        });
        
        setTimeout(() => {
            toggleLockedCardContent();
        }, 300);
    }, 600);
}

function toggleLockedCardContent() {
    const lockedCard = document.querySelector('.locked-card');
    const cardContent = document.getElementById('card-content-locked');
    const icon = lockedCard.querySelector('.card-toggle-icon');
    
    if (!cardContent || !icon) return;
    
    document.querySelectorAll('.card:not(.locked-card)').forEach((otherCard) => {
        if (otherCard.classList.contains('expanded')) {
            otherCard.classList.remove('expanded');
            const otherContent = otherCard.querySelector('.card-content');
            const otherIcon = otherCard.querySelector('.card-toggle-icon');
            if (otherContent) otherContent.style.maxHeight = '0';
            if (otherIcon) otherIcon.style.transform = 'rotate(0deg)';
        }
    });
    
    const isExpanded = lockedCard.classList.contains('expanded');
    
    if (isExpanded) {
        lockedCard.classList.remove('expanded');
        cardContent.style.maxHeight = '0';
        icon.style.transform = 'rotate(0deg)';
    } else {
        lockedCard.classList.add('expanded');
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
