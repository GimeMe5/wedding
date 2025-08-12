// js/ui.js
import { logToScreen } from './debug.js';

let countdownInterval;

// Получаем все элементы один раз при загрузке скрипта
const mainContentArea = document.getElementById('main-content-area');
const confirmButton = document.getElementById('confirmButton');
const menuButtonsArea = document.getElementById('menu-buttons-area');
const rulesScreen = document.getElementById('rules-screen');
const questScreen = document.getElementById('quest-screen');
const tasksScreen = document.getElementById('tasks-screen');
const quizScreen = document.getElementById('quiz-screen');
const countdownElement = document.getElementById('countdown');
const container = document.querySelector('.container');
const popupMessage = document.getElementById('popup-message');
const popupText = document.getElementById('popupText');
const tasksIntroText = document.getElementById('tasks-intro-text');
const tasksListContainer = document.getElementById('tasks-list-container');
const seatingScreen = document.getElementById('seating-screen');
const seatingImage = document.getElementById('seatingImage');

// Элементы квиза и рейтинга
const quizQuestionElement = document.getElementById('quizQuestion');
const quizAnswerInput = document.getElementById('quizAnswerInput');
const submitQuizAnswerButton = document.getElementById('submitQuizAnswer');
const quizQuestionSection = document.getElementById('quiz-question-section');
const quizLeaderboardSection = document.getElementById('quiz-leaderboard-section'); // Больше не будет скрываться CSS по умолчанию
const leaderboardList = document.getElementById('leaderboard-list');


// Функция для обновления обратного отсчета (без изменений)
export function updateCountdown(targetDate) {
    const now = new Date().getTime();
    const distance = targetDate - now;

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    if (document.getElementById('days')) document.getElementById('days').textContent = String(days).padStart(2, '0');
    if (document.getElementById('hours')) document.getElementById('hours').textContent = String(hours).padStart(2, '0');
    if (document.getElementById('minutes')) document.getElementById('minutes').textContent = String(minutes).padStart(2, '0');
    if (document.getElementById('seconds')) document.getElementById('seconds').textContent = String(seconds).padStart(2, '0');

    if (distance < 0) {
        clearInterval(countdownInterval);
        if (countdownElement) countdownElement.innerHTML = "Событие началось!";
        logToScreen('Обратный отсчет завершен.');
    }
}

// Функция для установки и очистки интервала обратного отсчета (без изменений)
export function setCountdownInterval(targetDate) {
    if (countdownInterval) {
        clearInterval(countdownInterval);
    }
    updateCountdown(targetDate);
    countdownInterval = setInterval(() => updateCountdown(targetDate), 1000);
}

