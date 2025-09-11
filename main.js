// ==================== СОСТОЯНИЕ ИГРЫ ====================
let gameState = {
    currentSystem: 'cardiovascular',
    currentCases: [],
    currentCaseIndex: 0,
    score: 0,
    selectedOption: null,
    totalCases: 5
};

// ==================== ИМПОРТ КЛИНИЧЕСКИХ СЛУЧАЕВ ====================
let clinicalCases = {};

// Функция для загрузки случаев из отдельных файлов
async function loadClinicalCases() {
    try {
        // Загружаем скрипты с клиническими случаями
        await loadScript('cases/cardiovascular.js');
        await loadScript('cases/respiratory.js');
        await loadScript('cases/gastrointestinal.js');
        await loadScript('cases/nervous.js');
        await loadScript('cases/endocrine.js');
        await loadScript('cases/renal.js');

        // Собираем все случаи в один объект
        clinicalCases = {
            cardiovascular: window.cardiovascularCases || [],
            respiratory: window.respiratoryCases || [],
            gastrointestinal: window.gastrointestinalCases || [],
            nervous: window.nervousCases || [],
            endocrine: window.endocrineCases || [],
            renal: window.renalCases || []
        };

        console.log('Клинические случаи загружены:', clinicalCases);
        
        // Выводим количество случаев по каждой системе
        Object.keys(clinicalCases).forEach(system => {
            console.log(`${system}: ${clinicalCases[system].length} случаев`);
        });
    } catch (error) {
        console.error('Ошибка загрузки клинических случаев:', error);
        
        // Если не удалось загрузить файлы, используем встроенные случаи
        clinicalCases = getDefaultCases();
        console.log('Используются резервные случаи');
    }
}

// Функция для динамической загрузки скриптов
function loadScript(src) {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.onload = () => {
            console.log(`Загружен: ${src}`);
            resolve();
        };
        script.onerror = () => {
            console.error(`Ошибка загрузки: ${src}`);
            reject(new Error(`Failed to load script: ${src}`));
        };
        document.head.appendChild(script);
    });
}

// Резервные случаи на случай, если файлы не загрузятся
function getDefaultCases() {
    return {
        cardiovascular: [
            {
                patient: "Мужчина, 58 лет, слесарь",
                complaint: "Интенсивная загрудинная боль давящего характера, возникшая 1 час назад во время подъема по лестнице. Боль иррадиирует в левую руку и нижнюю челюсть.",
                history: "В анамнезе: артериальная гипертензия 10 лет, курение 30 лет по 1 пачке в день, отец умер от инфаркта в 55 лет.",
                examination: "Состояние средней тяжести. Кожные покровы бледные, влажные. ЧД 22/мин. Пульс 95 уд/мин, ритмичный. АД 160/95 мм рт.ст.",
                additional: "ЭКГ: подъем сегмента ST в отведениях II, III, aVF. Тропонин I положительный.",
                question: "Наиболее вероятный диагноз:",
                options: [
                    "Нестабильная стенокардия",
                    "Острый инфаркт миокарда нижней стенки ЛЖ",
                    "ТЭЛА",
                    "Расслаивающая аневризма аорты"
                ],
                correct: 1,
                explanation: "Классическая клиника острого ИМ: загрудинная боль >20 мин с иррадиацией, подъем ST в отведениях от нижней стенки (II, III, aVF), положительный тропонин. Факторы риска: возраст, АГ, курение, наследственность."
            }
        ],
        respiratory: [
            {
                patient: "Мужчина, 45 лет, офисный работник",
                complaint: "Высокая лихорадка до 39.5°C, озноб, кашель с гнойной мокротой, боль в правой половине грудной клетки при дыхании.",
                history: "Болен 5 дней. Начало острое после переохлаждения. Не курит, хронических заболеваний не имеет.",
                examination: "Состояние средней тяжести. Температура 39.2°C. ЧД 28/мин. Справа в нижних отделах притупление перкуторного звука, ослабленное везикулярное дыхание, крепитация.",
                additional: "Рентген ОГК: инфильтративная тень в S6 правого легкого. Лейкоциты 16×10⁹/л, нейтрофилы 85%, СОЭ 45 мм/ч. SpO₂ 93%.",
                question: "Наиболее вероятный диагноз:",
                options: [
                    "Острый бронхит",
                    "Внебольничная пневмония, средней тяжести",
                    "Туберкулез легких",
                    "ТЭЛА"
                ],
                correct: 1,
                explanation: "Типичная внебольничная пневмония: острое начало, лихорадка, продуктивный кашель, локальные физикальные и рентгенологические изменения, лейкоцитоз с нейтрофилезом. Средняя тяжесть по SpO₂ и общему состоянию."
            }
        ],
        gastrointestinal: [],
        nervous: [],
        endocrine: [],
        renal: []
    };
}

// ==================== DOM ЭЛЕМЕНТЫ ====================
let startScreen, caseContainer, resultsContainer;

// ==================== ИНИЦИАЛИЗАЦИЯ ====================
document.addEventListener('DOMContentLoaded', async function() {
    console.log('Инициализация TherapyGod...');
    
    // Загружаем клинические случаи
    await loadClinicalCases();
    
    // Получаем DOM элементы
    startScreen = document.getElementById('start-screen');
    caseContainer = document.getElementById('case-container');
    resultsContainer = document.getElementById('results-container');
    
    // Настраиваем обработчики событий
    setupEventHandlers();
    
    console.log('TherapyGod готов к работе!');
});

