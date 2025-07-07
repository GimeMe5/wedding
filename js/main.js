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
        logToScreen('Запуск loadAndDisplayContent...');
        const userStatus = await checkUserStatus();
        logToScreen(`Полученный статус пользователя: "${userStatus}"`);

        if (userStatus === 'NEW' || userStatus === 'NOT_CONFIRMED') {
            logToScreen('Статус пользователя позволяет отобразить основной контент.');
            const data = await fetchAllContent();

            section1.textContent = data.text1;
            section3.textContent = data.text3;

            if (data.cooldownDate) {
                const targetDate = new Date(data.cooldownDate);
                logToScreen(`Целевая дата для отсчета: ${targetDate.toLocaleString()}`);
                setCountdownInterval(targetDate);
            } else {
                countdownElement.innerHTML = "Дата не загружена.";
                logToScreen('Дата для отсчета не получена.', true);
            }

            // Показываем основной контент и кнопку "Я приду"
            showScreen('main-content-area');
            confirmButton.style.display = 'block'; // Кнопка "Я приду"
            container.style.opacity = '1';
            logToScreen('Контейнер сделан видимым.');
        } else if (userStatus === 'CONFIRMED') {
            logToScreen('Пользователь уже подтвердил участие. Отображаем меню кнопок.');
            showScreen('menu-buttons-area');
            container.style.opacity = '1'; // Контейнер должен быть виден для меню
        } else {
            logToScreen('Неизвестный статус пользователя или ошибка. Отображаем сообщение об ошибке.', true);
            displayMessage('Произошла ошибка при загрузке данных. Пожалуйста, попробуйте позже.', true);
        }
    }

    // Привязываем все обработчики событий
    attachEventListeners();

    // Запускаем проверку статуса и загрузку контента
    loadAndDisplayContent();
});