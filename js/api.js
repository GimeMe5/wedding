// js/api.js
import { logToScreen } from './debug.js';

// Базовый URL для запросов к бэкенду. Замените на актуальный URL вашего бэкенда.
const API_BASE_URL = 'https://sovaint.ru:8443/api';
const TG = window.Telegram.WebApp; // Сокращение для удобства

// Вспомогательная функция для получения данных пользователя (без изменений)
function getTelegramUserPayload() {
    const user = TG.initDataUnsafe?.user;
    if (!user) {
        logToScreen('Внимание: Данные пользователя Telegram WebApp недоступны.', true);
        return {}; // Возвращаем пустой объект, если user не найден
    }
    // Формируем объект, который соответствует вашей структуре TelegramUser на бэкенде
    return {
        id: user.id || null,
        is_bot: user.is_bot || false,
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        username: user.username || '',
        language_code: user.language_code || '',
        is_premium: user.is_premium || false,
        added_to_attachment_menu: user.added_to_attachment_menu || false,
        allows_write_to_pm: user.allows_write_to_pm || false,
        photo_url: user.photo_url || ''
        // Если вы добавили auth_date или hash в TelegramUser, их можно добавить сюда:
        // auth_date: TG.initDataUnsafe?.auth_date || null,
        // hash: TG.initDataUnsafe?.hash || ''
    };
}

// Функция для получения всех данных одним запросом (без изменений)
export async function fetchAllContent() {
    logToScreen('Начало запроса fetchAllContent...');
    try {
        const initData = TG ? TG.initData : '';
        const userPayload = getTelegramUserPayload(); // Используем новую вспомогательную функцию

        logToScreen(`Тело запроса для /invocation: ${JSON.stringify(userPayload, null, 2)}`);

        const response = await fetch(`${API_BASE_URL}/invocation`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Telegram-Init-Data': initData
            },
            body: JSON.stringify(userPayload) // Отправляем полный объект TelegramUser
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
            cooldownDate: null,
            text2: 'Не удалось загрузить текст 3.'
        };
    }
}

// Функция для проверки статуса пользователя (без изменений)
export async function checkUserStatus() {
    logToScreen('Начало запроса checkUserStatus...');
    try {
        const initData = TG ? TG.initData : '';
        const userPayload = getTelegramUserPayload(); // Используем новую вспомогательную функцию

        logToScreen(`Тело запроса для /user-status: ${JSON.stringify(userPayload, null, 2)}`);

        const response = await fetch(`${API_BASE_URL}/user-status`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Telegram-Init-Data': initData
            },
            body: JSON.stringify(userPayload) // Отправляем полный объект TelegramUser
        });

        logToScreen(`Ответ от /user-status. Статус: ${response.status}`);
        if (!response.ok) {
            const errorText = await response.text();
            logToScreen(`Ошибка от /user-status: ${errorText}`, true);
            throw new Error(`Ошибка HTTP! Статус: ${response.status}. Ответ: ${errorText}`);
        }
        const statusData = await response.json();
        logToScreen(`Полученные данные от /user-status: ${JSON.stringify(statusData, null, 2)}`);
        return statusData.userStatus;
    } catch (error) {
        logToScreen(`Критическая ошибка при проверке статуса пользователя: ${error.message}`, true);
        return 'error';
    }
}

// Функция для подтверждения участия (без изменений)
export async function confirmParticipationRequest() {
    const confirmButton = document.getElementById('confirmButton');
    logToScreen('Нажата кнопка "Я приду".');
    confirmButton.disabled = true;
    confirmButton.textContent = 'Отправка...';

    try {
        const initData = TG ? TG.initData : '';
        const userPayload = getTelegramUserPayload(); // Используем новую вспомогательную функцию
        userPayload.status = 'CONFIRMED'; // Добавляем статус к объекту пользователя

        logToScreen(`Тело запроса для /rsvp: ${JSON.stringify(userPayload, null, 2)}`);

        const response = await fetch(`${API_BASE_URL}/rsvp`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Telegram-Init-Data': initData
            },
            body: JSON.stringify(userPayload) // Отправляем полный объект TelegramUser со статусом
        });

        logToScreen(`Ответ от /rsvp. Статус: ${response.status}`);
        if (response.ok) {
            confirmButton.textContent = 'Подтверждено!';
            confirmButton.style.background = 'linear-gradient(45deg, #28a745, #218838)';
            logToScreen('Участие успешно подтверждено. Переключаемся на меню.');
            return true;
        } else {
            const errorText = await response.text();
            confirmButton.textContent = 'Ошибка!';
            confirmButton.style.background = 'linear-gradient(45deg, #dc3545, #c82333)';
            logToScreen(`Ошибка подтверждения: ${errorText}`, true);
            return false;
        }
    } catch (error) {
        confirmButton.textContent = 'Ошибка сети!';
        confirmButton.style.background = 'linear-gradient(45deg, #dc3545, #c82333)';
        logToScreen(`Сетевая ошибка при подтверждении: ${error.message}`, true);
        return false;
    }
}

