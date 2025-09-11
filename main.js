// ==================== СОСТОЯНИЕ ИГРЫ ====================
let gameState = {
    currentSystem: 'cardiovascular',
    currentCases: [],
    currentCaseIndex: 0,
    score: 0,
    selectedOption: null,
    totalCases: 5
};

// ==================== КЛИНИЧЕСКИЕ СЛУЧАИ ====================
let clinicalCases = {};

// ==================== ИНИЦИАЛИЗАЦИЯ ====================
document.addEventListener('DOMContentLoaded', async function() {
    console.log('Инициализация TherapyGod...');
    
    try {
        await loadClinicalCases();
        console.log('Клинические случаи загружены успешно');
        setupEventHandlers();
        console.log('TherapyGod готов к работе!');
    } catch (error) {
        console.error('КРИТИЧЕСКАЯ ОШИБКА:', error);
        
        // Показываем пользователю понятное сообщение
        showErrorMessage('Не удалось загрузить клинические случаи. Попробуйте обновить страницу или обратитесь к администратору.');
    }
});

// ==================== ЗАГРУЗКА СЛУЧАЕВ ИЗ ПАПКИ CASES ====================
async function loadClinicalCases() {
    console.log('Начинаем загрузку случаев из папки cases/...');
    
    const caseFiles = [
        { file: 'cases/cardiovascular.js', variable: 'cardiovascularCases', system: 'cardiovascular' },
        { file: 'cases/respiratory.js', variable: 'respiratoryCases', system: 'respiratory' },
        { file: 'cases/gastrointestinal.js', variable: 'gastrointestinalCases', system: 'gastrointestinal' },
        { file: 'cases/nervous.js', variable: 'nervousCases', system: 'nervous' },
        { file: 'cases/endocrine.js', variable: 'endocrineCases', system: 'endocrine' },
        { file: 'cases/renal.js', variable: 'renalCases', system: 'renal' }
    ];

    // Загружаем все файлы
    for (const caseFile of caseFiles) {
        try {
            console.log(`Загружаем ${caseFile.file}...`);
            await loadScriptViaPolitics(caseFile.file);
            console.log(`✓ Файл ${caseFile.file} загружен`);
        } catch (error) {
            console.error(`✗ Ошибка загрузки ${caseFile.file}:`, error);
            throw new Error(`Не удалось загрузить файл ${caseFile.file}`);
        }
    }

    // Проверяем, что все переменные доступны
    console.log('Проверяем доступность переменных...');
    
    clinicalCases = {};
    let totalCasesLoaded = 0;

    for (const caseFile of caseFiles) {
        const cases = window[caseFile.variable];
        
        if (!cases) {
            console.error(`Переменная ${caseFile.variable} не найдена в ${caseFile.file}`);
            throw new Error(`Переменная ${caseFile.variable} не экспортирована из ${caseFile.file}`);
        }
        
        if (!Array.isArray(cases)) {
            console.error(`${caseFile.variable} не является массивом:`, cases);
            throw new Error(`${caseFile.variable} должна быть массивом`);
        }
        
        clinicalCases[caseFile.system] = cases;
        totalCasesLoaded += cases.length;
        
        console.log(`✓ ${caseFile.system}: загружено ${cases.length} случаев`);
    }

    if (totalCasesLoaded === 0) {
        throw new Error('Не загружено ни одного клинического случая');
    }

    console.log(`🎉 УСПЕШНО! Всего загружено ${totalCasesLoaded} клинических случаев`);
    console.log('Структура загруженных случаев:', clinicalCases);
}

