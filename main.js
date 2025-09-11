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

// Функция для загрузки случаев (будет заменена на импорт модулей)
async function loadClinicalCases() {
    // Пока создадим базовые случаи, потом заменим на импорт из файлов
    clinicalCases = {
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
        gastrointestinal: [
            {
                patient: "Мужчина, 52 года, водитель",
                complaint: "Интенсивная боль в эпигастрии, возникшая внезапно ночью, тошнота, однократная рвота пищей.",
                history: "В анамнезе: язвенная болезнь 12-перстной кишки 8 лет, частые обострения весной и осенью. Принимает НПВС по поводу болей в спине.",
                examination: "Состояние тяжелое. Вынужденное положение с приведенными к животу ногами. Живот не участвует в дыхании, резко болезненный в эпигастрии. Симптом Щеткина-Блюмберга положительный.",
                additional: "Рентген брюшной полости: свободный газ под правым куполом диафрагмы. Лейкоциты 18×10⁹/л.",
                question: "Наиболее вероятное осложнение:",
                options: [
                    "Пенетрация язвы",
                    "Перфорация язвы",
                    "Кровотечение из язвы",
                    "Стеноз привратника"
                ],
                correct: 1,
                explanation: "Классическая картина перфорации язвы: внезапная 'кинжальная' боль в эпигастрии, доскообразное напряжение мышц живота, положительные симптомы раздражения брюшины, пневмоперитонеум на рентгене."
            }
        ],
        nervous: [
            {
                patient: "Женщина, 70 лет, пенсионерка",
                complaint: "Внезапно развившаяся слабость в левой руке и ноге, нарушение речи, перекос лица влево. Симптомы появились 2 часа назад.",
                history: "В анамнезе: артериальная гипертензия, фибрилляция предсердий, не принимает антикоагулянты.",
                examination: "Сознание ясное. Левосторонний гемипарез до 2 баллов. Центральный парез VII и XII нервов слева. Моторная афазия. Симптом Бабинского слева.",
                additional: "КТ головного мозга: без патологии (выполнена через 1 час от начала). АД 180/100 мм рт.ст. ЭКГ: фибрилляция предсердий.",
                question: "Наиболее вероятный диагноз:",
                options: [
                    "Геморрагический инсульт",
                    "Ишемический инсульт в бассейне правой СМА",
                    "Гипертонический криз",
                    "Опухоль головного мозга"
                ],
                correct: 1,
                explanation: "Острое развитие очаговой неврологической симптоматики (левосторонний гемипарез, моторная афазия) указывает на ишемический инсульт в бассейне правой средней мозговой артерии. Фактор риска - фибрилляция предсердий без антикоагулянтов."
            }
        ],
        endocrine: [
            {
                patient: "Женщина, 35 лет, учительница",
                complaint: "Резкое похудение на 8 кг за 2 месяца, сердцебиение, потливость, раздражительность, дрожание рук.",
                history: "Симптомы появились постепенно. Аппетит повышен, но продолжает худеть. Стул до 4 раз в день.",
                examination: "Эмоционально лабильна. Кожа влажная, горячая. ЧСС 110 уд/мин, ритмичная. АД 140/70 мм рт.ст. Щитовидная железа увеличена диффузно, плотноэластичная. Тремор пальцев рук.",
                additional: "ТТГ <0.01 мЕд/л (норма 0.4-4.0), Т4 свободный 45 пмоль/л (норма 10-25), антитела к рТТГ повышены в 3 раза.",
                question: "Наиболее вероятный диагноз:",
                options: [
                    "Токсическая аденома щитовидной железы",
                    "Диффузный токсический зоб (болезнь Грейвса)",
                    "Подострый тиреоидит",
                    "Многоузловой токсический зоб"
                ],
                correct: 1,
                explanation: "Классическая картина болезни Грейвса: тиреотоксикоз (похудение, тахикардия, потливость), диффузное увеличение ЩЖ, подавленный ТТГ, повышенный Т4, положительные антитела к рТТГ."
            }
        ],
        renal: [
            {
                patient: "Мужчина, 28 лет, программист",
                complaint: "Высокая температура до 39°C, озноб, тупая боль в пояснице справа, частое болезненное мочеиспускание.",
                history: "Болен 3 дня. В детстве часто болел ангинами. Неделю назад перенес ОРВИ.",
                examination: "Состояние средней тяжести. Температура 38.8°C. Положительный симптом Пастернацкого справа. Пальпация в проекции правой почки болезненна.",
                additional: "Анализ мочи: лейкоциты сплошь в п/з, эритроциты 10-15 в п/з, белок 0.5 г/л, бактерии +++. Посев мочи: E.coli 10⁵ КОЕ/мл. УЗИ почек: расширение ЧЛС справа.",
                question: "Наиболее вероятный диагноз:",
                options: [
                    "Острый цистит",
                    "Острый пиелонефрит",
                    "Мочекаменная болезнь",
                    "Гломерулонефрит"
                ],
                correct: 1,
                explanation: "Острый пиелонефрит: лихорадка, боль в пояснице, положительный симптом Пастернацкого, лейкоцитурия, бактериурия, расширение ЧЛС на УЗИ. Возбудитель - E.coli (типично для восходящей инфекции)."
            }
        ]
    };
}

// ==================== DOM ЭЛЕМЕНТЫ ====================
let startScreen, caseContainer, resultsContainer;

// ==================== ИНИЦИАЛИЗАЦИЯ ====================
document.addEventListener('DOMContentLoaded', async function() {
    // Загружаем клинические случаи
    await loadClinicalCases();
    
    // Получаем DOM элементы
    startScreen = document.getElementById('start-screen');
    caseContainer = document.getElementById('case-container');
    resultsContainer = document.getElementById('results-container');
    
    // Настраиваем обработчики событий
    setupEventHandlers();
    
    console.log('TherapyGod инициализирован!');
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
