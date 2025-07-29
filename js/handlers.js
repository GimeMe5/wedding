// js/handlers.js
import { showScreen, resetConfirmButton, setCountdownInterval, showPopup, hidePopup, displayQuestTasks, showQuizSection, displayLeaderboard } from './ui.js';
import { fetchAllContent, confirmParticipationRequest, fetchNextQuestion, submitQuizAnswerRequest, fetchQuestTasks, fetchLeaderboard } from './api.js'; // Добавим fetchLeaderboard
import { logToScreen } from './debug.js';

const confirmButton = document.getElementById('confirmButton');
const inviteButton = document.getElementById('inviteButton');
const rulesButton = document.getElementById('rulesButton');
const questButton = document.getElementById('questButton');
// const seatingButton = document.getElementById('seatingButton'); // Неактивная кнопка
const rulesBackButton = document.getElementById('rulesBackButton');
const questBackButton = document.getElementById('questBackButton');

const section1 = document.getElementById('section1');
const section3 = document.getElementById('section3');
const countdownElement = document.getElementById('countdown');

const tasksButton = document.getElementById('tasksButton');
const quizButton = document.getElementById('quizButton');
const tasksBackButton = document.getElementById('tasksBackButton');
const quizQuestionElement = document.getElementById('quizQuestion');
const quizAnswerInput = document.getElementById('quizAnswerInput');
const submitQuizAnswerButton = document.getElementById('submitQuizAnswer');
const quizBackButton = document.getElementById('quizBackButton');
const popupOkButton = document.getElementById('popupOkButton');

// Флаг для отслеживания, был ли уже показан квиз
let quizOpenedOnce = false;

// Обработчик для кнопки "Я приду" (без изменений)
export async function handleConfirmParticipation() {
    const success = await confirmParticipationRequest();
    if (success) {
        showScreen('menu-buttons-area');
    } else {
        // Ошибка уже обработана в api.js, здесь просто сбрасываем кнопку
        setTimeout(() => {
            resetConfirmButton();
        }, 3000);
    }
}

// Обработчик для кнопки "Приглашение" (без изменений)
export async function handleInviteButtonClick() {
    logToScreen('Нажата кнопка "Приглашение". Перезагружаем контент...');
    showScreen('main-content-area');

    const data = await fetchAllContent();

    section1.textContent = data.text1;
    section3.textContent = data.text2;

    if (data.cooldownDate) {
        const targetDate = new Date(data.cooldownDate);
        logToScreen(`Целевая дата для отсчета (повторный вызов): ${targetDate.toLocaleString()}`);
        setCountdownInterval(targetDate);
    } else {
        countdownElement.innerHTML = "Дата не загружена.";
        logToScreen('Дата для отсчета не получена (повторный вызов).', true);
    }

    // Настраиваем кнопку как "Назад"
    confirmButton.textContent = 'Назад';
    confirmButton.style.display = 'block';
    confirmButton.disabled = false;
    confirmButton.onclick = () => { // Временно переопределяем, чтобы вернуть на меню
        showScreen('menu-buttons-area');
        resetConfirmButton(); // Сбрасываем кнопку к исходному состоянию
        confirmButton.onclick = handleConfirmParticipation; // Возвращаем исходный обработчик
    };
}

// Обработчик для кнопки "Правила" (без изменений)
export function handleRulesButtonClick() {
    logToScreen('Нажата кнопка "Правила".');
    showScreen('rules-screen');
}

// Обработчик для кнопки "Квест" (без изменений)
export function handleQuestButtonClick() {
    logToScreen('Нажата кнопка "Квест".');
    showScreen('quest-screen'); // Показываем меню квеста
}

// Обработчик для кнопки "Задания" (без изменений)
export async function handleTasksButtonClick() {
    logToScreen('Нажата кнопка "Задания".');
    showScreen('tasks-screen'); // Показываем экран "Задания"

    // Загрузка и отображение заданий
    logToScreen('Запрашиваем задания квеста...');
    const tasks = await fetchQuestTasks(); // Вызываем fetchQuestTasks из api.js
    displayQuestTasks(tasks); // Передаем полученные задания в displayQuestTasks
}

// Обработчик для кнопки "Квиз" (ОБНОВЛЕН)
export async function handleQuizButtonClick() {
    logToScreen('Нажата кнопка "Квиз".');
    showScreen('quiz-screen');

    // Если квиз открывается впервые ИЛИ если есть активный вопрос, показываем раздел вопросов
    const questionData = await fetchNextQuestion(); // Сначала всегда пробуем получить вопрос
    if (questionData.question && questionData.question !== 'Не удалось загрузить вопрос.' && questionData.question !== 'Вы прошли все доступные вопросы квиза! Новые вопросы появятся скоро.') {
        // Если есть активный вопрос, показываем секцию вопроса
        showQuizSection('question');
        quizQuestionElement.textContent = questionData.question;
        quizAnswerInput.value = ''; // Очищаем поле ввода
        submitQuizAnswerButton.disabled = false;
        submitQuizAnswerButton.textContent = 'Отправить ответ';
    } else {
        // Если вопросов нет или все пройдены, показываем рейтинг лидеров
        logToScreen('Вопросов больше нет или возникла ошибка при загрузке. Показываем рейтинг лидеров.');
        showQuizSection('leaderboard');
        const leaderboard = await fetchLeaderboard(); // Загружаем данные рейтинга
        displayLeaderboard(leaderboard); // Отображаем рейтинг
    }
}


