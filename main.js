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
let loadingAttempts = 0;
const MAX_LOADING_ATTEMPTS = 3;

// ==================== ИНИЦИАЛИЗАЦИЯ ДЛЯ ВК ====================
// Уведомляем ВК что приложение инициализируется
if (typeof window !== 'undefined') {
    // Для ВК приложений
    if (window.parent && window.parent !== window) {
        try {
            window.parent.postMessage('VKWebAppInit', '*');
            console.log('📱 Отправлено сообщение VKWebAppInit для ВК');
        } catch (e) {
            console.log('⚠️ Не удалось отправить VKWebAppInit:', e);
        }
    }
    
    // Инициализация VK API если доступно
    if (typeof VK !== 'undefined' && VK.init) {
        try {
            VK.init(function() {
                console.log('✅ VK API инициализирован успешно');
            }, function() {
                console.log('❌ Ошибка инициализации VK API');
            }, '5.199');
        } catch (e) {
            console.log('⚠️ VK API недоступен:', e);
        }
    }
}

// ==================== ИНИЦИАЛИЗАЦИЯ ====================
document.addEventListener('DOMContentLoaded', async function() {
    console.log('🚀 Инициализация TherapyGod...');
    
    // Показываем индикатор загрузки
    showLoadingIndicator();
    
    try {
        // Добавляем общий таймаут на всю загрузку
        const loadingPromise = loadClinicalCasesSimple();
        const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Timeout: загрузка заняла слишком много времени')), 10000);
        });
        
        await Promise.race([loadingPromise, timeoutPromise]);
        
        console.log('✅ Клинические случаи загружены успешно');
        hideLoadingIndicator();
        setupEventHandlers();
        console.log('✅ TherapyGod готов к работе!');
        
        // Уведомляем ВК о готовности после полной загрузки
        notifyVKAppReady();
        
    } catch (error) {
        console.error('❌ ОШИБКА ЗАГРУЗКИ:', error);
        hideLoadingIndicator();
        
        if (loadingAttempts < MAX_LOADING_ATTEMPTS) {
            loadingAttempts++;
            console.log(`🔄 Попытка перезагрузки ${loadingAttempts}/${MAX_LOADING_ATTEMPTS}...`);
            setTimeout(() => location.reload(), 2000);
        } else {
            showErrorMessage(`Не удалось загрузить приложение после ${MAX_LOADING_ATTEMPTS} попыток. Попробуйте обновить страницу.`);
        }
    }
});

// ==================== УВЕДОМЛЕНИЕ ВК О ГОТОВНОСТИ ====================
function notifyVKAppReady() {
    try {
        // Для ВК приложений отправляем сообщение о готовности
        if (window.parent && window.parent !== window) {
            window.parent.postMessage({
                type: 'VKWebAppUpdateConfig',
                data: {
                    app_id: window.location.hostname,
                    status: 'ready'
                }
            }, '*');
            
            window.parent.postMessage('VKWebAppInit', '*');
            console.log('📱 Уведомили ВК о готовности приложения');
        }
        
        // Дополнительно для VK Bridge API
        if (typeof vkBridge !== 'undefined') {
            vkBridge.send('VKWebAppInit');
            console.log('📱 Отправлено VKWebAppInit через vkBridge');
        }
        
        // Устанавливаем таймаут для принудительного показа приложения
        setTimeout(() => {
            const startScreen = document.getElementById('start-screen');
            if (startScreen) {
                startScreen.style.opacity = '1';
                startScreen.style.visibility = 'visible';
                console.log('🎯 Принудительно показываем приложение');
            }
        }, 1000);
        
    } catch (error) {
        console.log('⚠️ Ошибка уведомления ВК:', error);
    }
}

