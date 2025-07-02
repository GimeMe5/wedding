document.addEventListener('DOMContentLoaded', () => {
    const section1 = document.getElementById('section1');
    const countdownElement = document.getElementById('countdown');
    const section3 = document.getElementById('section3');
    const confirmButton = document.getElementById('confirmButton');
    const container = document.querySelector('.container'); // Получаем основной контейнер

    let countdownInterval;

    // Базовый URL для запросов к бэкенду. Замените на актуальный URL вашего бэкенда.
    const API_BASE_URL = 'https://sovaint.ru:8443/api';
    const TG = window.Telegram.WebApp; // Сокращение для удобства

    // Инициализация Telegram Web App
    if (window.Telegram && TG) {
        TG.ready();
        TG.expand();
        // TG.setBackgroundColor('#0a0a2a');
    } else {
        console.warn('Telegram Web App SDK не загружен. Функционал может быть ограничен.');
    }

    // Функция для получения всех данных одним запросом
    async function fetchAllContent() {
        try {
            const initData = TG ? TG.initData : '';
            // Получаем данные пользователя из initDataUnsafe, если они доступны
            const user = TG.initDataUnsafe?.user;

            // Если бэкенд ожидает POST-запрос с телом для /invocation
            const response = await fetch(`${API_BASE_URL}/invocation`, {
                method: 'POST', // Изменено на POST, как в предоставленном коде
                headers: {
                    'Content-Type': 'application/json',
                    'X-Telegram-Init-Data': initData // Используем динамический initData
                },
                body: JSON.stringify({user})
            });

            if (!response.ok) {
                throw new Error(`Ошибка HTTP! Статус: ${response.status}`);
            }
            // Ожидаем JSON-ответ, содержащий text1, countdownDate и text3
            return await response.json();
        } catch (error) {
            console.error('Ошибка при получении всего контента:', error);
            return {
                text1: 'Не удалось загрузить текст 1.',
                countdownDate: null, // null, если дата не загружена
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
        }
    }

    // Функция для проверки статуса пользователя
    async function checkUserStatus() {
        try {
            const initData = TG ? TG.initData : '';
            const user = TG.initDataUnsafe?.user; // Исправлено: TG вместо tg

            // Если бэкенд ожидает POST-запрос с телом для /user-status
            const response = await fetch(`${API_BASE_URL}/user-status`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Telegram-Init-Data': initData // Используем динамический initData
                },
                body: JSON.stringify({user})
            });

            if (!response.ok) {
                throw new Error(`Ошибка HTTP! Статус: ${response.status}`);
            }
            const statusData = await response.json();
            // Предполагаем, что бэкенд возвращает { status: 'new' | 'confirmed' | 'other' }
            return statusData.status;
        } catch (error) {
            console.error('Ошибка при проверке статуса пользователя:', error);
            return 'error';
        }
    }

    // Загрузка всего контента и отображение страницы
    async function loadAndDisplayContent() {
        const userStatus = await checkUserStatus();

        // Скрываем контейнер по умолчанию в CSS, показываем только после проверки
        // container.style.display = 'none'; // Это уже не нужно, так как opacity: 0 в CSS

        if (userStatus === 'new' || userStatus === 'not_confirmed') { // Пример статусов
            const data = await fetchAllContent();

            section1.textContent = data.text1;
            section3.textContent = data.text3;

            if (data.countdownDate) {
                const targetDate = new Date(data.countdownDate);
                updateCountdown(targetDate);
                countdownInterval = setInterval(() => updateCountdown(targetDate), 1000);
            } else {
                countdownElement.innerHTML = "Дата не загружена.";
            }

            // Показываем контейнер после загрузки данных
            // container.style.display = 'flex'; // Это тоже не нужно, так как display: flex в CSS
            container.style.opacity = '1'; // Делаем видимым
        } else if (userStatus === 'confirmed') {
            // Если пользователь уже подтвердил, показываем другое сообщение
            document.body.innerHTML = '<div style="color: white; font-size: 1.5em; text-align: center; padding: 20px;">Вы уже подтвердили свое участие. Спасибо!</div>';
            document.body.style.display = 'flex';
            document.body.style.justifyContent = 'center';
            document.body.style.alignItems = 'center';
            document.body.style.minHeight = '100vh';
        } else {
            // Обработка других статусов или ошибок
            document.body.innerHTML = '<div style="color: red; font-size: 1.5em; text-align: center; padding: 20px;">Произошла ошибка при загрузке данных. Пожалуйста, попробуйте позже.</div>';
            document.body.style.display = 'flex';
            document.body.style.justifyContent = 'center';
            document.body.style.alignItems = 'center';
            document.body.style.minHeight = '100vh';
        }
    }

    // Обработчик нажатия на кнопку "Я приду"
    confirmButton.addEventListener('click', async () => {
        confirmButton.disabled = true;
        confirmButton.textContent = 'Отправка...';

        try {
            const initData = TG ? TG.initData : '';
            const userId = TG.initDataUnsafe?.user?.id || 'unknown';

            const response = await fetch(`${API_BASE_URL}/rsvp`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Telegram-Init-Data': initData
                },
                body: JSON.stringify({
                    telegramUserId: userId,
                    status: 'confirmed'
                })
            });

            if (response.ok) {
                confirmButton.textContent = 'Подтверждено!';
                confirmButton.style.background = 'linear-gradient(45deg, #28a745, #218838)';
                // После подтверждения можно обновить статус или закрыть приложение
                // TG.close();
            } else {
                const errorText = await response.text();
                confirmButton.textContent = 'Ошибка!';
                confirmButton.style.background = 'linear-gradient(45deg, #dc3545, #c82333)';
                console.error('Ошибка подтверждения:', errorText);
            }
        } catch (error) {
            confirmButton.textContent = 'Ошибка сети!';
            confirmButton.style.background = 'linear-gradient(45deg, #dc3545, #c82333)';
            console.error('Сетевая ошибка при подтверждении:', error);
        } finally {
            setTimeout(() => {
                confirmButton.disabled = false;
                confirmButton.textContent = 'Я приду';
                confirmButton.style.background = 'linear-gradient(45deg, #00c6ff, #ee00ff)';
            }, 3000);
        }
    });

    // Запускаем проверку статуса и загрузку контента
    loadAndDisplayContent();
});
