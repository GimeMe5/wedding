// js/main.js
import { logToScreen } from './debug.js';
import { checkUserStatus, fetchAllContent } from './api.js';
import { showScreen, displayMessage, setCountdownInterval } from './ui.js';
import { attachEventListeners } from './handlers.js';

// Сокращение для удобства
const TG = window.Telegram.WebApp;

// DOM элементы, которые нужны для инициализации
const section1 = document.getElementById('section1');
const section3 = document.getElementById('section3');
const countdownElement = document.getElementById('countdown');
const confirmButton = document.getElementById('confirmButton');
const container = document.querySelector('.container');

document.addEventListener('DOMContentLoaded', () => {
    // Инициализация Telegram Web App
    if (window.Telegram && TG) {
        TG.ready();
        TG.expand();
        logToScreen('Telegram Web App SDK инициализирован.');
        logToScreen(`initData: ${TG.initData}`);
        logToScreen(`initDataUnsafe: ${JSON.stringify(TG.initDataUnsafe, null, 2)}`);
        // TG.setBackgroundColor('#0a0a2a');
    } else {
        logToScreen('Telegram Web App SDK не загружен. Функционал может быть ограничен.', true);
    }

    // Загрузка всего контента и отображение страницы
    async function loadAndDisplayContent() {
        logToScreen('Starting loadAndDisplayContent...');
        const telegramId = TG.initDataUnsafe.user?.id;
        const username = TG.initDataUnsafe.user?.username;
        const firstName = TG.initDataUnsafe.user?.first_name;

        const userStatus = await checkUserStatus(telegramId, username, firstName);
        logToScreen(`Received user status: "${userStatus}"`);

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
            confirmButton.style.display = 'block'; // "Я приду" button
            container.style.opacity = '1';
            logToScreen('Container made visible.');
        } else if (userStatus === 'CONFIRMED') {
            logToScreen('User has already confirmed participation. Displaying menu buttons.');
            showScreen('menu-buttons-area');
            container.style.opacity = '1';
        } else if (userStatus === 'BANNED') { // <--- НОВОЕ УСЛОВИЕ ДЛЯ ЗАБАНЕННЫХ
            logToScreen('User is banned. Displaying ban message.', true);
            // Ваше новое сообщение о бане на английском
            displayMessage('Access to this application is restricted. If you believe this is an error or wish to receive the invitation, please contact the groom or the bride.', true);
            if (container) container.style.display = 'none'; // Скрыть основной контейнер
            TG.close(); // Опционально: закрыть Web App
        } else {
            logToScreen('Unknown user status or error. Displaying error message.', true);
            displayMessage('An error occurred while loading data. Please try again later.', true);
        }
    }

    // Привязываем все обработчики событий
    attachEventListeners();

    // Запускаем проверку статуса и загрузку контента
    loadAndDisplayContent();
});