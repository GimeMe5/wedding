// js/ui.js
import { logToScreen } from './debug.js';

let countdownInterval;

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

// Новые элементы для квиза и рейтинга
const quizQuestionSection = document.getElementById('quiz-question-section');
const quizLeaderboardSection = document.getElementById('quiz-leaderboard-section');
const leaderboardList = document.getElementById('leaderboard-list');


// Функция для обновления обратного отсчета (без изменений)
export function updateCountdown(targetDate) {
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

// Функция для установки и очистки интервала обратного отсчета (без изменений)
export function setCountdownInterval(targetDate) {
    if (countdownInterval) {
        clearInterval(countdownInterval);
    }
    updateCountdown(targetDate);
    countdownInterval = setInterval(() => updateCountdown(targetDate), 1000);
}

// Функция для отображения сообщения (без изменений)
export function displayMessage(message, isError = false) {
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

// Функция для переключения экранов (обновим, чтобы учитывать секции квиза)
export function showScreen(screenId) {
    // Скрываем все основные экраны
    mainContentArea.style.display = 'none';
    confirmButton.style.display = 'none';
    menuButtonsArea.style.display = 'none';
    rulesScreen.style.display = 'none';
    questScreen.style.display = 'none';
    tasksScreen.style.display = 'none';
    quizScreen.style.display = 'none';

    // Дополнительно скрываем секции квиза по умолчанию, если они существуют
    if (quizQuestionSection) quizQuestionSection.style.display = 'none';
    if (quizLeaderboardSection) quizLeaderboardSection.style.display = 'none';


    // Показываем нужный экран
    const screenToShow = document.getElementById(screenId);
    if (screenToShow) {
        screenToShow.style.display = 'flex'; // Используем flex для центрирования содержимого
        screenToShow.style.opacity = '1';
        screenToShow.style.transition = 'opacity 0.5s ease-in-out';
    }
}

// Новая функция для переключения между вопросом и рейтингом в квизе
export function showQuizSection(section) {
    if (section === 'question') {
        quizQuestionSection.style.display = 'block'; // Или 'flex' в зависимости от стилей
        quizLeaderboardSection.style.display = 'none';
    } else if (section === 'leaderboard') {
        quizQuestionSection.style.display = 'none';
        quizLeaderboardSection.style.display = 'block'; // Или 'flex'
    }
}


export function resetConfirmButton() {
    confirmButton.textContent = 'Я приду';
    confirmButton.style.background = 'linear-gradient(45deg, #00c6ff, #ee00ff)';
    // Обработчик будет привязан в handlers.js
}

// Функция для показа всплывающего окна (без изменений)
export function showPopup(message) {
    popupText.textContent = message;
    popupMessage.style.display = 'flex';
}

// Функция для скрытия всплывающего окна (без изменений)
export function hidePopup() {
    popupMessage.style.display = 'none';
}

// Отображение списка заданий (без изменений)
export function displayQuestTasks(tasks) {
    logToScreen('Начинаем отображение заданий...');
    tasksListContainer.innerHTML = ''; // Очищаем контейнер перед добавлением новых заданий

    if (!tasks || tasks.length === 0) {
        tasksIntroText.textContent = 'Задания пока недоступны.';
        logToScreen('Список заданий пуст.', true);
        return;
    }

    tasksIntroText.textContent = 'Вот ваши задания:'; // Изменяем текст заглушки

    tasks.forEach(task => {
        const taskElement = document.createElement('div');
        taskElement.classList.add('quest-task-item'); // Добавим класс для стилизации

        // Добавляем класс, если задание выполнено
        if (task.completed) {
            taskElement.classList.add('completed');
        }

        const taskTitle = document.createElement('h3');
        // Используем 'command' для заголовка
        taskTitle.textContent = task.command;

        const taskDescription = document.createElement('p');
        // Используем 'question' для описания
        taskDescription.textContent = task.question;

        // Если есть статус, можно его тоже отобразить
        const taskStatus = document.createElement('span');
        taskStatus.classList.add('task-status');
        // Отображаем статус выполнения
        taskStatus.textContent = task.completed ? ' (Выполнено ✅)' : ' (Не выполнено ⏳)';

        taskTitle.appendChild(taskStatus); // Добавляем статус к заголовку

        taskElement.appendChild(taskTitle);
        taskElement.appendChild(taskDescription);

        tasksListContainer.appendChild(taskElement);
        logToScreen(`Добавлено задание: ${task.command}`);
    });
    logToScreen('Задания успешно отображены.');
}

// Новая функция для отображения рейтинга лидеров
export function displayLeaderboard(leaderboardData) {
    logToScreen('Отображаем рейтинг лидеров...');
    leaderboardList.innerHTML = ''; // Очищаем контейнер

    if (!leaderboardData || leaderboardData.length === 0) {
        leaderboardList.innerHTML = '<p>Рейтинг пока пуст. Будьте первыми!</p>';
        logToScreen('Рейтинг лидеров пуст.');
        return;
    }

    const table = document.createElement('table');
    table.classList.add('leaderboard-table');
    table.innerHTML = `
        <thead>
            <tr>
                <th>Место</th>
                <th>Имя</th>
                <th>Уровень</th>
            </tr>
        </thead>
        <tbody>
        </tbody>
    `;
    const tbody = table.querySelector('tbody');

    leaderboardData.forEach((player, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${player.name}</td>
            <td>${player.level}</td>
        `;
        tbody.appendChild(row);
    });

    leaderboardList.appendChild(table);
    logToScreen('Рейтинг лидеров успешно отображен.');
}