// Функция для получения следующего вопроса квиза (без изменений)
export async function fetchNextQuestion() {
    logToScreen('Запрос следующего вопроса квиза...');
    try {
        const initData = TG ? TG.initData : '';
        const userPayload = getTelegramUserPayload(); // Используем новую вспомогательную функцию

        const response = await fetch(`${API_BASE_URL}/next-question`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Telegram-Init-Data': initData
            },
            body: JSON.stringify(userPayload) // Отправляем полный объект TelegramUser
        });

        logToScreen(`Ответ от /next-question. Статус: ${response.status}`);
        if (!response.ok) {
            const errorText = await response.text();
            logToScreen(`Ошибка от /next-question: ${errorText}`, true);
            throw new Error(`Ошибка HTTP! Статус: ${response.status}. Ответ: ${errorText}`);
        }
        const data = await response.json();
        logToScreen(`Полученные данные от /next-question: ${JSON.stringify(data, null, 2)}`);
        return data; // Ожидаем { question: "...", hasNext: true/false }
    } catch (error) {
        logToScreen(`Критическая ошибка при получении вопроса квиза: ${error.message}`, true);
        return { question: 'Не удалось загрузить вопрос.', hasNext: false };
    }
}

// Функция для отправки ответа на квиз (без изменений)
export async function submitQuizAnswerRequest(answer) {
    const submitQuizAnswerButton = document.getElementById('submitQuizAnswer');
    logToScreen(`Отправка ответа на квиз: "${answer}"`);
    submitQuizAnswerButton.disabled = true;
    submitQuizAnswerButton.textContent = 'Отправка...';
    try {
        const initData = TG ? TG.initData : '';
        const userPayload = getTelegramUserPayload(); // Используем новую вспомогательную функцию
        userPayload.answer = answer; // Добавляем ответ к объекту пользователя

        const response = await fetch(`${API_BASE_URL}/submit-answer`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Telegram-Init-Data': initData
            },
            body: JSON.stringify(userPayload) // Отправляем полный объект TelegramUser с ответом
        });

        logToScreen(`Ответ от /submit-answer. Статус: ${response.status}`);
        const data = await response.json(); // Ожидаем { correct: true/false, message: "..." }
        logToScreen(`Полученные данные от /submit-answer: ${JSON.stringify(data, null, 2)}`);

        if (response.ok) {
            return data;
        } else {
            logToScreen(`Ошибка при отправке ответа: ${data.message || 'Неизвестная ошибка.'}`, true);
            return { correct: false, message: data.message || 'Произошла ошибка при отправке ответа.' };
        }
    } catch (error) {
        logToScreen(`Критическая ошибка при отправке ответа: ${error.message}`, true);
        return { correct: false, message: 'Сетевая ошибка при отправке ответа.' };
    } finally {
        submitQuizAnswerButton.disabled = false;
        submitQuizAnswerButton.textContent = 'Отправить ответ';
    }
}

export async function fetchQuestTasks() {
    logToScreen('Запрос списка заданий...');
    try {
        const initData = TG ? TG.initData : '';
        const userPayload = getTelegramUserPayload();

        const response = await fetch(`${API_BASE_URL}/tasks`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Telegram-Init-Data': initData
            },
            body: JSON.stringify(userPayload)
        });

        logToScreen(`Ответ от /tasks. Статус: ${response.status}`);
        if (!response.ok) {
            const errorText = await response.text();
            logToScreen(`Ошибка от /tasks: ${errorText}`, true);
            throw new Error(`Ошибка HTTP! Статус: ${response.status}. Ответ: ${errorText}`);
        }
        const data = await response.json();
        logToScreen(`Полученные задания: ${JSON.stringify(data, null, 2)}`);
        return data; // Ожидаем массив объектов QuestTask
    } catch (error) {
        logToScreen(`Критическая ошибка при получении заданий: ${error.message}`, true);
        return []; // Возвращаем пустой массив в случае ошибки
    }
}

// Новая функция: запрос рейтинга лидеров
export async function fetchLeaderboard() {
    logToScreen('Запрос рейтинга лидеров...');
    try {
        const initData = TG ? TG.initData : '';
        const userPayload = getTelegramUserPayload(); // Пользовательские данные могут быть нужны для фильтрации или аутентификации

        const response = await fetch(`${API_BASE_URL}/leaderboard`, {
            method: 'POST', // Используем POST, как и для других запросов
            headers: {
                'Content-Type': 'application/json',
                'X-Telegram-Init-Data': initData
            },
            body: JSON.stringify(userPayload) // Отправляем данные пользователя
        });

        logToScreen(`Ответ от /leaderboard. Статус: ${response.status}`);
        if (!response.ok) {
            const errorText = await response.text();
            logToScreen(`Ошибка от /leaderboard: ${errorText}`, true);
            throw new Error(`Ошибка HTTP! Статус: ${response.status}. Ответ: ${errorText}`);
        }
        const data = await response.json();
        logToScreen(`Полученные данные рейтинга: ${JSON.stringify(data, null, 2)}`);
        return data; // Ожидаем массив объектов { name: "...", level: ... }
    } catch (error) {
        logToScreen(`Критическая ошибка при получении рейтинга лидеров: ${error.message}`, true);
        return []; // Возвращаем пустой массив в случае ошибки
    }
}