// js/handlers.js
import { showScreen, resetConfirmButton, setCountdownInterval, showPopup, hidePopup } from './ui.js';
import { fetchAllContent, confirmParticipationRequest, fetchNextQuestion, submitQuizAnswerRequest } from './api.js';
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

// Обработчик для кнопки "Я приду"
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

// Обработчик для кнопки "Приглашение"
export async function handleInviteButtonClick() {
    logToScreen('Нажата кнопка "Приглашение". Перезагружаем контент...');
    showScreen('main-content-area');

    const data = await fetchAllContent();

    section1.textContent = data.text1;
    section3.textContent = data.text3;

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

// Обработчик для кнопки "Правила"
export function handleRulesButtonClick() {
    logToScreen('Нажата кнопка "Правила".');
    showScreen('rules-screen');
}

// Обработчик для кнопки "Квест"
export function handleQuestButtonClick() {
    logToScreen('Нажата кнопка "Квест".');
    showScreen('quest-screen'); // Показываем меню квеста
}

// Обработчик для кнопки "Задания"
export function handleTasksButtonClick() {
    logToScreen('Нажата кнопка "Задания".');
    showScreen('tasks-screen'); // Показываем экран "Задания"
}

// Обработчик для кнопки "Квиз"
export async function handleQuizButtonClick() {
    logToScreen('Нажата кнопка "Квиз".');
    showScreen('quiz-screen');
    // Загружаем первый вопрос при входе в квиз
    await loadNextQuestionForQuiz();
}

// Вспомогательная функция для загрузки вопроса квиза
async function loadNextQuestionForQuiz() {
    const questionData = await fetchNextQuestion();
    quizQuestionElement.textContent = questionData.question;
    quizAnswerInput.value = ''; // Очищаем поле ввода

    if (!questionData.hasNext) {
        submitQuizAnswerButton.disabled = true;
        submitQuizAnswerButton.textContent = 'Вопросы закончились';
        logToScreen('Все вопросы квиза пройдены.');
    } else {
        submitQuizAnswerButton.disabled = false;
        submitQuizAnswerButton.textContent = 'Отправить ответ';
    }
}


// Обработчик для кнопки "Отправить ответ" в квизе
export async function handleSubmitQuizAnswer() {
    const answer = quizAnswerInput.value.trim();
    if (answer) {
        const result = await submitQuizAnswerRequest(answer);
        showPopup(result.message);
        // Логика перехода к следующему вопросу обрабатывается в popupOkButton
    } else {
        showPopup('Пожалуйста, введите ваш ответ.');
    }
}

// Обработчик кнопки "ОК" во всплывающем окне
export async function handlePopupOk() {
    hidePopup();
    // Предполагаем, что бэкенд `/next-question` самостоятельно отслеживает прогресс пользователя.
    // Если ответ был верным, или если бэкенд решает показать следующий вопрос,
    // `/next-question` вернет новый вопрос.
    await loadNextQuestionForQuiz();
}

// Обработчики для кнопок "Назад"
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

// Назначение обработчиков событий
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