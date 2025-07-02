document.addEventListener('DOMContentLoaded', () => {
    const section1 = document.getElementById('section1');
    const countdownElement = document.getElementById('countdown');
    const section3 = document.getElementById('section3');
    const confirmButton = document.getElementById('confirmButton');
    const container = document.querySelector('.container'); // Получаем основной контейнер
    let debugOutput = document.getElementById('debug-output'); // Элемент для отладочного вывода

    // Если debugOutput не существует, создаем его динамически
    if (!debugOutput) {
        debugOutput = document.createElement('div');
        debugOutput.id = 'debug-output';
        document.body.appendChild(debugOutput);
        // Добавляем базовые стили для динамически созданного блока
        debugOutput.style.cssText = `
            position: fixed;
            bottom: 0;
            left: 0;
            width: 100%;
            max-height: 30vh;
            background: rgba(0, 0, 0, 0.8);
            color: limegreen;
            font-family: monospace;
            font-size: 0.8em;
            overflow-y: auto;
            padding: 10px;
            box-sizing: border-box;
            z-index: 9999;
            display: block; /* Всегда показываем */
        `;
    }

    let countdownInterval;

    // Базовый URL для запросов к бэкенду. Замените на актуальный URL вашего бэкенда.
    const API_BASE_URL = 'https://sovaint.ru:8443/api';
    const TG = window.Telegram.WebApp; // Сокращение для удобства

    // Функция для вывода отладочной информации на экран
    function logToScreen(message, isError = false) {
        if (debugOutput) {
            const p = document.createElement('p');
            p.style.color = isError ? 'red' : 'limegreen';
            p.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
            debugOutput.appendChild(p);
            debugOutput.scrollTop = debugOutput.scrollHeight; // Прокручиваем вниз
            debugOutput.classList.add('active'); // Показываем отладочный блок
        }
    }

    // Перехватываем console.log и console.error для вывода на экран
    const originalConsoleLog = console.log;
    const originalConsoleError = console.error;

    console.log = (...args) => {
        originalConsoleLog(...args);
        logToScreen(args.map(arg => typeof arg === 'object' ? JSON.stringify(arg, null, 2) : arg).join(' '));
    };

    console.error = (...args) => {
        originalConsoleError(...args);
        logToScreen(args.map(arg => typeof arg === 'object' ? JSON.stringify(arg, null, 2) : arg).join(' '), true);
    };

    // Принудительно показываем отладочный блок при загрузке
    if (debugOutput) {
        debugOutput.classList.add('active');
        logToScreen('Отладочный блок активирован.');
    }


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

    // Функция для получения всех данных одним запросом
    async function fetchAllContent() {
        logToScreen('Начало запроса fetchAllContent...');
        try {
            const initData = TG ? TG.initData : '';
            const user = TG.initDataUnsafe?.user;
            logToScreen(`Данные пользователя для /invocation: ${JSON.stringify(user, null, 2)}`);

            const requestBody = {
                id: user?.id || null,
                first_name: user?.first_name || '',
                last_name: user?.last_name || '',
                username: user?.username || ''
            };
            logToScreen(`Тело запроса для /invocation: ${JSON.stringify(requestBody, null, 2)}`);

            const response = await fetch(`${API_BASE_URL}/invocation`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Telegram-Init-Data': initData
                },
                body: JSON.stringify(requestBody)
            });

            logToScreen(`Ответ от /invocation. Статус: ${response.status}`);
            if (!response.ok) {
                const errorText = await response.text();
                logToScreen(`Ошибка от /invocation: ${errorText}`, true);
                throw new Error(`Ошибка HTTP! Статус: ${response.status}. Ответ: ${errorText}`);
            }
            const data = await response.json();
            logToScreen(`Полученные данные от /invocation: ${JSON.stringify(data, null, 2)}`);
            return data;
        } catch (error) {
            logToScreen(`Критическая ошибка при получении всего контента: ${error.message}`, true);
            return {
                text1: 'Не удалось загрузить текст 1.',
                cooldownDate: null, // Исправлено: ожидаем cooldownDate
                text3: 'Не удалось загрузить текст 3.'
            };
        }
    }

    // Функция для обновления обратного отсчета
    function updateCountdown(targetDate) {
        const now = new Date().getTime();
        const distance = targetDate - now;

        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        document.getElementById('days').textContent = String(days).padStart(2, '0');
        document.getElementById('hours').textContent = String(hours).padStart(2, '0');
        document.getElementById('minutes').textContent = String(minutes).padStart(2, '0');
        document.getElementById('seconds').textContent = String(seconds).padStart(2, '0');

        if (distance < 0) {
            clearInterval(countdownInterval);
            countdownElement.innerHTML = "Событие началось!";
            logToScreen('Обратный отсчет завершен.');
        }
    }

    // Функция для проверки статуса пользователя
    async function checkUserStatus() {
        logToScreen('Начало запроса checkUserStatus...');
        try {
            const initData = TG ? TG.initData : '';
            const user = TG.initDataUnsafe?.user;
            logToScreen(`Данные пользователя для /user-status: ${JSON.stringify(user, null, 2)}`);

            const requestBody = {
                id: user?.id || null,
                first_name: user?.first_name || '',
                last_name: user?.last_name || '',
                username: user?.username || ''
            };
            logToScreen(`Тело запроса для /user-status: ${JSON.stringify(requestBody, null, 2)}`);

            const response = await fetch(`${API_BASE_URL}/user-status`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Telegram-Init-Data': initData
                },
                body: JSON.stringify(requestBody)
            });

            logToScreen(`Ответ от /user-status. Статус: ${response.status}`);
            if (!response.ok) {
                const errorText = await response.text();
                logToScreen(`Ошибка от /user-status: ${errorText}`, true);
                throw new Error(`Ошибка HTTP! Статус: ${response.status}. Ответ: ${errorText}`);
            }
            const statusData = await response.json();
            logToScreen(`Полученные данные от /user-status: ${JSON.stringify(statusData, null, 2)}`);
            // Исправлено: обращаемся к statusData.userStatus
            return statusData.userStatus;
        } catch (error) {
            logToScreen(`Критическая ошибка при проверке статуса пользователя: ${error.message}`, true);
            return 'error';
        }
    }

    // Функция для отображения сообщения (вместо перезаписи body)
    function displayMessage(message, isError = false) {
        if (container) {
            container.style.display = 'none'; // Скрываем основной контент
        }
        const messageDiv = document.createElement('div');
        messageDiv.style.cssText = `
            color: ${isError ? 'red' : 'white'};
            font-size: 1.5em;
            text-align: center;
            padding: 20px;
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 80%;
            max-width: 400px;
            background: rgba(0, 0, 0, 0.7);
            border-radius: 10px;
            box-shadow: 0 0 20px rgba(0, 198, 255, 0.5);
            z-index: 100;
        `;
        messageDiv.textContent = message;
        document.body.appendChild(messageDiv);
    }

    // Загрузка всего контента и отображение страницы
    async function loadAndDisplayContent() {
        logToScreen('Запуск loadAndDisplayContent...');
        const userStatus = await checkUserStatus();
        logToScreen(`Полученный статус пользователя: "${userStatus}"`);

        // Исправлено: используем "NEW" и "NOT_CONFIRMED" в верхнем регистре
        if (userStatus === 'NEW' || userStatus === 'NOT_CONFIRMED') {
            logToScreen('Статус пользователя позволяет отобразить основной контент.');
            const data = await fetchAllContent();

            section1.textContent = data.text1;
            section3.textContent = data.text3;

            // Исправлено: используем data.cooldownDate
            if (data.cooldownDate) {
                const targetDate = new Date(data.cooldownDate);
                logToScreen(`Целевая дата для отсчета: ${targetDate.toLocaleString()}`);
                updateCountdown(targetDate);
                countdownInterval = setInterval(() => updateCountdown(targetDate), 1000);
            } else {
                countdownElement.innerHTML = "Дата не загружена.";
                logToScreen('Дата для отсчета не получена.', true);
            }

            container.style.opacity = '1';
            logToScreen('Контейнер сделан видимым.');
        } else if (userStatus === 'CONFIRMED') { // Предполагаем, что подтвержденный статус тоже в верхнем регистре
            logToScreen('Пользователь уже подтвердил участие. Отображаем сообщение.');
            displayMessage('Вы уже подтвердили свое участие. Спасибо!');
        } else {
            logToScreen('Неизвестный статус пользователя или ошибка. Отображаем сообщение об ошибке.', true);
            displayMessage('Произошла ошибка при загрузке данных. Пожалуйста, попробуйте позже.', true);
        }
    }

    // Обработчик нажатия на кнопку "Я приду"
    confirmButton.addEventListener('click', async () => {
        logToScreen('Нажата кнопка "Я приду".');
        confirmButton.disabled = true;
        confirmButton.textContent = 'Отправка...';

        try {
            const initData = TG ? TG.initData : '';
            const userId = TG.initDataUnsafe?.user?.id || 'unknown';
            logToScreen(`Данные пользователя для /rsvp: userId=${userId}`);

            const requestBody = {
                telegramUserId: userId,
                status: 'confirmed'
            };
            logToScreen(`Тело запроса для /rsvp: ${JSON.stringify(requestBody, null, 2)}`);

            const response = await fetch(`${API_BASE_URL}/rsvp`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Telegram-Init-Data': initData
                },
                body: JSON.stringify(requestBody)
            });

            logToScreen(`Ответ от /rsvp. Статус: ${response.status}`);
            if (response.ok) {
                confirmButton.textContent = 'Подтверждено!';
                confirmButton.style.background = 'linear-gradient(45deg, #28a745, #218838)';
                logToScreen('Участие успешно подтверждено.');
                // TG.close();
            } else {
                const errorText = await response.text();
                confirmButton.textContent = 'Ошибка!';
                confirmButton.style.background = 'linear-gradient(45deg, #dc3545, #c82333)';
                logToScreen(`Ошибка подтверждения: ${errorText}`, true);
            }
        } catch (error) {
            confirmButton.textContent = 'Ошибка сети!';
            confirmButton.style.background = 'linear-gradient(45deg, #dc3545, #c82333)';
            logToScreen(`Сетевая ошибка при подтверждении: ${error.message}`, true);
        } finally {
            setTimeout(() => {
                confirmButton.disabled = false;
                confirmButton.textContent = 'Я приду';
                confirmButton.style.background = 'linear-gradient(45deg, #00c6ff, #ee00ff)';
                logToScreen('Кнопка "Я приду" сброшена.');
            }, 3000);
        }
    });

    // Запускаем проверку статуса и загрузку контента
    loadAndDisplayContent();
});