// Вспомогательная функция для загрузки вопроса квиза (ОБНОВЛЕН)
async function loadNextQuestionForQuiz() {
    const questionData = await fetchNextQuestion();
    if (questionData.question && questionData.question !== 'Не удалось загрузить вопрос.' && questionData.question !== 'Вы прошли все доступные вопросы квиза! Новые вопросы появятся скоро.') {
        showQuizSection('question'); // Убеждаемся, что видна секция вопроса
        quizQuestionElement.textContent = questionData.question;
        quizAnswerInput.value = ''; // Очищаем поле ввода
        submitQuizAnswerButton.disabled = false;
        submitQuizAnswerButton.textContent = 'Отправить ответ';
    } else {
        // Если вопросов больше нет, переключаемся на рейтинг
        logToScreen('Все вопросы квиза пройдены. Переключаемся на рейтинг лидеров.');
        showQuizSection('leaderboard');
        const leaderboard = await fetchLeaderboard(); // Загружаем данные рейтинга
        displayLeaderboard(leaderboard); // Отображаем рейтинг
        submitQuizAnswerButton.disabled = true; // Отключаем кнопку отправки
        submitQuizAnswerButton.textContent = 'Вопросы закончились';
        // Также можно скрыть поле ввода ответа, если это необходимо
        // quizAnswerInput.style.display = 'none';
    }
}


// Обработчик для кнопки "Отправить ответ" в квизе (ОБНОВЛЕН)
export async function handleSubmitQuizAnswer() {
    const answer = quizAnswerInput.value.trim();
    if (answer) {
        // Получаем результат, который включает только { status: true/false }
        const result = await submitQuizAnswerRequest(answer);

        let messageToDisplay = '';
        if (result.status) { // Исправлено: свойство status
            messageToDisplay = 'Правильно! Отличный ответ!';
        } else {
            messageToDisplay = 'Неверно. Попробуйте еще раз.';
        }

        showPopup(messageToDisplay);

        // Логика перехода к следующему вопросу будет в handlePopupOk
    } else {
        showPopup('Пожалуйста, введите ваш ответ.');
    }
}

// Обработчик кнопки "ОК" во всплывающем окне (без изменений)
export async function handlePopupOk() {
    hidePopup();
    // Предполагаем, что бэкенд `/next-question` самостоятельно отслеживает прогресс пользователя.
    // Если ответ был верным, или если бэкенд решает показать следующий вопрос,
    // `/next-question` вернет новый вопрос.
    await loadNextQuestionForQuiz();
}

// Обработчики для кнопок "Назад" (без изменений)
export function handleRulesBackButtonClick() {
    logToScreen('Нажата кнопка "Назад" на экране правил.');
    showScreen('menu-buttons-area');
}

export function handleQuestBackButtonClick() {
    logToScreen('Нажата кнопка "Назад" на экране квеста.');
    showScreen('menu-buttons-area');
}

export function handleTasksBackButtonClick() {
    logToScreen('Нажата кнопка "Назад" на экране заданий.');
    showScreen('quest-screen'); // Возвращаемся в меню квеста
}

export function handleQuizBackButtonClick() {
    logToScreen('Нажата кнопка "Назад" на экране квиза.');
    showScreen('quest-screen'); // Возвращаемся в меню квеста
}

// Назначение обработчиков событий (без изменений)
export function attachEventListeners() {
    confirmButton.onclick = handleConfirmParticipation;
    inviteButton.addEventListener('click', handleInviteButtonClick);
    rulesButton.addEventListener('click', handleRulesButtonClick);
    questButton.addEventListener('click', handleQuestButtonClick);
    rulesBackButton.addEventListener('click', handleRulesBackButtonClick);
    questBackButton.addEventListener('click', handleQuestBackButtonClick);

    // Новые обработчики для квеста
    tasksButton.addEventListener('click', handleTasksButtonClick);
    quizButton.addEventListener('click', handleQuizButtonClick);
    tasksBackButton.addEventListener('click', handleTasksBackButtonClick);
    submitQuizAnswerButton.addEventListener('click', handleSubmitQuizAnswer);
    quizBackButton.addEventListener('click', handleQuizBackButtonClick);
    popupOkButton.addEventListener('click', handlePopupOk);
}