// ==================== ОБРАБОТЧИКИ СОБЫТИЙ ====================
function setupEventHandlers() {
    // Выбор системы органов
    document.querySelectorAll('.system-card').forEach(card => {
        card.addEventListener('click', () => selectSystem(card));
    });

    // Кнопки управления
    document.getElementById('start-cases').addEventListener('click', startCases);
    document.getElementById('next-case').addEventListener('click', nextCase);
    document.getElementById('exit-cases').addEventListener('click', exitCases);
    document.getElementById('restart-cases').addEventListener('click', restartCases);
}

// ==================== ВЫБОР СИСТЕМЫ ====================
function selectSystem(card) {
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
    // Получаем случаи для выбранной системы
    const systemCases = clinicalCases[gameState.currentSystem] || [];
    
    if (systemCases.length === 0) {
        alert('Случаи для этой системы еще в разработке!');
        return;
    }

    // Перемешиваем и берем нужное количество случаев
    gameState.currentCases = shuffleArray([...systemCases]).slice(0, Math.min(gameState.totalCases, systemCases.length));
    
    // Сброс состояния
    gameState.currentCaseIndex = 0;
    gameState.score = 0;
    gameState.selectedOption = null;

    // Переключаем на экран случая
    startScreen.style.display = 'none';
    caseContainer.style.display = 'block';

    // Загружаем первый случай
    loadCase();
}

// ==================== ЗАГРУЗКА СЛУЧАЯ ====================
function loadCase() {
    if (gameState.currentCaseIndex >= gameState.currentCases.length) {
        showResults();
        return;
    }

    const case_data = gameState.currentCases[gameState.currentCaseIndex];
    gameState.selectedOption = null;

    // Обновляем счетчик и прогресс
    document.getElementById('case-counter').textContent = `Случай ${gameState.currentCaseIndex + 1} из ${gameState.currentCases.length}`;
    const progress = ((gameState.currentCaseIndex) / gameState.currentCases.length) * 100;
    document.getElementById('progress-bar').style.width = `${progress}%`;

    // Формируем содержимое случая
    const caseContent = document.getElementById('case-content');
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
    optionsContainer.innerHTML = '';
    
    case_data.options.forEach((option, index) => {
        const optionElement = document.createElement('div');
        optionElement.classList.add('option');
        optionElement.textContent = option;
        optionElement.dataset.index = index;
        optionElement.addEventListener('click', () => selectOption(optionElement, index));
        optionsContainer.appendChild(optionElement);
    });

    // Скрываем объяснение и делаем кнопку неактивной
    document.getElementById('explanation').classList.remove('show');
    document.getElementById('next-case').disabled = true;
}

// ==================== ВЫБОР ОТВЕТА ====================
function selectOption(element, index) {
    if (gameState.selectedOption !== null) return; // Уже выбрали

    gameState.selectedOption = index;
    const case_data = gameState.currentCases[gameState.currentCaseIndex];
    const isCorrect = index === case_data.correct;

    // Подсвечиваем правильный и неправильный ответы
    const options = document.querySelectorAll('.option');
    options[case_data.correct].classList.add('correct');
    
    if (!isCorrect) {
        element.classList.add('wrong');
    }

    // Отключаем все варианты
    options.forEach(opt => opt.style.pointerEvents = 'none');

    // Показываем объяснение
    document.getElementById('explanation-text').textContent = case_data.explanation;
    document.getElementById('explanation').classList.add('show');

    // Включаем кнопку следующего случая
    document.getElementById('next-case').disabled = false;

    // Увеличиваем счет, если правильно
    if (isCorrect) {
        gameState.score++;
    }
}

// ==================== СЛЕДУЮЩИЙ СЛУЧАЙ ====================
function nextCase() {
    gameState.currentCaseIndex++;
    loadCase();
}

// ==================== ВЫХОД ИЗ ИГРЫ ====================
function exitCases() {
    caseContainer.style.display = 'none';
    startScreen.style.display = 'block';
}

// ==================== ПЕРЕЗАПУСК ====================
function restartCases() {
    resultsContainer.style.display = 'none';
    startScreen.style.display = 'block';
}

// ==================== ПОКАЗ РЕЗУЛЬТАТОВ ====================
function showResults() {
    caseContainer.style.display = 'none';
    resultsContainer.style.display = 'block';

    const percentage = Math.round((gameState.score / gameState.currentCases.length) * 100);
    
    document.getElementById('percentage').textContent = percentage;
    document.getElementById('correct-answers').textContent = gameState.score;
    document.getElementById('total-questions').textContent = gameState.currentCases.length;

    let resultText;
    if (percentage >= 90) {
        resultText = '🏆 Превосходно! Вы демонстрируете экспертный уровень клинического мышления!';
    } else if (percentage >= 70) {
        resultText = '🎉 Отлично! Ваши диагностические навыки на высоком уровне!';
    } else if (percentage >= 50) {
        resultText = '👍 Хорошо! Есть понимание клинических процессов, но стоит углубить знания.';
    } else {
        resultText = '📚 Нужно больше практики! Изучайте клинические случаи и возвращайтесь снова.';
    }
    
    document.getElementById('result-message').innerHTML = resultText;
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
