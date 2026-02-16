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
                <div class="card-recipient">${escapeHtml(card.title)}</div>
                <div class="card-from">${escapeHtml(card.date)}</div>
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
    
    // Add event listener to locked card after rendering
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

const PASSCODE = '143143'; // Change this to your desired 6-digit passcode
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
    
    // Focus on first input
    setTimeout(() => {
        document.getElementById('digit-0').focus();
    }, 100);
}

function closePasscodeModal() {
    const passcodeModal = document.getElementById('passcodeModal');
    passcodeModal.classList.remove('active');
    document.body.style.overflow = 'auto';
    
    // Clear inputs
    for (let i = 0; i < 6; i++) {
        document.getElementById(`digit-${i}`).value = '';
    }
    
    // Clear error
    document.getElementById('passcodeError').style.display = 'none';
}

function handleDigitInput(index) {
    const input = document.getElementById(`digit-${index}`);
    const value = input.value;
    
    // Only allow numbers
    if (value && !/^\d$/.test(value)) {
        input.value = '';
        return;
    }
    
    // Move to next input if value entered
    if (value && index < 5) {
        document.getElementById(`digit-${index + 1}`).focus();
    }
    
    // Check if all digits entered
    if (index === 5 && value) {
        checkPasscode();
    }
}

function handleDigitKeydown(index, event) {
    const input = document.getElementById(`digit-${index}`);
    
    // Handle backspace
    if (event.key === 'Backspace' && !input.value && index > 0) {
        document.getElementById(`digit-${index - 1}`).focus();
    }
    
    // Handle paste
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
        // Correct passcode
        isLockedCardUnlocked = true;
        closePasscodeModal();
        unlockCard();
    } else {
        // Wrong passcode
        errorElement.textContent = 'Incorrect passcode. Try again!';
        errorElement.style.display = 'block';
        
        // Shake animation
        const passcodeInputs = document.querySelector('.passcode-inputs');
        passcodeInputs.style.animation = 'shake 0.5s';
        setTimeout(() => {
            passcodeInputs.style.animation = '';
        }, 500);
        
        // Clear inputs
        for (let i = 0; i < 6; i++) {
            document.getElementById(`digit-${i}`).value = '';
        }
        document.getElementById('digit-0').focus();
    }
}

function unlockCard() {
    const lockedCard = document.querySelector('.locked-card');
    
    // Remove old event listener
    lockedCard.removeEventListener('click', openLockedCard);
    
    lockedCard.classList.add('unlocked');
    
    // Replace content with actual card
    const lockedCardData = {
        recipient: "My Dearest Ali",
        message: "This is a special message just for you! You found the secret gift. I wanted to create something unique that only you could unlock. You mean the world to me, and this hidden treasure is a reminder of how special you are. Thank you for being amazing! ❤️",
        from: "Your Secret Admirer",
        downloadLink: "./faithful.apk", // Just put your APK file in the same directory as index.html
        downloadText: "Faithful"
    };
    
    setTimeout(() => {
        lockedCard.innerHTML = `
            <div class="card-header">
                <div class="card-recipient">${escapeHtml(lockedCardData.recipient)}</div>
                <div class="card-from">${escapeHtml(lockedCardData.from)}</div>
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
        
        // Add new event listener for toggling
        lockedCard.addEventListener('click', function(e) {
            // Don't toggle if clicking on the download link
            if (!e.target.closest('.download-link')) {
                toggleLockedCardContent();
            }
        });
        
        // Auto expand to show the message
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
    
    // Close all other regular cards
    document.querySelectorAll('.card:not(.locked-card)').forEach((otherCard) => {
        if (otherCard.classList.contains('expanded')) {
            otherCard.classList.remove('expanded');
            const otherContent = otherCard.querySelector('.card-content');
            const otherIcon = otherCard.querySelector('.card-toggle-icon');
            if (otherContent) otherContent.style.maxHeight = '0';
            if (otherIcon) otherIcon.style.transform = 'rotate(0deg)';
        }
    });
    
    // Toggle current card
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
