// ==================== МЕДИЦИНСКИЙ ДИСКЛЕЙМЕР ====================
function showMedicalDisclaimer() {
    return new Promise((resolve) => {
        const disclaimerHTML = `
            <div id="medical-disclaimer" style="
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.95);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10000;
                backdrop-filter: blur(15px);
                animation: fadeIn 0.5s ease-out;
            ">
                <div style="
                    background: var(--glass-bg);
                    border: 1px solid var(--glass-border);
                    border-radius: var(--border-radius-lg);
                    padding: 40px;
                    max-width: 550px;
                    margin: 20px;
                    text-align: center;
                    box-shadow: var(--shadow-glass);
                    animation: slideInUp 0.6s ease-out;
                ">
                    <div style="
                        width: 80px;
                        height: 80px;
                        background: linear-gradient(135deg, #ef4444, #dc2626);
                        border-radius: 50%;
                        margin: 0 auto 25px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-size: 40px;
                    ">
                        ⚠️
                    </div>
                    <h2 style="
                        color: #ef4444; 
                        margin-bottom: 25px; 
                        font-size: 26px;
                        font-weight: 700;
                        letter-spacing: -0.02em;
                    ">
                        Медицинский дисклеймер
                    </h2>
                    <div style="
                        color: var(--text-secondary); 
                        line-height: 1.7; 
                        margin-bottom: 30px;
                        text-align: left;
                    ">
                        <p style="margin-bottom: 15px;">
                            <strong style="color: var(--text-primary);">📚 Образовательные цели:</strong><br>
                            Приложение предназначено исключительно для обучения медицинских работников и студентов медицинских вузов.
                        </p>
                        <p style="margin-bottom: 15px;">
                            <strong style="color: var(--text-primary);">🎯 Учебный характер:</strong><br>
                            Все клинические случаи носят тренировочный характер и основаны на типовых медицинских ситуациях.
                        </p>
                        <p style="margin-bottom: 20px;">
                            <strong style="color: #ef4444;">⚕️ НЕ является медицинским советом:</strong><br>
                            Приложение НЕ заменяет профессиональную медицинскую консультацию, диагностику или лечение.
                        </p>
                        <div style="
                            background: rgba(239, 68, 68, 0.1);
                            border: 1px solid rgba(239, 68, 68, 0.3);
                            border-radius: 8px;
                            padding: 15px;
                            text-align: center;
                        ">
                            <strong style="color: #ef4444;">
                                При любых медицинских вопросах обращайтесь к квалифицированным специалистам!
                            </strong>
                        </div>
                    </div>
                    <button id="accept-disclaimer" style="
                        background: var(--medical-primary);
                        color: white;
                        border: none;
                        padding: 18px 40px;
                        border-radius: var(--border-radius);
                        font-size: 16px;
                        font-weight: 600;
                        cursor: pointer;
                        transition: all 0.3s ease;
                        width: 100%;
                        text-transform: uppercase;
                        letter-spacing: 0.5px;
                    " onmouseover="this.style.background='var(--medical-secondary)'; this.style.transform='translateY(-2px)'" 
                       onmouseout="this.style.background='var(--medical-primary)'; this.style.transform='translateY(0)'">
                        ✓ Понял(а), начать обучение
                    </button>
                </div>
            </div>
            <style>
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes slideInUp {
                    from { opacity: 0; transform: translateY(50px) scale(0.9); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }
            </style>
        `;
        
        document.body.insertAdjacentHTML('beforeend', disclaimerHTML);
        
        document.getElementById('accept-disclaimer').addEventListener('click', () => {
            const disclaimer = document.getElementById('medical-disclaimer');
            disclaimer.style.animation = 'fadeOut 0.3s ease-out forwards';
            
            setTimeout(() => {
                disclaimer.remove();
                // Сохраняем согласие в переменной (не используем localStorage)
                window.disclaimerAccepted = true;
                resolve();
            }, 300);
        });
    });
}