// ==================== УПРОЩЕННАЯ ЗАГРУЗКА СЛУЧАЕВ ====================
async function loadClinicalCasesSimple() {
    console.log('📥 Начинаем упрощенную загрузку случаев...');
    
    const caseFiles = [
        { file: 'cases/cardiovascular.js', variable: 'cardiovascularCases', system: 'cardiovascular' },
        { file: 'cases/respiratory.js', variable: 'respiratoryCases', system: 'respiratory' },
        { file: 'cases/gastrointestinal.js', variable: 'gastrointestinalCases', system: 'gastrointestinal' },
        { file: 'cases/nervous.js', variable: 'nervousCases', system: 'nervous' },
        { file: 'cases/endocrine.js', variable: 'endocrineCases', system: 'endocrine' },
        { file: 'cases/renal.js', variable: 'renalCases', system: 'renal' }
    ];

    // Загружаем все файлы параллельно, но с таймаутом
    const loadPromises = caseFiles.map(caseFile => 
        loadSingleScript(caseFile.file).then(() => caseFile)
    );
    
    console.log('⏳ Загружаем все скрипты параллельно...');
    await Promise.all(loadPromises);
    
    // Даем время скриптам выполниться
    console.log('⏳ Ожидаем выполнения скриптов...');
    await new Promise(resolve => setTimeout(resolve, 500));

    // Проверяем переменные
    clinicalCases = {};
    let totalCasesLoaded = 0;

    for (const caseFile of caseFiles) {
        console.log(`🔍 Проверяем переменную ${caseFile.variable}...`);
        
        const cases = window[caseFile.variable];
        
        if (!cases) {
            throw new Error(`Переменная ${caseFile.variable} не найдена. Проверьте файл ${caseFile.file}`);
        }
        
        if (!Array.isArray(cases) || cases.length === 0) {
            throw new Error(`${caseFile.variable} не является массивом или пуст`);
        }
        
        clinicalCases[caseFile.system] = cases;
        totalCasesLoaded += cases.length;
        
        console.log(`✅ ${caseFile.system}: загружено ${cases.length} случаев`);
    }

    if (totalCasesLoaded === 0) {
        throw new Error('Не загружено ни одного клинического случая');
    }

    console.log(`🎉 Успешно загружено ${totalCasesLoaded} клинических случаев`);
}

// ==================== ПРОСТАЯ ЗАГРУЗКА ОДНОГО СКРИПТА ====================
function loadSingleScript(src) {
    return new Promise((resolve, reject) => {
        console.log(`📄 Загружаем скрипт: ${src}`);
        
        // Проверяем, не загружен ли уже
        const existingScript = document.querySelector(`script[src="${src}"]`);
        if (existingScript) {
            console.log(`✅ Скрипт уже загружен: ${src}`);
            resolve();
            return;
        }

        const script = document.createElement('script');
        script.src = src;
        script.type = 'text/javascript';
        script.async = false;
        
        // Таймаут для каждого скрипта
        const timeout = setTimeout(() => {
            script.remove();
            reject(new Error(`Таймаут загрузки скрипта: ${src}`));
        }, 5000);

        script.onload = () => {
            clearTimeout(timeout);
            console.log(`✅ Скрипт загружен: ${src}`);
            resolve();
        };
        
        script.onerror = (error) => {
            clearTimeout(timeout);
            script.remove();
            console.error(`❌ Ошибка загрузки: ${src}`, error);
            reject(new Error(`Не удалось загрузить: ${src}`));
        };

        document.head.appendChild(script);
    });
}

// ==================== ИНДИКАТОР ЗАГРУЗКИ ====================
function showLoadingIndicator() {
    // Убираем все предыдущие индикаторы
    const existingLoader = document.getElementById('loading-indicator');
    if (existingLoader) existingLoader.remove();
    
    const loader = document.createElement('div');
    loader.id = 'loading-indicator';
    loader.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(15, 23, 42, 0.95);
        z-index: 9999;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        color: white;
        font-family: -apple-system, BlinkMacSystemFont, sans-serif;
    `;
    
    loader.innerHTML = `
        <div style="
            width: 60px;
            height: 60px;
            border: 4px solid rgba(37, 99, 235, 0.3);
            border-top: 4px solid #2563eb;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin-bottom: 20px;
        "></div>
        <div style="font-size: 18px; font-weight: 600; margin-bottom: 10px;">
            Загрузка TherapyGod...
        </div>
        <div style="font-size: 14px; opacity: 0.7;">
            Подготавливаем клинические случаи
        </div>
        <style>
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        </style>
    `;
    
    document.body.appendChild(loader);
}

function hideLoadingIndicator() {
    const loader = document.getElementById('loading-indicator');
    if (loader) {
        loader.style.opacity = '0';
        loader.style.transition = 'opacity 0.3s ease';
        setTimeout(() => loader.remove(), 300);
    }
}

// ==================== ПОКАЗ ОШИБКИ ====================
function showErrorMessage(message) {
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
        font-family: -apple-system, BlinkMacSystemFont, sans-serif;
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
            margin-right: 10px;
        ">🔄 Обновить страницу</button>
        <button onclick="this.parentElement.remove()" style="
            background: rgba(255,255,255,0.2);
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 8px;
            font-weight: bold;
            cursor: pointer;
            font-size: 14px;
        ">✕ Закрыть</button>
    `;
    
    document.body.appendChild(errorDiv);
}