// Функция для отображения сообщения (без изменений, но помним, что она создает новый элемент)
export function displayMessage(message, isError = false) {
    if (container) {
        container.style.display = 'none';
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

// Функция для переключения экранов (ОБНОВЛЕНО - УДАЛЕНЫ УПОМИНАНИЯ quizQuestionSection и quizLeaderboardSection)
export function showScreen(screenId) {
    logToScreen(`Переключение на экран: ${screenId}`);

    // Список всех основных экранов для скрытия
    const allScreens = [
        mainContentArea, menuButtonsArea, rulesScreen,
        questScreen, tasksScreen, quizScreen
    ];

    // Скрываем все основные экраны
    allScreens.forEach(screen => {
        if (screen) {
            screen.style.display = 'none';
            screen.style.opacity = '0';
        }
    });

    // Показываем нужный экран
    const screenToShow = document.getElementById(screenId);
    if (screenToShow) {
        screenToShow.style.display = 'flex'; // Устанавливаем display: flex для основного контейнера экрана
        setTimeout(() => { // Для плавности
            screenToShow.style.opacity = '1';
        }, 10);
        screenToShow.style.transition = 'opacity 0.5s ease-in-out';
    } else {
        logToScreen(`Элемент с ID ${screenId} не найден для отображения.`, true);
    }

    // Специальная логика для confirmButton
    if (confirmButton) {
        if (screenId === 'main-content-area') {
            confirmButton.style.display = 'block'; // Показываем кнопку "Я приду" на главном экране
        } else {
            confirmButton.style.display = 'none'; // Скрываем на всех остальных
        }
    }
}

// Добавим функцию для скрытия/показа элементов квиза (вопроса и инпута)
export function setQuizQuestionVisibility(visible) {
    if (quizQuestionSection) {
        quizQuestionSection.style.display = visible ? 'flex' : 'none';
        logToScreen(`Видимость секции вопроса установлена на: ${visible}`);
    } else {
        logToScreen('Элемент quizQuestionSection не найден.', true);
    }
}


export function resetConfirmButton() {
    if (confirmButton) {
        confirmButton.textContent = 'Я приду';
        confirmButton.style.background = 'linear-gradient(45deg, #00c6ff, #ee00ff)';
        confirmButton.style.display = 'block'; // Убедимся, что кнопка видна
    }
}

// Функция для показа всплывающего окна (без изменений)
export function showPopup(message) {
    if (popupText && popupMessage) {
        popupText.textContent = message;
        popupMessage.style.display = 'flex';
        setTimeout(() => {
            popupMessage.style.opacity = '1';
        }, 10);
        logToScreen(`Показано всплывающее окно: "${message}"`);
    } else {
        logToScreen('Не найдены элементы всплывающего окна (popupText или popupMessage).', true);
    }
}

// Функция для скрытия всплывающего окна (без изменений)
export function hidePopup() {
    if (popupMessage) {
        popupMessage.style.opacity = '0';
        setTimeout(() => {
            popupMessage.style.display = 'none';
        }, 300);
        logToScreen('Всплывающее окно скрыто.');
    }
}

// Отображение списка заданий (без изменений)
export function displayQuestTasks(tasks) {
    logToScreen('Начинаем отображение заданий...');
    if (!tasksListContainer) {
        logToScreen('Элемент #tasksListContainer не найден.', true);
        return;
    }
    tasksListContainer.innerHTML = '';

    if (!tasks || tasks.length === 0) {
        if (tasksIntroText) tasksIntroText.textContent = 'Задания пока недоступны.';
        logToScreen('Список заданий пуст.', true);
        return;
    }

    if (tasksIntroText) tasksIntroText.textContent = 'Вот ваши задания:';

    tasks.forEach(task => {
        const taskElement = document.createElement('div');
        taskElement.classList.add('quest-task-item');

        if (task.completed) {
            taskElement.classList.add('completed');
        }

        const taskTitle = document.createElement('h3');
        taskTitle.textContent = task.command;

        const taskDescription = document.createElement('p');
        taskDescription.textContent = task.question;

        const taskStatus = document.createElement('span');
        taskStatus.classList.add('task-status');
        taskStatus.textContent = task.completed ? ' (Выполнено ✅)' : ' (Не выполнено ⏳)';

        taskTitle.appendChild(taskStatus);

        taskElement.appendChild(taskTitle);
        taskElement.appendChild(taskDescription);

        tasksListContainer.appendChild(taskElement);
        logToScreen(`Добавлено задание: ${task.command}`);
    });
    logToScreen('Задания успешно отображены.');
}

// Функция для отображения рейтинга лидеров (без изменений)
export function displayLeaderboard(leaderboardData) {
    logToScreen('Отображаем рейтинг лидеров...');
    if (!leaderboardList) {
        logToScreen('Элемент #leaderboard-list не найден.', true);
        return;
    }
    leaderboardList.innerHTML = '';

    if (!leaderboardData || leaderboardData.length === 0) {
        leaderboardList.innerHTML = '<p style="color: #a0a0ff; text-align: center; padding: 20px;">Рейтинг пока пуст. Будьте первыми!</p>';
        logToScreen('Рейтинг лидеров пуст.');
        return;
    }

    const table = document.createElement('table');
    table.classList.add('leaderboard-table');
    table.innerHTML = `
        <tbody>
        </tbody>
    `;
    const tbody = table.querySelector('tbody');

    leaderboardData.forEach((player, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${player.name}</td>
            <td>Уровень ${player.level}</td>
        `;
        tbody.appendChild(row);
    });

    leaderboardList.appendChild(table);
    logToScreen('Рейтинг лидеров успешно отображен.');
}

export function showSeatingImage(imageUrl) {
    if (imageUrl) {
        seatingImage.src = imageUrl;
        showScreen('seating-screen');
    } else {
        // Если картинки нет, показываем сообщение
        showPopup('Схема рассадки пока не доступна.');
    }
}