// ==================== УЛУЧШЕННАЯ ЗАГРУЗКА СКРИПТОВ ====================
async function loadScriptViaPolitics(src) {
    console.log(`🔄 Пробуем разные способы загрузки: ${src}`);
    
    // Способ 1: Fetch + eval (наиболее совместимый с ВК)
    try {
        console.log(`📥 Способ 1 - fetch: ${src}`);
        const response = await fetch(src, {
            method: 'GET',
            cache: 'no-cache',
            headers: {
                'Content-Type': 'application/javascript'
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const scriptContent = await response.text();
        
        if (!scriptContent || scriptContent.trim().length === 0) {
            throw new Error('Пустой файл');
        }
        
        // Безопасное выполнение кода
        const script = document.createElement('script');
        script.textContent = scriptContent;
        script.setAttribute('data-source', src);
        document.head.appendChild(script);
        
        console.log(`✅ Fetch загрузка успешна: ${src}`);
        return;
        
    } catch (fetchError) {
        console.warn(`❌ Fetch не сработал для ${src}:`, fetchError.message);
    }
    
    // Способ 2: Классическая загрузка script тега
    try {
        console.log(`📥 Способ 2 - script tag: ${src}`);
        await loadScriptClassic(src);
        console.log(`✅ Script tag загрузка успешна: ${src}`);
        return;
        
    } catch (scriptError) {
        console.warn(`❌ Script tag не сработал для ${src}:`, scriptError.message);
    }
    
    // Способ 3: XMLHttpRequest (для старых браузеров)
    try {
        console.log(`📥 Способ 3 - XMLHttpRequest: ${src}`);
        await loadScriptXHR(src);
        console.log(`✅ XHR загрузка успешна: ${src}`);
        return;
        
    } catch (xhrError) {
        console.warn(`❌ XHR не сработал для ${src}:`, xhrError.message);
    }
    
    // Если все способы не сработали
    throw new Error(`Все способы загрузки не сработали для ${src}`);
}

// ==================== КЛАССИЧЕСКАЯ ЗАГРУЗКА СКРИПТОВ ====================
function loadScriptClassic(src) {
    return new Promise((resolve, reject) => {
        // Проверяем, не загружен ли уже скрипт
        const existingScript = document.querySelector(`script[src="${src}"]`);
        if (existingScript) {
            console.log(`Скрипт ${src} уже загружен`);
            resolve();
            return;
        }

        const script = document.createElement('script');
        script.src = src;
        script.type = 'text/javascript';
        script.async = false; // Важно для последовательной загрузки
        
        // Устанавливаем таймаут для загрузки
        const timeout = setTimeout(() => {
            script.remove();
            reject(new Error(`Таймаут загрузки скрипта ${src}`));
        }, 15000); // 15 секунд

        script.onload = () => {
            clearTimeout(timeout);
            console.log(`✓ Скрипт загружен: ${src}`);
            resolve();
        };
        
        script.onerror = (error) => {
            clearTimeout(timeout);
            script.remove();
            console.error(`✗ Ошибка загрузки скрипта: ${src}`, error);
            reject(new Error(`Не удалось загрузить скрипт: ${src}`));
        };

        // Добавляем скрипт в head
        document.head.appendChild(script);
        console.log(`Добавлен скрипт в DOM: ${src}`);
    });
}

// ==================== ЗАГРУЗКА ЧЕРЕЗ XMLHttpRequest ====================
function loadScriptXHR(src) {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        
        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    try {
                        const script = document.createElement('script');
                        script.textContent = xhr.responseText;
                        script.setAttribute('data-source', src);
                        document.head.appendChild(script);
                        resolve();
                    } catch (error) {
                        reject(new Error(`Ошибка выполнения скрипта ${src}: ${error.message}`));
                    }
                } else {
                    reject(new Error(`HTTP ${xhr.status} для ${src}`));
                }
            }
        };
        
        xhr.onerror = function() {
            reject(new Error(`Сетевая ошибка при загрузке ${src}`));
        };
        
        xhr.ontimeout = function() {
            reject(new Error(`Таймаут при загрузке ${src}`));
        };
        
        xhr.timeout = 15000; // 15 секунд
        xhr.open('GET', src, true);
        xhr.send();
    });
}

