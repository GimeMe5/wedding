// js/debug.js

// Определяем глобальный флаг для отладочного режима.
// По умолчанию можно установить false (отключено) или true (включено).
// Мы будем управлять им из main.js или index.html
window.DEBUG_MODE = true; // Устанавливаем true для текущей отладки, потом можно поменять на false

const debugOutput = document.getElementById('debug-output');

// Если debugOutput не существует, создаем его динамически
if (!debugOutput) {
    const newDebugOutput = document.createElement('div');
    newDebugOutput.id = 'debug-output';
    document.body.appendChild(newDebugOutput);
    // Добавляем базовые стили для динамически созданного блока
    newDebugOutput.style.cssText = `
        position: fixed;
        top: 0;
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
        display: none; /* Изначально скрываем, показываем только если DEBUG_MODE активен и есть логи */
    `;
    window.debugOutput = newDebugOutput; // Делаем доступным глобально
} else {
    window.debugOutput = debugOutput; // Делаем доступным глобально, если уже есть
}

// Функция для вывода отладочной информации на экран
export function logToScreen(message, isError = false) {
    if (!window.DEBUG_MODE) return; // Если отладочный режим выключен, выходим

    const currentDebugOutput = window.debugOutput;
    if (currentDebugOutput) {
        const p = document.createElement('p');
        p.style.color = isError ? 'red' : 'limegreen';
        p.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
        currentDebugOutput.appendChild(p);
        currentDebugOutput.scrollTop = currentDebugOutput.scrollHeight; // Прокручиваем вниз
        currentDebugOutput.classList.add('active'); // Показываем отладочный блок
    }
}

// Перехватываем console.log и console.error для вывода на экран
const originalConsoleLog = console.log;
const originalConsoleError = console.error;

console.log = (...args) => {
    if (window.DEBUG_MODE) { // Перехватываем только если DEBUG_MODE включен
        originalConsoleLog(...args);
        logToScreen(args.map(arg => typeof arg === 'object' ? JSON.stringify(arg, null, 2) : arg).join(' '));
    }
};

console.error = (...args) => {
    if (window.DEBUG_MODE) { // Перехватываем только если DEBUG_MODE включен
        originalConsoleError(...args);
        logToScreen(args.map(arg => typeof arg === 'object' ? JSON.stringify(arg, null, 2) : arg).join(' '), true);
    }
};

// Принудительно показываем отладочный блок при загрузке, только если DEBUG_MODE активен
if (window.debugOutput && window.DEBUG_MODE) {
    window.debugOutput.classList.add('active');
    logToScreen('Отладочный блок активирован.');
} else if (window.debugOutput) {
    window.debugOutput.classList.remove('active'); // Убедимся, что он скрыт, если DEBUG_MODE false
}