// ==================== ОБРАБОТЧИКИ СОБЫТИЙ ====================
function setupEventHandlers() {
    console.log('⚙️ Настройка обработчиков событий...');

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
            console.log(`✅ Обработчик установлен для: ${id}`);
        } else {
            console.warn(`⚠️ Кнопка не найдена: ${id}`);
        }
    });

    console.log('✅ Все обработчики настроены');
}

// ==================== ВЫБОР СИСТЕМЫ ====================
function selectSystem(card) {
    console.log('🎯 Выбор системы:', card.dataset.system);
    
    document.querySelectorAll('.system-card').forEach(c => c.classList.remove('active'));
    card.classList.add('active');
    gameState.currentSystem = card.dataset.system;
    
    console.log('✅ Выбрана система:', gameState.currentSystem);
}

// ==================== ЗАПУСК ИГРЫ ====================
function startCases() {
    console.log('🎮 === ЗАПУСК ИГРЫ ===');
    console.log('Выбранная система:', gameState.currentSystem);
    
    if (Object.keys(clinicalCases).length === 0) {
        showErrorMessage('Клинические случаи не загружены! Попробуйте обновить страницу.');
        return;
    }
    
    const systemCases = clinicalCases[gameState.currentSystem];
    
    if (!systemCases || systemCases.length === 0) {
        showErrorMessage(`Случаи для системы "${gameState.currentSystem}" не найдены!`);
        return;
    }

    console.log(`📋 Найдено ${systemCases.length} случаев для системы ${gameState.currentSystem}`);

    gameState.currentCases = shuffleArray([...systemCases]).slice(0, Math.min(gameState.totalCases, systemCases.length));
    gameState.currentCaseIndex = 0;
    gameState.score = 0;
    gameState.selectedOption = null;

    const startScreen = document.getElementById('start-screen');
    const caseContainer = document.getElementById('case-container');
    
    if (startScreen) startScreen.style.display = 'none';
    if (caseContainer) {
        caseContainer.style.display = 'block';
        loadCase();
    } else {
        showErrorMessage('Элемент case-container не найден!');
    }
}

// ==================== ЗАГРУЗКА СЛУЧАЯ ====================
function loadCase() {
    console.log(`📄 === ЗАГРУЗКА СЛУЧАЯ ${gameState.currentCaseIndex + 1} ===`);
    
    if (gameState.currentCaseIndex >= gameState.currentCases.length) {
        showResults();
        return;
    }

    const case_data = gameState.currentCases[gameState.currentCaseIndex];
    gameState.selectedOption = null;

    // Обновляем UI
    const caseCounter = document.getElementById('case-counter');
    const progressBar = document.getElementById('progress-bar');
    
    if (caseCounter) {
        caseCounter.textContent = `Случай ${gameState.currentCaseIndex + 1} из ${gameState.currentCases.length}`;
    }
    
    if (progressBar) {
        const progress = ((gameState.currentCaseIndex) / gameState.currentCases.length) * 100;
        progressBar.style.width = `${progress}%`;
    }

    // Формируем содержимое
    const caseContent = document.getElementById('case-content');
    if (caseContent) {
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
    }

    // Создаем варианты ответов
    const optionsContainer = document.getElementById('options');
    if (optionsContainer) {
        optionsContainer.innerHTML = '';
        
        case_data.options.forEach((option, index) => {
            const optionElement = document.createElement('div');
            optionElement.classList.add('option');
            optionElement.textContent = option;
            optionElement.dataset.index = index;
            optionElement.addEventListener('click', () => selectOption(optionElement, index));
            optionsContainer.appendChild(optionElement);
        });
    }

    // Скрываем объяснение и делаем кнопку неактивной
    const explanation = document.getElementById('explanation');
    const nextBtn = document.getElementById('next-case');
    
    if (explanation) explanation.classList.remove('show');
    if (nextBtn) nextBtn.disabled = true;

    console.log('✅ Случай загружен успешно');
}

