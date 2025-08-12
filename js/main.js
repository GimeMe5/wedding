// js/main.js
import { logToScreen } from './debug.js';
import { checkUserStatus, fetchAllContent } from './api.js';
import { showScreen, displayMessage, setCountdownInterval } from './ui.js';
import { attachEventListeners, seatingImageURL } from './handlers.js';

// Сокращение для удобства
const TG = window.Telegram.WebApp;

// DOM элементы, которые нужны для инициализации
const section1 = document.getElementById('section1');
const section3 = document.getElementById('section3');
const countdownElement = document.getElementById('countdown');
const confirmButton = document.getElementById('confirmButton');
const container = document.querySelector('.container');
const seatingButton = document.getElementById('seatingButton');


document.addEventListener('DOMContentLoaded', () => {
    // Инициализация Telegram Web App
    if (window.Telegram && TG) {
        TG.ready();
        TG.expand();
        logToScreen('Telegram Web App SDK инициализирован.');
        logToScreen(`initData: ${TG.initData}`);
        logToScreen(`initDataUnsafe: ${JSON.stringify(TG.initDataUnsafe, null, 2)}`);
    } else {
        logToScreen('Telegram Web App SDK не загружен. Функционал может быть ограничен.', true);
    }

    async function loadAndDisplayContent() {
        logToScreen('Starting loadAndDisplayContent...');
        const userStatus = await checkUserStatus();
        logToScreen(`Received user status: "${userStatus}"`);

        // Логика для NEW/NOT_CONFIRMED
        if (userStatus === 'NEW' || userStatus === 'NOT_CONFIRMED') {
            logToScreen('User status allows displaying main content.');
            const data = await fetchAllContent();

            section1.textContent = data.text1;
            section3.textContent = data.text2;

            if (data.cooldownDate) {
                const targetDate = new Date(data.cooldownDate);
                logToScreen(`Target date for countdown: ${targetDate.toLocaleString()}`);
                setCountdownInterval(targetDate);
            } else {
                countdownElement.innerHTML = "Date not loaded.";
                logToScreen('Countdown date not received.', true);
            }

            showScreen('main-content-area');
            confirmButton.style.display = 'block';
            container.style.opacity = '1';
        }
        // Логика для CONFIRMED
        else if (userStatus === 'CONFIRMED') {
            logToScreen('User has already confirmed participation. Displaying menu buttons.');
            showScreen('menu-buttons-area');
            container.style.opacity = '1';
            seatingButton.disabled = false;
            seatingButton.classList.remove('disabled');
            logToScreen('Кнопка "Рассадка" активирована для подтвержденного пользователя.');
        }
        // ...existing logic for BANNED and ERROR
        else if (userStatus === 'BANNED') {
            logToScreen('User is banned. Displaying ban message.', true);
            displayMessage('Access to this application is restricted. If you believe this is an error or wish to receive the invitation, please contact the groom or the bride.', true);
            if (container) container.style.display = 'none';
        } else {
            logToScreen('Unknown user status or error. Displaying error message.', true);
            displayMessage('An error occurred while loading data. Please try again later.', true);
        }
    }

    attachEventListeners();
    loadAndDisplayContent();
});