// Функция проверки необходимости показа дисклеймера
function checkDisclaimerNeeded() {
    return !window.disclaimerAccepted;
}

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
            },
            {
                patient: "Женщина, 67 лет, пенсионерка",
                complaint: "Нарастающая одышка при физической нагрузке в течение 3 месяцев, отеки голеней и стоп, увеличение живота.",
                history: "В анамнезе: ИБС, перенесенный Q-ИМ 2 года назад, артериальная гипертензия.",
                examination: "Ортопноэ. Акроцианоз. Набухание шейных вен. В легких влажные хрипы в нижних отделах. Тоны сердца приглушены, ритм галопа. Гепатомегалия +3 см.",
                additional: "ЭхоКГ: ФВ ЛЖ 35%, диффузная гипокинезия. NT-proBNP 2500 пг/мл. Рентген ОГК: кардиомегалия, застой в малом круге.",
                question: "Стадия хронической сердечной недостаточности по NYHA:",
                options: [
                    "NYHA I",
                    "NYHA II", 
                    "NYHA III",
                    "NYHA IV"
                ],
                correct: 2,
                explanation: "NYHA III: выраженная одышка при незначительной физической нагрузке, но в покое симптомов нет. Признаки застоя по большому и малому кругу, снижение ФВ <40%, высокий NT-proBNP."
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
    
    // Показываем дисклеймер при первом запуске
    if (checkDisclaimerNeeded()) {
        await showMedicalDisclaimer();
    }
    
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
        // Показываем красивое уведомление вместо alert
        showNotification('Случаи для этой системы находятся в разработке! Попробуйте другую специальность.', 'warning');
        return;
    }

    // Перемешиваем и берем нужное количество случаев
    gameState.currentCases = shuffleArray([...systemCases]).slice(0, Math.min(gameState.totalCases, systemCases.length));
    
    // Сброс состояния
    gameState.currentCaseIndex = 0;
    gameState.score = 0;
    gameState.selectedOption = null;

    // Переключаем на экран случая с анимацией
    startScreen.style.animation = 'fadeOut 0.3s ease-out forwards';
    setTimeout(() => {
        startScreen.style.display = 'none';
        caseContainer.style.display = 'block';
        caseContainer.style.animation = 'fadeIn 0.3s ease-out forwards';
        
        // Загружаем первый случай
        loadCase();
    }, 300);
}