// ==================== ВЫБОР ОТВЕТА ====================
function selectOption(element, index) {
    if (gameState.selectedOption !== null) return;

    gameState.selectedOption = index;
    const case_data = gameState.currentCases[gameState.currentCaseIndex];
    const isCorrect = index === case_data.correct;

    const options = document.querySelectorAll('.option');
    if (options[case_data.correct]) {
        options[case_data.correct].classList.add('correct');
    }
    
    if (!isCorrect) {
        element.classList.add('wrong');
    }

    options.forEach(opt => opt.style.pointerEvents = 'none');

    const explanationText = document.getElementById('explanation-text');
    const explanation = document.getElementById('explanation');
    
    if (explanationText) explanationText.textContent = case_data.explanation;
    if (explanation) explanation.classList.add('show');

    const nextBtn = document.getElementById('next-case');
    if (nextBtn) nextBtn.disabled = false;

    if (isCorrect) gameState.score++;
}

// ==================== НАВИГАЦИЯ ====================
function nextCase() {
    gameState.currentCaseIndex++;
    loadCase();
}

function exitCases() {
    const caseContainer = document.getElementById('case-container');
    const startScreen = document.getElementById('start-screen');
    
    if (caseContainer) caseContainer.style.display = 'none';
    if (startScreen) startScreen.style.display = 'block';
}

function restartCases() {
    const resultsContainer = document.getElementById('results-container');
    const startScreen = document.getElementById('start-screen');
    
    if (resultsContainer) resultsContainer.style.display = 'none';
    if (startScreen) startScreen.style.display = 'block';
}

// ==================== ПОКАЗ РЕЗУЛЬТАТОВ ====================
function showResults() {
    const caseContainer = document.getElementById('case-container');
    const resultsContainer = document.getElementById('results-container');
    
    if (caseContainer) caseContainer.style.display = 'none';
    if (resultsContainer) resultsContainer.style.display = 'block';

    const percentage = Math.round((gameState.score / gameState.currentCases.length) * 100);
    
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

// ==================== ОБРАБОТЧИКИ СООБЩЕНИЙ ДЛЯ ВК ====================
// Слушаем сообщения от ВК
window.addEventListener('message', function(event) {
    if (event.data && typeof event.data === 'object') {
        console.log('📱 Получено сообщение от ВК:', event.data);
        
        // Обработка различных событий ВК
        switch(event.data.type) {
            case 'VKWebAppUpdateConfig':
                console.log('📱 ВК обновил конфигурацию');
                break;
            case 'VKWebAppViewHide':
                console.log('📱 ВК скрыл приложение');
                break;
            case 'VKWebAppViewRestore':
                console.log('📱 ВК восстановил приложение');
                break;
        }
    }
});

// ==================== ФИНАЛЬНАЯ ИНИЦИАЛИЗАЦИЯ ДЛЯ ВК ====================
// Дополнительная инициализация через небольшую задержку
setTimeout(() => {
    try {
        // Еще раз уведомляем ВК
        if (window.parent && window.parent !== window) {
            window.parent.postMessage('VKWebAppInit', '*');
        }
        
        // Принудительно показываем интерфейс
        const body = document.body;
        if (body) {
            body.style.opacity = '1';
            body.style.visibility = 'visible';
        }
        
        console.log('🎯 Финальная инициализация завершена');
    } catch (error) {
        console.log('⚠️ Ошибка финальной инициализации:', error);
    }
}, 2000);