// ==================== ПОКАЗ ОШИБКИ ПОЛЬЗОВАТЕЛЮ ====================
function showErrorMessage(message) {
    // Создаем красивое сообщение об ошибке
    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(239, 68, 68, 0.95);
        color: white;
        padding: 30px;
        border-radius: 12px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        z-index: 10000;
        max-width: 500px;
        text-align: center;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
        font-size: 16px;
        line-height: 1.5;
    `;
    
    errorDiv.innerHTML = `
        <h3 style="margin: 0 0 15px 0; font-size: 20px;">⚠️ Ошибка загрузки</h3>
        <p style="margin: 0 0 20px 0;">${message}</p>
        <button onclick="location.reload()" style="
            background: white;
            color: #ef4444;
            border: none;
            padding: 12px 24px;
            border-radius: 8px;
            font-weight: bold;
            cursor: pointer;
            font-size: 14px;
        ">🔄 Обновить страницу</button>
    `;
    
    document.body.appendChild(errorDiv);
    
    // Автоматически убираем через 10 секунд
    setTimeout(() => {
        if (errorDiv.parentNode) {
            errorDiv.parentNode.removeChild(errorDiv);
        }
    }, 10000);
}

// ==================== ОБРАБОТЧИКИ СОБЫТИЙ ====================
function setupEventHandlers() {
    console.log('Настройка обработчиков событий...');

    // Принудительное отображение стартового экрана
    const startScreen = document.getElementById('start-screen');
    if (startScreen) {
        startScreen.style.display = 'block';
        startScreen.style.visibility = 'visible';
        startScreen.style.opacity = '1';
        console.log('🔧 Принудительно активировал start-screen');
    }

    // Выбор системы органов
    const systemCards = document.querySelectorAll('.system-card');
    console.log(`Найдено карточек систем: ${systemCards.length}`);
    
    systemCards.forEach(card => {
        card.addEventListener('click', () => selectSystem(card));
    });

    // Кнопки управления
    const buttons = {
        'start-cases': startCases,
        'next-case': nextCase,
        'exit-cases': exitCases,
        'restart-cases': restartCases
    };

    Object.entries(buttons).forEach(([id, handler]) => {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener('click', handler);
            console.log(`✓ Обработчик установлен для кнопки: ${id}`);
        } else {
            console.warn(`⚠ Кнопка не найдена: ${id}`);
        }
    });
}

// ==================== ВЫБОР СИСТЕМЫ ====================
function selectSystem(card) {
    console.log('Выбор системы:', card.dataset.system);
    
    // Убираем активный класс со всех карточек
    document.querySelectorAll('.system-card').forEach(c => c.classList.remove('active'));
    
    // Добавляем активный класс к выбранной
    card.classList.add('active');
    
    // Сохраняем выбранную систему
    gameState.currentSystem = card.dataset.system;
    
    console.log('Выбрана система:', gameState.currentSystem);
}

// ==================== ЗАПУСК ИГРЫ ====================
function startCases() {
    console.log('=== ЗАПУСК ИГРЫ ===');
    console.log('Выбранная система:', gameState.currentSystem);
    
    // Проверяем, что случаи загружены
    if (Object.keys(clinicalCases).length === 0) {
        showErrorMessage('Клинические случаи не загружены! Обновите страницу.');
        return;
    }
    
    // Получаем случаи для выбранной системы
    const systemCases = clinicalCases[gameState.currentSystem];
    
    console.log('Случаи для системы:', systemCases);
    
    if (!systemCases || systemCases.length === 0) {
        showErrorMessage(`Случаи для системы "${gameState.currentSystem}" не найдены!\nПроверьте файл cases/${gameState.currentSystem}.js`);
        return;
    }

    console.log(`Найдено ${systemCases.length} случаев для системы ${gameState.currentSystem}`);

    // Перемешиваем и берем нужное количество случаев
    gameState.currentCases = shuffleArray([...systemCases]).slice(0, Math.min(gameState.totalCases, systemCases.length));
    
    console.log(`Выбрано ${gameState.currentCases.length} случаев для игры`);

    // Сброс состояния
    gameState.currentCaseIndex = 0;
    gameState.score = 0;
    gameState.selectedOption = null;

    // Переключаем на экран случая
    const startScreen = document.getElementById('start-screen');
    const caseContainer = document.getElementById('case-container');
    
    if (startScreen) startScreen.style.display = 'none';
    if (caseContainer) {
        caseContainer.style.display = 'block';
    } else {
        console.error('Элемент case-container не найден!');
        return;
    }

    // Загружаем первый случай
    loadCase();
}

// ==================== ЗАГРУЗКА СЛУЧАЯ ====================
function loadCase() {
    console.log(`=== ЗАГРУЗКА СЛУЧАЯ ${gameState.currentCaseIndex + 1} ===`);
    
    if (gameState.currentCaseIndex >= gameState.currentCases.length) {
        console.log('Все случаи пройдены, показываем результаты');
        showResults();
        return;
    }

    const case_data = gameState.currentCases[gameState.currentCaseIndex];
    console.log('Данные текущего случая:', case_data);
    
    gameState.selectedOption = null;

    // Обновляем счетчик и прогресс
    const caseCounter = document.getElementById('case-counter');
    const progressBar = document.getElementById('progress-bar');
    
    if (caseCounter) {
        caseCounter.textContent = `Случай ${gameState.currentCaseIndex + 1} из ${gameState.currentCases.length}`;
    }
    
    if (progressBar) {
        const progress = ((gameState.currentCaseIndex) / gameState.currentCases.length) * 100;
        progressBar.style.width = `${progress}%`;
    }

    // Формируем содержимое случая
    const caseContent = document.getElementById('case-content');
    if (!caseContent) {
        console.error('Элемент case-content не найден!');
        return;
    }
    
    caseContent.innerHTML = `
        <div class="patient-info">Пациент: ${case_data.patient}</div>
        <div class="case-description">
            <strong>Жалобы:</strong> ${case_data.complaint}<br><br>
            <strong>Анамнез заболевания:</strong> ${case_data.history}<br><br>
            <strong>Объективный осмотр:</strong> ${case_data.examination}
        </div>
        ${case_data.additional ? `<div class="case-data"><strong>Дополнительные данные:</strong><br>${case_data.additional}</div>` : ''}
        <div class="case-question">${case_data.question}</div>
    `;

    // Создаем варианты ответов
    const optionsContainer = document.getElementById('options');
    if (!optionsContainer) {
        console.error('Элемент options не найден!');
        return;
    }
    
    optionsContainer.innerHTML = '';
    
    case_data.options.forEach((option, index) => {
        const optionElement = document.createElement('div');
        optionElement.classList.add('option');
        optionElement.textContent = option;
        optionElement.dataset.index = index;
        optionElement.addEventListener('click', () => selectOption(optionElement, index));
        optionsContainer.appendChild(optionElement);
    });

    console.log(`Создано ${case_data.options.length} вариантов ответов`);

    // Скрываем объяснение и делаем кнопку неактивной
    const explanation = document.getElementById('explanation');
    const nextBtn = document.getElementById('next-case');
    
    if (explanation) explanation.classList.remove('show');
    if (nextBtn) nextBtn.disabled = true;

    console.log('Случай загружен успешно');
}

// ==================== ВЫБОР ОТВЕТА ====================
function selectOption(element, index) {
    console.log(`Выбран ответ ${index}`);
    
    if (gameState.selectedOption !== null) {
        console.log('Ответ уже выбран, игнорируем');
        return;
    }

    gameState.selectedOption = index;
    const case_data = gameState.currentCases[gameState.currentCaseIndex];
    const isCorrect = index === case_data.correct;

    console.log(`Правильный ответ: ${case_data.correct}, выбран: ${index}, корректно: ${isCorrect}`);

    // Подсвечиваем правильный и неправильный ответы
    const options = document.querySelectorAll('.option');
    if (options[case_data.correct]) {
        options[case_data.correct].classList.add('correct');
    }
    
    if (!isCorrect) {
        element.classList.add('wrong');
    }

    // Отключаем все варианты
    options.forEach(opt => opt.style.pointerEvents = 'none');

    // Показываем объяснение
    const explanationText = document.getElementById('explanation-text');
    const explanation = document.getElementById('explanation');
    
    if (explanationText) explanationText.textContent = case_data.explanation;
    if (explanation) explanation.classList.add('show');

    // Включаем кнопку следующего случая
    const nextBtn = document.getElementById('next-case');
    if (nextBtn) nextBtn.disabled = false;

    // Увеличиваем счет, если правильно
    if (isCorrect) {
        gameState.score++;
        console.log(`Счет увеличен: ${gameState.score}`);
    }
}

// ==================== СЛЕДУЮЩИЙ СЛУЧАЙ ====================
function nextCase() {
    console.log('Переход к следующему случаю');
    gameState.currentCaseIndex++;
    loadCase();
}

// ==================== ВЫХОД ИЗ ИГРЫ ====================
function exitCases() {
    console.log('Выход из игры');
    const caseContainer = document.getElementById('case-container');
    const startScreen = document.getElementById('start-screen');
    
    if (caseContainer) caseContainer.style.display = 'none';
    if (startScreen) startScreen.style.display = 'block';
}

// ==================== ПЕРЕЗАПУСК ====================
function restartCases() {
    console.log('Перезапуск игры');
    const resultsContainer = document.getElementById('results-container');
    const startScreen = document.getElementById('start-screen');
    
    if (resultsContainer) resultsContainer.style.display = 'none';
    if (startScreen) startScreen.style.display = 'block';
}

// ==================== ПОКАЗ РЕЗУЛЬТАТОВ ====================
function showResults() {
    console.log('=== ПОКАЗ РЕЗУЛЬТАТОВ ===');
    console.log(`Правильных ответов: ${gameState.score} из ${gameState.currentCases.length}`);
    
    const caseContainer = document.getElementById('case-container');
    const resultsContainer = document.getElementById('results-container');
    
    if (caseContainer) caseContainer.style.display = 'none';
    if (resultsContainer) resultsContainer.style.display = 'block';

    const percentage = Math.round((gameState.score / gameState.currentCases.length) * 100);
    console.log(`Процент правильных ответов: ${percentage}%`);
    
    const percentageElement = document.getElementById('percentage');
    const correctAnswers = document.getElementById('correct-answers');
    const totalQuestions = document.getElementById('total-questions');
    const resultMessage = document.getElementById('result-message');
    
    if (percentageElement) percentageElement.textContent = percentage;
    if (correctAnswers) correctAnswers.textContent = gameState.score;
    if (totalQuestions) totalQuestions.textContent = gameState.currentCases.length;

    let resultText;
    if (percentage >= 90) {
        resultText = 'Превосходно! Вы демонстрируете экспертный уровень клинического мышления!';
    } else if (percentage >= 70) {
        resultText = 'Отлично! Ваши диагностические навыки на высоком уровне!';
    } else if (percentage >= 50) {
        resultText = 'Хорошо! Есть понимание клинических процессов, но стоит углубить знания.';
    } else {
        resultText = 'Нужно больше практики! Изучайте клинические случаи и возвращайтесь снова.';
    }
    
    if (resultMessage) resultMessage.textContent = resultText;
}

// ==================== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ====================
function shuffleArray(array) {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
}

// ==================== ДИАГНОСТИЧЕСКИЕ ФУНКЦИИ ====================
function diagnoseApp() {
    console.log('=== 🔍 ДИАГНОСТИКА THERAPYGOD ===');
    
    // Проверка элементов
    const startScreen = document.getElementById('start-screen');
    const caseContainer = document.getElementById('case-container');
    const systemsGrid = document.querySelector('.systems-grid');
    const container = document.querySelector('.container');
    
    console.log('📋 Проверка элементов:');
    console.log('  start-screen найден:', !!startScreen);
    console.log('  case-container найден:', !!caseContainer);
    console.log('  systems-grid найден:', !!systemsGrid);
    console.log('  container найден:', !!container);
    
    if (startScreen) {
        const styles = getComputedStyle(startScreen);
        console.log('👁️ Стили start-screen:');
        console.log('  display:', styles.display);
        console.log('  visibility:', styles.visibility);
        console.log('  opacity:', styles.opacity);
        console.log('  position:', styles.position);
        console.log('  z-index:', styles.zIndex);
        console.log('  width:', styles.width);
        console.log('  height:', styles.height);
    }
    
    // Проверка CSS
    const bodyStyles = getComputedStyle(document.body);
    console.log('🎨 Стили body:');
    console.log('  background:', bodyStyles.background.substring(0, 100));
    console.log('  color:', bodyStyles.color);
    console.log('  font-family:', bodyStyles.fontFamily.substring(0, 50));
    console.log('  display:', bodyStyles.display);
    
    // Проверка загрузки CSS
    const cssLinks = document.querySelectorAll('link[rel="stylesheet"]');
    console.log('📎 CSS файлы (' + cssLinks.length + '):');
    Array.from(cssLinks).forEach((link, index) => {
        console.log(`  CSS ${index + 1}:`, link.href);
        console.log('  Загружен:', link.sheet ? 'ДА' : 'НЕТ');
    });
    
    // Проверка переменных игры
    if (typeof gameState !== 'undefined') {
        console.log('🎮 GameState:', gameState);
    }
    
    if (typeof clinicalCases !== 'undefined') {
        console.log('🏥 Clinical Cases загружены:', Object.keys(clinicalCases).length, 'систем');
    }
    
    console.log('=== ✅ ДИАГНОСТИКА ЗАВЕРШЕНА ===');
}

// Функция принудительного показа
function forceShowApp() {
    console.log('🔧 ПРИНУДИТЕЛЬНОЕ ОТОБРАЖЕНИЕ');
    
    const startScreen = document.getElementById('start-screen');
    const caseContainer = document.getElementById('case-container');
    const resultsContainer = document.getElementById('results-container');
    
    if (startScreen) {
        startScreen.style.display = 'block';
        startScreen.style.visibility = 'visible';
        startScreen.style.opacity = '1';
        startScreen.style.position = 'relative';
        startScreen.style.zIndex = '1';
        console.log('✅ start-screen принудительно показан');
    }
    
    if (caseContainer) {
        caseContainer.style.display = 'none';
        console.log('✅ case-container скрыт');
    }
    
    if (resultsContainer) {
        resultsContainer.style.display = 'none';
        console.log('✅ results-container скрыт');
    }
    
    // Принудительные стили для body
    document.body.style.background = 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)';
    document.body.style.minHeight = '100vh';
    document.body.style.color = '#ffffff';
    document.body.style.display = 'flex';
    document.body.style.alignItems = 'center';
    document.body.style.justifyContent = 'center';
    
    console.log('🎯 Приложение должно быть видно!');
}

// Автоматическая диагностика через 3 секунды
setTimeout(function() {
    console.log('🤖 Автоматическая диагностика через 3 секунды...');
    diagnoseApp();
}, 3000);