// ==================== УВЕДОМЛЕНИЯ ====================
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 30px;
        right: 30px;
        background: ${type === 'warning' ? 'var(--medical-warning)' : 'var(--medical-primary)'};
        color: white;
        padding: 20px 25px;
        border-radius: var(--border-radius);
        font-weight: 600;
        z-index: 9999;
        box-shadow: var(--shadow-glass);
        animation: slideInRight 0.5s ease-out;
        max-width: 400px;
        backdrop-filter: blur(10px);
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.5s ease-out forwards';
        setTimeout(() => notification.remove(), 500);
    }, 3000);
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
        <div class="patient-info">👤 Пациент: ${case_data.patient}</div>
        <div class="case-description">
            <strong>💬 Жалобы:</strong> ${case_data.complaint}<br><br>
            <strong>📋 Анамнез заболевания:</strong> ${case_data.history}<br><br>
            <strong>🔍 Объективный осмотр:</strong> ${case_data.examination}
        </div>
        ${case_data.additional ? `<div class="case-data"><strong>📊 Дополнительные данные:</strong><br>${case_data.additional}</div>` : ''}
        <div class="case-question">❓ ${case_data.question}</div>
    `;

    // Создаем варианты ответов
    const optionsContainer = document.getElementById('options');
    optionsContainer.innerHTML = '';
    
    case_data.options.forEach((option, index) => {
        const optionElement = document.createElement('div');
        optionElement.classList.add('option');
        optionElement.innerHTML = `<span style="font-weight: 600; color: var(--medical-primary); margin-right: 10px;">${String.fromCharCode(65 + index)}.</span>${option}`;
        optionElement.dataset.index = index;
        optionElement.addEventListener('click', () => selectOption(optionElement, index));
        optionsContainer.appendChild(optionElement);
    });

    // Скрываем объяснение и делаем кнопку неактивной
    document.getElementById('explanation').classList.remove('show');
    document.getElementById('next-case').disabled = true;
    
    // Обновляем текст кнопки
    const nextButton = document.getElementById('next-case');
    if (gameState.currentCaseIndex === gameState.currentCases.length - 1) {
        nextButton.textContent = 'Показать результаты';
    } else {
        nextButton.textContent = 'Следующий случай';
    }
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
    document.getElementById('explanation-text').innerHTML = `
        <strong style="color: var(--medical-success);">Правильный ответ: ${String.fromCharCode(65 + case_data.correct)}. ${case_data.options[case_data.correct]}</strong><br><br>
        <strong>📚 Клиническое обоснование:</strong><br>
        ${case_data.explanation}
    `;
    document.getElementById('explanation').classList.add('show');

    // Включаем кнопку следующего случая
    document.getElementById('next-case').disabled = false;

    // Увеличиваем счет, если правильно
    if (isCorrect) {
        gameState.score++;
        showNotification('✅ Правильный диагноз!', 'success');
    } else {
        showNotification('❌ Неверный диагноз. Изучите объяснение.', 'error');
    }
}

// ==================== СЛЕДУЮЩИЙ СЛУЧАЙ ====================
function nextCase() {
    gameState.currentCaseIndex++;
    loadCase();
}

// ==================== ВЫХОД ИЗ ИГРЫ ====================
function exitCases() {
    caseContainer.style.animation = 'fadeOut 0.3s ease-out forwards';
    setTimeout(() => {
        caseContainer.style.display = 'none';
        startScreen.style.display = 'block';
        startScreen.style.animation = 'fadeIn 0.3s ease-out forwards';
    }, 300);
}

// ==================== ПЕРЕЗАПУСК ====================
function restartCases() {
    resultsContainer.style.animation = 'fadeOut 0.3s ease-out forwards';
    setTimeout(() => {
        resultsContainer.style.display = 'none';
        startScreen.style.display = 'block';
        startScreen.style.animation = 'fadeIn 0.3s ease-out forwards';
    }, 300);
}

// ==================== ПОКАЗ РЕЗУЛЬТАТОВ ====================
function showResults() {
    caseContainer.style.animation = 'fadeOut 0.3s ease-out forwards';
    setTimeout(() => {
        caseContainer.style.display = 'none';
        resultsContainer.style.display = 'block';
        resultsContainer.style.animation = 'fadeIn 0.3s ease-out forwards';

        const percentage = Math.round((gameState.score / gameState.currentCases.length) * 100);
        
        // Анимированное обновление процентов
        animateNumber(document.getElementById('percentage'), 0, percentage, 1000);
        
        document.getElementById('correct-answers').textContent = gameState.score;
        document.getElementById('total-questions').textContent = gameState.currentCases.length;

        let resultText, resultEmoji;
        if (percentage >= 90) {
            resultText = 'Превосходно! Вы демонстрируете экспертный уровень клинического мышления!';
            resultEmoji = '🏆';
        } else if (percentage >= 70) {
            resultText = 'Отлично! Ваши диагностические навыки на высоком уровне!';
            resultEmoji = '🎉';
        } else if (percentage >= 50) {
            resultText = 'Хорошо! Есть понимание клинических процессов, но стоит углубить знания.';
            resultEmoji = '👍';
        } else {
            resultText = 'Нужно больше практики! Изучайте клинические случаи и возвращайтесь снова.';
            resultEmoji = '📚';
        }
        
        document.getElementById('result-message').innerHTML = `${resultEmoji} ${resultText}`;
    }, 300);
}

// ==================== АНИМАЦИИ ====================
function animateNumber(element, start, end, duration) {
    const startTime = Date.now();
    const range = end - start;
    
    function updateNumber() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const current = Math.round(start + (range * easeOutCubic(progress)));
        
        element.textContent = current;
        
        if (progress < 1) {
            requestAnimationFrame(updateNumber);
        }
    }
    
    updateNumber();
}

function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
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

// Добавляем стили для анимаций
if (!document.querySelector('#animation-styles')) {
    const animationStyles = document.createElement('style');
    animationStyles.id = 'animation-styles';
    animationStyles.textContent = `
        @keyframes fadeOut {
            from { opacity: 1; transform: scale(1); }
            to { opacity: 0; transform: scale(0.95); }
        }
        @keyframes fadeIn {
            from { opacity: 0; transform: scale(0.95); }
            to { opacity: 1; transform: scale(1); }
        }
        @keyframes slideInRight {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOutRight {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
    `;
    document.head.appendChild(animationStyles);
}
