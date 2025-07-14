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


// Функция для обновления обратного отсчета
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

// Функция для установки и очистки интервала обратного отсчета
export function setCountdownInterval(targetDate) {
    if (countdownInterval) {
        clearInterval(countdownInterval);
    }
    updateCountdown(targetDate);
    countdownInterval = setInterval(() => updateCountdown(targetDate), 1000);
}

// Функция для отображения сообщения (вместо перезаписи body)
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

// Функция для переключения экранов
export function showScreen(screenId) {
    // Скрываем все основные экраны
    mainContentArea.style.display = 'none';
    confirmButton.style.display = 'none';
    menuButtonsArea.style.display = 'none';
    rulesScreen.style.display = 'none';
    questScreen.style.display = 'none';
    tasksScreen.style.display = 'none';
    quizScreen.style.display = 'none';

    // Показываем нужный экран
    const screenToShow = document.getElementById(screenId);
    if (screenToShow) {
        screenToShow.style.display = 'flex'; // Используем flex для центрирования содержимого
        screenToShow.style.opacity = '1';
        screenToShow.style.transition = 'opacity 0.5s ease-in-out';
    }
}

export function resetConfirmButton() {
    confirmButton.textContent = 'Я приду';
    confirmButton.style.background = 'linear-gradient(45deg, #00c6ff, #ee00ff)';
    // Обработчик будет привязан в handlers.js
}

// Функция для показа всплывающего окна
export function showPopup(message) {
    popupText.textContent = message;
    popupMessage.style.display = 'flex';
}

// Функция для скрытия всплывающего окна
export function hidePopup() {
    popupMessage.style.display = 'none';
}

// Отображение списка заданий
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

        // Можно добавить дополнительные классы в зависимости от статуса задания
        if (task.completed) {
            taskElement.classList.add('completed');
        }

        const taskTitle = document.createElement('h3');
        taskTitle.textContent = task.title; // Предполагаем, что у задания есть поле 'title'

        const taskDescription = document.createElement('p');
        taskDescription.textContent = task.description; // Предполагаем, что у задания есть поле 'description'

        // Если есть статус, можно его тоже отобразить
        const taskStatus = document.createElement('span');
        taskStatus.classList.add('task-status');
        taskStatus.textContent = task.completed ? ' (Выполнено ✅)' : ' (Не выполнено ⏳)';

        taskTitle.appendChild(taskStatus); // Добавляем статус к заголовку

        taskElement.appendChild(taskTitle);
        taskElement.appendChild(taskDescription);

        tasksListContainer.appendChild(taskElement);
        logToScreen(`Добавлено задание: ${task.title}`);
    });
    logToScreen('Задания успешно отображены.');
}