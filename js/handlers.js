// js/handlers.js
import { showScreen, resetConfirmButton, setCountdownInterval, showPopup, hidePopup, displayQuestTasks, setQuizQuestionVisibility, displayLeaderboard } from './ui.js';
import { fetchAllContent, confirmParticipationRequest, fetchNextQuestion, submitQuizAnswerRequest, fetchQuestTasks, fetchLeaderboard } from './api.js';
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
const quizQuestionElement = document.getElementById('quizQuestion'); // Это будет элемент для вывода текста вопроса (например, <p>)
const quizAnswerInput = document.getElementById('quizAnswerInput');
const submitQuizAnswerButton = document.getElementById('submitQuizAnswer');
const quizBackButton = document.getElementById('quizBackButton');
const popupOkButton = document.getElementById('popupOkButton');

// Флаг для отслеживания, был ли уже показан квиз - теперь не так критичен, т.к. логика в loadNextQuestionForQuiz
// let quizOpenedOnce = false;

// Обработчик для кнопки "Я приду" (без изменений)
export async function handleConfirmParticipation() {
    const success = await confirmParticipationRequest();
    if (success) {
        showScreen('menu-buttons-area');
    } else {
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
    section3.textContent = data.text3; // Исправлено на text3, если вы имели в виду его, а не text2

    if (data.cooldownDate) {
        const targetDate = new Date(data.cooldownDate);
        logToScreen(`Целевая дата для отсчета (повторный вызов): ${targetDate.toLocaleString()}`);
        setCountdownInterval(targetDate);
    } else {
        countdownElement.innerHTML = "Дата не загружена.";
        logToScreen('Дата для отсчета не получена (повторный вызов).', true);
    }

    confirmButton.textContent = 'Назад';
    confirmButton.style.display = 'block';
    confirmButton.disabled = false;
    confirmButton.onclick = () => {
        showScreen('menu-buttons-area');
        resetConfirmButton();
        confirmButton.onclick = handleConfirmParticipation;
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
    showScreen('quest-screen');
}

// Обработчик для кнопки "Задания" (без изменений)
export async function handleTasksButtonClick() {
    logToScreen('Нажата кнопка "Задания".');
    showScreen('tasks-screen');

    logToScreen('Запрашиваем задания квеста...');
    const tasks = await fetchQuestTasks();
    displayQuestTasks(tasks);
}

// Обработчик для кнопки "Квиз" (ОБНОВЛЕН)
export async function handleQuizButtonClick() {
    logToScreen('Нажата кнопка "Квиз".');
    showScreen('quiz-screen');
    await loadQuizContent(); // Новая функция для загрузки всего контента квиза
}

// НОВАЯ ФУНКЦИЯ: Загрузка контента квиза (вопрос + рейтинг)
async function loadQuizContent() {
    logToScreen('Загрузка всего контента квиза (вопрос и рейтинг)...');

    // 1. Загружаем и отображаем рейтинг
    const leaderboard = await fetchLeaderboard();
    displayLeaderboard(leaderboard);

    // 2. Загружаем и отображаем вопрос (если есть)
    const questionData = await fetchNextQuestion();

    if (questionData && questionData.questionText && questionData.questionText !== 'Не удалось загрузить вопрос.' && questionData.hasNext) {
        setQuizQuestionVisibility(true); // Показываем секцию вопроса
        quizQuestionElement.textContent = questionData.questionText;
        quizAnswerInput.value = ''; // Очищаем поле ввода
        submitQuizAnswerButton.disabled = false;
        submitQuizAnswerButton.textContent = 'Отправить ответ';
    } else {
        setQuizQuestionVisibility(false); // Скрываем секцию вопроса, если вопросов нет
        submitQuizAnswerButton.disabled = true;
        submitQuizAnswerButton.textContent = 'Вопросы закончились';
        // Также можно очистить или скрыть поле ввода
        quizAnswerInput.value = 'Все вопросы пройдены!';
        quizAnswerInput.disabled = true;
    }
}


// Обработчик для кнопки "Отправить ответ" в квизе (ОБНОВЛЕН)
export async function handleSubmitQuizAnswer() {
    const answer = quizAnswerInput.value.trim();
    if (answer) {
        const result = await submitQuizAnswerRequest(answer); // Ожидаем { status: true/false }

        let messageToDisplay = '';
        if (result.status) {
            messageToDisplay = 'Правильно! Отличный ответ!';
        } else {
            messageToDisplay = 'Неверно. Попробуйте еще раз.';
        }

        showPopup(messageToDisplay);

        // Логика перехода к следующему вопросу теперь в handlePopupOk
    } else {
        showPopup('Пожалуйста, введите ваш ответ.');
    }
}

// Обработчик кнопки "ОК" во всплывающем окне (ОБНОВЛЕН)
export async function handlePopupOk() {
    hidePopup();
    // После закрытия попапа, заново загружаем весь контент квиза
    await loadQuizContent();
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
    showScreen('quest-screen');
}

export function handleQuizBackButtonClick() {
    logToScreen('Нажата кнопка "Назад" на экране квиза.');
    showScreen('quest-screen');
}

// Назначение обработчиков событий (без изменений)
export function attachEventListeners() {
    confirmButton.onclick = handleConfirmParticipation;
    inviteButton.addEventListener('click', handleInviteButtonClick);
    rulesButton.addEventListener('click', handleRulesButtonClick);
    questButton.addEventListener('click', handleQuestButtonClick);
    rulesBackButton.addEventListener('click', handleRulesBackButtonClick);
    questBackButton.addEventListener('click', handleQuestBackButtonClick);

    tasksButton.addEventListener('click', handleTasksButtonClick);
    quizButton.addEventListener('click', handleQuizButtonClick);
    tasksBackButton.addEventListener('click', handleTasksBackButtonClick);
    submitQuizAnswerButton.addEventListener('click', handleSubmitQuizAnswer);
    quizBackButton.addEventListener('click', handleQuizBackButtonClick);
    popupOkButton.addEventListener('click', handlePopupOk);
}