/**
 * Entrenamiento Académico - Application Logic & Core Quiz Engines
 * Inspired by ThatQuiz, developed in Spanish.
 */

// ==========================================================================
// APPLICATION STATE
// ==========================================================================
const state = {
    theme: 'dark',
    currentScreen: 'dashboard', // dashboard, config, quiz, results
    currentCategory: '',        // aritmetica, fracciones, geometria, conceptos
    currentTopic: '',           // suma, resta, multiplicar, etc.
    
    // Quiz Config
    config: {
        length: 20,
        level: 1,
        timeLimit: 0, // seconds, 0 = unlimited
        mode: 'practice', // practice, exam
        negatives: false,
        simplifyFrac: false
    },

    // Active Quiz State
    quiz: {
        questions: [],
        currentIndex: 0,
        correctCount: 0,
        wrongCount: 0,
        skippedCount: 0,
        startTime: null,
        elapsedSeconds: 0,
        timerInterval: null,
        answersHistory: [], // { question, correctAns, userAns, isCorrect, detail }
    }
};

// Map topics to user-friendly Spanish labels and icons
const TOPIC_METADATA = {
    aritmetica: [
        { id: 'suma', label: 'Suma', icon: 'fa-plus' },
        { id: 'resta', label: 'Resta', icon: 'fa-minus' },
        { id: 'multiplicacion', label: 'Multiplicación', icon: 'fa-xmark' },
        { id: 'division', label: 'División', icon: 'fa-divide' },
        { id: 'enteros_mixtos', label: 'Mixto (Enteros)', icon: 'fa-shuffle' },
        { id: 'decimales', label: 'Aritmética Decimal', icon: 'fa-coins' },
        { id: 'regla_tres_directa', label: 'Regla de Tres Directa', icon: 'fa-arrow-trend-up' },
        { id: 'regla_tres_inversa', label: 'Regla de Tres Inversa', icon: 'fa-arrow-trend-down' },
        { id: 'base_diez', label: 'Aritmética Base 10', icon: 'fa-subscript' },
        { id: 'potenciacion', label: 'Potenciación (Propiedades)', icon: 'fa-superscript' }
    ],
    fracciones: [
        { id: 'identificar', label: 'Identificar Fracción', icon: 'fa-pie-chart' },
        { id: 'comparar', label: 'Comparar Fracciones', icon: 'fa-code-compare' },
        { id: 'simplificar', label: 'Simplificar Fracción', icon: 'fa-compress' },
        { id: 'operaciones', label: 'Operaciones de Frac.', icon: 'fa-calculator' }
    ],
    geometria: [
        { id: 'area', label: 'Área', icon: 'fa-vector-square' },
        { id: 'perimetro', label: 'Perímetro', icon: 'fa-border-top-left' },
        { id: 'angulos', label: 'Cálculo de Ángulos', icon: 'fa-compass' }
    ],
    conceptos: [
        { id: 'reloj', label: 'Lectura del Reloj', icon: 'fa-clock' },
        { id: 'romanos', label: 'Números Romanos', icon: 'fa-scroll' },
        { id: 'unidades', label: 'Conversión de Unidades', icon: 'fa-ruler-combined' }
    ],
    algebra_conjuntos: [
        { id: 'conjuntos', label: 'Operaciones de Conjuntos', icon: 'fa-circle-nodes' },
        { id: 'propiedades_desigualdades', label: 'Propiedades de Desigualdades', icon: 'fa-scale-unbalanced' },
        { id: 'solucion_desigualdades', label: 'Solución de Desigualdades', icon: 'fa-xmark' },
        { id: 'intervalos', label: 'Intervalos & Desigualdades', icon: 'fa-grip-lines-vertical' }
    ],
    conversion_unidades: [
        { id: 'matematicas_conversion', label: 'Conversión Matemática', icon: 'fa-hashtag' },
        { id: 'fisica_conversion', label: 'Conversión Física', icon: 'fa-temperature-half' },
        { id: 'quimica_conversion', label: 'Conversión Química', icon: 'fa-flask' },
        { id: 'ingenieria_conversion', label: 'Conversión en Ingeniería', icon: 'fa-gears' }
    ],
    despeje_variables: [
        { id: 'fisica_despeje', label: 'Despeje en Física', icon: 'fa-atom' },
        { id: 'quimica_despeje', label: 'Despeje en Química', icon: 'fa-flask' },
        { id: 'ingenieria_despeje', label: 'Despeje en Ingeniería', icon: 'fa-microchip' },
        { id: 'matematicas_despeje', label: 'Despeje en Matemáticas', icon: 'fa-arrow-trend-up' }
    ],
    ecuaciones: [
        { id: 'lineales', label: 'Ecuaciones Lineales', icon: 'fa-grip-lines' },
        { id: 'cuadraticas', label: 'Ecuaciones Cuadráticas', icon: 'fa-arrow-up-right-dots' },
        { id: 'radicales', label: 'Ecuaciones con Radicales', icon: 'fa-square-root-variable' },
        { id: 'fraccionarias', label: 'Ecuaciones con Fracciones', icon: 'fa-divide' }
    ],
    calculo_derivadas: [
        { id: 'derivadas_basicas', label: 'Derivadas Algebraicas Básicas', icon: 'fa-arrow-down-short-wide' },
        { id: 'derivadas_producto_cociente', label: 'Reglas del Producto y Cociente', icon: 'fa-divide' },
        { id: 'derivadas_trig_exp', label: 'Trigonométricas, Exponenciales y Log.', icon: 'fa-wave-square' },
        { id: 'derivadas_cadena', label: 'Regla de la Cadena', icon: 'fa-link' }
    ],
    integrales_indefinidas: [
        { id: 'integrales_basicas', label: 'Integrales Inmediatas Algebraicas', icon: 'fa-arrow-up-wide-short' },
        { id: 'integrales_directas_trig_exp', label: 'Directas Trigonométricas y Exp.', icon: 'fa-wave-square' },
        { id: 'integrales_sustitucion', label: 'Integración por Sustitución', icon: 'fa-repeat' },
        { id: 'integrales_partes', label: 'Integración por Partes', icon: 'fa-scissors' }
    ],
    derivadas_parciales: [
        { id: 'parciales_dos_primer', label: 'Parciales 1er Orden (2 var)', icon: 'fa-x' },
        { id: 'parciales_dos_segundo', label: 'Parciales 2do Orden (2 var)', icon: 'fa-y' },
        { id: 'parciales_tres_primer', label: 'Parciales 1er Orden (3 var)', icon: 'fa-z' },
        { id: 'parciales_gradiente', label: 'Gradiente (2 y 3 var)', icon: 'fa-location-arrow' }
    ],
    integrales_fracciones_parciales: [
        { id: 'fracciones_parciales_simples', label: 'Factores Lineales Distintos', icon: 'fa-table-columns' },
        { id: 'fracciones_parciales_repetidos', label: 'Factores Lineales Repetidos', icon: 'fa-repeat' },
        { id: 'fracciones_parciales_cuadraticos', label: 'Factores Cuadráticos', icon: 'fa-border-all' }
    ],
    integrales_sustitucion_trigonometrica: [
        { id: 'sust_trig_seno', label: 'Caso Seno (a^2 - x^2)', icon: 'fa-wave-square' },
        { id: 'sust_trig_tangente', label: 'Caso Tangente (a^2 + x^2)', icon: 'fa-arrow-up-right-dots' },
        { id: 'sust_trig_secante', label: 'Caso Secante (x^2 - a^2)', icon: 'fa-bezier-curve' }
    ],
    recta_tangente: [
        { id: 'recta_tangente_algebraica', label: 'Funciones Algebraicas', icon: 'fa-arrow-trend-up' },
        { id: 'recta_tangente_trig_exp', label: 'Trascendentes (Trig/Exp)', icon: 'fa-wave-square' },
        { id: 'recta_tangente_completo', label: 'Punto Completo (x, y)', icon: 'fa-location-crosshairs' }
    ],
    optimizacion_primera_derivada: [
        { id: 'opt_1d_numeros', label: 'Problemas Numéricos', icon: 'fa-calculator' },
        { id: 'opt_1d_areas', label: 'Optimización de Áreas', icon: 'fa-vector-square' },
        { id: 'opt_1d_volumenes', label: 'Optimización de Volúmenes', icon: 'fa-cube' }
    ],
    optimizacion_segunda_derivada: [
        { id: 'opt_2d_costos', label: 'Costos y Recursos', icon: 'fa-dollar-sign' },
        { id: 'opt_2d_geometria', label: 'Geometría General', icon: 'fa-shapes' },
        { id: 'opt_2d_distancias', label: 'Optimizar Distancias', icon: 'fa-ruler' }
    ],
    optimizacion_cuadratica: [
        { id: 'opt_cuad_maximos', label: 'Modelos con Máximo', icon: 'fa-arrow-up-long' },
        { id: 'opt_cuad_minimos', label: 'Modelos con Mínimo', icon: 'fa-arrow-down-long' },
        { id: 'opt_cuad_general', label: 'Decisión Máximo/Mínimo', icon: 'fa-circle-question' }
    ],
    identidades_trigonometricas: [
        { id: 'ident_pitagoricas', label: 'Identidades Pitagóricas', icon: 'fa-shapes' },
        { id: 'ident_cocientes_reciprocidades', label: 'Cocientes y Recíprocas', icon: 'fa-divide' },
        { id: 'ident_suma_doble', label: 'Ángulo Doble y Adición', icon: 'fa-wave-square' }
    ],
    factorizacion_cuadratica: [
        { id: 'fact_poshenloh', label: 'Método Po-Shen Loh (a = 1)', icon: 'fa-graduation-cap' },
        { id: 'fact_diferencia_tcp', label: 'Dif. Cuadrados y TCP', icon: 'fa-square-minus' },
        { id: 'fact_a_diferente_uno', label: 'Trinomios con a != 1', icon: 'fa-arrow-up-right-dots' }
    ]
};

// ==========================================================================
// DOM ELEMENTS
// ==========================================================================
const DOM = {
    body: document.body,
    themeToggle: document.getElementById('theme-toggle'),
    btnLogoHome: document.getElementById('btn-logo-home'),
    
    // Screens
    secDashboard: document.getElementById('sec-dashboard'),
    secConfig: document.getElementById('sec-config'),
    secQuiz: document.getElementById('sec-quiz'),
    secResults: document.getElementById('sec-results'),
    
    // Config Screen Elements
    configCategoryTitle: document.getElementById('config-category-title'),
    topicsContainer: document.getElementById('topics-container'),
    ctrlLength: document.getElementById('ctrl-length'),
    ctrlTime: document.getElementById('ctrl-time'),
    ctrlMode: document.getElementById('ctrl-mode'),
    settingLevel: document.getElementById('setting-level'),
    levelDisplay: document.getElementById('level-display'),
    extraOptionsContainer: document.getElementById('extra-options-container'),
    extraCheckboxes: document.getElementById('extra-checkboxes'),
    btnStartQuiz: document.getElementById('btn-start-quiz'),
    btnConfigBack: document.getElementById('btn-config-back'),
    
    // Quiz Screen Elements
    quizProgressText: document.getElementById('quiz-progress-text'),
    quizCorrectCount: document.getElementById('quiz-correct-count'),
    quizWrongCount: document.getElementById('quiz-wrong-count'),
    quizTimer: document.getElementById('quiz-timer'),
    quizProgressBar: document.getElementById('quiz-progress-bar'),
    visualContainer: document.getElementById('visual-container'),
    quizCanvas: document.getElementById('quiz-canvas'),
    quizQuestionText: document.getElementById('quiz-question-text'),
    quizAnswersArea: document.getElementById('quiz-answers-area'),
    btnSkip: document.getElementById('btn-skip'),
    btnSubmit: document.getElementById('btn-submit'),
    btnQuitQuiz: document.getElementById('btn-quit-quiz'),
    
    // Results Screen Elements
    resultsScoreCircle: document.getElementById('results-score-circle'),
    resPercent: document.getElementById('res-percent'),
    resGrade: document.getElementById('res-grade'),
    resCorrect: document.getElementById('res-correct'),
    resWrong: document.getElementById('res-wrong'),
    resSkipped: document.getElementById('res-skipped'),
    resTime: document.getElementById('res-time'),
    resTimeAvg: document.getElementById('res-time-avg'),
    resTopicName: document.getElementById('res-topic-name'),
    btnRestartQuiz: document.getElementById('btn-restart-quiz'),
    btnHome: document.getElementById('btn-home'),
    resultsReviewList: document.getElementById('results-review-list'),
    
    // Modals
    modalQuit: document.getElementById('modal-quit'),
    btnQuitCancel: document.getElementById('btn-quit-cancel'),
    btnQuitConfirm: document.getElementById('btn-quit-confirm')
};

// Canvas 2D Context
const ctx = DOM.quizCanvas.getContext('2d');

// ==========================================================================
// THEME & INITIALIZATION
// ==========================================================================
function initTheme() {
    const savedTheme = localStorage.getItem('entrenamiento-theme') || 'dark';
    state.theme = savedTheme;
    if (savedTheme === 'light') {
        DOM.body.classList.remove('dark-theme');
        DOM.body.classList.add('light-theme');
    } else {
        DOM.body.classList.remove('light-theme');
        DOM.body.classList.add('dark-theme');
    }
}

function toggleTheme() {
    if (state.theme === 'dark') {
        state.theme = 'light';
        DOM.body.classList.replace('dark-theme', 'light-theme');
    } else {
        state.theme = 'dark';
        DOM.body.classList.replace('light-theme', 'dark-theme');
    }
    localStorage.setItem('entrenamiento-theme', state.theme);
}

// Hook up global events
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    setupNavigationEvents();
    setupConfigEvents();
    setupQuizEvents();
});

// ==========================================================================
// NAVIGATION SYSTEM
// ==========================================================================
function showScreen(screenId) {
    const screens = [
        { id: 'dashboard', el: DOM.secDashboard },
        { id: 'config', el: DOM.secConfig },
        { id: 'quiz', el: DOM.secQuiz },
        { id: 'results', el: DOM.secResults }
    ];

    screens.forEach(s => {
        if (s.id === screenId) {
            s.el.style.display = 'block';
            setTimeout(() => s.el.classList.add('active'), 10);
        } else {
            s.el.classList.remove('active');
            s.el.style.display = 'none';
        }
    });
    state.currentScreen = screenId;
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function setupNavigationEvents() {
    // Theme Switcher
    DOM.themeToggle.addEventListener('click', toggleTheme);

    // Click Logo/Home to restart
    DOM.btnLogoHome.addEventListener('click', () => {
        if (state.currentScreen === 'quiz') {
            openQuitModal();
        } else {
            showScreen('dashboard');
        }
    });

    // Dashboard Category Cards
    document.querySelectorAll('.category-card').forEach(card => {
        card.addEventListener('click', () => {
            const cat = card.getAttribute('data-category');
            state.currentCategory = cat;
            enterConfigScreen();
        });
    });

    // Back to dashboard
    DOM.btnConfigBack.addEventListener('click', () => {
        showScreen('dashboard');
    });

    // Results back to home
    DOM.btnHome.addEventListener('click', () => {
        showScreen('dashboard');
    });

    // Results restart
    DOM.btnRestartQuiz.addEventListener('click', () => {
        startQuiz();
    });
}

// ==========================================================================
// CONFIGURATION PANEL HANDLERS
// ==========================================================================
function enterConfigScreen() {
    // 1. Update Title
    const categoryTitles = {
        aritmetica: 'Aritmética',
        fracciones: 'Fracciones',
        geometria: 'Geometría',
        conceptos: 'Conceptos',
        algebra_conjuntos: 'Álgebra & Conjuntos',
        conversion_unidades: 'Conversión de Unidades',
        despeje_variables: 'Despeje de Variables',
        ecuaciones: 'Ecuaciones',
        calculo_derivadas: 'Cálculo de Derivadas',
        integrales_indefinidas: 'Integrales Indefinidas',
        derivadas_parciales: 'Derivadas Parciales',
        integrales_fracciones_parciales: 'Integrales por Fracciones Parciales',
        integrales_sustitucion_trigonometrica: 'Sustitución Trigonométrica',
        recta_tangente: 'Recta Tangente',
        optimizacion_primera_derivada: 'Optimización (1ª Derivada)',
        optimizacion_segunda_derivada: 'Optimización (2ª Derivada)',
        optimizacion_cuadratica: 'Optimización Cuadrática',
        identidades_trigonometricas: 'Identidades Trigonométricas',
        factorizacion_cuadratica: 'Factorización Cuadrática'
    };
    DOM.configCategoryTitle.innerText = categoryTitles[state.currentCategory] || 'Práctica';

    // 2. Render Topics
    DOM.topicsContainer.innerHTML = '';
    const topics = TOPIC_METADATA[state.currentCategory] || [];
    
    topics.forEach((t, index) => {
        const btn = document.createElement('button');
        btn.className = `topic-btn ${index === 0 ? 'active' : ''}`;
        btn.setAttribute('data-topic', t.id);
        btn.innerHTML = `<i class="fa-solid ${t.icon}"></i> <span>${t.label}</span>`;
        btn.addEventListener('click', () => {
            document.querySelectorAll('.topic-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            state.currentTopic = t.id;
            updateContextualOptions();
        });
        DOM.topicsContainer.appendChild(btn);
    });

    // Select first topic by default
    if (topics.length > 0) {
        state.currentTopic = topics[0].id;
    }

    // 3. Render contextual settings checkboxes
    updateContextualOptions();

    // 4. Reset config settings in the UI to defaults
    state.config.length = 20;
    state.config.level = 1;
    state.config.timeLimit = 0;
    state.config.mode = 'practice';
    state.config.negatives = false;
    state.config.simplifyFrac = false;

    // Reset length UI active
    setActiveSegment(DOM.ctrlLength, '20');
    setActiveSegment(DOM.ctrlTime, '0');
    setActiveSegment(DOM.ctrlMode, 'practice');
    DOM.settingLevel.value = 1;
    DOM.levelDisplay.innerText = 'Nivel 1';

    showScreen('config');
}

function updateContextualOptions() {
    DOM.extraCheckboxes.innerHTML = '';
    let hasExtras = false;

    // Aritmética options
    if (state.currentCategory === 'aritmetica' && state.currentTopic !== 'decimales') {
        hasExtras = true;
        const lbl = createCheckboxOption('opt-negatives', 'Enteros Negativos', state.config.negatives, (checked) => {
            state.config.negatives = checked;
        });
        DOM.extraCheckboxes.appendChild(lbl);
    }

    // Fracciones options
    if (state.currentCategory === 'fracciones' && (state.currentTopic === 'operaciones' || state.currentTopic === 'simplificar')) {
        hasExtras = true;
        const lbl = createCheckboxOption('opt-simplify', 'Exigir Simplificación al Máximo', state.config.simplifyFrac, (checked) => {
            state.config.simplifyFrac = checked;
        });
        DOM.extraCheckboxes.appendChild(lbl);
    }

    // Show or hide panel
    if (hasExtras) {
        DOM.extraOptionsContainer.style.display = 'flex';
    } else {
        DOM.extraOptionsContainer.style.display = 'none';
    }
}

function createCheckboxOption(id, text, checked, onChange) {
    const label = document.createElement('label');
    label.className = 'checkbox-label';
    label.htmlFor = id;

    const input = document.createElement('input');
    input.type = 'checkbox';
    input.id = id;
    input.checked = checked;
    input.addEventListener('change', (e) => onChange(e.target.checked));

    const span = document.createElement('span');
    span.innerText = text;

    label.appendChild(input);
    label.appendChild(span);
    return label;
}

function setupConfigEvents() {
    // Level Slider
    DOM.settingLevel.addEventListener('input', (e) => {
        const val = e.target.value;
        state.config.level = parseInt(val);
        DOM.levelDisplay.innerText = `Nivel ${val}`;
    });

    // Segmented control utility
    setupSegmentedControl(DOM.ctrlLength, (val) => {
        state.config.length = parseInt(val);
    });

    setupSegmentedControl(DOM.ctrlTime, (val) => {
        state.config.timeLimit = parseInt(val);
    });

    setupSegmentedControl(DOM.ctrlMode, (val) => {
        state.config.mode = val;
    });

    // Start Quiz
    DOM.btnStartQuiz.addEventListener('click', startQuiz);
}

function setupSegmentedControl(parentEl, callback) {
    parentEl.querySelectorAll('.segment-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            parentEl.querySelectorAll('.segment-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            callback(btn.getAttribute('data-val'));
        });
    });
}

function setActiveSegment(parentEl, val) {
    parentEl.querySelectorAll('.segment-btn').forEach(btn => {
        if (btn.getAttribute('data-val') === val) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
}

// ==========================================================================
// QUIZ CORE MOTOR (ENGINE)
// ==========================================================================
function startQuiz() {
    // 1. Reset Quiz state
    state.quiz.currentIndex = 0;
    state.quiz.correctCount = 0;
    state.quiz.wrongCount = 0;
    state.quiz.skippedCount = 0;
    state.quiz.elapsedSeconds = 0;
    state.quiz.answersHistory = [];
    state.quiz.startTime = new Date();

    // 2. Generate questions
    state.quiz.questions = generateQuestions(
        state.currentCategory,
        state.currentTopic,
        state.config.length,
        state.config.level,
        state.config
    );

    // 3. Clear existing timers
    if (state.quiz.timerInterval) {
        clearInterval(state.quiz.timerInterval);
    }

    // 4. Initialize screen and timer
    updateQuizHeader();
    renderQuestion(0);
    showScreen('quiz');

    // 5. Start timer loop
    if (state.config.timeLimit > 0) {
        state.quiz.elapsedSeconds = state.config.timeLimit;
        DOM.quizTimer.innerText = formatTime(state.quiz.elapsedSeconds);
        DOM.quizTimer.parentElement.classList.add('text-warning');
        
        state.quiz.timerInterval = setInterval(() => {
            state.quiz.elapsedSeconds--;
            DOM.quizTimer.innerText = formatTime(state.quiz.elapsedSeconds);
            if (state.quiz.elapsedSeconds <= 0) {
                clearInterval(state.quiz.timerInterval);
                finishQuizDueToTimeout();
            }
        }, 1000);
    } else {
        DOM.quizTimer.innerText = '00:00';
        DOM.quizTimer.parentElement.classList.remove('text-warning');
        
        state.quiz.timerInterval = setInterval(() => {
            state.quiz.elapsedSeconds++;
            DOM.quizTimer.innerText = formatTime(state.quiz.elapsedSeconds);
        }, 1000);
    }
}

function formatTime(secs) {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
}

function updateQuizHeader() {
    const current = state.quiz.currentIndex + 1;
    const total = state.quiz.questions.length;
    
    DOM.quizProgressText.innerText = `${current} / ${total}`;
    DOM.quizCorrectCount.innerText = state.quiz.correctCount;
    DOM.quizWrongCount.innerText = state.quiz.wrongCount;
    
    const percent = (state.quiz.currentIndex / total) * 100;
    DOM.quizProgressBar.style.width = `${percent}%`;
}

// ==========================================================================
// QUESTION GENERATOR IMPLEMENTATIONS
// ==========================================================================
const quizCache = {
    shuffledIndices: {}
};

function getShuffledIndexForTopic(topicKey, poolLength, currentIndex) {
    if (!quizCache.shuffledIndices[topicKey]) {
        const arr = Array.from({ length: poolLength }, (_, idx) => idx);
        shuffleArray(arr);
        quizCache.shuffledIndices[topicKey] = arr;
    }
    const shuffledArr = quizCache.shuffledIndices[topicKey];
    const cycle = Math.floor(currentIndex / poolLength);
    const offset = currentIndex % poolLength;
    if (offset === 0 && cycle > 0) {
        shuffleArray(shuffledArr);
    }
    return shuffledArr[offset];
}

function generateQuestions(category, topic, count, level, options) {
    // Clear quiz generation cache at start of new quiz
    quizCache.shuffledIndices = {};

    const list = [];
    for (let i = 0; i < count; i++) {
        list.push(createSingleQuestion(category, topic, level, options, i, count));
    }
    return list;
}

function createSingleQuestion(category, topic, level, options, index, total) {
    switch (category) {
        case 'aritmetica':
            return generateArithmeticQuestion(topic, level, options, index, total);
        case 'fracciones':
            return generateFractionsQuestion(topic, level, options, index, total);
        case 'geometria':
            return generateGeometryQuestion(topic, level, options, index, total);
        case 'conceptos':
            return generateConceptsQuestion(topic, level, options, index, total);
        case 'algebra_conjuntos':
            return generateAlgebraConjuntosQuestion(topic, level, options, index, total);
        case 'conversion_unidades':
            return generateConversionUnidadesQuestion(topic, level, options, index, total);
        case 'despeje_variables':
            return generateDespejeVariablesQuestion(topic, level, options, index, total);
        case 'ecuaciones':
            return generateEcuacionesQuestion(topic, level, options, index, total);
        case 'calculo_derivadas':
            return generateCalculoDerivadasQuestion(topic, level, options, index, total);
        case 'integrales_indefinidas':
            return generateIntegralesIndefinidasQuestion(topic, level, options, index, total);
        case 'derivadas_parciales':
            return generateDerivadasParcialesQuestion(topic, level, options, index, total);
        case 'integrales_fracciones_parciales':
            return generateIntegralesFraccionesParcialesQuestion(topic, level, options, index, total);
        case 'integrales_sustitucion_trigonometrica':
            return generateIntegralesSustitucionTrigonometricaQuestion(topic, level, options, index, total);
        case 'recta_tangente':
            return generateRectaTangenteQuestion(topic, level, options, index, total);
        case 'optimizacion_primera_derivada':
            return generateOptimizacionPrimeraDerivadaQuestion(topic, level, options, index, total);
        case 'optimizacion_segunda_derivada':
            return generateOptimizacionSegundaDerivadaQuestion(topic, level, options, index, total);
        case 'optimizacion_cuadratica':
            return generateOptimizacionCuadraticaQuestion(topic, level, options, index, total);
        case 'identidades_trigonometricas':
            return generateIdentidadesTrigonometricasQuestion(topic, level, options, index, total);
        case 'factorizacion_cuadratica':
            return generateFactorizacionCuadraticaQuestion(topic, level, options, index, total);
        default:
            return {
                text: 'Error en la pregunta',
                correctAnswer: '0',
                inputType: 'number'
            };
    }
}

// Helper: random number in range [min, max] inclusive
function randRange(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Helper: random decimal in range [min, max] with decimal places
function randDecimal(min, max, places) {
    const val = Math.random() * (max - min) + min;
    return parseFloat(val.toFixed(places));
}

// Helper: Greatest Common Divisor
function gcd(a, b) {
    return b === 0 ? Math.abs(a) : gcd(b, a % b);
}

// Helper: Simplify fraction
function simplifyFraction(num, den) {
    const divisor = gcd(num, den);
    return [num / divisor, den / divisor];
}

// Aritmética Generator
function generateArithmeticQuestion(topic, level, options, index, total) {
    if (topic === 'regla_tres_directa') {
        return generateReglaTresDirecta(level, index, total);
    }
    if (topic === 'regla_tres_inversa') {
        return generateReglaTresInversa(level, index, total);
    }
    if (topic === 'base_diez') {
        return generateBaseDiezArithmetic(level, index, total);
    }
    if (topic === 'potenciacion') {
        return generatePotenciacionPropiedades(level, index, total);
    }
    let a, b, op, text, ans;
    const isDecimal = topic === 'decimales';
    const allowNegatives = options.negatives;

    // Define number range based on level
    let min = 1, max = 10;
    if (level === 2) { min = 2; max = 20; }
    else if (level === 3) { min = 10; max = 50; }
    else if (level === 4) { min = 10; max = 100; }
    else if (level === 5) { min = 20; max = 200; }
    else if (level === 6) { min = 50; max = 500; }
    else if (level === 7) { min = 100; max = 1000; }
    else if (level === 8) { min = 200; max = 1500; }
    else if (level === 9) { min = 500; max = 5000; }
    else if (level === 10) { min = 1000; max = 10000; }

    // If decimal mode, choose ranges and roundings
    if (isDecimal) {
        const places = level <= 3 ? 1 : (level <= 6 ? 2 : 3);
        a = randDecimal(min / 10, max / 10, places);
        b = randDecimal(min / 10, max / 10, places);
        const actualTopic = ['suma', 'resta', 'multiplicacion', 'division'][randRange(0, 3)];
        
        if (actualTopic === 'suma') {
            ans = parseFloat((a + b).toFixed(places));
            text = `Calcula: ${a} + ${b}`;
        } else if (actualTopic === 'resta') {
            if (a < b) { const tmp = a; a = b; b = tmp; } // Keep positive for simplicity in low decimals
            ans = parseFloat((a - b).toFixed(places));
            text = `Calcula: ${a} - ${b}`;
        } else if (actualTopic === 'multiplicacion') {
            a = randDecimal(1, 10, 1);
            b = randDecimal(1, 10, 1);
            ans = parseFloat((a * b).toFixed(2));
            text = `Calcula: ${a} × ${b}`;
        } else { // division
            b = randDecimal(1, 5, 1);
            ans = randDecimal(1, 10, 1);
            a = parseFloat((ans * b).toFixed(2));
            ans = parseFloat(ans.toFixed(1));
            text = `Calcula: ${a} ÷ ${b}`;
        }
        return {
            text: text,
            correctAnswer: ans.toString(),
            inputType: 'number',
            topicLabel: 'Aritmética Decimal'
        };
    }

    // Determine actual topic if it's mixed enteros
    let actualTopic = topic;
    if (topic === 'enteros_mixtos') {
        const topics = ['suma', 'resta', 'multiplicacion', 'division'];
        actualTopic = topics[randRange(0, 3)];
    }

    // Helper to apply negatives if allowed
    const makeVal = () => {
        let v = randRange(min, max);
        if (allowNegatives && Math.random() > 0.5) {
            v = -v;
        }
        return v;
    };

    if (actualTopic === 'suma') {
        a = makeVal();
        b = makeVal();
        ans = a + b;
        text = `¿Cuánto es: ${a} + (${b < 0 ? b : '+' + b})?`;
        if (a >= 0 && b >= 0) text = `¿Cuánto es: ${a} + ${b}?`;
    } else if (actualTopic === 'resta') {
        a = makeVal();
        b = makeVal();
        ans = a - b;
        text = `¿Cuánto es: ${a} - (${b < 0 ? b : '+' + b})?`;
        if (a >= 0 && b >= 0) text = `¿Cuánto es: ${a} - ${b}?`;
    } else if (actualTopic === 'multiplicacion') {
        // Multiplier shouldn't be too huge
        const multMax = Math.min(max, 12 + level);
        a = makeVal();
        b = randRange(2, multMax);
        if (allowNegatives && Math.random() > 0.5) b = -b;
        ans = a * b;
        text = `¿Cuánto es: ${a} × (${b < 0 ? b : '+' + b})?`;
        if (a >= 0 && b >= 0) text = `¿Cuánto es: ${a} × ${b}?`;
    } else { // division
        const divMax = Math.min(max, 12 + level);
        b = randRange(2, divMax);
        if (allowNegatives && Math.random() > 0.5) b = -b;
        ans = makeVal();
        a = ans * b;
        text = `¿Cuánto es: ${a} ÷ (${b < 0 ? b : '+' + b})?`;
        if (a >= 0 && b >= 0) text = `¿Cuánto es: ${a} ÷ ${b}?`;
    }

    return {
        text: text,
        correctAnswer: ans.toString(),
        inputType: 'number',
        topicLabel: actualTopic.toUpperCase()
    };
}

// Fracciones Generator
function generateFractionsQuestion(topic, level, options) {
    if (topic === 'identificar') {
        // numerator < denominator. Denominator scales with level
        const den = randRange(2, 4 + level);
        const num = randRange(1, den - 1);
        
        // Draw details: circle or rectangle slice representation
        const renderType = Math.random() > 0.5 ? 'circle' : 'rectangle';

        return {
            text: 'Identifica la fracción sombreada en la figura:',
            correctAnswer: `${num}/${den}`,
            inputType: 'fraction',
            drawFunc: (c) => drawFraction(c, renderType, num, den),
            topicLabel: 'Identificar Fracción',
            verify: (userVal) => {
                // Check if user value is equivalent to num/den
                const parts = userVal.split('/');
                if (parts.length !== 2) return false;
                const uNum = parseInt(parts[0]);
                const uDen = parseInt(parts[1]);
                if (isNaN(uNum) || isNaN(uDen) || uDen === 0) return false;
                
                return (uNum * den) === (num * uDen); // Cross multiplication equivalence
            }
        };
    }

    if (topic === 'comparar') {
        // Two fractions to compare: A/B vs C/D
        const b = randRange(2, 5 + level);
        const a = randRange(1, b);
        
        let d = randRange(2, 5 + level);
        let c = randRange(1, d);
        // Avoid equal fraction loops
        if (a * d === b * c) {
            c = (c + 1) % d || 1;
        }

        const val1 = a / b;
        const val2 = c / d;
        let ans = '=';
        if (val1 < val2) ans = '<';
        if (val1 > val2) ans = '>';

        return {
            text: `Compara las siguientes fracciones:`,
            fractionCompare: { a, b, c, d }, // to render beautifully in HTML
            correctAnswer: ans,
            inputType: 'multiple-choice',
            choices: ['<', '=', '>'],
            topicLabel: 'Comparar Fracciones'
        };
    }

    if (topic === 'simplificar') {
        // Create simplified fraction, then scale it up by multiplying numerator/denominator by factor
        const basicDen = randRange(2, 5 + Math.floor(level / 2));
        const basicNum = randRange(1, basicDen - 1);
        const [simpNum, simpDen] = simplifyFraction(basicNum, basicDen);

        // Scale factor
        const factor = randRange(2, 2 + Math.floor(level / 2));
        const finalNum = simpNum * factor;
        const finalDen = simpDen * factor;

        return {
            text: `Simplifica la fracción:`,
            fractionInput: { num: finalNum, den: finalDen },
            correctAnswer: `${simpNum}/${simpDen}`,
            inputType: 'fraction',
            topicLabel: 'Simplificar Fracción',
            verify: (userVal) => {
                const parts = userVal.split('/');
                if (parts.length !== 2) return false;
                const uNum = parseInt(parts[0]);
                const uDen = parseInt(parts[1]);
                
                if (options.simplifyFrac) {
                    // MUST be exactly the simplified ones
                    return uNum === simpNum && uDen === simpDen;
                } else {
                    // Just equivalent
                    return (uNum * finalDen) === (finalNum * uDen);
                }
            }
        };
    }

    if (topic === 'operaciones') {
        // Addition/Subtraction of fractions
        const isSum = Math.random() > 0.5;
        let b = randRange(2, 3 + level);
        let d = randRange(2, 3 + level);
        
        let a = randRange(1, b - 1);
        let c = randRange(1, d - 1);

        // Perform computation
        let finalNum, finalDen;
        if (isSum) {
            finalNum = a * d + c * b;
            finalDen = b * d;
        } else {
            // Keep subtraction positive
            if (a * d < c * b) {
                const tmpA = a; const tmpB = b;
                a = c; b = d;
                c = tmpA; d = tmpB;
            }
            finalNum = a * d - c * b;
            finalDen = b * d;
        }

        const [simpNum, simpDen] = simplifyFraction(finalNum, finalDen);

        return {
            text: `Calcula el resultado de la siguiente operación:`,
            fractionOp: { a, b, c, d, op: isSum ? '+' : '-' },
            correctAnswer: options.simplifyFrac ? `${simpNum}/${simpDen}` : `${finalNum}/${finalDen}`,
            inputType: 'fraction',
            topicLabel: 'Operaciones de Fracciones',
            verify: (userVal) => {
                const parts = userVal.split('/');
                if (parts.length !== 2) return false;
                const uNum = parseInt(parts[0]);
                const uDen = parseInt(parts[1]);
                
                if (options.simplifyFrac) {
                    return uNum === simpNum && uDen === simpDen;
                } else {
                    return (uNum * finalDen) === (finalNum * uDen);
                }
            }
        };
    }
}

// Geometría Generator
function generateGeometryQuestion(topic, level, options) {
    const shape = ['rectangulo', 'triangulo', 'circulo'][randRange(0, 2)];
    
    if (topic === 'area') {
        if (shape === 'rectangulo') {
            const w = randRange(3, 10 + level);
            const h = randRange(2, 8 + level);
            const ans = w * h;
            return {
                text: `Calcula el área del rectángulo:`,
                correctAnswer: ans.toString(),
                inputType: 'number',
                drawFunc: (c) => drawGeometryShape(c, 'rectangulo', { w, h }),
                topicLabel: 'Área del Rectángulo'
            };
        } else if (shape === 'triangulo') {
            // base and height. Make it even numbers if base/height to avoid decimals in early levels
            const b = randRange(2, 10 + level) * 2;
            const h = randRange(2, 8 + level);
            const ans = (b * h) / 2;
            return {
                text: `Calcula el área del triángulo:`,
                correctAnswer: ans.toString(),
                inputType: 'number',
                drawFunc: (c) => drawGeometryShape(c, 'triangulo', { b, h }),
                topicLabel: 'Área del Triángulo'
            };
        } else { // circulo
            const r = randRange(2, 5 + Math.floor(level / 2));
            // Ask for answer using PI = 3.14
            const ans = parseFloat((3.14 * r * r).toFixed(2));
            return {
                text: `Calcula el área del círculo (usa π = 3.14):`,
                correctAnswer: ans.toString(),
                inputType: 'number',
                drawFunc: (c) => drawGeometryShape(c, 'circulo', { r }),
                topicLabel: 'Área del Círculo'
            };
        }
    }

    if (topic === 'perimetro') {
        if (shape === 'rectangulo') {
            const w = randRange(3, 10 + level);
            const h = randRange(2, 8 + level);
            const ans = 2 * (w + h);
            return {
                text: `Calcula el perímetro del rectángulo:`,
                correctAnswer: ans.toString(),
                inputType: 'number',
                drawFunc: (c) => drawGeometryShape(c, 'rectangulo', { w, h }),
                topicLabel: 'Perímetro del Rectángulo'
            };
        } else if (shape === 'triangulo') {
            const sideA = randRange(3, 8 + level);
            const sideB = randRange(3, 8 + level);
            const base = randRange(3, 8 + level);
            const ans = sideA + sideB + base;
            return {
                text: `Calcula el perímetro del triángulo:`,
                correctAnswer: ans.toString(),
                inputType: 'number',
                drawFunc: (c) => drawGeometryShape(c, 'triangulo', { sideA, sideB, base, labelSides: true }),
                topicLabel: 'Perímetro del Triángulo'
            };
        } else { // circulo
            const r = randRange(2, 8 + level);
            const ans = parseFloat((2 * 3.14 * r).toFixed(2));
            return {
                text: `Calcula la longitud de la circunferencia (perímetro) (usa π = 3.14):`,
                correctAnswer: ans.toString(),
                inputType: 'number',
                drawFunc: (c) => drawGeometryShape(c, 'circulo', { r }),
                topicLabel: 'Perímetro del Círculo'
            };
        }
    }

    if (topic === 'angulos') {
        // angle calculations (complementary 90 deg, supplementary 180 deg)
        const type = Math.random() > 0.5 ? 'complementario' : 'suplementario';
        const targetTotal = type === 'complementario' ? 90 : 180;
        
        const knownAngle = randRange(15, targetTotal - 15);
        const ans = targetTotal - knownAngle;

        return {
            text: `Encuentra el valor del ángulo faltante 'x':`,
            correctAnswer: ans.toString(),
            inputType: 'number',
            drawFunc: (c) => drawAngleQuestion(c, type, knownAngle),
            topicLabel: `Ángulo ${type.toUpperCase()}`
        };
    }
}

// Conceptos Generator
function generateConceptsQuestion(topic, level, options) {
    if (topic === 'reloj') {
        // Read analog clock face
        // Level limits minutes accuracy: level 1 is only hours, level 2 halves, level 3 is multiples of 5, etc.
        let m = 0;
        if (level === 1) {
            m = [0, 30][randRange(0, 1)];
        } else if (level === 2) {
            m = [0, 15, 30, 45][randRange(0, 3)];
        } else if (level <= 5) {
            m = randRange(0, 11) * 5;
        } else {
            m = randRange(0, 59);
        }
        
        const h = randRange(1, 12);
        
        const hStr = h.toString().padStart(2, '0');
        const mStr = m.toString().padStart(2, '0');

        return {
            text: `¿Qué hora indica el reloj analógico?`,
            correctAnswer: `${hStr}:${mStr}`,
            inputType: 'time',
            drawFunc: (c) => drawClock(c, h, m),
            topicLabel: 'Lectura de Reloj'
        };
    }

    if (topic === 'romanos') {
        // Roman conversions
        let maxVal = 20;
        if (level === 2) maxVal = 50;
        else if (level === 3) maxVal = 100;
        else if (level === 4) maxVal = 200;
        else if (level === 5) maxVal = 500;
        else if (level >= 6) maxVal = 1000 + level * 100;

        const val = randRange(1, maxVal);
        const roman = toRoman(val);
        const dir = Math.random() > 0.5 ? 'toRoman' : 'toArabic';

        if (dir === 'toRoman') {
            return {
                text: `Convierte el número ${val} a números romanos:`,
                correctAnswer: roman,
                inputType: 'roman-text',
                topicLabel: 'Arábigo a Romano'
            };
        } else {
            return {
                text: `Convierte el número romano ${roman} a números arábigos:`,
                correctAnswer: val.toString(),
                inputType: 'number',
                topicLabel: 'Romano a Arábigo'
            };
        }
    }

    if (topic === 'unidades') {
        // Unit conversions
        const types = ['longitud', 'masa', 'capacidad'];
        const selectedType = types[randRange(0, 2)];
        
        let unitFrom, unitTo, factor, valueFrom, valueTo;
        
        if (selectedType === 'longitud') {
            const units = [
                { name: 'mm', mult: 0.001 },
                { name: 'cm', mult: 0.01 },
                { name: 'm', mult: 1 },
                { name: 'km', mult: 1000 }
            ];
            const u1 = units[randRange(0, 3)];
            let u2 = units[randRange(0, 3)];
            while (u1.name === u2.name) {
                u2 = units[randRange(0, 3)];
            }
            unitFrom = u1.name;
            unitTo = u2.name;
            factor = u1.mult / u2.mult;
        } else if (selectedType === 'masa') {
            const units = [
                { name: 'mg', mult: 0.001 },
                { name: 'g', mult: 1 },
                { name: 'kg', mult: 1000 }
            ];
            const u1 = units[randRange(0, 2)];
            let u2 = units[randRange(0, 2)];
            while (u1.name === u2.name) {
                u2 = units[randRange(0, 2)];
            }
            unitFrom = u1.name;
            unitTo = u2.name;
            factor = u1.mult / u2.mult;
        } else { // capacidad
            const units = [
                { name: 'ml', mult: 0.001 },
                { name: 'L', mult: 1 }
            ];
            unitFrom = Math.random() > 0.5 ? 'ml' : 'L';
            unitTo = unitFrom === 'ml' ? 'L' : 'ml';
            factor = unitFrom === 'ml' ? 0.001 : 1000;
        }

        // generate nice values based on level
        const baseVals = [1, 2, 5, 10, 20, 50, 100, 250, 500, 1000];
        const valBase = baseVals[randRange(0, Math.min(level, baseVals.length - 1))];
        valueFrom = valBase;
        
        // Compute correct conversions
        valueTo = parseFloat((valueFrom * factor).toFixed(4));

        return {
            text: `Convierte la siguiente medida de unidades:\n${valueFrom} ${unitFrom} = ? ${unitTo}`,
            correctAnswer: valueTo.toString(),
            inputType: 'number',
            topicLabel: 'Conversión de Unidades'
        };
    }
}

// Roman numbers converter helper
function toRoman(num) {
    const romanMap = [
        { M: 1000 }, { CM: 900 }, { D: 500 }, { CD: 400 },
        { C: 100 }, { XC: 90 }, { L: 50 }, { XL: 40 },
        { X: 10 }, { IX: 9 }, { V: 5 }, { IV: 4 }, { I: 1 }
    ];
    let result = '';
    let val = num;
    romanMap.forEach(item => {
        const key = Object.keys(item)[0];
        const decimal = item[key];
        while (val >= decimal) {
            result += key;
            val -= decimal;
        }
    });
    return result;
}

// ==========================================================================
// RENDERERS & LAYOUTS (QUIZ INTERACTION)
// ==========================================================================
function renderQuestion(index) {
    const q = state.quiz.questions[index];
    if (!q) return;

    // Reset view
    DOM.visualContainer.style.display = 'none';
    if (q.criterion) {
        const header = q.criterionHeader || "Criterio aplicado:";
        DOM.quizQuestionText.innerHTML = `
            <div class="question-container-split">
                <div class="question-main-text">${q.text.replace(/\n/g, '<br>')}</div>
                <div class="question-criterion-box">
                    <strong>${header}</strong><br>${q.criterion.replace(/\n/g, '<br>')}
                </div>
            </div>
        `;
    } else {
        DOM.quizQuestionText.innerHTML = q.text.replace(/\n/g, '<br>');
    }
    DOM.quizAnswersArea.innerHTML = '';

    // Draw function visualizer
    if (q.drawFunc) {
        DOM.visualContainer.style.display = 'flex';
        // Clear canvas and Sharp canvas drawing on high DPI & fully responsive scaling
        const dpr = window.devicePixelRatio || 1;
        const rect = DOM.quizCanvas.getBoundingClientRect();
        const w = rect.width || 400;
        const h = rect.height || 300;
        DOM.quizCanvas.width = w * dpr;
        DOM.quizCanvas.height = h * dpr;
        
        // Scale to handle high DPI and map 400x300 virtual canvas coordinates
        const scaleFactor = (w * dpr) / 400;
        ctx.scale(scaleFactor, scaleFactor);
        
        q.drawFunc(ctx);
    }

    // Set custom layouts based on inputTypes
    if (q.inputType === 'number' || q.inputType === 'roman-text') {
        renderNumberInputLayout(q.inputType);
    } else if (q.inputType === 'fraction') {
        renderFractionInputLayout(q);
    } else if (q.inputType === 'time') {
        renderTimeInputLayout();
    } else if (q.inputType === 'multiple-choice') {
        renderMultipleChoiceLayout(q);
    }

    // Render mathematical LaTeX symbols if any
    renderMath(DOM.quizQuestionText);
    renderMath(DOM.quizAnswersArea);
}

function renderNumberInputLayout(type) {
    const layout = document.createElement('div');
    layout.className = 'input-keypad-layout';

    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'quiz-input';
    input.id = 'txt-answer';
    input.placeholder = type === 'roman-text' ? 'Escribe en romano (ej. XIV)' : 'Ingresa tu respuesta';
    input.autocomplete = 'off';
    
    // Auto-focus input
    setTimeout(() => input.focus(), 150);

    // Enter key submit
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            submitUserAnswer();
        }
    });

    layout.appendChild(input);

    // On-screen Virtual Keypad
    const keypad = document.createElement('div');
    keypad.className = 'virtual-keypad';
    
    const keys = type === 'roman-text' 
        ? ['I', 'V', 'X', 'L', 'C', 'D', 'M', '⌫', '✓'] 
        : ['1', '2', '3', '4', '5', '6', '7', '8', '9', '-', '0', '.', '⌫', '✓'];

    keys.forEach(k => {
        const btn = document.createElement('button');
        btn.className = 'keypad-btn';
        btn.innerText = k;
        
        if (k === '⌫') {
            btn.innerHTML = '<i class="fa-solid fa-backspace"></i>';
            btn.addEventListener('click', () => {
                input.value = input.value.slice(0, -1);
                input.focus();
            });
        } else if (k === '✓') {
            btn.innerHTML = '<i class="fa-solid fa-check"></i>';
            btn.addEventListener('click', submitUserAnswer);
        } else {
            btn.addEventListener('click', () => {
                input.value += k;
                input.focus();
            });
        }
        keypad.appendChild(btn);
    });

    layout.appendChild(keypad);
    DOM.quizAnswersArea.appendChild(layout);
}

function renderFractionInputLayout(q) {
    const wrapper = document.createElement('div');
    wrapper.className = 'input-keypad-layout';

    // Show visual layout of fraction if question displays one in prompt
    if (q.fractionInput) {
        const topFrac = document.createElement('div');
        topFrac.style.fontSize = '36px';
        topFrac.style.marginBottom = '20px';
        topFrac.innerHTML = `
            <div style="display:inline-flex; flex-direction:column; align-items:center; vertical-align:middle;">
                <span>${q.fractionInput.num}</span>
                <span style="border-top:2px solid var(--text-main); width:100%; height:0; display:block;"></span>
                <span>${q.fractionInput.den}</span>
            </div>
        `;
        wrapper.appendChild(topFrac);
    } else if (q.fractionOp) {
        const topFrac = document.createElement('div');
        topFrac.style.fontSize = '36px';
        topFrac.style.marginBottom = '20px';
        topFrac.style.display = 'flex';
        topFrac.style.alignItems = 'center';
        topFrac.style.justifyContent = 'center';
        topFrac.style.gap = '16px';
        topFrac.innerHTML = `
            <div style="display:inline-flex; flex-direction:column; align-items:center;">
                <span>${q.fractionOp.a}</span>
                <span style="border-top:2px solid var(--text-main); width:100%;"></span>
                <span>${q.fractionOp.b}</span>
            </div>
            <span>${q.fractionOp.op}</span>
            <div style="display:inline-flex; flex-direction:column; align-items:center;">
                <span>${q.fractionOp.c}</span>
                <span style="border-top:2px solid var(--text-main); width:100%;"></span>
                <span>${q.fractionOp.d}</span>
            </div>
        `;
        wrapper.appendChild(topFrac);
    }

    // Input layout for user answer (fraction format)
    const inputsRow = document.createElement('div');
    inputsRow.style.display = 'flex';
    inputsRow.style.alignItems = 'center';
    inputsRow.style.gap = '12px';
    inputsRow.style.fontSize = '32px';

    const numInput = document.createElement('input');
    numInput.type = 'text';
    numInput.id = 'txt-frac-num';
    numInput.className = 'quiz-input';
    numInput.style.width = '100px';
    numInput.style.padding = '8px';
    numInput.placeholder = 'N';
    numInput.autocomplete = 'off';

    const denInput = document.createElement('input');
    denInput.type = 'text';
    denInput.id = 'txt-frac-den';
    denInput.className = 'quiz-input';
    denInput.style.width = '100px';
    denInput.style.padding = '8px';
    denInput.placeholder = 'D';
    denInput.autocomplete = 'off';

    numInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') denInput.focus();
    });
    denInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') submitUserAnswer();
    });

    const divider = document.createElement('div');
    divider.style.display = 'flex';
    divider.style.flexDirection = 'column';
    divider.style.alignItems = 'center';
    divider.innerHTML = `
        <span style="border-top: 3px solid var(--text-main); width: 40px;"></span>
    `;

    inputsRow.appendChild(numInput);
    inputsRow.appendChild(divider);
    inputsRow.appendChild(denInput);

    wrapper.appendChild(inputsRow);

    // Custom fraction virtual keypad
    const keypad = document.createElement('div');
    keypad.className = 'virtual-keypad';
    keypad.style.marginTop = '16px';
    
    // Virtual digits
    let activeInput = numInput;
    numInput.addEventListener('focus', () => activeInput = numInput);
    denInput.addEventListener('focus', () => activeInput = denInput);

    // Auto-focus first input
    setTimeout(() => numInput.focus(), 150);

    const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'Tab', '0', '⌫'];
    keys.forEach(k => {
        const btn = document.createElement('button');
        btn.className = 'keypad-btn';
        btn.innerText = k;

        if (k === '⌫') {
            btn.innerHTML = '<i class="fa-solid fa-backspace"></i>';
            btn.addEventListener('click', () => {
                activeInput.value = activeInput.value.slice(0, -1);
                activeInput.focus();
            });
        } else if (k === 'Tab') {
            btn.innerHTML = '<i class="fa-solid fa-right-left"></i>';
            btn.addEventListener('click', () => {
                if (activeInput === numInput) {
                    denInput.focus();
                } else {
                    numInput.focus();
                }
            });
        } else {
            btn.addEventListener('click', () => {
                activeInput.value += k;
                activeInput.focus();
            });
        }
        keypad.appendChild(btn);
    });

    wrapper.appendChild(keypad);
    DOM.quizAnswersArea.appendChild(wrapper);
}

function renderTimeInputLayout() {
    const wrapper = document.createElement('div');
    wrapper.className = 'input-keypad-layout';

    const row = document.createElement('div');
    row.style.display = 'flex';
    row.style.alignItems = 'center';
    row.style.gap = '8px';
    row.style.fontSize = '28px';
    row.style.fontWeight = '800';

    const hInput = document.createElement('input');
    hInput.type = 'text';
    hInput.id = 'txt-time-h';
    hInput.className = 'quiz-input';
    hInput.style.width = '80px';
    hInput.style.padding = '8px';
    hInput.placeholder = 'HH';
    hInput.maxLength = 2;
    hInput.autocomplete = 'off';

    const mInput = document.createElement('input');
    mInput.type = 'text';
    mInput.id = 'txt-time-m';
    mInput.className = 'quiz-input';
    mInput.style.width = '80px';
    mInput.style.padding = '8px';
    mInput.placeholder = 'MM';
    mInput.maxLength = 2;
    mInput.autocomplete = 'off';

    hInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') mInput.focus();
    });
    mInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') submitUserAnswer();
    });

    // Auto-focus hour
    setTimeout(() => hInput.focus(), 150);

    row.appendChild(hInput);
    row.appendChild(document.createTextNode(':'));
    row.appendChild(mInput);

    wrapper.appendChild(row);

    // Timer Keypad
    let activeInput = hInput;
    hInput.addEventListener('focus', () => activeInput = hInput);
    mInput.addEventListener('focus', () => activeInput = mInput);

    const keypad = document.createElement('div');
    keypad.className = 'virtual-keypad';
    keypad.style.marginTop = '16px';

    const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'Tab', '0', '⌫'];
    keys.forEach(k => {
        const btn = document.createElement('button');
        btn.className = 'keypad-btn';
        btn.innerText = k;

        if (k === '⌫') {
            btn.innerHTML = '<i class="fa-solid fa-backspace"></i>';
            btn.addEventListener('click', () => {
                activeInput.value = activeInput.value.slice(0, -1);
                activeInput.focus();
            });
        } else if (k === 'Tab') {
            btn.innerHTML = '<i class="fa-solid fa-right-left"></i>';
            btn.addEventListener('click', () => {
                if (activeInput === hInput) {
                    mInput.focus();
                } else {
                    hInput.focus();
                }
            });
        } else {
            btn.addEventListener('click', () => {
                activeInput.value += k;
                activeInput.focus();
            });
        }
        keypad.appendChild(btn);
    });

    wrapper.appendChild(keypad);
    DOM.quizAnswersArea.appendChild(wrapper);
}

function renderMultipleChoiceLayout(q) {
    const container = document.createElement('div');
    container.className = 'choices-layout';

    // Fraction rendering if present in compare
    if (q.fractionCompare) {
        const display = document.createElement('div');
        display.style.fontSize = '36px';
        display.style.display = 'flex';
        display.style.alignItems = 'center';
        display.style.justifyContent = 'center';
        display.style.gap = '40px';
        display.style.marginBottom = '24px';
        display.innerHTML = `
            <div style="display:inline-flex; flex-direction:column; align-items:center;">
                <span>${q.fractionCompare.a}</span>
                <span style="border-top:2px solid var(--text-main); width:100%;"></span>
                <span>${q.fractionCompare.b}</span>
            </div>
            <div style="border:1px dashed var(--border-color); width:60px; height:60px; border-radius:10px; display:flex; align-items:center; justify-content:center; font-weight:800; color:var(--primary);" id="cmp-slot">?</div>
            <div style="display:inline-flex; flex-direction:column; align-items:center;">
                <span>${q.fractionCompare.c}</span>
                <span style="border-top:2px solid var(--text-main); width:100%;"></span>
                <span>${q.fractionCompare.d}</span>
            </div>
        `;
        DOM.quizAnswersArea.appendChild(display);
    }

    // Choice buttons
    q.choices.forEach((choice, idx) => {
        const btn = document.createElement('button');
        btn.className = 'btn-choice';
        btn.innerHTML = `
            <span>${choice}</span>
            <span class="choice-shortcut">${idx + 1}</span>
        `;
        
        btn.addEventListener('click', () => {
            document.querySelectorAll('.btn-choice').forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            
            // If compare, show choice inside placeholder slot
            const slot = document.getElementById('cmp-slot');
            if (slot) slot.innerText = choice;
            
            // Autocomplete multiple choice on selection
            setTimeout(() => submitAnswer(choice), 200);
        });

        container.appendChild(btn);
    });

    DOM.quizAnswersArea.appendChild(container);

    // Keyboard support for multiple choice: keys 1, 2, 3...
    const choiceKeyHandler = (e) => {
        const num = parseInt(e.key);
        if (!isNaN(num) && num >= 1 && num <= q.choices.length) {
            const chosen = q.choices[num - 1];
            const btns = container.querySelectorAll('.btn-choice');
            if (btns[num - 1]) {
                btns[num - 1].classList.add('selected');
                const slot = document.getElementById('cmp-slot');
                if (slot) slot.innerText = chosen;
                document.removeEventListener('keydown', choiceKeyHandler);
                setTimeout(() => submitAnswer(chosen), 200);
            }
        }
    };
    document.addEventListener('keydown', choiceKeyHandler);
}

// ==========================================================================
// QUIZ CANVAS VISUAL ENGINE
// ==========================================================================

// 1. Fractions drawer (Circle and Rectangle)
function drawFraction(c, type, num, den) {
    const width = 400;
    const height = 300;
    
    // Style setups
    c.strokeStyle = state.theme === 'dark' ? '#334155' : '#cbd5e1';
    c.lineWidth = 3;
    c.fillStyle = '#818cf8'; // Primary theme shade (Indigo)

    if (type === 'circle') {
        const cx = width / 2;
        const cy = height / 2;
        const radius = 90;

        // Draw shaded slices
        for (let i = 0; i < den; i++) {
            const startAngle = (i * 2 * Math.PI) / den - Math.PI / 2;
            const endAngle = ((i + 1) * 2 * Math.PI) / den - Math.PI / 2;

            if (i < num) {
                c.fillStyle = 'rgba(99, 102, 241, 0.4)';
                c.beginPath();
                c.moveTo(cx, cy);
                c.arc(cx, cy, radius, startAngle, endAngle);
                c.closePath();
                c.fill();
            }
        }

        // Draw outline borders and slice connectors
        for (let i = 0; i < den; i++) {
            const angle = (i * 2 * Math.PI) / den - Math.PI / 2;
            c.beginPath();
            c.moveTo(cx, cy);
            c.lineTo(cx + radius * Math.cos(angle), cy + radius * Math.sin(angle));
            c.stroke();
        }

        // Final outer circle outline
        c.beginPath();
        c.arc(cx, cy, radius, 0, 2 * Math.PI);
        c.stroke();

    } else {
        // Rectangle Bar
        const rx = 60;
        const ry = 80;
        const rw = 280;
        const rh = 140;

        const sliceW = rw / den;

        // Draw fills
        for (let i = 0; i < num; i++) {
            c.fillStyle = 'rgba(16, 185, 129, 0.35)'; // Emerald tint
            c.fillRect(rx + i * sliceW, ry, sliceW, rh);
        }

        // Draw slice lines
        for (let i = 1; i < den; i++) {
            c.beginPath();
            c.moveTo(rx + i * sliceW, ry);
            c.lineTo(rx + i * sliceW, ry + rh);
            c.stroke();
        }

        // Draw main surrounding border
        c.beginPath();
        c.rect(rx, ry, rw, rh);
        c.stroke();
    }
}

// 2. Geometry Shape visualizers
function drawGeometryShape(c, type, data) {
    const width = 400;
    const height = 300;

    c.strokeStyle = state.theme === 'dark' ? '#a78bfa' : '#8b5cf6'; // Violet theme border
    c.lineWidth = 3;
    c.fillStyle = 'rgba(139, 92, 246, 0.1)';
    c.font = "bold 15px 'Plus Jakarta Sans'";
    c.textAlign = 'center';
    
    // Labels text color
    const textFill = state.theme === 'dark' ? '#f3f4f6' : '#1e293b';
    c.fillStyle = textFill;

    if (type === 'rectangulo') {
        const rw = 200;
        const rh = 110;
        const rx = (width - rw) / 2;
        const ry = (height - rh) / 2;

        c.beginPath();
        c.rect(rx, ry, rw, rh);
        c.fillStyle = 'rgba(139, 92, 246, 0.1)';
        c.fill();
        c.stroke();

        c.fillStyle = textFill;
        c.fillText(`${data.w} cm`, width / 2, ry - 10);
        c.textAlign = 'right';
        c.fillText(`${data.h} cm`, rx - 10, ry + rh / 2 + 5);

    } else if (type === 'triangulo') {
        const x1 = 100, y1 = 210;
        const x2 = 300, y2 = 210;
        const x3 = 200, y3 = 90;

        c.beginPath();
        c.moveTo(x1, y1);
        c.lineTo(x2, y2);
        c.lineTo(x3, y3);
        c.closePath();
        c.fillStyle = 'rgba(139, 92, 246, 0.1)';
        c.fill();
        c.stroke();

        // Draw dotted height helper line if doing area
        if (data.h) {
            c.strokeStyle = '#f59e0b';
            c.lineWidth = 2;
            c.setLineDash([4, 4]);
            c.beginPath();
            c.moveTo(x3, y3);
            c.lineTo(x3, y1);
            c.stroke();
            c.setLineDash([]); // reset

            c.fillStyle = '#f59e0b';
            c.textAlign = 'left';
            c.fillText(`h = ${data.h} m`, x3 + 8, (y1 + y3) / 2);
            c.fillStyle = textFill;
            c.textAlign = 'center';
            c.fillText(`base = ${data.b} m`, width / 2, y1 + 25);
        } else {
            // perimeter sides label
            c.fillStyle = textFill;
            c.fillText(`${data.base} m`, width / 2, y1 + 25);
            c.textAlign = 'right';
            c.fillText(`${data.sideA} m`, 140, 150);
            c.textAlign = 'left';
            c.fillText(`${data.sideB} m`, 260, 150);
        }

    } else if (type === 'circulo') {
        const cx = width / 2;
        const cy = height / 2;
        const r = 80;

        c.beginPath();
        c.arc(cx, cy, r, 0, 2 * Math.PI);
        c.fillStyle = 'rgba(139, 92, 246, 0.1)';
        c.fill();
        c.stroke();

        // radius indicator line
        c.strokeStyle = '#e11d48';
        c.beginPath();
        c.moveTo(cx, cy);
        c.lineTo(cx + r * Math.cos(Math.PI / 4), cy - r * Math.sin(Math.PI / 4));
        c.stroke();

        c.fillStyle = textFill;
        c.textAlign = 'left';
        c.fillText(`r = ${data.r} cm`, cx + 15, cy - 25);
        
        c.beginPath();
        c.arc(cx, cy, 4, 0, 2 * Math.PI);
        c.fillStyle = state.theme === 'dark' ? '#ffffff' : '#000000';
        c.fill();
    }
}

// 3. Angle Calculations Drawer
function drawAngleQuestion(c, type, angleVal) {
    const cx = 200;
    const cy = 200;
    const len = 110;
    const radAngle = (angleVal * Math.PI) / 180;
    const textFill = state.theme === 'dark' ? '#f3f4f6' : '#1e293b';

    c.strokeStyle = state.theme === 'dark' ? '#cbd5e1' : '#334155';
    c.lineWidth = 3;

    // Draw baseline
    c.beginPath();
    c.moveTo(cx - len, cy);
    c.lineTo(cx + len, cy);
    c.stroke();

    if (type === 'complementario') {
        // Draw vertical 90 degree line
        c.strokeStyle = state.theme === 'dark' ? '#475569' : '#cbd5e1';
        c.setLineDash([3, 3]);
        c.beginPath();
        c.moveTo(cx, cy);
        c.lineTo(cx, cy - len);
        c.stroke();
        c.setLineDash([]);
        
        // Draw 90 deg corner square indicator
        c.strokeStyle = state.theme === 'dark' ? '#94a3b8' : '#64748b';
        c.beginPath();
        c.rect(cx, cy - 12, 12, 12);
        c.stroke();

        // Draw custom ray
        c.strokeStyle = '#8b5cf6';
        c.beginPath();
        c.moveTo(cx, cy);
        c.lineTo(cx + len * Math.cos(Math.PI/2 - radAngle), cy - len * Math.sin(Math.PI/2 - radAngle));
        c.stroke();

        // Draw angles arc info
        c.strokeStyle = '#e2e8f0';
        c.lineWidth = 1.5;
        // Known angle arc
        c.beginPath();
        c.arc(cx, cy, 30, -Math.PI/2, -(Math.PI/2 - radAngle));
        c.stroke();
        // Unknown 'x' arc
        c.beginPath();
        c.arc(cx, cy, 45, -(Math.PI/2 - radAngle), 0);
        c.stroke();

        c.fillStyle = textFill;
        c.font = "bold 14px 'Plus Jakarta Sans'";
        c.fillText(`${angleVal}°`, cx + 22, cy - 40);
        c.fillText(`x`, cx + 55, cy - 12);

    } else {
        // Supplementary angle (straight line = 180 deg)
        c.strokeStyle = '#3b82f6';
        c.beginPath();
        c.moveTo(cx, cy);
        c.lineTo(cx + len * Math.cos(Math.PI - radAngle), cy - len * Math.sin(Math.PI - radAngle));
        c.stroke();

        // Draw known angle arc
        c.strokeStyle = state.theme === 'dark' ? '#94a3b8' : '#64748b';
        c.lineWidth = 2;
        c.beginPath();
        c.arc(cx, cy, 35, Math.PI - radAngle, Math.PI);
        c.stroke();

        // Draw x angle arc
        c.beginPath();
        c.arc(cx, cy, 50, 0, Math.PI - radAngle);
        c.stroke();

        c.fillStyle = textFill;
        c.font = "bold 14px 'Plus Jakarta Sans'";
        // Draw labels
        c.textAlign = 'right';
        c.fillText(`${angleVal}°`, cx - 45, cy - 15);
        c.textAlign = 'left';
        c.fillText(`x`, cx + 55, cy - 15);
    }
}

// 4. Analog clock visualizer
function drawClock(c, h, m) {
    const cx = 200;
    const cy = 150;
    const radius = 95;
    const textFill = state.theme === 'dark' ? '#f3f4f6' : '#1e293b';

    // Outer clock face boundary
    c.strokeStyle = state.theme === 'dark' ? '#cbd5e1' : '#334155';
    c.lineWidth = 4;
    c.beginPath();
    c.arc(cx, cy, radius, 0, 2 * Math.PI);
    c.stroke();

    // Subtle face fill
    c.fillStyle = state.theme === 'dark' ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.01)';
    c.fill();

    // Hours labels 12, 3, 6, 9
    c.fillStyle = textFill;
    c.font = "bold 16px 'Plus Jakarta Sans'";
    c.textAlign = 'center';
    c.textBaseline = 'middle';
    
    c.fillText('12', cx, cy - radius + 18);
    c.fillText('6', cx, cy + radius - 18);
    c.textAlign = 'left';
    c.fillText('3', cx + radius - 18, cy);
    c.textAlign = 'right';
    c.fillText('9', cx - radius + 18, cy);

    // Minor minute/hour ticks
    c.strokeStyle = state.theme === 'dark' ? '#64748b' : '#94a3b8';
    c.lineWidth = 2;
    for (let i = 0; i < 12; i++) {
        if (i % 3 === 0) continue; // skip 12,3,6,9
        const angle = (i * 30 * Math.PI) / 180;
        c.beginPath();
        c.moveTo(cx + (radius - 8) * Math.cos(angle), cy + (radius - 8) * Math.sin(angle));
        c.lineTo(cx + radius * Math.cos(angle), cy + radius * Math.sin(angle));
        c.stroke();
    }

    // Calculations of angles for hands
    // hour hand takes minute fraction offset
    const minuteAngle = (m * 6 * Math.PI) / 180 - Math.PI / 2;
    const hourAngle = ((h % 12) * 30 + m * 0.5) * Math.PI / 180 - Math.PI / 2;

    // Hour Hand (Shorter, Thicker)
    c.strokeStyle = '#f59e0b'; // Gold
    c.lineWidth = 6;
    c.lineCap = 'round';
    c.beginPath();
    c.moveTo(cx, cy);
    c.lineTo(cx + (radius - 40) * Math.cos(hourAngle), cy + (radius - 40) * Math.sin(hourAngle));
    c.stroke();

    // Minute Hand (Longer, Thicker)
    c.strokeStyle = '#3b82f6'; // Indigo Blue
    c.lineWidth = 4;
    c.beginPath();
    c.moveTo(cx, cy);
    c.lineTo(cx + (radius - 20) * Math.cos(minuteAngle), cy + (radius - 20) * Math.sin(minuteAngle));
    c.stroke();

    // Clock Center Pin
    c.beginPath();
    c.arc(cx, cy, 6, 0, 2 * Math.PI);
    c.fillStyle = state.theme === 'dark' ? '#ffffff' : '#000000';
    c.fill();
}

// ==========================================================================
// USER ANSWER SUBMISSION & FEEDBACK SYSTEM
// ==========================================================================
function setupQuizEvents() {
    DOM.btnSubmit.addEventListener('click', submitUserAnswer);
    DOM.btnSkip.addEventListener('click', skipQuestion);
    DOM.btnQuitQuiz.addEventListener('click', openQuitModal);
    
    // Quit confirmation handlers
    DOM.btnQuitCancel.addEventListener('click', closeQuitModal);
    DOM.btnQuitConfirm.addEventListener('click', quitQuiz);
}

function submitUserAnswer() {
    const q = state.quiz.questions[state.quiz.currentIndex];
    let userVal = '';

    if (q.inputType === 'number' || q.inputType === 'roman-text') {
        const input = document.getElementById('txt-answer');
        userVal = input ? input.value.trim() : '';
    } else if (q.inputType === 'fraction') {
        const num = document.getElementById('txt-frac-num').value.trim();
        const den = document.getElementById('txt-frac-den').value.trim();
        userVal = num !== '' && den !== '' ? `${num}/${den}` : '';
    } else if (q.inputType === 'time') {
        const h = document.getElementById('txt-time-h').value.trim();
        const m = document.getElementById('txt-time-m').value.trim();
        const hPad = h.padStart(2, '0');
        const mPad = m.padStart(2, '0');
        userVal = h !== '' && m !== '' ? `${hPad}:${mPad}` : '';
    }

    if (userVal === '') return; // block empty submissions
    submitAnswer(userVal);
}

function submitAnswer(userAnswer) {
    const q = state.quiz.questions[state.quiz.currentIndex];
    
    // Verify answer correctness
    let isCorrect = false;
    if (q.verify) {
        isCorrect = q.verify(userAnswer);
    } else {
        // Standard comparison (case-insensitive for Roman strings)
        isCorrect = userAnswer.toLowerCase() === q.correctAnswer.toLowerCase();
    }

    // Update counters
    if (isCorrect) {
        state.quiz.correctCount++;
    } else {
        state.quiz.wrongCount++;
    }

    // Save to history
    state.quiz.answersHistory.push({
        question: q.text,
        questionObject: q,
        correctAnswer: q.correctAnswer,
        userAnswer: userAnswer,
        isCorrect: isCorrect,
        topicLabel: q.topicLabel
    });

    // Check mode: practice vs exam
    if (state.config.mode === 'practice') {
        showInstantFeedback(isCorrect, q.correctAnswer, () => {
            advanceQuiz();
        });
    } else {
        advanceQuiz();
    }
}

function skipQuestion() {
    const q = state.quiz.questions[state.quiz.currentIndex];
    
    state.quiz.skippedCount++;
    state.quiz.answersHistory.push({
        question: q.text,
        questionObject: q,
        correctAnswer: q.correctAnswer,
        userAnswer: 'Saltada ➔',
        isCorrect: false,
        topicLabel: q.topicLabel
    });

    advanceQuiz();
}

function advanceQuiz() {
    state.quiz.currentIndex++;
    if (state.quiz.currentIndex >= state.quiz.questions.length) {
        finishQuiz();
    } else {
        updateQuizHeader();
        renderQuestion(state.quiz.currentIndex);
    }
}

function showInstantFeedback(isCorrect, correctVal, callback) {
    const overlay = document.createElement('div');
    overlay.className = `feedback-flash ${isCorrect ? 'correct' : 'wrong'}`;
    
    const icon = isCorrect ? 'fa-circle-check' : 'fa-circle-xmark';
    const title = isCorrect ? '¡Excelente!' : 'Incorrecto';
    const text = isCorrect 
        ? 'Respuesta correcta.' 
        : `La respuesta correcta era: <strong>${correctVal}</strong>`;

    overlay.innerHTML = `
        <i class="fa-solid ${icon} feedback-icon"></i>
        <div class="feedback-title">${title}</div>
        <div class="feedback-text">${text}</div>
        <button class="btn-primary" id="btn-feedback-next">Siguiente</button>
    `;

    DOM.secQuiz.querySelector('.quiz-body-layout').appendChild(overlay);

    // Wait for button press or Enter/Space keys to advance feedback
    const btnNext = overlay.querySelector('#btn-feedback-next');
    
    const cleanupAndNext = () => {
        overlay.remove();
        document.removeEventListener('keydown', keyHandler);
        callback();
    };

    const keyHandler = (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            cleanupAndNext();
        }
    };

    btnNext.addEventListener('click', cleanupAndNext);
    document.addEventListener('keydown', keyHandler);
}

// Exit Confirmation Modal
function openQuitModal() {
    DOM.modalQuit.classList.add('active');
}
function closeQuitModal() {
    DOM.modalQuit.classList.remove('active');
}
function quitQuiz() {
    closeQuitModal();
    if (state.quiz.timerInterval) clearInterval(state.quiz.timerInterval);
    showScreen('dashboard');
}

function finishQuizDueToTimeout() {
    // Fill remaining uncompleted answers as skipped
    const total = state.quiz.questions.length;
    for (let i = state.quiz.currentIndex; i < total; i++) {
        const q = state.quiz.questions[i];
        state.quiz.skippedCount++;
        state.quiz.answersHistory.push({
            question: q.text,
            questionObject: q,
            correctAnswer: q.correctAnswer,
            userAnswer: 'Tiempo Expirado ⧗',
            isCorrect: false,
            topicLabel: q.topicLabel
        });
    }
    finishQuiz();
}

// ==========================================================================
// RESULTS COMPILER SCREEN
// ==========================================================================
function finishQuiz() {
    if (state.quiz.timerInterval) clearInterval(state.quiz.timerInterval);
    
    // Calculations
    const total = state.quiz.questions.length;
    const correct = state.quiz.correctCount;
    const skipped = state.quiz.skippedCount;
    const wrong = state.quiz.wrongCount;
    const scorePct = Math.round((correct / total) * 100);

    // Time calculations
    let totalSecs = 0;
    if (state.config.timeLimit > 0) {
        totalSecs = state.config.timeLimit - state.quiz.elapsedSeconds;
    } else {
        totalSecs = state.quiz.elapsedSeconds;
    }
    const avgSecs = (totalSecs / total).toFixed(1);

    // 1. Text displays
    DOM.resPercent.innerText = `${scorePct}%`;
    DOM.resCorrect.innerText = correct;
    DOM.resWrong.innerText = wrong;
    DOM.resSkipped.innerText = skipped;
    DOM.resTime.innerText = formatTime(totalSecs);
    DOM.resTimeAvg.innerText = `${avgSecs}s`;
    
    // Topic name mapping
    const categoryTopics = TOPIC_METADATA[state.currentCategory] || [];
    const topicObj = categoryTopics.find(t => t.id === state.currentTopic);
    DOM.resTopicName.innerText = topicObj ? topicObj.label : 'Examen';

    // 2. Color badge styling based on grade
    DOM.resultsScoreCircle.className = 'results-badge'; // reset
    if (scorePct >= 90) {
        DOM.resultsScoreCircle.classList.add('excellent');
        DOM.resGrade.innerText = '¡Sobresaliente!';
    } else if (scorePct >= 70) {
        DOM.resultsScoreCircle.classList.add('good');
        DOM.resGrade.innerText = '¡Bien hecho!';
    } else {
        DOM.resultsScoreCircle.classList.add('failed');
        DOM.resGrade.innerText = 'Sigue practicando';
    }

    // 3. Render review lists
    DOM.resultsReviewList.innerHTML = '';
    state.quiz.answersHistory.forEach((hist, index) => {
        const item = document.createElement('div');
        item.className = `review-item ${hist.isCorrect ? 'correct' : 'wrong'}`;

        // Build neat comparing texts
        let comparisonHTML = '';
        const qObj = hist.questionObject;

        if (qObj.inputType === 'fraction' && qObj.fractionInput) {
            // Fraction display
            comparisonHTML = `
                <div class="review-answers-compare">
                    <span class="text-muted">Pregunta: ${qObj.fractionInput.num}/${qObj.fractionInput.den}</span>
                    <span class="text-danger"><i class="fa-solid fa-xmark"></i> ${hist.userAnswer}</span>
                    <span class="text-success"><i class="fa-solid fa-check"></i> ${hist.correctAnswer}</span>
                </div>
            `;
        } else if (qObj.inputType === 'fraction' && qObj.fractionOp) {
            comparisonHTML = `
                <div class="review-answers-compare">
                    <span class="text-muted">Operación: ${qObj.fractionOp.a}/${qObj.fractionOp.b} ${qObj.fractionOp.op} ${qObj.fractionOp.c}/${qObj.fractionOp.d}</span>
                    <span class="text-danger"><i class="fa-solid fa-xmark"></i> ${hist.userAnswer}</span>
                    <span class="text-success"><i class="fa-solid fa-check"></i> ${hist.correctAnswer}</span>
                </div>
            `;
        } else {
            comparisonHTML = `
                <div class="review-answers-compare">
                    <span class="${hist.isCorrect ? 'text-success' : 'text-danger'}">
                        Tu respuesta: <strong>${hist.userAnswer}</strong>
                    </span>
                    ${!hist.isCorrect ? `
                    <span class="text-success">
                        Correcta: <strong>${hist.correctAnswer}</strong>
                    </span>` : ''}
                </div>
            `;
        }

        item.innerHTML = `
            <div class="review-info">
                <div class="review-question">${index + 1}. ${hist.question}</div>
                ${comparisonHTML}
            </div>
            <div class="review-status-badge">
                <i class="fa-solid ${hist.isCorrect ? 'fa-check' : 'fa-xmark'}"></i>
            </div>
        `;
        DOM.resultsReviewList.appendChild(item);
    });

    renderMath(DOM.resultsReviewList);
    showScreen('results');
}

// ==========================================================================
// NUEVOS GENERADORES: REGLA DE TRES Y ÁLGEBRA/CONJUNTOS
// ==========================================================================

function generateReglaTresDirecta(level, index, total) {
    let R = randRange(2, 5 + level);
    if (Math.random() > 0.5) R += 0.5; // Support fractional rates like 1.5, 2.5
    
    let A = randRange(2, 5 + level * 2);
    // If rate has a decimal part, ensure A is even so B is an integer
    if (R % 1 !== 0 && A % 2 !== 0) {
        A += 1;
    }
    const B = A * R;
    
    let C = randRange(3, 8 + level * 3);
    if (R % 1 !== 0 && C % 2 !== 0) {
        C += 1;
    }
    while (C === A) {
        C += 2;
    }
    const ans = C * R;

    const templates = [
        {
            text: `Si ${A} kg de manzanas cuestan $${B} pesos, ¿cuánto costarán ${C} kg de manzanas?`,
            unitA: 'Manzanas (kg)',
            unitB: 'Precio ($)',
            sfx: ' kg'
        },
        {
            text: `Un automóvil recorre ${B} km en ${A} horas. Si mantiene la misma velocidad constante, ¿cuántos km recorrerá en ${C} horas?`,
            unitA: 'Tiempo (horas)',
            unitB: 'Distancia (km)',
            sfx: ' h'
        },
        {
            text: `Para pintar ${A} habitaciones se necesitan ${B} litros de pintura. ¿Cuántos litros se necesitarán para pintar ${C} habitaciones del mismo tamaño?`,
            unitA: 'Habitaciones',
            unitB: 'Pintura (litros)',
            sfx: ' hab'
        },
        {
            text: `Si por trabajar ${A} días una persona cobra $${B} dólares, ¿cuánto cobrará por trabajar ${C} días?`,
            unitA: 'Trabajo (días)',
            unitB: 'Pago ($)',
            sfx: ' días'
        },
        {
            text: `Si un tren recorre ${B} km en ${A} horas a velocidad constante, ¿cuántos km recorrerá en ${C} horas?`,
            unitA: 'Tiempo (horas)',
            unitB: 'Distancia (km)',
            sfx: ' h'
        },
        {
            text: `Una fábrica produce ${B} juguetes en ${A} días. ¿Cuántos juguetes producirá en ${C} días?`,
            unitA: 'Tiempo (días)',
            unitB: 'Juguetes',
            sfx: ' días'
        },
        {
            text: `Si hacer ${A} fotocopias cuesta $${B} centavos, ¿cuánto costará hacer ${C} fotocopias?`,
            unitA: 'Fotocopias',
            unitB: 'Precio (¢)',
            sfx: ' copias'
        },
        {
            text: `En una receta, para ${A} personas se necesitan ${B} gramos de harina. ¿Cuántos gramos se necesitarán para ${C} personas?`,
            unitA: 'Personas',
            unitB: 'Harina (g)',
            sfx: ' pers'
        },
        {
            text: `Un grifo vierte ${B} litros de agua en ${A} minutos. ¿Cuántos litros verterá en ${C} minutos?`,
            unitA: 'Tiempo (min)',
            unitB: 'Agua (litros)',
            sfx: ' min'
        },
        {
            text: `Si ${A} metros de cable eléctrico cuestan $${B} dólares, ¿cuánto costarán ${C} metros del mismo cable?`,
            unitA: 'Longitud (m)',
            unitB: 'Precio ($)',
            sfx: ' m'
        },
        {
            text: `Un jardinero tarda ${A} horas en podar ${B} árboles. ¿Cuántas horas tardará en podar ${C} árboles?`,
            unitA: 'Árboles',
            unitB: 'Tiempo (horas)',
            sfx: ' árb',
            rev: true
        },
        {
            text: `Si ${A} botes de pintura alcanzan para cubrir ${B} m² de pared, ¿cuántos botes se necesitan para pintar ${C} m²?`,
            unitA: 'Área (m²)',
            unitB: 'Pintura (botes)',
            sfx: ' m²',
            rev: true
        },
        {
            text: `Para preparar ${B} pasteles se necesitan ${A} docenas de huevos. ¿Cuántas docenas se necesitarán para ${C} pasteles?`,
            unitA: 'Pasteles',
            unitB: 'Huevos (docenas)',
            sfx: ' past',
            rev: true
        },
        {
            text: `Si una máquina consume ${B} kWh de energía en ${A} horas de uso, ¿cuántos kWh consumirá en ${C} horas?`,
            unitA: 'Tiempo (horas)',
            unitB: 'Consumo (kWh)',
            sfx: ' h'
        }
    ];
    const templateIdx = getShuffledIndexForTopic('regla_tres_directa', templates.length, index);
    const selected = templates[templateIdx];

    let valA = `${A}${selected.sfx}`;
    let valC = `${C}${selected.sfx}`;
    let valB = `${B}`;
    
    if (selected.unitB.includes('$')) {
        valB = `$${B}`;
    } else if (selected.unitB.includes('litros')) {
        valB = `${B} L`;
    } else if (selected.unitB.includes('km')) {
        valB = `${B} km`;
    } else if (selected.unitB.includes('centavos')) {
        valB = `${B}¢`;
    } else if (selected.unitB.includes('gramos') || selected.unitB.includes('(g)')) {
        valB = `${B} g`;
    } else if (selected.unitB.includes('botes')) {
        valB = `${B} botes`;
    } else if (selected.unitB.includes('docenas')) {
        valB = `${B} doc`;
    } else if (selected.unitB.includes('kWh')) {
        valB = `${B} kWh`;
    }

    return {
        text: selected.text,
        correctAnswer: ans.toString(),
        inputType: 'number',
        drawFunc: (c) => drawReglaTresSchema(c, valA, selected.unitA, valB, selected.unitB, valC, true),
        topicLabel: 'Regla de Tres Directa'
    };
}

function generateReglaTresInversa(level, index, total) {
    const productsByLevel = {
        1: [12, 18, 24, 30],
        2: [24, 36, 40, 48],
        3: [60, 72, 80, 96],
        4: [120, 144, 180, 200],
        5: [240, 300, 360, 400],
        6: [480, 600, 720, 900],
        7: [1200, 1500, 1800, 2400],
        8: [2400, 3000, 3600, 4000],
        9: [4800, 6000, 7200, 9000],
        10: [12000, 15000, 18000, 24000]
    };
    
    const possibleProducts = productsByLevel[level] || productsByLevel[10];
    const P = possibleProducts[randRange(0, possibleProducts.length - 1)];
    
    // Find factors of P
    const factors = [];
    for (let i = 2; i <= P / 2; i++) {
        if (P % i === 0) factors.push(i);
    }
    
    let aIdx = randRange(0, factors.length - 1);
    let cIdx = randRange(0, factors.length - 1);
    while (cIdx === aIdx && factors.length > 1) {
        cIdx = randRange(0, factors.length - 1);
    }
    
    const A = factors[aIdx];
    const C = factors[cIdx];
    const B = P / A;
    const ans = P / C;

    const templates = [
        {
            text: `Si ${A} obreros tardan ${B} días en construir una barda, ¿cuántos días tardarán ${C} obreros en hacer el mismo trabajo?`,
            unitA: 'Obreros',
            unitB: 'Tiempo (días)',
            sfxA: ' obreros',
            sfxB: ' días'
        },
        {
            text: `Un grifo con un flujo de ${A} L/min llena un depósito en ${B} horas. ¿Cuánto tardará en llenarse si el flujo es de ${C} L/min?`,
            unitA: 'Flujo (L/min)',
            unitB: 'Tiempo (horas)',
            sfxA: ' L/m',
            sfxB: ' h'
        },
        {
            text: `Un coche viaja a ${A} km/h y tarda ${B} horas en realizar un trayecto. ¿Cuántas horas tardará si viaja a ${C} km/h?`,
            unitA: 'Velocidad (km/h)',
            unitB: 'Tiempo (horas)',
            sfxA: ' km/h',
            sfxB: ' h'
        },
        {
            text: `Si ${A} pintores tardan ${B} horas en terminar de pintar un edificio, ¿cuántas horas tardarán ${C} pintores?`,
            unitA: 'Pintores',
            unitB: 'Tiempo (horas)',
            sfxA: ' pintores',
            sfxB: ' h'
        },
        {
            text: `Si ${A} tractores tardan ${B} días en sembrar un campo de cultivo, ¿cuántos días tardarán ${C} tractores similares?`,
            unitA: 'Tractores',
            unitB: 'Tiempo (días)',
            sfxA: ' trac',
            sfxB: ' días'
        },
        {
            text: `Un camión que transporta ${A} toneladas por viaje tarda ${B} viajes en vaciar un almacén. ¿Cuántos viajes tardará un camión de ${C} toneladas?`,
            unitA: 'Capacidad (t)',
            unitB: 'Viajes',
            sfxA: ' t',
            sfxB: ' viajes'
        },
        {
            text: `Si ${A} impresoras tardan ${B} minutos en imprimir un lote de folletos, ¿cuántos minutos tardarán ${C} impresoras similares?`,
            unitA: 'Impresoras',
            unitB: 'Tiempo (min)',
            sfxA: ' imp',
            sfxB: ' min'
        },
        {
            text: `Un grupo de ${A} excursionistas tiene comida para ${B} días. Si el grupo pasa a ser de ${C} excursionistas, ¿cuántos días durará la comida?`,
            unitA: 'Excursionistas',
            unitB: 'Tiempo (días)',
            sfxA: ' pers',
            sfxB: ' días'
        },
        {
            text: `Para envasar un lote de perfume se necesitan ${B} frascos de ${A} mL de capacidad. ¿Cuántos frascos de ${C} mL se necesitarán?`,
            unitA: 'Capacidad (mL)',
            unitB: 'Frascos',
            sfxA: ' mL',
            sfxB: ' frascos',
            rev: true
        },
        {
            text: `Un depósito de agua se vacía en ${B} horas mediante ${A} desagües del mismo diámetro. ¿Cuántas horas tardará si se usan ${C} desagües?`,
            unitA: 'Desagües',
            unitB: 'Tiempo (horas)',
            sfxA: ' des',
            sfxB: ' h',
            rev: true
        },
        {
            text: `Si ${A} albañiles construyen una pared en ${B} horas, ¿cuántas horas tardarán ${C} albañiles en realizar el mismo trabajo?`,
            unitA: 'Albañiles',
            unitB: 'Tiempo (horas)',
            sfxA: ' alb',
            sfxB: ' h'
        },
        {
            text: `Un ganadero tiene pasto para alimentar a ${A} ovejas durante ${B} días. ¿Cuántos días durará el pasto si tiene ${C} ovejas?`,
            unitA: 'Ovejas',
            unitB: 'Tiempo (días)',
            sfxA: ' ovejas',
            sfxB: ' días'
        },
        {
            text: `Para pavimentar una calle, ${A} operarios tardan ${B} horas. ¿Cuántas horas tardarán ${C} operarios en pavimentar la misma calle?`,
            unitA: 'Operarios',
            unitB: 'Tiempo (horas)',
            sfxA: ' oper',
            sfxB: ' h'
        },
        {
            text: `Una bomba de agua tarda ${B} horas en llenar una piscina con un caudal de ${A} L/s. ¿Cuánto tardará si el caudal es de ${C} L/s?`,
            unitA: 'Caudal (L/s)',
            unitB: 'Tiempo (horas)',
            sfxA: ' L/s',
            sfxB: ' h',
            rev: true
        }
    ];
    const templateIdx = getShuffledIndexForTopic('regla_tres_inversa', templates.length, index);
    const selected = templates[templateIdx];

    let valA = `${A}${selected.sfxA}`;
    let valC = `${C}${selected.sfxA}`;
    let valB = `${B}${selected.sfxB}`;

    return {
        text: selected.text,
        correctAnswer: ans.toString(),
        inputType: 'number',
        drawFunc: (c) => drawReglaTresSchema(c, valA, selected.unitA, valB, selected.unitB, valC, false),
        topicLabel: 'Regla de Tres Inversa'
    };
}

function generateAlgebraConjuntosQuestion(topic, level, options, index, total) {
    if (topic === 'conjuntos') {
        const maxNum = level <= 3 ? 6 : 8;
        const elements = Array.from({ length: maxNum }, (_, i) => i + 1);

        const onlyA = [];
        const intersection = [];
        const onlyB = [];
        const outside = [];

        elements.forEach(el => {
            const r = Math.random();
            if (r < 0.25) onlyA.push(el);
            else if (r < 0.5) intersection.push(el);
            else if (r < 0.75) onlyB.push(el);
            else outside.push(el);
        });

        // Ensure not completely empty
        if (onlyA.length === 0 && intersection.length === 0 && onlyB.length === 0) {
            onlyA.push(1);
            intersection.push(2);
            onlyB.push(3);
        }

        const setA = [...onlyA, ...intersection].sort((x, y) => x - y);
        const setB = [...onlyB, ...intersection].sort((x, y) => x - y);

        const ops = ['union', 'interseccion', 'diferencia_ab', 'diferencia_ba', 'complemento_a', 'complemento_b'];
        const opIdx = getShuffledIndexForTopic('conjuntos_ops', ops.length, index);
        const op = ops[opIdx];

        const contexts = [
            "En un salón de clases, el conjunto $A$ representa a los alumnos que estudian alemán y $B$ a los que estudian francés.",
            "En una encuesta sobre deportes, el conjunto $A$ representa a quienes practican atletismo y $B$ a quienes practican básquetbol.",
            "En una biblioteca, el conjunto $A$ contiene los libros de aventuras y $B$ los de ciencia ficción.",
            "En una tienda de tecnología, el conjunto $A$ representa los teléfonos con sistema Android y $B$ los que tienen Bluetooth.",
            "En un club social, el conjunto $A$ representa a los miembros que juegan ajedrez y $B$ a los que juegan billar.",
            "En un menú de restaurante, el conjunto $A$ representa los platillos vegetarianos y $B$ los platillos picantes.",
            "En un hospital, el conjunto $A$ representa a los pacientes con alergias alimentarias y $B$ a los pacientes con alergias al polen.",
            "En una escuela de música, el conjunto $A$ representa a los estudiantes de piano y $B$ a los de guitarra.",
            "En una oficina, el conjunto $A$ representa a los empleados que usan laptop y $B$ a los que usan pantalla externa.",
            "En un club de lectura, el conjunto $A$ representa a los miembros que prefieren novelas y $B$ a los que prefieren biografías."
        ];
        const contextIdx = getShuffledIndexForTopic('conjuntos_contexts', contexts.length, index);
        const context = contexts[contextIdx];

        let questionText = '';
        let correctList = [];
        let opSymbol = '';

        switch (op) {
            case 'union':
                questionText = `${context}\nCalcula la unión de ambos conjuntos: $A \\cup B$\n(Escribe los números separados por comas)`;
                correctList = [...onlyA, ...intersection, ...onlyB];
                opSymbol = 'A ∪ B';
                break;
            case 'interseccion':
                questionText = `${context}\nCalcula la intersección de ambos conjuntos: $A \\cap B$\n(Escribe los números separados por comas o "vacío" si no hay)`;
                correctList = intersection;
                opSymbol = 'A ∩ B';
                break;
            case 'diferencia_ab':
                questionText = `${context}\nCalcula la diferencia de los conjuntos: $A - B$\n(Escribe los números separados por comas o "vacío")`;
                correctList = onlyA;
                opSymbol = 'A - B';
                break;
            case 'diferencia_ba':
                questionText = `${context}\nCalcula la diferencia de los conjuntos: $B - A$\n(Escribe los números separados por comas o "vacío")`;
                correctList = onlyB;
                opSymbol = 'B - A';
                break;
            case 'complemento_a':
                questionText = `${context}\nCalcula el complemento del conjunto $A$ en el universo $U$: $A'$\n(Escribe los números separados por comas)`;
                correctList = [...onlyB, ...outside];
                opSymbol = "A'";
                break;
            case 'complemento_b':
                questionText = `${context}\nCalcula el complemento del conjunto $B$ en el universo $U$: $B'$\n(Escribe los números separados por comas)`;
                correctList = [...onlyA, ...outside];
                opSymbol = "B'";
                break;
        }

        correctList.sort((x, y) => x - y);
        const correctAnswer = correctList.length === 0 ? 'vacio' : correctList.join(',');

        return {
            text: questionText,
            correctAnswer: correctAnswer,
            inputType: 'number',
            drawFunc: (c) => drawVennDiagram(c, onlyA, intersection, onlyB, outside, opSymbol),
            topicLabel: 'Operaciones de Conjuntos',
            verify: (userVal) => {
                let cleanUser = userVal.toLowerCase().replace(/[\s\{\}\[\]]/g, '');
                if (cleanUser === 'vacio' || cleanUser === 'vacío' || cleanUser === 'ø' || cleanUser === '') {
                    return correctList.length === 0;
                }
                const userParts = cleanUser.split(',').map(Number).filter(x => !isNaN(x)).sort((x, y) => x - y);
                if (userParts.length !== correctList.length) return false;
                return userParts.every((val, index) => val === correctList[index]);
            }
        };
    }

    if (topic === 'propiedades_desigualdades') {
        const questionsPool = [
            {
                text: "Si $a < b$ y $c > 0$ (número positivo), ¿cuál de las siguientes afirmaciones es siempre correcta?",
                correctAnswer: "$a \\cdot c < b \\cdot c$",
                choices: ["$a \\cdot c < b \\cdot c$", "$a \\cdot c > b \\cdot c$", "$a \\cdot c = b \\cdot c$", "$a + c > b + c$"]
            },
            {
                text: "Si $a < b$ y $c < 0$ (número negativo), ¿cuál de las siguientes afirmaciones es siempre correcta?",
                correctAnswer: "$a \\cdot c > b \\cdot c$",
                choices: ["$a \\cdot c > b \\cdot c$", "$a \\cdot c < b \\cdot c$", "$a \\cdot c = b \\cdot c$", "$a / c < b / c$"]
            },
            {
                text: "Si $a < b$, ¿qué sucede si restamos una constante $c$ de ambos lados?",
                correctAnswer: "$a - c < b - c$",
                choices: ["$a - c < b - c$", "$a - c > b - c$", "$a - c = b - c$", "Depende del signo de $c$"]
            },
            {
                text: "Si $a > b$ y ambos son positivos ($a, b > 0$), ¿cuál de las siguientes afirmaciones sobre sus recíprocos es correcta?",
                correctAnswer: "$1/a < 1/b$",
                choices: ["$1/a < 1/b$", "$1/a > 1/b$", "$1/a = 1/b$", "$1/a \\ge 1/b$"]
            },
            {
                text: "Si $a < b$ y $c < d$, ¿cuál de las siguientes afirmaciones es siempre correcta al sumar ambas desigualdades?",
                correctAnswer: "$a + c < b + d$",
                choices: ["$a + c < b + d$", "$a + c > b + d$", "$a + c = b + d$", "No se pueden sumar"]
            },
            {
                text: "Si $a < b$ y $c < 0$ (número negativo), ¿qué sucede si dividimos ambos lados entre $c$?",
                correctAnswer: "$a/c > b/c$",
                choices: ["$a/c > b/c$", "$a/c < b/c$", "$a/c = b/c$", "$a \\cdot c < b \\cdot c$"]
            },
            {
                text: "Si $a \\ge b$ y multiplicamos ambos lados por $-1$, ¿cómo cambia la desigualdad?",
                correctAnswer: "$-a \\le -b$",
                choices: ["$-a \\le -b$", "$-a \\ge -b$", "$-a > -b$", "$a \\le b$"]
            },
            {
                text: "Si $a > 0$ y $b < 0$, ¿cuál de las siguientes afirmaciones sobre su producto es siempre correcta?",
                correctAnswer: "$a \\cdot b < 0$",
                choices: ["$a \\cdot b < 0$", "$a \\cdot b > 0$", "$a + b < 0$", "$a - b < 0$"]
            },
            {
                text: "Si $a < b$ y multiplicamos ambos lados por cero ($c = 0$), ¿qué afirmación es correcta?",
                correctAnswer: "$a \\cdot c = b \\cdot c$",
                choices: ["$a \\cdot c = b \\cdot c$", "$a \\cdot c < b \\cdot c$", "$a \\cdot c > b \\cdot c$", "$a + c < b + c$"]
            },
            {
                text: "Si $a < b$, ¿cuál de las siguientes afirmaciones al sumar una constante negativa $c$ ($c < 0$) es correcta?",
                correctAnswer: "$a + c < b + c$",
                choices: ["$a + c < b + c$", "$a + c > b + c$", "$a - c > b - c$", "$a \\cdot c < b \\cdot c$"]
            },
            {
                text: "Si $a > b$ y $c > d$, ¿cuál de las siguientes afirmaciones al restar es siempre cierta?",
                correctAnswer: "$a - d > b - c$",
                choices: ["$a - d > b - c$", "$a - c > b - d$", "$a - d < b - c$", "$a + d > b + c$"]
            },
            {
                text: "Si $a > b > 0$ y elevamos ambos lados al cuadrado, ¿qué afirmación es correcta?",
                correctAnswer: "$a^2 > b^2$",
                choices: ["$a^2 > b^2$", "$a^2 < b^2$", "$a^2 = b^2$", "$-a^2 > -b^2$"]
            },
            {
                text: "Si $a < b < 0$ (ambos son números negativos) y elevamos ambos lados al cuadrado, ¿cuál de las siguientes afirmaciones es correcta?",
                correctAnswer: "$a^2 > b^2$",
                choices: ["$a^2 > b^2$", "$a^2 < b^2$", "$a^2 = b^2$", "$a^2 \\le b^2$"]
            },
            {
                text: "Si $a < b$ y $c > 0$ (número positivo), ¿qué afirmación es correcta sobre la división entre $c$?",
                correctAnswer: "$a/c < b/c$",
                choices: ["$a/c < b/c$", "$a/c > b/c$", "$a/c = b/c$", "$a + c > b + c$"]
            },
            {
                text: "Si $a \\le b$ y $b \\le c$, ¿qué afirmación describe la propiedad transitiva de las desigualdades?",
                correctAnswer: "$a \\le c$",
                choices: ["$a \\le c$", "$a \\ge c$", "$a < c$", "$a = c$"]
            }
        ];

        const qIdx = getShuffledIndexForTopic('propiedades_desigualdades', questionsPool.length, index);
        const selectedQ = questionsPool[qIdx];

        return {
            text: selectedQ.text,
            correctAnswer: selectedQ.correctAnswer,
            inputType: 'multiple-choice',
            choices: shuffleArray([...selectedQ.choices]),
            topicLabel: 'Propiedades de Desigualdades'
        };
    }

    if (topic === 'solucion_desigualdades') {
        const signs = ['<', '>', '≤', '≥'];
        const sign = signs[randRange(0, 3)];

        const x0 = randRange(-10, 10) || 3;
        let a = randRange(2, 6);
        if (Math.random() > 0.5) a = -a; // negative coefficient to test sign flip

        const b = randRange(-15, 15) || 5;
        const cVal = a * x0 + b;

        const bPart = b >= 0 ? `+ ${b}` : `- ${Math.abs(b)}`;
        const inequalityTex = `${a}x ${bPart} ${sign === '≤' ? '\\le' : (sign === '≥' ? '\\ge' : sign)} ${cVal}`;

        let finalSign = sign;
        if (a < 0) {
            const reverseMap = { '<': '>', '>': '<', '≤': '≥', '≥': '≤' };
            finalSign = reverseMap[sign];
        }

        const correctAnswer = `$x ${finalSign === '≤' ? '\\le' : (finalSign === '≥' ? '\\ge' : finalSign)} ${x0}$`;

        const choices = [
            correctAnswer,
            `$x ${sign === finalSign && a < 0 ? (sign === '≤' ? '\\le' : (sign === '≥' ? '\\ge' : sign)) : (a > 0 ? (sign === '<' ? '>' : '<') : (sign === '≤' ? '\\le' : (sign === '≥' ? '\\ge' : sign)))} ${x0}$`, // wrong sign
            `$x ${finalSign === '≤' ? '\\le' : (finalSign === '≥' ? '\\ge' : finalSign)} ${x0 + randRange(-3, 3) || x0 + 1}$`, // wrong value
            `$x ${finalSign === '<' ? '>' : '<'} ${x0 + randRange(-3, 3) || x0 - 1}$` // wrong sign and value
        ];

        const uniqueChoices = [...new Set(choices)];
        while (uniqueChoices.length < 4) {
            const randomOffset = randRange(-5, 5) || 1;
            uniqueChoices.push(`$x ${finalSign === '≤' ? '\\le' : (finalSign === '≥' ? '\\ge' : finalSign)} ${x0 + randomOffset}$`);
        }

        // Add 10 verbal statement templates
        const verbalTemplates = [
            `Un fabricante de camisas estima que los costos de producción diarios en miles de pesos siguen la relación $$ ${inequalityTex} $$, donde $x$ es la cantidad de camisas producidas en decenas. ¿Cuál es el rango de producción permitido?`,
            `Para obtener una beca escolar, la puntuación total de un alumno debe cumplir la condición $$ ${inequalityTex} $$, donde $x$ es la calificación del examen final. Encuentra el conjunto solución para la calificación $x$.`,
            `Un submarino científico debe mantener su profundidad operativa en metros según la restricción $$ ${inequalityTex} $$, donde $x$ es el nivel de presión atmosférica local en kilopascales. Resuelve para $x$.`,
            `La temperatura interna en una incubadora artificial debe ajustarse de modo que $$ ${inequalityTex} $$, siendo $x$ el factor de calibración térmica. Resuelve para $x$.`,
            `Un camión de carga tiene un límite de peso en toneladas que se modela con la inecuación $$ ${inequalityTex} $$, donde $x$ represents el número de contenedores medianos a bordo. Determina la solución para $x$.`,
            `En un experimento biológico, la tasa de reproducción de un hongo se mantiene estable si $$ ${inequalityTex} $$, donde $x$ es la humedad ambiente en porcentaje. Resuelve para $x$.`,
            `Un inversor financiero proyecta que obtendrá ganancias anuales netas si su portafolio cumple con la desigualdad $$ ${inequalityTex} $$, donde $x$ es el rendimiento porcentual promedio. Halla el intervalo de rendimiento.`,
            `La velocidad de operación permitida para una turbina eólica está delimitada por la desigualdad $$ ${inequalityTex} $$, donde $x$ es la velocidad del viento en m/s. ¿Qué rango de velocidad de viento es aceptable?`,
            `Un agricultor determina que la cantidad de fertilizante en kilogramos por hectárea debe cumplir la relación $$ ${inequalityTex} $$ para no dañar los cultivos. Resuelve para $x$.`,
            `Para mantener estable la presión de seguridad en una tubería de gas, la inecuación de control es $$ ${inequalityTex} $$, donde $x$ es la apertura de la válvula de escape en grados. Resuelve para $x$.`
        ];

        const useVerbal = Math.random() > 0.5;
        const text = useVerbal
            ? verbalTemplates[getShuffledIndexForTopic('solucion_desigualdades_verbal', verbalTemplates.length, index)]
            : `Resuelve la siguiente desigualdad lineal:\n$$ ${inequalityTex} $$`;

        return {
            text: text,
            correctAnswer: correctAnswer,
            inputType: 'multiple-choice',
            choices: shuffleArray(uniqueChoices),
            topicLabel: 'Solución de Desigualdades'
        };
    }

    if (topic === 'intervalos') {
        const type = Math.random() > 0.5 ? 'desig_to_interval' : 'interval_to_desig';
        const subtype = Math.random() > 0.5 ? 'double' : 'single';

        let questionText = '';
        let correctAnswer = '';
        let choices = [];

        if (subtype === 'double') {
            const L = randRange(-10, 5);
            const R = L + randRange(3, 10);
            const leftInc = Math.random() > 0.5;
            const rightInc = Math.random() > 0.5;

            const leftSign = leftInc ? '\\le' : '<';
            const rightSign = rightInc ? '\\le' : '<';
            const leftBracket = leftInc ? '[' : '(';
            const rightBracket = rightInc ? ']' : ')';

            const inequalityStr = `$${L} ${leftSign} x ${rightSign} ${R}$`;
            const intervalStr = `$${leftBracket}${L}, ${R}${rightBracket}$`;

            if (type === 'desig_to_interval') {
                const verbalDoubleTemplates = [
                    `La temperatura de almacenamiento de un medicamento debe estar estrictamente por encima de $L$ °C y como máximo a $R$ °C. Expresa este rango en notación de intervalos.`,
                    `La altura reglamentaria para el ingreso a una atracción mecánica debe ser mayor o igual a $L$ metros pero menor a $R$ metros. Representa este rango en notación de intervalos.`,
                    `El nivel de humedad aceptable en una cámara de maduración de quesos oscila entre el $L$\% y el $R$\%, ambos valores incluidos. Expresa este rango en notación de intervalos.`,
                    `Un sensor de presión en una fábrica emite una alarma si el nivel de presión está estrictamente entre $L$ bar y $R$ bar. Representa este rango en notación de intervalos.`,
                    `La velocidad recomendada en una autovía está limitada a valores mayores que $L$ km/h y menores o iguales a $R$ km/h. Expresa este rango en notación de intervalos.`
                ];
                
                const selectedVerbal = verbalDoubleTemplates[getShuffledIndexForTopic('intervalos_double_verbal', verbalDoubleTemplates.length, index)]
                    .replace('$L$', L.toString())
                    .replace('$R$', R.toString());

                const useVerbal = Math.random() > 0.5;
                questionText = useVerbal 
                    ? selectedVerbal 
                    : `Representa la desigualdad en notación de intervalos:\n${inequalityStr}`;
                correctAnswer = intervalStr;
                choices = [
                    correctAnswer,
                    `$${leftInc ? '(' : '['}${L}, ${R}${rightInc ? ']' : ')'}$`,
                    `$(${L}, ${R})$`,
                    `$[${L}, ${R}]$`
                ];
            } else {
                const verbalDoubleTemplates = [
                    `La temperatura de almacenamiento de un medicamento debe cumplir con el intervalo $I$. Expresa este rango en forma de desigualdad.`,
                    `La altura reglamentaria para el ingreso a una atracción mecánica debe cumplir con el intervalo $I$. Representa este rango en forma de desigualdad.`,
                    `El nivel de humedad aceptable en una cámara de maduración de quesos se encuentra dentro del intervalo $I$. Expresa este rango en forma de desigualdad.`,
                    `Un sensor de presión en una fábrica emite una alarma si el nivel de presión en bar cae dentro del intervalo $I$. Representa este rango en forma de desigualdad.`,
                    `La velocidad recomendada en una autovía en km/h debe mantenerse dentro del intervalo $I$. Expresa este rango en forma de desigualdad.`
                ];
                
                const selectedVerbal = verbalDoubleTemplates[getShuffledIndexForTopic('intervalos_double_verbal_rev', verbalDoubleTemplates.length, index)]
                    .replace('$I$', intervalStr);

                const useVerbal = Math.random() > 0.5;
                questionText = useVerbal
                    ? selectedVerbal
                    : `Representa el intervalo en forma de desigualdad:\n${intervalStr}`;
                correctAnswer = inequalityStr;
                choices = [
                    correctAnswer,
                    `$${L} ${leftInc ? '<' : '\\le'} x ${rightInc ? '<' : '\\le'} ${R}$`,
                    `$${L} < x < ${R}$`,
                    `$${L} \\le x \\le ${R}$`
                ];
            }
        } else {
            const B = randRange(-10, 10);
            const direction = ['left_open', 'left_closed', 'right_open', 'right_closed'][randRange(0, 3)];
            
            let inequalityStr = '';
            let intervalStr = '';

            switch (direction) {
                case 'left_open':
                    inequalityStr = `$x < ${B}$`;
                    intervalStr = `$(-\\infty, ${B})$`;
                    break;
                case 'left_closed':
                    inequalityStr = `$x \\le ${B}$`;
                    intervalStr = `$(-\\infty, ${B}]$`;
                    break;
                case 'right_open':
                    inequalityStr = `$x > ${B}$`;
                    intervalStr = `$(${B}, \\infty)$`;
                    break;
                case 'right_closed':
                    inequalityStr = `$x \\ge ${B}$`;
                    intervalStr = `$[${B}, \\infty)$`;
                    break;
            }

            if (type === 'desig_to_interval') {
                const verbalSingleTemplates = [
                    `La edad permitida para participar en un torneo deportivo juvenil es de al menos $B$ años. Representa este rango en notación de intervalos.`,
                    `El saldo en una cuenta de ahorros para no pagar comisiones debe mantenerse estrictamente por debajo de $B$ dólares. Representa este rango en notación de intervalos.`,
                    `El nivel de pH permitido para el agua purificada de una piscina debe ser menor o igual a $B$. Representa este rango en notación de intervalos.`,
                    `El voltaje de entrada para un componente electrónico delicado debe ser estrictamente mayor que $B$ voltios. Representa este rango en notación de intervalos.`,
                    `Para calificar a la categoría de peso pesado en un gimnasio, un boxeador debe registrar un peso mayor o igual a $B$ kg. Representa este rango en notación de intervalos.`
                ];
                const selectedVerbal = verbalSingleTemplates[getShuffledIndexForTopic('intervalos_single_verbal', verbalSingleTemplates.length, index)]
                    .replace('$B$', B.toString());

                const useVerbal = Math.random() > 0.5;
                questionText = useVerbal
                    ? selectedVerbal
                    : `Representa la desigualdad en notación de intervalos:\n${inequalityStr}`;
                correctAnswer = intervalStr;
                
                const altBracket = direction.includes('open') ? ']' : ')';
                choices = [
                    correctAnswer,
                    direction.includes('left') ? `$(-\\infty, ${B}${altBracket}$` : `$${direction.includes('open') ? '[' : '('}${B}, \\infty)$`,
                    direction.includes('left') ? `$[-\\infty, ${B})$` : `$(${B}, \\infty]$`,
                    direction.includes('left') ? `$(\\infty, ${B})$` : `$(-\\infty, ${B}]$`
                ];
            } else {
                const verbalSingleTemplates = [
                    `La edad permitida para participar en un torneo deportivo juvenil cumple el intervalo $I$. Representa este rango en forma de desigualdad.`,
                    `El saldo en una cuenta de ahorros para no pagar comisiones debe mantenerse en el intervalo $I$. Representa este rango en forma de desigualdad.`,
                    `El nivel de pH permitido para el agua purificada de una piscina debe estar en el intervalo $I$. Representa este rango en forma de desigualdad.`,
                    `El voltaje de entrada para un componente electrónico delicado debe mantenerse en el intervalo $I$. Representa este rango en forma de desigualdad.`,
                    `Para calificar a la categoría de peso pesado en un gimnasio, un boxeador debe tener un peso en el intervalo $I$. Representa este rango en forma de desigualdad.`
                ];
                const selectedVerbal = verbalSingleTemplates[getShuffledIndexForTopic('intervalos_single_verbal_rev', verbalSingleTemplates.length, index)]
                    .replace('$I$', intervalStr);

                const useVerbal = Math.random() > 0.5;
                questionText = useVerbal
                    ? selectedVerbal
                    : `Representa el intervalo en forma de desigualdad:\n${intervalStr}`;
                correctAnswer = inequalityStr;

                const oppSign = direction.includes('left') ? (direction.includes('open') ? '\\le' : '<') : (direction.includes('open') ? '\\ge' : '>');
                const flippedSign = direction.includes('left') ? (direction.includes('open') ? '>' : '\\ge') : (direction.includes('open') ? '<' : '\\le');

                choices = [
                    correctAnswer,
                    `$x ${oppSign} ${B}$`,
                    `$x ${flippedSign} ${B}$`,
                    `$x = ${B}$`
                ];
            }
        }

        const uniqueChoices = [...new Set(choices)];
        while (uniqueChoices.length < 4) {
            uniqueChoices.push(`$x < ${randRange(-10, 10)}$`);
        }

        return {
            text: questionText,
            correctAnswer: correctAnswer,
            inputType: 'multiple-choice',
            choices: shuffleArray(uniqueChoices),
            topicLabel: 'Intervalos & Desigualdades'
        };
    }
}

function drawVennDiagram(c, onlyA, intersection, onlyB, outside, opSymbol) {
    const width = 400;
    const height = 300;
    
    c.strokeStyle = state.theme === 'dark' ? '#475569' : '#94a3b8';
    c.lineWidth = 2;
    
    // Universal set box
    c.beginPath();
    c.rect(30, 30, 340, 240);
    c.stroke();
    
    c.font = "bold 13px 'Plus Jakarta Sans'";
    c.fillStyle = state.theme === 'dark' ? '#94a3b8' : '#64748b';
    c.textAlign = 'left';
    c.fillText('U', 45, 48);

    const cx1 = 160, cy1 = 150, r = 70;
    const cx2 = 240, cy2 = 150;

    // Draw left circle A
    c.strokeStyle = '#818cf8';
    c.beginPath();
    c.arc(cx1, cy1, r, 0, 2 * Math.PI);
    c.stroke();
    c.fillStyle = 'rgba(99, 102, 241, 0.03)';
    c.fill();

    // Draw right circle B
    c.strokeStyle = '#ec4899';
    c.beginPath();
    c.arc(cx2, cy2, r, 0, 2 * Math.PI);
    c.stroke();
    c.fillStyle = 'rgba(236, 72, 153, 0.03)';
    c.fill();

    // Text labels for circles
    c.font = "bold 16px 'Plus Jakarta Sans'";
    c.fillStyle = '#818cf8';
    c.fillText('A', cx1 - 40, cy1 - 78);
    c.fillStyle = '#ec4899';
    c.fillText('B', cx2 + 25, cy2 - 78);

    // Render elements inside regions
    c.font = "bold 15px 'Plus Jakarta Sans'";
    c.fillStyle = state.theme === 'dark' ? '#f3f4f6' : '#1e293b';
    c.textAlign = 'center';
    c.textBaseline = 'middle';

    const drawNums = (list, x, y, dx = 22) => {
        if (list.length === 0) return;
        const startX = x - ((list.length - 1) * dx) / 2;
        list.forEach((val, idx) => {
            const dy = idx % 2 === 0 ? -6 : 8;
            c.fillText(val.toString(), startX + idx * dx, y + dy);
        });
    };

    drawNums(onlyA, 115, 150);
    drawNums(intersection, 200, 150);
    drawNums(onlyB, 285, 150);
    drawNums(outside, 200, 245);
}

function drawVennDiagram(c, onlyA, intersection, onlyB, outside, opSymbol) {
    const width = 400;
    const height = 300;
    
    // Set theme styles
    c.strokeStyle = state.theme === 'dark' ? '#475569' : '#cbd5e1';
    c.lineWidth = 2.5;
    
    // Universal set box
    c.beginPath();
    c.rect(30, 30, 340, 240);
    c.stroke();
    
    c.font = "bold 13px 'Plus Jakarta Sans'";
    c.fillStyle = state.theme === 'dark' ? '#94a3b8' : '#64748b';
    c.textAlign = 'left';
    c.fillText('U', 45, 48);

    const cx1 = 160, cy1 = 150, r = 70;
    const cx2 = 240, cy2 = 150;

    // Highlight the queried operation's region (Elaborate Visual Graphic)
    c.save();
    c.fillStyle = 'rgba(236, 72, 153, 0.16)'; // Soft Rose Highlight
    
    if (opSymbol === 'A ∪ B') {
        c.beginPath();
        c.arc(cx1, cy1, r, 0, 2 * Math.PI);
        c.fill();
        c.beginPath();
        c.arc(cx2, cy2, r, 0, 2 * Math.PI);
        c.fill();
    } else if (opSymbol === 'A ∩ B') {
        c.beginPath();
        c.arc(cx1, cy1, r, 0, 2 * Math.PI);
        c.clip();
        c.beginPath();
        c.arc(cx2, cy2, r, 0, 2 * Math.PI);
        c.fill();
    } else if (opSymbol === 'A - B') {
        c.beginPath();
        c.arc(cx1, cy1, r, 0, 2 * Math.PI);
        c.fill();
        c.globalCompositeOperation = 'destination-out';
        c.beginPath();
        c.arc(cx2, cy2, r, 0, 2 * Math.PI);
        c.fill();
    } else if (opSymbol === 'B - A') {
        c.beginPath();
        c.arc(cx2, cy2, r, 0, 2 * Math.PI);
        c.fill();
        c.globalCompositeOperation = 'destination-out';
        c.beginPath();
        c.arc(cx1, cy1, r, 0, 2 * Math.PI);
        c.fill();
    } else if (opSymbol === "A'") {
        c.beginPath();
        c.rect(30, 30, 340, 240);
        c.fill();
        c.globalCompositeOperation = 'destination-out';
        c.beginPath();
        c.arc(cx1, cy1, r, 0, 2 * Math.PI);
        c.fill();
    } else if (opSymbol === "B'") {
        c.beginPath();
        c.rect(30, 30, 340, 240);
        c.fill();
        c.globalCompositeOperation = 'destination-out';
        c.beginPath();
        c.arc(cx2, cy2, r, 0, 2 * Math.PI);
        c.fill();
    }
    c.restore();

    // Draw left circle A
    c.strokeStyle = '#818cf8';
    c.beginPath();
    c.arc(cx1, cy1, r, 0, 2 * Math.PI);
    c.stroke();
    c.fillStyle = 'rgba(99, 102, 241, 0.03)';
    c.fill();

    // Draw right circle B
    c.strokeStyle = '#ec4899';
    c.beginPath();
    c.arc(cx2, cy2, r, 0, 2 * Math.PI);
    c.stroke();
    c.fillStyle = 'rgba(236, 72, 153, 0.03)';
    c.fill();

    // Text labels for circles
    c.font = "bold 16px 'Plus Jakarta Sans'";
    c.fillStyle = '#818cf8';
    c.fillText('A', cx1 - 40, cy1 - 78);
    c.fillStyle = '#ec4899';
    c.fillText('B', cx2 + 25, cy2 - 78);

    // Render elements inside regions
    c.font = "bold 15px 'Plus Jakarta Sans'";
    c.fillStyle = state.theme === 'dark' ? '#f3f4f6' : '#1e293b';
    c.textAlign = 'center';
    c.textBaseline = 'middle';

    const drawNums = (list, x, y, dx = 22) => {
        if (list.length === 0) return;
        const startX = x - ((list.length - 1) * dx) / 2;
        list.forEach((val, idx) => {
            const dy = idx % 2 === 0 ? -6 : 8;
            c.fillText(val.toString(), startX + idx * dx, y + dy);
        });
    };

    drawNums(onlyA, 115, 150);
    drawNums(intersection, 200, 150);
    drawNums(onlyB, 285, 150);
    drawNums(outside, 200, 245);
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Draw visual help schema for rule of three
function drawReglaTresSchema(c, valA, unitA, valB, unitB, valC, isDirect) {
    const width = 400;
    const height = 300;
    
    // Outline box
    c.strokeStyle = state.theme === 'dark' ? '#475569' : '#cbd5e1';
    c.lineWidth = 2;
    c.beginPath();
    c.rect(20, 20, 360, 250);
    c.stroke();
    
    // Header
    c.font = "bold 15px 'Plus Jakarta Sans'";
    c.fillStyle = isDirect ? '#06b6d4' : '#ec4899';
    c.textAlign = 'center';
    c.fillText(`Esquema: Proporcionalidad ${isDirect ? 'Directa' : 'Inversa'}`, width / 2, 48);

    const xL = 100;
    const xR = 300;
    const y1 = 120;
    const y2 = 210;
    
    // Left values
    c.font = "bold 13px 'Plus Jakarta Sans'";
    c.fillStyle = state.theme === 'dark' ? '#94a3b8' : '#64748b';
    c.fillText(unitA, xL, 88);
    
    c.font = "bold 20px 'Plus Jakarta Sans'";
    c.fillStyle = state.theme === 'dark' ? '#f3f4f6' : '#1e293b';
    c.fillText(valA, xL, y1);
    c.fillText(valC, xL, y2);

    // Right values
    c.font = "bold 13px 'Plus Jakarta Sans'";
    c.fillStyle = state.theme === 'dark' ? '#94a3b8' : '#64748b';
    c.fillText(unitB, xR, 88);
    
    c.font = "bold 20px 'Plus Jakarta Sans'";
    c.fillStyle = state.theme === 'dark' ? '#f3f4f6' : '#1e293b';
    c.fillText(valB, xR, y1);
    
    c.fillStyle = isDirect ? '#06b6d4' : '#ec4899';
    c.font = "bold 26px 'Plus Jakarta Sans'";
    c.fillText(`x`, xR, y2);

    // Connecting arrows
    c.strokeStyle = state.theme === 'dark' ? '#64748b' : '#94a3b8';
    c.lineWidth = 3;
    
    const drawArrow = (fromX, fromY, toX, toY) => {
        c.beginPath();
        c.moveTo(fromX, fromY);
        c.lineTo(toX, toY);
        c.stroke();
        c.beginPath();
        c.moveTo(toX - 8, toY - 5);
        c.lineTo(toX, toY);
        c.lineTo(toX - 8, toY + 5);
        c.stroke();
    };

    drawArrow(160, y1, 240, y1);
    drawArrow(160, y2, 240, y2);

    // Dotted math lines helper
    c.strokeStyle = isDirect ? 'rgba(6, 182, 212, 0.45)' : 'rgba(236, 72, 153, 0.45)';
    c.lineWidth = 2.5;
    c.setLineDash([4, 4]);
    
    if (isDirect) {
        c.beginPath();
        c.moveTo(xL + 25, y2 - 10);
        c.lineTo(xR - 25, y1 + 10);
        c.stroke();
        c.beginPath();
        c.arc(xL, y1, 22, 0, 2 * Math.PI);
        c.stroke();
    } else {
        c.beginPath();
        c.moveTo(xL + 25, y1);
        c.lineTo(xR - 25, y1);
        c.stroke();
        c.beginPath();
        c.arc(xL, y2, 22, 0, 2 * Math.PI);
        c.stroke();
    }
    c.setLineDash([]);
}

// LaTeX Math rendering helper
function renderMath(el) {
    if (window.renderMathInElement) {
        window.renderMathInElement(el, {
            delimiters: [
                {left: '$$', right: '$$', display: true},
                {left: '$', right: '$', display: false}
            ],
            throwOnError: false
        });
    } else {
        setTimeout(() => renderMath(el), 50);
    }
}


// ==========================================================================
// NUEVOS GENERADORES: ARITMÉTICA BASE 10, POTENCIACIÓN Y CONVERSIÓN DE UNIDADES
// ==========================================================================

function generateBaseDiezArithmetic(level, index, total) {
    const useVerbal = Math.random() > 0.5;
    
    // Choose type
    const type = ['multiplicacion', 'division', 'suma_resta'][randRange(0, 2)];
    let text = '';
    let correctAnswer = '';
    let choices = [];
    
    if (type === 'multiplicacion') {
        let A, B, N, M;
        const verbalIndex = useVerbal ? getShuffledIndexForTopic('base_diez_mult', 6, index) : -1;
        
        if (verbalIndex === 0) { // Año luz
            A = randRange(2, 6);
            N = randRange(2, 5);
            // (9.5 * 10^12) * (A * 10^N)
            const val1_coef = 9.5;
            const val1_exp = 12;
            const raw_coef = val1_coef * A;
            const raw_exp = val1_exp + N;
            let finalCoef = raw_coef;
            let finalExp = raw_exp;
            if (finalCoef >= 10) {
                finalCoef = parseFloat((finalCoef / 10).toFixed(2));
                finalExp += 1;
            }
            text = `Un año luz equivale aproximadamente a $9.5 \\times 10^{12}$ km. Si una estrella está a $${A} \\times 10^{${N}}$ años luz de la Tierra, ¿cuál es su distancia en kilómetros expresada en notación científica?`;
            correctAnswer = `$${finalCoef} \\times 10^{${finalExp}}$`;
            choices = [
                correctAnswer,
                `$${raw_coef.toFixed(1)} \\times 10^{${val1_exp * N}}$`,
                `$${finalCoef} \\times 10^{${finalExp + 2}}$`,
                `$${(val1_coef + A).toFixed(1)} \\times 10^{${finalExp}}$`
            ];
        } else if (verbalIndex === 3) { // Velocidad de la luz
            A = randRange(2, 8);
            N = randRange(1, 4);
            // (3 * 10^8) * (A * 10^N)
            const val1_coef = 3;
            const val1_exp = 8;
            const raw_coef = val1_coef * A;
            const raw_exp = val1_exp + N;
            let finalCoef = raw_coef;
            let finalExp = raw_exp;
            if (finalCoef >= 10) {
                finalCoef = parseFloat((finalCoef / 10).toFixed(1));
                finalExp += 1;
            }
            text = `La velocidad de la luz en el vacío es de $3 \\times 10^8$ m/s. Si una señal electromagnética tarda $${A} \\times 10^{${N}}$ segundos en viajar desde un planeta, ¿qué distancia en metros recorrió en notación científica?`;
            correctAnswer = `$${finalCoef} \\times 10^{${finalExp}}$`;
            choices = [
                correctAnswer,
                `$${raw_coef} \\times 10^{${val1_exp * N}}$`,
                `$${finalCoef} \\times 10^{${finalExp - 1}}$`,
                `$${val1_coef + A} \\times 10^{${finalExp}}$`
            ];
        } else {
            // General multiplication templates (verbal or direct)
            A = randRange(2, 5);
            B = randRange(2, 6);
            N = randRange(-4, 6) || 2;
            M = randRange(-4, 6) || 1;
            const raw_coef = A * B;
            const raw_exp = N + M;
            let finalCoef = raw_coef;
            let finalExp = raw_exp;
            if (finalCoef >= 10) {
                finalCoef = parseFloat((finalCoef / 10).toFixed(1));
                finalExp += 1;
            }
            correctAnswer = `$${finalCoef} \\times 10^{${finalExp}}$`;
            choices = [
                correctAnswer,
                `$${raw_coef} \\times 10^{${N * M}}$`,
                `$${finalCoef} \\times 10^{${finalExp + 2}}$`,
                `$${A + B} \\times 10^{${finalExp}}$`
            ];
            
            if (verbalIndex === 1) { // Masa bacterias
                text = `La masa de una sola bacteria es de $${A} \\times 10^{-12}$ gramos. Si un cultivo contiene $${B} \\times 10^{${N + 8}}$ bacterias, ¿cuál es la masa total del cultivo en gramos en notación científica?`;
                // Recalculate with adjusted exponent for realistic scale
                const adjM = N + 8;
                const adj_raw_exp = -12 + adjM;
                let adj_finalCoef = raw_coef;
                let adj_finalExp = adj_raw_exp;
                if (adj_finalCoef >= 10) {
                    adj_finalCoef = parseFloat((adj_finalCoef / 10).toFixed(1));
                    adj_finalExp += 1;
                }
                correctAnswer = `$${adj_finalCoef} \\times 10^{${adj_finalExp}}$`;
                choices = [
                    correctAnswer,
                    `$${raw_coef} \\times 10^{${-12 * adjM}}$`,
                    `$${adj_finalCoef} \\times 10^{${adj_finalExp + 1}}$`,
                    `$${A + B} \\times 10^{${adj_finalExp}}$`
                ];
            } else if (verbalIndex === 2) { // Glóbulos rojos
                text = `El diámetro de un glóbulo rojo es de $${A} \\times 10^{-6}$ metros. Si colocamos $${B} \\times 10^{${N + 4}}$ glóbulos rojos en fila, ¿qué longitud total en metros alcanzarían en notación científica?`;
                const adjM = N + 4;
                const adj_raw_exp = -6 + adjM;
                let adj_finalCoef = raw_coef;
                let adj_finalExp = adj_raw_exp;
                if (adj_finalCoef >= 10) {
                    adj_finalCoef = parseFloat((adj_finalCoef / 10).toFixed(1));
                    adj_finalExp += 1;
                }
                correctAnswer = `$${adj_finalCoef} \\times 10^{${adj_finalExp}}$`;
                choices = [
                    correctAnswer,
                    `$${raw_coef} \\times 10^{${-6 * adjM}}$`,
                    `$${adj_finalCoef} \\times 10^{${adj_finalExp - 2}}$`,
                    `$${A + B} \\times 10^{${adj_finalExp}}$`
                ];
            } else if (verbalIndex === 4) { // Supercomputadora
                text = `Una supercomputadora realiza $${A} \\times 10^{${N + 6}}$ operaciones por segundo. ¿Cuántas operaciones realizará en un lapso de $${B} \\times 10^{${Math.abs(M) + 1}}$ segundos?`;
                const adjM = Math.abs(M) + 1;
                const adjN = N + 6;
                const adj_raw_exp = adjN + adjM;
                let adj_finalCoef = raw_coef;
                let adj_finalExp = adj_raw_exp;
                if (adj_finalCoef >= 10) {
                    adj_finalCoef = parseFloat((adj_finalCoef / 10).toFixed(1));
                    adj_finalExp += 1;
                }
                correctAnswer = `$${adj_finalCoef} \\times 10^{${adj_finalExp}}$`;
                choices = [
                    correctAnswer,
                    `$${raw_coef} \\times 10^{${adjN * adjM}}$`,
                    `$${adj_finalCoef} \\times 10^{${adj_finalExp + 2}}$`,
                    `$${A + B} \\times 10^{${adj_finalExp}}$`
                ];
            } else if (verbalIndex === 5) { // Colisiones de protones
                text = `Un colisionador produce $${A} \\times 10^{${N + 7}}$ choques de partículas por segundo, liberando $${B} \\times 10^{${Math.abs(M) + 2}}$ julios de energía por choque. ¿Qué energía total en julios se libera por segundo?`;
                const adjM = Math.abs(M) + 2;
                const adjN = N + 7;
                const adj_raw_exp = adjN + adjM;
                let adj_finalCoef = raw_coef;
                let adj_finalExp = adj_raw_exp;
                if (adj_finalCoef >= 10) {
                    adj_finalCoef = parseFloat((adj_finalCoef / 10).toFixed(1));
                    adj_finalExp += 1;
                }
                correctAnswer = `$${adj_finalCoef} \\times 10^{${adj_finalExp}}$`;
                choices = [
                    correctAnswer,
                    `$${raw_coef} \\times 10^{${adjN * adjM}}$`,
                    `$${adj_finalCoef} \\times 10^{${adj_finalExp - 1}}$`,
                    `$${A + B} \\times 10^{${adj_finalExp}}$`
                ];
            } else { // Direct calculation
                text = `Calcula el resultado en notación científica:\n$$ (${A} \\times 10^{${N}}) \\times (${B} \\times 10^{${M}}) $$`;
            }
        }
    } else if (type === 'division') {
        let A, B, N, M;
        const verbalIndex = useVerbal ? getShuffledIndexForTopic('base_diez_div', 3, index) : -1;
        
        if (verbalIndex === 1) { // Sonda espacial
            const V = [2, 3, 5, 6][randRange(0, 3)];
            const expM = randRange(2, 4);
            const val1_coef = 1.5;
            const val1_exp = 8;
            
            const raw_coef = val1_coef / V;
            const raw_exp = val1_exp - expM;
            let finalCoef = raw_coef;
            let finalExp = raw_exp;
            if (finalCoef < 1) {
                finalCoef = parseFloat((finalCoef * 10).toFixed(1));
                finalExp -= 1;
            }
            text = `La distancia de la Tierra a una sonda espacial es de $1.5 \\times 10^8$ km. Si la sonda viaja a una velocidad de $${V} \\times 10^{${expM}}$ km/h, ¿cuántas horas tardará en regresar en notación científica?`;
            correctAnswer = `$${finalCoef} \\times 10^{${finalExp}}$`;
            choices = [
                correctAnswer,
                `$${(val1_coef * V).toFixed(1)} \\times 10^{${val1_exp + expM}}$`,
                `$${finalCoef} \\times 10^{${finalExp + 1}}$`,
                `$${(val1_coef - 0.5).toFixed(1)} \\times 10^{${finalExp}}$`
            ];
        } else {
            // Division templates (verbal or direct)
            B = randRange(2, 5);
            const ansCoef = randRange(2, 6);
            A = B * ansCoef;
            N = randRange(-3, 6) || 3;
            M = randRange(-3, 6) || 2;
            
            const raw_coef = ansCoef;
            const raw_exp = N - M;
            let finalCoef = raw_coef;
            let finalExp = raw_exp;
            if (finalCoef >= 10) {
                finalCoef = parseFloat((finalCoef / 10).toFixed(1));
                finalExp += 1;
            }
            correctAnswer = `$${finalCoef} \\times 10^{${finalExp}}$`;
            choices = [
                correctAnswer,
                `$${finalCoef} \\times 10^{${N + M}}$`,
                `$${(A - B).toFixed(1)} \\times 10^{${finalExp}}$`,
                `$${finalCoef} \\times 10^{${N - M - 1}}$`
            ];
            
            if (verbalIndex === 0) { // Chips density
                text = `Un procesador microelectrónico contiene $${A} \\times 10^{${N + 6}}$ transistores en una superficie de $${B} \\times 10^{${Math.abs(M)}}$ mm². ¿Cuál es la densidad promedio de transistores por mm² en notación científica?`;
                const adjN = N + 6;
                const adjM = Math.abs(M);
                const adj_raw_exp = adjN - adjM;
                let adj_finalCoef = raw_coef;
                let adj_finalExp = adj_raw_exp;
                if (adj_finalCoef >= 10) {
                    adj_finalCoef = parseFloat((adj_finalCoef / 10).toFixed(1));
                    adj_finalExp += 1;
                }
                correctAnswer = `$${adj_finalCoef} \\times 10^{${adj_finalExp}}$`;
                choices = [
                    correctAnswer,
                    `$${adj_finalCoef} \\times 10^{${adjN + adjM}}$`,
                    `$${(A - B).toFixed(1)} \\times 10^{${adj_finalExp}}$`,
                    `$${adj_finalCoef} \\times 10^{${adj_finalExp - 1}}$`
                ];
            } else if (verbalIndex === 2) { // Reserva de agua
                text = `Un depósito de irrigación agrícola tiene $${A} \\times 10^{${N + 5}}$ litros de agua. Si se reparte equitativamente entre $${B} \\times 10^{${Math.abs(M) + 1}}$ parcelas de cultivo, ¿cuántos litros de agua recibe cada parcela en notación científica?`;
                const adjN = N + 5;
                const adjM = Math.abs(M) + 1;
                const adj_raw_exp = adjN - adjM;
                let adj_finalCoef = raw_coef;
                let adj_finalExp = adj_raw_exp;
                if (adj_finalCoef >= 10) {
                    adj_finalCoef = parseFloat((adj_finalCoef / 10).toFixed(1));
                    adj_finalExp += 1;
                }
                correctAnswer = `$${adj_finalCoef} \\times 10^{${adj_finalExp}}$`;
                choices = [
                    correctAnswer,
                    `$${adj_finalCoef} \\times 10^{${adjN + adjM}}$`,
                    `$${(A / B).toFixed(1)} \\times 10^{${adj_finalExp + 1}}$`,
                    `$${adj_finalCoef} \\times 10^{${adj_finalExp - 1}}$`
                ];
            } else { // Direct calculation
                text = `Calcula el resultado en notación científica:\n$$ (${A} \\times 10^{${N}}) \\div (${B} \\times 10^{${M}}) $$`;
            }
        }
    } else { // suma_resta
        const verbalIndex = useVerbal ? getShuffledIndexForTopic('base_diez_sum', 2, index) : -1;
        
        if (verbalIndex === 0) { // Tierra y Luna
            text = `La masa de la Tierra es de $5.97 \\times 10^{24}$ kg y la de la Luna es de $7.34 \\times 10^{22}$ kg. Calcula la masa combinada de ambos cuerpos en notación científica.`;
            correctAnswer = `$6.04 \\times 10^{24}$`;
            choices = [
                correctAnswer,
                `$13.31 \\times 10^{46}$`,
                `$6.04 \\times 10^{22}$`,
                `$5.97 \\times 10^{46}$`
            ];
        } else {
            const N = randRange(-3, 4);
            const M = level <= 4 ? N : N + (Math.random() > 0.5 ? 1 : -1);
            
            let A = randRange(1, 8);
            let B = randRange(1, 8);
            let isSum = Math.random() > 0.5;
            
            if (!isSum) {
                const valA = A * Math.pow(10, N);
                const valB = B * Math.pow(10, M);
                if (valB > valA) {
                    const tempA = A; A = B; B = tempA;
                    const tempN = N; N = M; M = tempN;
                }
            }

            const valA = A * Math.pow(10, N);
            const valB = B * Math.pow(10, M);
            const result = isSum ? valA + valB : valA - valB;

            let coefResult = 0;
            let expResult = 0;
            
            if (result === 0) {
                coefResult = 0;
                expResult = 0;
            } else {
                expResult = Math.floor(Math.log10(Math.abs(result)));
                coefResult = parseFloat((result / Math.pow(10, expResult)).toFixed(2));
            }

            correctAnswer = `$${coefResult} \\times 10^{${expResult}}$`;
            choices = [
                correctAnswer,
                `$${isSum ? A + B : A - B} \\times 10^{${N + M}}$`,
                `$${coefResult} \\times 10^{${expResult + 1}}$`,
                `$${isSum ? A * B : A - B} \\times 10^{${Math.max(N, M)}}$`
            ];
            
            if (verbalIndex === 1) { // Botellas plásticas
                const adjN = N + 5;
                const adjM = M + 4;
                const adjValA = A * Math.pow(10, adjN);
                const adjValB = B * Math.pow(10, adjM);
                const adjResult = adjValA - adjValB;
                let adjCoef = 0, adjExp = 0;
                if (adjResult > 0) {
                    adjExp = Math.floor(Math.log10(adjResult));
                    adjCoef = parseFloat((adjResult / Math.pow(10, adjExp)).toFixed(2));
                }
                text = `Una metrópolis genera $${A} \\times 10^{${adjN}}$ botellas plásticas al año. Si gracias a campañas ecológicas se logran reciclar $${B} \\times 10^{${adjM}}$ botellas, ¿cuántas botellas NO se reciclan en dicho año en notación científica?`;
                correctAnswer = `$${adjCoef} \\times 10^{${adjExp}}$`;
                choices = [
                    correctAnswer,
                    `$${A - B} \\times 10^{${adjN - adjM}}$`,
                    `$${adjCoef} \\times 10^{${adjExp + 1}}$`,
                    `$${A - B} \\times 10^{${adjN}}$`
                ];
            } else { // Direct calculation
                text = `Calcula el resultado en notación científica:\n$$ (${A} \\times 10^{${N}}) ${isSum ? '+' : '-'} (${B} \\times 10^{${M}}) $$`;
            }
        }
    }

    const uniqueChoices = [...new Set(choices)];
    while (uniqueChoices.length < 4) {
        uniqueChoices.push(`$${randRange(1, 9)} \\times 10^{${randRange(-3, 6)}}$`);
    }

    return {
        text: text,
        correctAnswer: correctAnswer,
        inputType: 'multiple-choice',
        choices: shuffleArray(uniqueChoices),
        topicLabel: 'Aritmética en Base 10'
    };
}

function generatePotenciacionPropiedades(level, index, total) {
    const propIdx = getShuffledIndexForTopic('potenciacion_properties', 7, index);
    const isFrac = Math.random() > 0.5;
    
    // Generate values
    const baseVal = randRange(2, 6);
    let aVal = randRange(2, 5);
    let bVal = randRange(2, 5);
    while (bVal === aVal) {
        bVal = randRange(2, 5);
    }
    
    const makeBaseTex = () => {
        return isFrac ? `\\left(\\frac{${aVal}}{${bVal}}\\right)` : `${baseVal}`;
    };
    
    const makePowerTex = (exp) => {
        const expStr = exp < 0 ? `{${exp}}` : `${exp}`;
        return `${makeBaseTex()}^{${expStr}}`;
    };
    
    let text = '';
    let correctAnswer = '';
    let choices = [];
    
    const useVerbal = Math.random() > 0.5;
    const verbalIdx = useVerbal ? getShuffledIndexForTopic('potenciacion_verbal', 10, index) : -1;
    
    switch (propIdx) {
        case 0: { // Multiplicación de bases iguales: base^n * base^m = base^{n+m}
            const n = randRange(2, 5);
            const m = randRange(2, 5);
            const sumExp = n + m;
            
            correctAnswer = `$${makePowerTex(sumExp)}$`;
            choices = [
                correctAnswer,
                `$${makePowerTex(n * m)}$`,
                isFrac 
                    ? `$\\left(\\frac{${aVal * aVal}}{${bVal * bVal}}\\right)^{${sumExp}}$` 
                    : `$${baseVal * baseVal}^{${sumExp}}$`,
                `$${makePowerTex(Math.abs(n - m))}$`
            ];
            
            if (verbalIdx === 0) {
                text = `Un cultivo de bacterias tiene una población inicial de $${makePowerTex(m)}$. Si cada hora su población se multiplica por un factor de $${makePowerTex(n)}$, ¿cuál será la población total después de una hora expresada como una sola potencia?`;
            } else if (verbalIdx === 7) {
                text = `Un estudiante calcula la cantidad de energía liberada en un proceso físico multiplicando $${makePowerTex(n)}$ por $${makePowerTex(m)}$. Expresa el resultado final como una sola potencia.`;
            } else {
                text = `Simplifica aplicando las propiedades de la potenciación:\n$$ ${makePowerTex(n)} \\times ${makePowerTex(m)} $$`;
            }
            break;
        }
        case 1: { // División de bases iguales: base^n / base^m = base^{n-m}
            const n = randRange(5, 8);
            const m = randRange(2, 4);
            const diffExp = n - m;
            
            correctAnswer = `$${makePowerTex(diffExp)}$`;
            choices = [
                correctAnswer,
                `$${makePowerTex(n + m)}$`,
                `$1$`,
                `$${makePowerTex(n * m)}$`
            ];
            
            if (verbalIdx === 2) {
                text = `El volumen inicial de agua en un tanque experimental es de $${makePowerTex(n)}$ litros. Si debido al drenaje el volumen se reduce dividiéndose entre $${makePowerTex(m)}$, ¿cuál es el volumen final de agua expresado como una sola potencia?`;
            } else {
                text = `Simplifica aplicando las propiedades de la potenciación:\n$$ ${makePowerTex(n)} \\div ${makePowerTex(m)} $$`;
            }
            break;
        }
        case 2: { // Potencia de una potencia: (base^n)^m = base^{n*m}
            const n = randRange(2, 4);
            const m = randRange(2, 4);
            const prodExp = n * m;
            
            correctAnswer = `$${makePowerTex(prodExp)}$`;
            choices = [
                correctAnswer,
                `$${makePowerTex(n + m)}$`,
                isFrac 
                    ? `$\\left(\\frac{${aVal * aVal}}{${bVal * bVal}}\\right)^{${prodExp}}$` 
                    : `$${baseVal * baseVal}^{${prodExp}}$`,
                `$${makePowerTex(Math.pow(n, m))}$`
            ];
            
            if (verbalIdx === 1) {
                text = `En un reactor físico, una partícula se subdivide en $${makePowerTex(n)}$ fragmentos, y posteriormente cada fragmento se divide en otros $${makePowerTex(m)}$ micro fragmentos. Expresa la cantidad total de micro fragmentos como una sola potencia de la base original.`;
            } else if (verbalIdx === 5) {
                text = `Un algoritmo de cifrado toma una clave, la eleva al exponente $${n}$ y luego el resultado lo vuelve a elevar al exponente $${m}$. Expresa la operación final sobre la clave como una sola potencia.`;
            } else {
                text = `Simplifica aplicando las propiedades de la potenciación:\n$$ \\left(${makePowerTex(n)}\\right)^{${m}} $$`;
            }
            break;
        }
        case 3: { // Exponente negativo: base^-n = 1/base^n or (b/a)^n
            const n = randRange(2, 4);
            
            if (isFrac) {
                correctAnswer = `$\\left(\\frac{${bVal}}{${aVal}}\\right)^{${n}}$`;
                choices = [
                    correctAnswer,
                    `$\\left(\\frac{${aVal}}{${bVal}}\\right)^{${n}}$`,
                    `$-\\left(\\frac{${aVal}}{${bVal}}\\right)^{${n}}$`,
                    `$-\\left(\\frac{${bVal}}{${aVal}}\\right)^{${n}}$`
                ];
            } else {
                correctAnswer = `$\\frac{1}{${baseVal}^{${n}}}$`;
                choices = [
                    correctAnswer,
                    `$-${baseVal}^{${n}}$`,
                    `$${baseVal}^{${n}}$`,
                    `$-\\frac{1}{${baseVal}^{${n}}}$`
                ];
            }
            
            if (verbalIdx === 3) {
                text = `La intensidad de una señal se atenúa por un factor de $${makePowerTex(-n)}$ al atravesar una barrera. Expresa este factor de atenuación utilizando un exponente positivo.`;
            } else if (verbalIdx === 6) {
                text = `Un lote de vacunas pierde efectividad por un factor de $${makePowerTex(-n)}$ debido a la temperatura ambiente. Expresa este factor de pérdida con un exponente positivo.`;
            } else {
                text = `Expresa con exponente positivo:\n$$ ${makePowerTex(-n)} $$`;
            }
            break;
        }
        case 4: { // Potencia de un cociente: (a/b)^n = a^n / b^n
            const n = randRange(2, 4);
            correctAnswer = `$\\frac{${aVal}^{${n}}}{${bVal}^{${n}}}$`;
            choices = [
                correctAnswer,
                `$\\frac{${aVal * n}}{${bVal * n}}$`,
                `$\\frac{${aVal}^{${n}}}{${bVal}}$`,
                `$\\frac{${aVal}}{${bVal}^{${n}}}$`
            ];
            
            if (verbalIdx === 4) {
                text = `Se tiene un contenedor cúbico de juguete cuya arista mide $\\frac{${aVal}}{${bVal}}$ metros. Si su volumen se calcula como $\\left(\\frac{${aVal}}{${bVal}}\\right)^{${n}}$, expresa esta potencia aplicando la potencia de un cociente.`;
            } else if (verbalIdx === 9) {
                text = `El área de un terreno cuadrado de lado $\\frac{${aVal}}{${bVal}}$ kilómetros se representa como $\\left(\\frac{${aVal}}{${bVal}}\\right)^{2}$. Expresa esta área como el cociente de los cuadrados de sus lados.`;
                correctAnswer = `$\\frac{${aVal}^{2}}{${bVal}^{2}}$`;
                choices = [
                    correctAnswer,
                    `$\\frac{${aVal * 2}}{${bVal * 2}}$`,
                    `$\\frac{${aVal}^{2}}{${bVal}}$`,
                    `$\\frac{${aVal}}{${bVal}^{2}}$`
                ];
            } else {
                text = `Aplica la propiedad de potencia de un cociente:\n$$ \\left(\\frac{${aVal}}{${bVal}}\\right)^{${n}} $$`;
            }
            break;
        }
        case 5: { // Exponente cero: base^0 = 1
            correctAnswer = `$1$`;
            choices = [
                correctAnswer,
                `$0$`,
                `$${makeBaseTex()}$`,
                `$-1$`
            ];
            
            if (verbalIdx === 8) {
                text = `Un físico determina que el factor de decaimiento cuántico relativo de una subpartícula está dado por la expresión $${makePowerTex(0)}$. ¿A qué valor numérico equivale este factor?`;
            } else {
                text = `Simplifica aplicando las propiedades de la potenciación:\n$$ \\left(${makeBaseTex()}\\right)^{0} $$`;
            }
            break;
        }
        case 6: { // Exponente uno: base^1 = base
            correctAnswer = `$${makeBaseTex()}$`;
            choices = [
                correctAnswer,
                `$1$`,
                isFrac 
                    ? `$\\left(\\frac{${aVal * aVal}}{${bVal * bVal}}\\right)$` 
                    : `$${baseVal * baseVal}$`,
                isFrac 
                    ? `$-\\left(\\frac{${aVal}}{${bVal}}\\right)$` 
                    : `$-${baseVal}$`
            ];
            
            if (verbalIdx === 8) {
                text = `Un algoritmo de compresión reduce el tamaño de un archivo por un factor de $${makePowerTex(1)}$. Expresa este factor de reducción en su forma más simple.`;
            } else {
                text = `Simplifica aplicando las propiedades de la potenciación:\n$$ ${makePowerTex(1)} $$`;
            }
            break;
        }
    }
    
    const uniqueChoices = [...new Set(choices)];
    while (uniqueChoices.length < 4) {
        const randBase = randRange(2, 10);
        const randExp = randRange(2, 5);
        uniqueChoices.push(`$${randBase}^{${randExp}}$`);
    }
    
    return {
        text: text,
        correctAnswer: correctAnswer,
        inputType: 'multiple-choice',
        choices: shuffleArray(uniqueChoices),
        topicLabel: 'Propiedades de la Potenciación'
    };
}

function generateConversionUnidadesQuestion(topic, level, options, index, total) {
    let text = '';
    let correctAnswer = '';
    let choices = [];

    const verbalIdx = getShuffledIndexForTopic(topic + '_verbal', 10, index);

    if (topic === 'matematicas_conversion') {
        let type = 'base_bin_dec';
        if (verbalIdx === 2 || verbalIdx === 3) type = 'base_dec_bin';
        else if (verbalIdx === 4 || verbalIdx === 5) type = 'base_hex_dec';
        else if (verbalIdx === 6 || verbalIdx === 7) type = 'base_dec_hex';
        else if (verbalIdx === 8 || verbalIdx === 9) type = 'grados_rad';

        if (type === 'base_bin_dec') {
            const val = randRange(5, 30);
            const bin = val.toString(2);
            correctAnswer = val.toString();
            choices = [
                correctAnswer,
                (val + randRange(-3, 3) || val + 1).toString(),
                (val * 2).toString(),
                (val + 5).toString()
            ];
            
            if (verbalIdx === 0) {
                text = `Un microprocesador lee una señal de sensor codificada en binario como $${bin}₂$. Para procesarla, la convierte a base decimal (10). ¿Qué valor obtiene?`;
            } else {
                text = `Un algoritmo criptográfico procesa bloques de datos. Convierte el número binario $${bin}₂$ a su valor equivalente en base decimal (10).`;
            }
        } else if (type === 'base_dec_bin') {
            const val = randRange(5, 30);
            const bin = val.toString(2);
            correctAnswer = bin;
            choices = [
                correctAnswer,
                (val + 1).toString(2),
                (val - 1).toString(2),
                bin + "0"
            ];
            
            if (verbalIdx === 2) {
                text = `Un programador de sistemas embebidos necesita transmitir el número decimal $${val}₁₀$ a través de un bus de datos en formato binario. ¿Qué secuencia transmitirá?`;
            } else {
                text = `En una red de comunicación industrial, se requiere expresar el valor de sensor decimal $${val}₁₀$ en código binario (base 2). ¿Cuál es la representación correcta?`;
            }
        } else if (type === 'base_hex_dec') {
            const val = randRange(15, 100);
            const hex = val.toString(16).toUpperCase();
            correctAnswer = val.toString();
            choices = [
                correctAnswer,
                (val + randRange(-5, 5) || val + 2).toString(),
                (val + 10).toString(),
                (val - 10).toString()
            ];
            
            if (verbalIdx === 4) {
                text = `Un programador analiza una dirección de memoria física indicada en hexadecimal como $${hex}₁₆$. ¿A qué dirección equivale en base decimal (10)?`;
            } else {
                text = `Al depurar un programa en lenguaje ensamblador, se lee el registro con el valor hexadecimal $${hex}₁₆$. Convierte dicho número a sistema decimal.`;
            }
        } else if (type === 'base_dec_hex') {
            const val = randRange(15, 100);
            const hex = val.toString(16).toUpperCase();
            correctAnswer = hex;
            choices = [
                correctAnswer,
                (val + 1).toString(16).toUpperCase(),
                (val - 1).toString(16).toUpperCase(),
                (val + 16).toString(16).toUpperCase()
            ];
            
            if (verbalIdx === 6) {
                text = `Para configurar el brillo de un color en formato CSS, se requiere ingresar en hexadecimal el valor decimal de intensidad $${val}₁₀$. ¿Cuál es su código hexadecimal correspondiente?`;
            } else {
                text = `La escala de colores de una pantalla digital mapea el brillo de píxel con el número decimal $${val}₁₀$. Expresa este brillo en base hexadecimal (16).`;
            }
        } else { // grados_rad
            const commonAngles = [
                { deg: 30, rad: '\\pi/6 rad' },
                { deg: 45, rad: '\\pi/4 rad' },
                { deg: 60, rad: '\\pi/3 rad' },
                { deg: 90, rad: '\\pi/2 rad' },
                { deg: 120, rad: '2\\pi/3 rad' },
                { deg: 135, rad: '3\\pi/4 rad' },
                { deg: 150, rad: '5\\pi/6 rad' },
                { deg: 180, rad: '\\pi rad' },
                { deg: 270, rad: '3\\pi/2 rad' },
                { deg: 360, rad: '2\\pi rad' }
            ];
            const selectAngle = commonAngles[randRange(0, commonAngles.length - 1)];
            correctAnswer = `$${selectAngle.rad}$`;
            choices = [
                correctAnswer,
                `$${selectAngle.rad.replace('\\pi', '2\\pi')}$`,
                `$${selectAngle.rad.replace('/', ' / 2')}$`,
                `$\\pi rad$`
            ];
            
            if (verbalIdx === 8) {
                text = `Un brazo robótico industrial gira un ángulo de $${selectAngle.deg}^\\circ$ en su articulación principal. Expresa este ángulo en radianes.`;
            } else {
                text = `Una rueda de bicicleta completa un giro parcial describiendo un arco de $${selectAngle.deg}^\\circ$ sexagesimales. Convierte esta medida a radianes.`;
            }
        }
    } else if (topic === 'fisica_conversion') {
        let subfield = 'velocidad';
        if (verbalIdx >= 2 && verbalIdx <= 4) subfield = 'temperatura';
        else if (verbalIdx === 5 || verbalIdx === 6) subfield = 'fuerza';
        else if (verbalIdx >= 7 && verbalIdx <= 9) subfield = 'energia';

        if (subfield === 'velocidad') {
            const direction = verbalIdx === 0;
            if (direction) {
                const ms = randRange(1, 10) * 5;
                const kmh = ms * 3.6;
                text = `Un tren bala de alta velocidad viaja a una rapidez constante de $${ms}$ m/s. Expresa esta velocidad en kilómetros por hora (km/h).`;
                correctAnswer = kmh.toString();
                choices = [correctAnswer, (ms * 3).toString(), (ms * 4).toString(), (kmh - 10).toString()];
            } else {
                const kmh = randRange(1, 10) * 18;
                const ms = kmh / 3.6;
                text = `En una autopista de pruebas, un vehículo deportivo alcanza una velocidad máxima de $${kmh}$ km/h. ¿Cuál es su equivalencia en metros por segundo (m/s)?`;
                correctAnswer = ms.toString();
                choices = [correctAnswer, (ms + 5).toString(), (ms - 5).toString(), (kmh / 3).toString()];
            }
        } else if (subfield === 'temperatura') {
            const type = verbalIdx - 2;
            if (type === 0) {
                const C = randRange(0, 8) * 5;
                const F = (C * 1.8) + 32;
                text = `Una reacción de laboratorio requiere calentar una probeta de ensayo hasta los $${C}$ °C. ¿Cuál es la temperatura equivalente en grados Fahrenheit (°F)?`;
                correctAnswer = F.toString();
                choices = [correctAnswer, (C + 32).toString(), (C * 2 + 32).toString(), (F - 10).toString()];
            } else if (type === 1) {
                const C = randRange(0, 8) * 5;
                const F = (C * 1.8) + 32;
                text = `La temperatura recomendada de conservación para un semiconductor es de $${F}$ °F. Expresa este límite térmico en grados Celsius (°C).`;
                correctAnswer = C.toString();
                choices = [correctAnswer, (F - 32).toString(), (C + 5).toString(), (C - 5).toString()];
            } else {
                const C = randRange(-20, 100);
                const K = parseFloat((C + 273.15).toFixed(2));
                text = `Un sensor criogénico mide la temperatura de una muestra de nitrógeno obteniendo $${C}$ °C. Conviértela a la escala absoluta Kelvin (K).`;
                correctAnswer = K.toString();
                choices = [correctAnswer, (C + 273).toString(), (C - 273.15).toString(), (C + 100).toString()];
            }
        } else if (subfield === 'fuerza') {
            const type = verbalIdx === 5;
            if (type) {
                const N = randRange(1, 10);
                const dyn = N * 100000;
                text = `Un pistón neumático ejerce una fuerza de empuje de $${N}$ Newtons. Convierte esta fuerza a Dinas (dyn) para los cálculos de microescala ($1\\text{ N} = 10^5\\text{ dyn}$).`;
                correctAnswer = dyn.toString();
                choices = [correctAnswer, (N * 10000).toString(), (N * 1000000).toString(), (N * 1000).toString()];
            } else {
                const kgf = randRange(1, 10);
                const N = parseFloat((kgf * 9.8).toFixed(1));
                text = `Una grúa eleva una carga metálica ejerciendo una tensión de $${kgf}$ kilogramos-fuerza. Convierte este registro a Newtons (N) usando la equivalencia $1\\text{ kgf} = 9.8\\text{ N}$.`;
                correctAnswer = N.toString();
                choices = [correctAnswer, (kgf * 10).toString(), (kgf * 9).toString(), (N + 5).toString()];
            }
        } else {
            const type = verbalIdx === 7 || verbalIdx === 8;
            if (type) {
                const cal = randRange(5, 50) * 2;
                const J = parseFloat((cal * 4.18).toFixed(2));
                text = `Un proceso de combustión en una caldera libera una cantidad calórica de $${cal}$ calorías. Convierte esta energía a julios (J) sabiendo que $1\\text{ cal} = 4.18\\text{ J}$.`;
                correctAnswer = J.toString();
                choices = [correctAnswer, (cal * 4).toString(), (cal * 4.5).toString(), (J + 10).toString()];
            } else {
                const Wh = randRange(1, 5);
                const J = Wh * 3600;
                text = `Un módulo electrónico consume $${Wh}$ Vatios-hora de energía durante su ciclo operativo. Expresa este gasto energético en julios (J) sabiendo que $1\\text{ Wh} = 3600\\text{ J}$.`;
                correctAnswer = J.toString();
                choices = [correctAnswer, (Wh * 1000).toString(), (Wh * 360).toString(), (J + 3600).toString()];
            }
        }
    } else if (topic === 'quimica_conversion') {
        let subfield = 'volumen';
        if (verbalIdx === 2 || verbalIdx === 3) subfield = 'moles_mmol';
        else if (verbalIdx === 4 || verbalIdx === 5) subfield = 'presion';
        else if (verbalIdx >= 6) subfield = 'moles_gramos';

        if (subfield === 'volumen') {
            const type = verbalIdx === 0;
            if (type) {
                const L = randRange(1, 12) * 0.5;
                const mL = L * 1000;
                text = `Un matraz aforado en un laboratorio de química analítica contiene $${L}$ litros de una solución ácida. Expresa este volumen en mililitros (mL).`;
                correctAnswer = mL.toString();
                choices = [correctAnswer, (mL / 10).toString(), (mL * 10).toString(), (L * 100).toString()];
            } else {
                const m3 = randRange(1, 5);
                const L = m3 * 1000;
                text = `Un tanque de almacenamiento en una planta petroquímica tiene capacidad para $${m3}$ metros cúbicos ($m^3$) de gas. ¿A cuántos litros ($L$) equivale este volumen? ($1\\text{ m}^3 = 1000\\text{ L}$)`;
                correctAnswer = L.toString();
                choices = [correctAnswer, (L / 10).toString(), (L * 10).toString(), (m3 * 100).toString()];
            }
        } else if (subfield === 'moles_mmol') {
            const mol = randRange(1, 15) * 0.1;
            const mmol = Math.round(mol * 1000);
            text = `Una solución amortiguadora se prepara disolviendo $${mol.toFixed(1)}$ moles de reactivo. Convierte esta cantidad de sustancia a milimoles (mmol) para el cálculo de concentración.`;
            correctAnswer = mmol.toString();
            choices = [correctAnswer, (mmol / 10).toString(), (mmol * 10).toString(), (mol * 100).toString()];
        } else if (subfield === 'presion') {
            const type = verbalIdx === 4;
            if (type) {
                const atm = randRange(1, 4) * 0.5;
                const mmHg = atm * 760;
                text = `La presión medida en una cámara de destilación de gases al vacío es de $${atm}$ atmósferas. Expresa este valor en milímetros de mercurio (mmHg) ($1\\text{ atm} = 760\\text{ mmHg}$).`;
                correctAnswer = mmHg.toString();
                choices = [correctAnswer, (atm * 700).toString(), (mmHg + 100).toString(), (mmHg - 100).toString()];
            } else {
                const atm = randRange(1, 3);
                const Pa = atm * 101325;
                text = `Un reactor autoclave opera a una presión de seguridad de $${atm}$ atmósferas. Convierte esta lectura de presión a Pascales (Pa) ($1\\text{ atm} = 101325\\text{ Pa}$).`;
                correctAnswer = Pa.toString();
                choices = [correctAnswer, (atm * 100000).toString(), (Pa + 1000).toString(), (Pa - 1000).toString()];
            }
        } else {
            const substances = [
                { name: 'Agua ($H_2O$)', mw: 18 },
                { name: 'Dióxido de Carbono ($CO_2$)', mw: 44 },
                { name: 'Cloruro de Sodio ($NaCl$)', mw: 58.5 },
                { name: 'Oxígeno Gas ($O_2$)', mw: 32 }
            ];
            const sub = substances[verbalIdx - 6];
            const moles = randRange(2, 5);
            const grams = moles * sub.mw;
            text = `Un laboratorista necesita pesar exactamente $${moles}$ moles de la sustancia ${sub.name} (Peso Molecular = $${sub.mw}$ g/mol). ¿Cuál es la masa equivalente de la muestra en gramos que debe medir?`;
            correctAnswer = grams.toString();
            choices = [correctAnswer, (grams + sub.mw).toString(), (grams - sub.mw).toString(), (moles * 10).toString()];
        }
    } else {
        let subfield = 'almacenamiento';
        if (verbalIdx >= 4 && verbalIdx <= 6) subfield = 'caudal';
        else if (verbalIdx >= 7) subfield = 'potencia';

        if (subfield === 'almacenamiento') {
            const type = verbalIdx % 2 === 0;
            if (type) {
                const GB = randRange(1, 5) * 2;
                const MB = GB * 1024;
                text = `Un servidor virtual tiene una partición asignada para almacenamiento temporal de $${GB}$ GB. Convierte esta capacidad a Megabytes (MB) sabiendo que $1\\text{ GB} = 1024\\text{ MB}$.`;
                correctAnswer = MB.toString();
                choices = [correctAnswer, (GB * 1000).toString(), (MB + 1024).toString(), (MB - 1024).toString()];
            } else {
                const TB = randRange(1, 4);
                const GB = TB * 1024;
                text = `Un repositor de copias de seguridad de una entidad financiera almacena un total de $${TB}$ TB de datos. Expresa esta capacidad en Gigabytes (GB) ($1\\text{ TB} = 1024\\text{ GB}$).`;
                correctAnswer = GB.toString();
                choices = [correctAnswer, (TB * 1000).toString(), (GB + 1024).toString(), (GB - 1024).toString()];
            }
        } else if (subfield === 'caudal') {
            const Ls = randRange(1, 10) * 5;
            const m3h = Ls * 3.6;
            text = `Una bomba de fluidos hidráulica descarga agua con un caudal constante de $${Ls}$ L/s. Convierte el caudal a metros cúbicos por hora ($m^3/h$) sabiendo que $1\\text{ L/s} = 3.6\\text{ m}^3/h$.`;
            correctAnswer = m3h.toString();
            choices = [correctAnswer, (Ls * 3).toString(), (Ls * 4).toString(), (m3h - 3.6).toString()];
        } else {
            const type = verbalIdx === 7 || verbalIdx === 8;
            if (type) {
                const kW = randRange(1, 10) * 10;
                const HP = parseFloat((kW * 1.34).toFixed(1));
                text = `Un motor de inducción eléctrico trifásico registra una potencia nominal de $${kW}$ kW. Convierte esta potencia a Caballos de Fuerza (HP) usando la equivalencia $1\\text{ kW} = 1.34\\text{ HP}$.`;
                correctAnswer = HP.toString();
                choices = [correctAnswer, (kW * 1.3).toString(), (HP + 10).toString(), (HP - 10).toString()];
            } else {
                const W = randRange(1, 20) * 500;
                const kW = W / 1000;
                text = `Una luminaria LED de gran capacidad tiene una especificación de consumo de $${W}$ Vatios. Expresa esta potencia eléctrica en Kilovatios (kW).`;
                correctAnswer = kW.toString();
                choices = [correctAnswer, (kW * 10).toString(), (kW / 10).toString(), (W * 1000).toString()];
            }
        }
    }

    const uniqueChoices = [...new Set(choices)];
    while (uniqueChoices.length < 4) {
        uniqueChoices.push((parseFloat(correctAnswer) + randRange(-10, 10) || parseFloat(correctAnswer) + 1).toString());
    }

    return {
        text: text,
        correctAnswer: correctAnswer,
        inputType: 'multiple-choice',
        choices: shuffleArray(uniqueChoices),
        topicLabel: 'Conversión de Unidades'
    };
}

function formatSuperscript(num) {
    const map = {
        '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴',
        '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹',
        '-': '⁻'
    };
    return num.toString().split('').map(c => map[c] || c).join('');
}

function generateDespejeVariablesQuestion(topic, level, options, index, total) {
    let formulas = [];
    
    if (topic === 'fisica_despeje') {
        formulas = [
            {
                formula: "v = \\frac{d}{t}",
                target: "t",
                desc: "Velocidad media ($v$), distancia ($d$) y tiempo ($t$).",
                correct: "t = \\frac{d}{v}",
                wrong: ["t = d \\cdot v", "t = \\frac{v}{d}", "t = v - d"]
            },
            {
                formula: "F = m \\cdot a",
                target: "m",
                desc: "Fuerza ($F$), masa ($m$) y aceleración ($a$).",
                correct: "m = \\frac{F}{a}",
                wrong: ["m = F \\cdot a", "m = \\frac{a}{F}", "m = F - a"]
            },
            {
                formula: "E_k = \\frac{1}{2} m v^2",
                target: "v",
                desc: "Energía cinética ($E_k$), masa ($m$) y velocidad ($v$). Asume velocidad positiva.",
                correct: "v = \\sqrt{\\frac{2 E_k}{m}}",
                wrong: ["v = \\frac{2 E_k}{m}", "v = \\sqrt{\\frac{E_k}{2m}}", "v = \\sqrt{2 E_k \\cdot m}"]
            },
            {
                formula: "F = G \\frac{m_1 m_2}{r^2}",
                target: "r",
                desc: "Fuerza gravitatoria ($F$), constante ($G$), masas ($m_1, m_2$) y distancia ($r$). Asume distancia positiva.",
                correct: "r = \\sqrt{\\frac{G m_1 m_2}{F}}",
                wrong: ["r = \\frac{G m_1 m_2}{F}", "r = \\sqrt{\\frac{F}{G m_1 m_2}}", "r = \\sqrt{G m_1 m_2 \\cdot F}"]
            },
            {
                formula: "P = \\frac{F}{A}",
                target: "A",
                desc: "Presión ($P$), fuerza ($F$) y área ($A$).",
                correct: "A = \\frac{F}{P}",
                wrong: ["A = F \\cdot P", "A = \\frac{P}{F}", "A = P - F"]
            },
            {
                formula: "F = -k \\cdot x",
                target: "x",
                desc: "Ley de Hooke: fuerza ($F$), constante de resorte ($k$) y elongación ($x$).",
                correct: "x = -\\frac{F}{k}",
                wrong: ["x = -\\frac{k}{F}", "x = -F \\cdot k", "x = \\frac{F}{k}"]
            },
            {
                formula: "v = f \\cdot \\lambda",
                target: "f",
                desc: "Velocidad de onda ($v$), frecuencia ($f$) y longitud de onda ($\\lambda$).",
                correct: "f = \\frac{v}{\\lambda}",
                wrong: ["f = v \\cdot \\lambda", "f = \\frac{\\lambda}{v}", "f = v - \\lambda"]
            },
            {
                formula: "U = \\frac{1}{2} k x^2",
                target: "k",
                desc: "Energía potencial elástica ($U$), constante ($k$) y deformación ($x$).",
                correct: "k = \\frac{2 U}{x^2}",
                wrong: ["k = \\frac{U}{2 x^2}", "k = 2 U \\cdot x^2", "k = \\sqrt{\\frac{2 U}{x}}"]
            },
            {
                formula: "P_1 + \\frac{1}{2} \\rho v^2 = C",
                target: "\\rho",
                desc: "Ecuación de Bernoulli simplificada con presión ($P_1$), densidad ($\\rho$), velocidad ($v$) y constante ($C$).",
                correct: "\\rho = \\frac{2(C - P_1)}{v^2}",
                wrong: ["\\rho = \\frac{C - P_1}{2 v^2}", "\\rho = \\frac{2 C - P_1}{v^2}", "\\rho = 2(C - P_1) v^2"]
            },
            {
                formula: "T = 2\\pi \\sqrt{\\frac{L}{g}}",
                target: "L",
                desc: "Período ($T$) de un péndulo de longitud ($L$) y gravedad ($g$).",
                correct: "L = g \\left(\\frac{T}{2\\pi}\\right)^2",
                wrong: ["L = g \\left(\\frac{2\\pi}{T}\\right)^2", "L = \\frac{g T^2}{2\\pi}", "L = g^2 \\frac{T}{2\\pi}"]
            }
        ];
    } else if (topic === 'quimica_despeje') {
        formulas = [
            {
                formula: "P V = n R T",
                target: "T",
                desc: "Ley de gases ideales: presión ($P$), volumen ($V$), moles ($n$), constante ($R$) y temperatura ($T$).",
                correct: "T = \\frac{P V}{n R}",
                wrong: ["T = \\frac{n R}{P V}", "T = P V n R", "T = \\frac{P V R}{n}"]
            },
            {
                formula: "M = \\frac{n}{V}",
                target: "V",
                desc: "Molaridad ($M$), moles ($n$) y volumen de disolución ($V$).",
                correct: "V = \\frac{n}{M}",
                wrong: ["V = n \\cdot M", "V = \\frac{M}{n}", "V = M - n"]
            },
            {
                formula: "n = \\frac{m}{M_w}",
                target: "M_w",
                desc: "Cantidad de sustancia ($n$), masa ($m$) y masa molecular ($M_w$).",
                correct: "M_w = \\frac{m}{n}",
                wrong: ["M_w = m \\cdot n", "M_w = \\frac{n}{m}", "M_w = m + n"]
            },
            {
                formula: "\\frac{V_1}{T_1} = \\frac{V_2}{T_2}",
                target: "T_2",
                desc: "Ley de Charles: volúmenes ($V_1, V_2$) y temperaturas absolutas ($T_1, T_2$).",
                correct: "T_2 = \\frac{V_2 T_1}{V_1}",
                wrong: ["T_2 = \\frac{V_1 T_1}{V_2}", "T_2 = \\frac{V_2 V_1}{T_1}", "T_2 = V_2 T_1 V_1"]
            },
            {
                formula: "\\text{pH} = -\\log_{10}[H^+]",
                target: "[H^+]",
                desc: "Definición de pH en base a la concentración de iones de hidrógeno ($[H^+]$).",
                correct: "[H^+] = 10^{-\\text{pH}}",
                wrong: ["[H^+] = 10^{\\text{pH}}", "[H^+] = -\\text{pH}^{10}", "[H^+] = \\log_{10}(\\text{pH})"]
            },
            {
                formula: "k = A e^{-\\frac{E_a}{R T}}",
                target: "E_a",
                desc: "Ecuación de Arrhenius: constante ($k$), factor de frecuencia ($A$), energía de activación ($E_a$), constante de gases ($R$) y temperatura ($T$).",
                correct: "E_a = -R T \\ln\\left(\\frac{k}{A}\\right)",
                wrong: ["E_a = R T \\ln\\left(\\frac{k}{A}\\right)", "E_a = -\\frac{R T \\ln(k)}{A}", "E_a = -R T \\left(\\frac{k}{A}\right)"]
            },
            {
                formula: "d = \\frac{m}{V}",
                target: "m",
                desc: "Densidad ($d$), masa ($m$) y volumen ($V$).",
                correct: "m = d \\cdot V",
                wrong: ["m = \\frac{d}{V}", "m = \\frac{V}{d}", "m = d - V"]
            },
            {
                formula: "E = E^0 - \\frac{R T}{n F} \\ln(Q)",
                target: "\\ln(Q)",
                desc: "Ecuación de Nernst: potencial ($E, E^0$), constante ($R$), temperatura ($T$), electrones ($n$), constante de Faraday ($F$) y cociente de reacción ($Q$).",
                correct: "\\ln(Q) = \\frac{n F(E^0 - E)}{R T}",
                wrong: ["ln(Q) = \\frac{n F(E - E^0)}{R T}", "\\ln(Q) = \\frac{R T(E^0 - E)}{n F}", "\\ln(Q) = n F R T (E^0 - E)"]
            },
            {
                formula: "P_1 V_1 = P_2 V_2",
                target: "P_1",
                desc: "Ley de Boyle: presiones ($P_1, P_2$) y volúmenes ($V_1, V_2$).",
                correct: "P_1 = \\frac{P_2 V_2}{V_1}",
                wrong: ["P_1 = \\frac{P_2 V_1}{V_2}", "P_1 = P_2 V_2 V_1", "P_1 = \\frac{V_1}{P_2 V_2}"]
            },
            {
                formula: "X_A = \\frac{n_A}{n_A + n_B}",
                target: "n_B",
                desc: "Fracción molar ($X_A$) a partir del número de moles ($n_A, n_B$).",
                correct: "n_B = \\frac{n_A(1 - X_A)}{X_A}",
                wrong: ["n_B = \\frac{n_A(X_A - 1)}{X_A}", "n_B = \\frac{X_A(1 - n_A)}{n_A}", "n_B = n_A X_A - n_A"]
            }
        ];
    } else if (topic === 'ingenieria_despeje') {
        formulas = [
            {
                formula: "V = I \\cdot R",
                target: "I",
                desc: "Ley de Ohm: voltaje ($V$), corriente ($I$) y resistencia ($R$).",
                correct: "I = \\frac{V}{R}",
                wrong: ["I = V \\cdot R", "I = \\frac{R}{V}", "I = V - R"]
            },
            {
                formula: "f = \\frac{1}{2\\pi \\sqrt{L C}}",
                target: "C",
                desc: "Frecuencia de resonancia de un circuito LC con inductancia ($L$) y capacitancia ($C$).",
                correct: "C = \\frac{1}{4\\pi^2 f^2 L}",
                wrong: ["C = \\frac{1}{2\\pi f^2 L}", "C = 4\\pi^2 f^2 L", "C = \\frac{1}{4\\pi^2 f L}"]
            },
            {
                formula: "\\sigma = \\frac{P}{A}",
                target: "P",
                desc: "Esfuerzo mecánico normal ($\\sigma$), carga ($P$) y área de sección transversal ($A$).",
                correct: "P = \\sigma \\cdot A",
                wrong: ["P = \\frac{\\sigma}{A}", "P = \\frac{A}{\\sigma}", "P = \\sigma - A"]
            },
            {
                formula: "P = V \\cdot I \\cdot \\cos(\\theta)",
                target: "\\cos(\\theta)",
                desc: "Potencia activa eléctrica ($P$), voltaje ($V$), corriente ($I$) y factor de potencia ($\\cos(\\theta)$).",
                correct: "\\cos(\\theta) = \\frac{P}{V \\cdot I}",
                wrong: ["\\cos(\\theta) = \\frac{V \\cdot I}{P}", "\\cos(\\theta) = P \\cdot V \\cdot I", "\\cos(\\theta) = \\frac{P \\cdot I}{V}"]
            },
            {
                formula: "C = \\epsilon \\frac{A}{d}",
                target: "d",
                desc: "Capacitancia ($C$), permitividad ($\\epsilon$), área ($A$) y distancia ($d$) entre placas.",
                correct: "d = \\epsilon \\frac{A}{C}",
                wrong: ["d = \\frac{A C}{\\epsilon}", "d = \\epsilon \\cdot A \\cdot C", "d = \\frac{\\epsilon C}{A}"]
            },
            {
                formula: "A_v = -\\frac{R_f}{R_{in}}",
                target: "R_{in}",
                desc: "Ganancia de voltaje ($A_v$) de un amplificador operacional inversor con resistencias ($R_f, R_{in}$).",
                correct: "R_{in} = -\\frac{R_f}{A_v}",
                wrong: ["R_{in} = -\\frac{A_v}{R_f}", "R_{in} = -R_f \\cdot A_v", "R_{in} = \\frac{R_f}{A_v}"]
            },
            {
                formula: "q = k A \\frac{\\Delta T}{L}",
                target: "L",
                desc: "Conducción de calor ($q$), conductividad ($k$), área ($A$), diferencial de temperatura ($\\Delta T$) y espesor ($L$).",
                correct: "L = \\frac{k A \\Delta T}{q}",
                wrong: ["L = \\frac{q}{k A \\Delta T}", "L = k A \\Delta T q", "L = \\frac{k A q}{\\Delta T}"]
            },
            {
                formula: "I = \\frac{b h^3}{12}",
                target: "b",
                desc: "Momento de inercia de una sección rectangular con ancho ($b$) y altura ($h$).",
                correct: "b = \\frac{12 I}{h^3}",
                wrong: ["b = \\frac{I}{12 h^3}", "b = 12 I h^3", "b = \\frac{12 h^3}{I}"]
            },
            {
                formula: "\\epsilon = \\frac{\\Delta L}{L_0}",
                target: "L_0",
                desc: "Deformación unitaria ($\\epsilon$), elongación ($\\Delta L$) y longitud inicial ($L_0$).",
                correct: "L_0 = \\frac{\\Delta L}{\\epsilon}",
                wrong: ["L_0 = \\Delta L \\cdot \\epsilon", "L_0 = \\frac{\\epsilon}{\\Delta L}", "L_0 = \\Delta L - \\epsilon"]
            },
            {
                formula: "\\eta = 1 - \\frac{T_C}{T_H}",
                target: "T_H",
                desc: "Eficiencia de Carnot ($\\eta$) usando temperaturas fría ($T_C$) y caliente ($T_H$).",
                correct: "T_H = \\frac{T_C}{1 - \\eta}",
                wrong: ["T_H = \\frac{1 - \\eta}{T_C}", "T_H = T_C(1 - \\eta)", "T_H = \\frac{T_C}{\\eta - 1}"]
            }
        ];
    } else { // matematicas_despeje
        formulas = [
            {
                formula: "y - y_1 = m(x - x_1)",
                target: "m",
                desc: "Ecuación punto-pendiente de una recta con coordenadas y pendiente ($m$).",
                correct: "m = \\frac{y - y_1}{x - x_1}",
                wrong: ["m = \\frac{x - x_1}{y - y_1}", "m = (y - y_1)(x - x_1)", "m = y - y_1 - x + x_1"]
            },
            {
                formula: "A = \\frac{(a + b) h}{2}",
                target: "a",
                desc: "Área ($A$) de un trapecio con bases ($a, b$) y altura ($h$).",
                correct: "a = \\frac{2A}{h} - b",
                wrong: ["a = \\frac{2A - b}{h}", "a = \\frac{A}{2h} - b", "a = 2A \\cdot h - b"]
            },
            {
                formula: "V = \\frac{1}{3} \\pi r^2 h",
                target: "r",
                desc: "Volumen ($V$) de un cono con radio ($r$) y altura ($h$). Asume radio positivo.",
                correct: "r = \\sqrt{\\frac{3V}{\\pi h}}",
                wrong: ["r = \\frac{3V}{\\pi h}", "r = \\sqrt{\\frac{V}{3\\pi h}}", "r = \\sqrt{3V \\pi h}"]
            },
            {
                formula: "a_n = a_1 + (n - 1) d",
                target: "n",
                desc: "Término enésimo ($a_n$), término inicial ($a_1$), posición ($n$) y diferencia ($d$) en progresión aritmética.",
                correct: "n = \\frac{a_n - a_1}{d} + 1",
                wrong: ["n = \\frac{a_n - a_1 + 1}{d}", "n = \\frac{a_1 - a_n}{d} + 1", "n = \\frac{a_n - a_1}{d} - 1"]
            },
            {
                formula: "c^2 = a^2 + b^2",
                target: "b",
                desc: "Teorema de Pitágoras con hipotenusa ($c$) y catetos ($a, b$). Asume longitud positiva.",
                correct: "b = \\sqrt{c^2 - a^2}",
                wrong: ["b = c - a", "b = \\sqrt{a^2 - c^2}", "b = \\sqrt{c^2 + a^2}"]
            },
            {
                formula: "m = \\frac{y_2 - y_1}{x_2 - x_1}",
                target: "y_1",
                desc: "Pendiente ($m$) de una recta a partir de dos puntos.",
                correct: "y_1 = y_2 - m(x_2 - x_1)",
                wrong: ["y_1 = y_2 + m(x_2 - x_1)", "y_1 = m(x_2 - x_1) - y_2", "y_1 = \\frac{y_2}{m(x_2 - x_1)}"]
            },
            {
                formula: "S = 180(n - 2)",
                target: "n",
                desc: "Suma de ángulos interiores ($S$) de un polígono regular de ($n$) lados.",
                correct: "n = \\frac{S}{180} + 2",
                wrong: ["n = \\frac{S + 2}{180}", "n = \\frac{S}{180} - 2", "n = \\frac{180}{S} + 2"]
            },
            {
                formula: "A = P(1 + r)^t",
                target: "P",
                desc: "Fórmula de interés compuesto: monto final ($A$), capital principal ($P$), tasa ($r$) y tiempo ($t$).",
                correct: "P = \\frac{A}{(1 + r)^t}",
                wrong: ["P = A(1 + r)^t", "P = \\frac{(1 + r)^t}{A}", "P = A - (1 + r)^t"]
            },
            {
                formula: "D = b^2 - 4ac",
                target: "a",
                desc: "Discriminante ($D$) de la ecuación cuadrática con coeficientes ($a, b, c$).",
                correct: "a = \\frac{b^2 - D}{4c}",
                wrong: ["a = \\frac{D - b^2}{4c}", "a = \\frac{b^2 + D}{4c}", "a = \\frac{4c}{b^2 - D}"]
            },
            {
                formula: "s^2 = \\frac{SS}{n - 1}",
                target: "n",
                desc: "Varianza muestral ($s^2$), suma de cuadrados ($SS$) y tamaño de muestra ($n$).",
                correct: "n = \\frac{SS}{s^2} + 1",
                wrong: ["n = \\frac{s^2}{SS} + 1", "n = \\frac{SS}{s^2} - 1", "n = SS \\cdot s^2 + 1"]
            }
        ];
    }
    
    // Shuffle the formulas using the shuffling cache
    const fIdx = getShuffledIndexForTopic(topic + '_despeje', formulas.length, index);
    const item = formulas[fIdx];
    
    const text = `Dada la siguiente fórmula:\n$$ ${item.formula} $$\nDonde: ${item.desc}\n\n**Despeja la variable $${item.target}$** y selecciona la opción correcta:`;
    const correctAnswer = `$${item.correct}$`;
    const choices = [correctAnswer];
    item.wrong.forEach(w => {
        choices.push(`$${w}$`);
    });
    
    return {
        text: text,
        correctAnswer: correctAnswer,
        inputType: 'multiple-choice',
        choices: shuffleArray(choices),
        topicLabel: 'Despeje de Variables'
    };
}

function generateEcuacionesQuestion(topic, level, options, index, total) {
    let text = '';
    let correctAnswer = '';
    let choices = [];
    
    const shuffleKey = topic + '_eq_' + level;
    
    if (topic === 'lineales') {
        const subType = getShuffledIndexForTopic(shuffleKey + '_sub', 2, index);
        
        if (subType === 0) {
            const sol = randRange(-8, 8) || 3;
            const a = randRange(2, 8);
            let c = randRange(-8, 8);
            while (c === a || c === 0) {
                c = randRange(-8, 8);
            }
            const b = randRange(-15, 15);
            const d = (a - c) * sol + b;
            
            const lhs = formatLinearTerm(a, b);
            const rhs = formatLinearTerm(c, d);
            
            text = `Resuelve la siguiente ecuación lineal:\n$$ ${lhs} = ${rhs} $$`;
            correctAnswer = `$x = ${sol}$`;
            choices = [
                correctAnswer,
                `$x = ${sol + randRange(1, 3)}$`,
                `$x = ${sol - randRange(1, 3)}$`,
                `$x = ${-sol}$`
            ];
        } else {
            const sol = randRange(-6, 6);
            const a = randRange(2, 5);
            let d = randRange(2, 5);
            while (d === a) {
                d = randRange(2, 5);
            }
            const b = randRange(-4, 4);
            const e = randRange(-4, 4);
            const c = randRange(-10, 10);
            const f = a * (sol + b) + c - d * (sol + e);
            
            const aTerm = a === 1 ? '' : a;
            const dTerm = d === 1 ? '' : d;
            
            const bStr = b > 0 ? `+ ${b}` : b < 0 ? `- ${Math.abs(b)}` : '';
            const eStr = e > 0 ? `+ ${e}` : e < 0 ? `- ${Math.abs(e)}` : '';
            
            const lhs = `${aTerm}(x ${bStr}) ${c >= 0 ? '+ ' + c : '- ' + Math.abs(c)}`;
            const rhs = `${dTerm}(x ${eStr}) ${f >= 0 ? '+ ' + f : '- ' + Math.abs(f)}`;
            
            text = `Resuelve la ecuación simplificando y agrupando términos:\n$$ ${lhs} = ${rhs} $$`;
            correctAnswer = `$x = ${sol}$`;
            choices = [
                correctAnswer,
                `$x = ${sol + randRange(1, 2)}$`,
                `$x = ${sol - randRange(1, 2)}$`,
                `$x = ${-sol}$`
            ];
        }
    } else if (topic === 'cuadraticas') {
        const subType = getShuffledIndexForTopic(shuffleKey + '_sub', 2, index);
        
        if (subType === 0) {
            const r1 = randRange(-6, 6);
            const r2 = randRange(-6, 6);
            
            const b = -(r1 + r2);
            const c = r1 * r2;
            
            let eqStr = 'x^2';
            if (b > 0) eqStr += ` + ${b === 1 ? '' : b}x`;
            else if (b < 0) eqStr += ` - ${b === -1 ? '' : Math.abs(b)}x`;
            
            if (c > 0) eqStr += ` + ${c}`;
            else if (c < 0) eqStr += ` - ${Math.abs(c)}`;
            
            text = `Halla las soluciones de la ecuación cuadrática:\n$$ ${eqStr} = 0 $$`;
            
            if (r1 === r2) {
                correctAnswer = `$x = ${r1}$`;
                choices = [
                    correctAnswer,
                    `$x = ${-r1}$`,
                    `$x = ${r1 + 1}$`,
                    `$x = ${r1 - 1}$`
                ];
            } else {
                const minR = Math.min(r1, r2);
                const maxR = Math.max(r1, r2);
                correctAnswer = `$x = ${minR} \\text{ o } x = ${maxR}$`;
                choices = [
                    correctAnswer,
                    `$x = ${-minR} \\text{ o } x = ${-maxR}$`,
                    `$x = ${minR} \\text{ o } x = ${-maxR}$`,
                    `$x = ${minR + 1} \\text{ o } x = ${maxR - 1}$`
                ];
            }
        } else {
            const a = randRange(2, 3);
            const r1 = randRange(-4, 4);
            const r2 = randRange(-4, 4);
            
            const bCoeff = -a * (r1 + r2);
            const cCoeff = a * r1 * r2;
            
            let eqStr = `${a}x^2`;
            if (bCoeff > 0) eqStr += ` + ${bCoeff}x`;
            else if (bCoeff < 0) eqStr += ` - ${Math.abs(bCoeff)}x`;
            
            if (cCoeff > 0) eqStr += ` + ${cCoeff}`;
            else if (cCoeff < 0) eqStr += ` - ${Math.abs(cCoeff)}`;
            
            text = `Resuelve la ecuación cuadrática factorizando o usando la fórmula general:\n$$ ${eqStr} = 0 $$`;
            
            if (r1 === r2) {
                correctAnswer = `$x = ${r1}$`;
                choices = [
                    correctAnswer,
                    `$x = ${-r1}$`,
                    `$x = ${r1 + 2}$`,
                    `$x = ${r1 - 2}$`
                ];
            } else {
                const minR = Math.min(r1, r2);
                const maxR = Math.max(r1, r2);
                correctAnswer = `$x = ${minR} \\text{ o } x = ${maxR}$`;
                choices = [
                    correctAnswer,
                    `$x = ${-minR} \\text{ o } x = ${-maxR}$`,
                    `$x = ${minR} \\text{ o } x = ${-maxR}$`,
                    `$x = ${minR + 1} \\text{ o } x = ${maxR - 1}$`
                ];
            }
        }
    } else if (topic === 'radicales') {
        const subType = getShuffledIndexForTopic(shuffleKey + '_sub', 2, index);
        
        if (subType === 0) {
            const sol = randRange(2, 12);
            const c = randRange(2, 6);
            const a = randRange(1, 4);
            const b = c * c - a * sol;
            
            const innerStr = formatLinearTerm(a, b);
            
            text = `Resuelve la siguiente ecuación con radicales (eleva al cuadrado ambos lados):\n$$ \\sqrt{${innerStr}} = ${c} $$`;
            correctAnswer = `$x = ${sol}$`;
            choices = [
                correctAnswer,
                `$x = ${sol + randRange(1, 2)}$`,
                `$x = ${sol - randRange(1, 2)}$`,
                `$x = ${-sol}$`
            ];
        } else {
            const sol = randRange(4, 9);
            const c = randRange(1, 3);
            const a = randRange(1, 3);
            const b = (sol - c) * (sol - c) - a * sol;
            
            const innerStr = formatLinearTerm(a, b);
            
            text = `Resuelve la ecuación y comprueba si hay soluciones extrañas:\n$$ \\sqrt{${innerStr}} = x - ${c} $$`;
            correctAnswer = `$x = ${sol}$`;
            choices = [
                correctAnswer,
                `$x = ${sol + 1}$`,
                `$x = ${sol - 2}$`,
                `$x = ${-sol}$`
            ];
        }
    } else {
        const subType = getShuffledIndexForTopic(shuffleKey + '_sub', 2, index);
        
        if (subType === 0) {
            let sol = null, a = 0, c = 0, b = 0, d = 0;
            let attempts = 0;
            while (sol === null && attempts < 100) {
                attempts++;
                a = randRange(-5, 5);
                c = randRange(-5, 5);
                b = randRange(-5, 5);
                d = randRange(-5, 5);
                if (a !== 0 && c !== 0 && a !== c && b !== d) {
                    const num = a * d - c * b;
                    const den = a - c;
                    if (num % den === 0) {
                        const tempSol = num / den;
                        if (tempSol !== b && tempSol !== d && Math.abs(tempSol) <= 12) {
                            sol = tempSol;
                        }
                    }
                }
            }
            if (sol === null) { sol = 3; a = 2; c = 1; b = 1; d = 2; }
            
            const bStr = b > 0 ? `- ${b}` : b < 0 ? `+ ${Math.abs(b)}` : '';
            const dStr = d > 0 ? `- ${d}` : d < 0 ? `+ ${Math.abs(d)}` : '';
            
            text = `Resuelve la siguiente ecuación fraccionaria multiplicando en cruz:\n$$ \\frac{${a}}{x ${bStr}} = \\frac{${c}}{x ${dStr}} $$`;
            correctAnswer = `$x = ${sol}$`;
            choices = [
                correctAnswer,
                `$x = ${sol + randRange(1, 2)}$`,
                `$x = ${sol - randRange(1, 2)}$`,
                `$x = ${-sol}$`
            ];
        } else {
            const sol = randRange(-6, 6);
            const b = randRange(2, 4);
            let d = randRange(2, 4);
            while (d === b) {
                d = randRange(2, 4);
            }
            const k = randRange(-2, 2);
            const m = randRange(-2, 2);
            
            const a = k * b - sol;
            const c = m * d - sol;
            const e = k + m;
            
            const aStr = a > 0 ? `+ ${a}` : a < 0 ? `- ${Math.abs(a)}` : '';
            const cStr = c > 0 ? `+ ${c}` : c < 0 ? `- ${Math.abs(c)}` : '';
            
            text = `Resuelve la ecuación fraccionaria eliminando los denominadores (multiplicando por el m.c.m. de $${b}$ y $${d}$):\n$$ \\frac{x ${aStr}}{${b}} + \\frac{x ${cStr}}{${d}} = ${e} $$`;
            correctAnswer = `$x = ${sol}$`;
            choices = [
                correctAnswer,
                `$x = ${sol + 1}$`,
                `$x = ${sol - 1}$`,
                `$x = ${-sol}$`
            ];
        }
    }
    
    const uniqueChoices = [...new Set(choices)];
    while (uniqueChoices.length < 4) {
        uniqueChoices.push(`$x = ${randRange(-10, 10)}$`);
    }
    
    return {
        text: text,
        correctAnswer: correctAnswer,
        inputType: 'multiple-choice',
        choices: shuffleArray(uniqueChoices),
        topicLabel: 'Ecuaciones'
    };
}

function formatLinearTerm(a, b, varName = 'x') {
    let term = '';
    if (a === 1) term += varName;
    else if (a === -1) term += '-' + varName;
    else term += a + varName;

    if (b > 0) term += ' + ' + b;
    else if (b < 0) term += ' - ' + Math.abs(b);
    return term;
}

// ==========================================================================
// CÁLCULO DE DERIVADAS GENERATOR
// ==========================================================================
function generateCalculoDerivadasQuestion(topic, level, options, index, total) {
    let text = '';
    let correctAnswer = '';
    let choices = [];
    const shuffleKey = topic + '_deriv_' + level;
    
    if (topic === 'derivadas_basicas') {
        const subType = getShuffledIndexForTopic(shuffleKey + '_sub', 3, index);
        if (subType === 0) {
            // Polynomial: f(x) = a*x^n + b*x^m + c
            const a = randRange(2, 6);
            const n = randRange(3, 5);
            const b = randRange(2, 6) * (Math.random() < 0.5 ? 1 : -1);
            const m = randRange(1, 2);
            const c = randRange(-8, 8);
            
            const fnText = `${a}x^{${n}} ${b > 0 ? '+ ' + b : '- ' + Math.abs(b)}x${m === 2 ? '^2' : ''} ${c > 0 ? '+ ' + c : c < 0 ? '- ' + Math.abs(c) : ''}`;
            text = `Calcula la derivada de la siguiente función respecto a $x$:\n$$ f(x) = ${fnText} $$`;
            
            const term1Val = a * n;
            const term1Exp = n - 1;
            const term2Val = b * m;
            const term2Exp = m - 1;
            
            const derivTerm1 = `${term1Val}x${term1Exp > 1 ? '^{' + term1Exp + '}' : ''}`;
            const derivTerm2 = term2Val > 0 ? `+ ${term2Val}${term2Exp > 0 ? 'x' : ''}` : `- ${Math.abs(term2Val)}${term2Exp > 0 ? 'x' : ''}`;
            correctAnswer = `$f'(x) = ${derivTerm1} ${derivTerm2}$`;
            
            choices = [
                correctAnswer,
                `$f'(x) = ${a}x^{${term1Exp}} ${derivTerm2}$`,
                `$f'(x) = ${term1Val}x^{${n}} ${derivTerm2}$`,
                `$f'(x) = ${term1Val}x^{${term1Exp}} ${term2Val > 0 ? '-' : '+'} ${Math.abs(term2Val)}${term2Exp > 0 ? 'x' : ''}$`
            ];
        } else if (subType === 1) {
            // Negative exponent: f(x) = a/x^n + b
            const a = randRange(2, 6);
            const n = randRange(1, 3);
            const b = randRange(-6, 6);
            
            const fnText = `\\frac{${a}}{x^{${n}}} ${b > 0 ? '+ ' + b : b < 0 ? '- ' + Math.abs(b) : ''}`;
            text = `Calcula la derivada de la función:\n$$ f(x) = ${fnText} $$`;
            
            const termExp = n + 1;
            correctAnswer = `$f'(x) = -\\frac{${a * n}}{x^{${termExp}}}$`;
            
            choices = [
                correctAnswer,
                `$f'(x) = \\frac{${a * n}}{x^{${termExp}}}$`,
                `$f'(x) = -\\frac{${a}}{x^{${n - 1}}}$`,
                `$f'(x) = -\\frac{${a * n}}{x^{${n}}}$`
            ];
        } else {
            // Square root: f(x) = a*\sqrt{x} + x^n
            const a = randRange(2, 6);
            const n = randRange(2, 3);
            
            const fnText = `${a}\\sqrt{x} + x^{${n}}`;
            text = `Calcula la derivada de la función:\n$$ f(x) = ${fnText} $$`;
            
            const aIsEven = (a % 2 === 0);
            const leadTerm = aIsEven ? `\\frac{${a/2}}{\\sqrt{x}}` : `\\frac{${a}}{2\\sqrt{x}}`;
            correctAnswer = `$f'(x) = ${leadTerm} + ${n}x^{${n-1}}$`;
            
            choices = [
                correctAnswer,
                `$f'(x) = ${leadTerm} + x^{${n-1}}$`,
                `$f'(x) = \\frac{${a}}{\\sqrt{x}} + ${n}x^{${n-1}}$`,
                `$f'(x) = ${leadTerm} + ${n}x^{${n}}$`
            ];
        }
    } else if (topic === 'derivadas_producto_cociente') {
        const subType = getShuffledIndexForTopic(shuffleKey + '_sub', 2, index);
        if (subType === 0) {
            // Product: f(x) = (ax + b)(cx^2)
            const a = randRange(2, 4);
            const b = randRange(1, 4);
            const c = randRange(2, 4);
            text = `Usa la regla del producto para derivar:\n$$ f(x) = (${a}x + ${b})(${c}x^2) $$`;
            
            const correctVal1 = 3 * a * c;
            const correctVal2 = 2 * b * c;
            correctAnswer = `$f'(x) = ${correctVal1}x^2 + ${correctVal2}x$`;
            
            choices = [
                correctAnswer,
                `$f'(x) = ${a * c}x^2 + ${correctVal2}x$`,
                `$f'(x) = ${a} \\cdot (${c}x^2) + (${a}x + ${b}) \\cdot (${c}x)$`,
                `$f'(x) = ${correctVal1}x^3 + ${correctVal2}x^2$`
            ];
        } else {
            // Quotient: f(x) = (ax + b) / (cx - d)
            const a = randRange(2, 5);
            const b = randRange(1, 5);
            const c = randRange(2, 3);
            const d = randRange(2, 5);
            
            text = `Usa la regla del cociente para derivar:\n$$ f(x) = \\frac{${a}x + ${b}}{${c}x - ${d}} $$`;
            
            const num = - (a * d + b * c);
            correctAnswer = `$f'(x) = \\frac{${num}}{(${c}x - ${d})^2}$`;
            
            choices = [
                correctAnswer,
                `$f'(x) = \\frac{${a * d + b * c}}{(${c}x - ${d})^2}$`,
                `$f'(x) = \\frac{${num}}{${c}x - ${d}}$`,
                `$f'(x) = \\frac{${a * c}}{(${c}x - ${d})^2}$`
            ];
        }
    } else if (topic === 'derivadas_trig_exp') {
        const subType = getShuffledIndexForTopic(shuffleKey + '_sub', 3, index);
        if (subType === 0) {
            // f(x) = a*sin(x) - b*cos(x)
            const a = randRange(2, 6);
            const b = randRange(2, 6);
            
            text = `Calcula la derivada de:\n$$ f(x) = ${a}\\sin(x) - ${b}\\cos(x) $$`;
            correctAnswer = `$f'(x) = ${a}\\cos(x) + ${b}\\sin(x)$`;
            
            choices = [
                correctAnswer,
                `$f'(x) = ${a}\\cos(x) - ${b}\\sin(x)$`,
                `$f'(x) = -${a}\\cos(x) + ${b}\\sin(x)$`,
                `$f'(x) = ${a}\\sin(x) + ${b}\\cos(x)$`
            ];
        } else if (subType === 1) {
            // f(x) = a*e^x + b*ln(x)
            const a = randRange(2, 5);
            const b = randRange(2, 6);
            
            text = `Calcula la derivada de:\n$$ f(x) = ${a}e^x + ${b}\\ln(x) $$`;
            correctAnswer = `$f'(x) = ${a}e^x + \\frac{${b}}{x}$`;
            
            choices = [
                correctAnswer,
                `$f'(x) = ${a}e^x - \\frac{${b}}{x}$`,
                `$f'(x) = e^x + \\frac{${b}}{x^2}$`,
                `$f'(x) = ${a}e^{x-1} + \\frac{1}{x}$`
            ];
        } else {
            // f(x) = a*tan(x)
            const a = randRange(2, 5);
            
            text = `Calcula la derivada de:\n$$ f(x) = ${a}\\tan(x) $$`;
            correctAnswer = `$f'(x) = ${a}\\sec^2(x)$`;
            
            choices = [
                correctAnswer,
                `$f'(x) = ${a}\\csc^2(x)$`,
                `$f'(x) = -${a}\\sec^2(x)$`,
                `$f'(x) = ${a}\\tan^2(x)$`
            ];
        }
    } else { // derivadas_cadena
        const subType = getShuffledIndexForTopic(shuffleKey + '_sub', 3, index);
        if (subType === 0) {
            // f(x) = (ax + b)^n
            const a = randRange(2, 5);
            const b = randRange(-5, 5);
            const n = randRange(3, 5);
            
            const bStr = b > 0 ? `+ ${b}` : b < 0 ? `- ${Math.abs(b)}` : '';
            text = `Usa la regla de la cadena para derivar:\n$$ f(x) = (${a}x ${bStr})^{${n}} $$`;
            
            const coeff = a * n;
            correctAnswer = `$f'(x) = ${coeff}(${a}x ${bStr})^{${n-1}}$`;
            
            choices = [
                correctAnswer,
                `$f'(x) = ${n}(${a}x ${bStr})^{${n-1}}$`,
                `$f'(x) = ${coeff}(${a}x ${bStr})^{${n}}$`,
                `$f'(x) = ${a}(${a}x ${bStr})^{${n-1}}$`
            ];
        } else if (subType === 1) {
            // f(x) = sin(a*x^2)
            const a = randRange(2, 6);
            
            text = `Deriva aplicando la regla de la cadena:\n$$ f(x) = \\sin(${a}x^2) $$`;
            correctAnswer = `$f'(x) = ${2 * a}x \\cos(${a}x^2)$`;
            
            choices = [
                correctAnswer,
                `$f'(x) = \\cos(${a}x^2)$`,
                `$f'(x) = ${a}x \\cos(${a}x^2)$`,
                `$f'(x) = -${2 * a}x \\cos(${a}x^2)$`
            ];
        } else {
            // f(x) = e^{a*x^2 + b*x}
            const a = randRange(2, 4);
            const b = randRange(1, 4);
            
            text = `Deriva aplicando la regla de la cadena:\n$$ f(x) = e^{${a}x^2 + ${b}x} $$`;
            correctAnswer = `$f'(x) = (${2 * a}x + ${b}) e^{${a}x^2 + ${b}x}$`;
            
            choices = [
                correctAnswer,
                `$f'(x) = (${a}x + ${b}) e^{${a}x^2 + ${b}x}$`,
                `$f'(x) = e^{${2 * a}x + ${b}}$`,
                `$f'(x) = (${2 * a}x) e^{${a}x^2 + ${b}x}$`
            ];
        }
    }

    const uniqueChoices = [...new Set(choices)];
    while (uniqueChoices.length < 4) {
        uniqueChoices.push(`$f'(x) = ${randRange(2, 9)}x$`);
    }

    return {
        text: text,
        correctAnswer: correctAnswer,
        inputType: 'multiple-choice',
        choices: shuffleArray(uniqueChoices),
        topicLabel: 'Cálculo de Derivadas'
    };
}

// ==========================================================================
// INTEGRALES INDEFINIDAS GENERATOR
// ==========================================================================
function generateIntegralesIndefinidasQuestion(topic, level, options, index, total) {
    let text = '';
    let correctAnswer = '';
    let choices = [];
    const shuffleKey = topic + '_integ_' + level;
    
    if (topic === 'integrales_basicas') {
        const subType = getShuffledIndexForTopic(shuffleKey + '_sub', 3, index);
        if (subType === 0) {
            // Polynomial: \int (a*x^n + b*x + c) dx
            const a = randRange(2, 6);
            const n = randRange(2, 4);
            const coeffA = a * (n + 1); 
            const b = randRange(2, 6) * (Math.random() < 0.5 ? 1 : -1);
            const coeffB = b * 2; 
            const c = randRange(-8, 8);
            
            const fnText = `${coeffA}x^{${n}} ${coeffB > 0 ? '+ ' + coeffB : '- ' + Math.abs(coeffB)}x ${c > 0 ? '+ ' + c : c < 0 ? '- ' + Math.abs(c) : ''}`;
            text = `Resuelve la siguiente integral indefinida:\n$$ \\int (${fnText}) \\, dx $$`;
            
            const term1 = `${a}x^{${n+1}}`;
            const term2 = b > 0 ? `+ ${b}x^2` : `- ${Math.abs(b)}x^2`;
            const term3 = c > 0 ? `+ ${c}x` : c < 0 ? `- ${Math.abs(c)}x` : '';
            
            correctAnswer = `$${term1} ${term2} ${term3} + C$`;
            
            choices = [
                correctAnswer,
                `$${coeffA}x^{${n+1}} ${term2} ${term3} + C$`,
                `$${a}x^{${n}} ${b > 0 ? '+ ' + b : '- ' + Math.abs(b)}x ${c > 0 ? '+ ' + c : c < 0 ? '- ' + Math.abs(c) : ''} + C$`,
                `$${a}x^{${n+1}} ${b > 0 ? '-' : '+'} ${Math.abs(b)}x^2 ${c > 0 ? '-' : '+'} ${Math.abs(c)}x + C$`
            ];
        } else if (subType === 1) {
            // Constant over power: \int a / x^n dx
            const n = randRange(2, 4);
            const k = randRange(2, 5);
            const a = k * (n - 1); 
            
            text = `Resuelve la integral indefinida:\n$$ \\int \\frac{${a}}{x^{${n}}} \\, dx $$`;
            
            const exponent = n - 1;
            correctAnswer = `$-\\frac{${k}}{x^{${exponent}}} + C$`;
            
            choices = [
                correctAnswer,
                `$\\frac{${k}}{x^{${exponent}}} + C$`,
                `$-\\frac{${a}}{x^{${n+1}}} + C$`,
                `$-\\frac{${a * (n - 1)}}{x^{${exponent}}} + C$`
            ];
        } else {
            // Square root: \int a*\sqrt{x} dx
            const k = randRange(1, 4);
            const a = 3 * k;
            
            text = `Resuelve la integral indefinida:\n$$ \\int ${a}\\sqrt{x} \\, dx $$`;
            
            correctAnswer = `$${2 * k}x\\sqrt{x} + C$`;
            
            choices = [
                correctAnswer,
                `$${a}x\\sqrt{x} + C$`,
                `$\\frac{${k}}{2\\sqrt{x}} + C$`,
                `$${2 * k}\\sqrt{x} + C$`
            ];
        }
    } else if (topic === 'integrales_directas_trig_exp') {
        const subType = getShuffledIndexForTopic(shuffleKey + '_sub', 3, index);
        if (subType === 0) {
            // \int a*sin(x) + b*cos(x) dx
            const a = randRange(2, 5);
            const b = randRange(2, 5);
            
            text = `Calcula la antiderivada de:\n$$ f(x) = ${a}\\sin(x) + ${b}\\cos(x) $$`;
            correctAnswer = `$-${a}\\cos(x) + ${b}\\sin(x) + C$`;
            
            choices = [
                correctAnswer,
                `$${a}\\cos(x) - ${b}\\sin(x) + C$`,
                `$${a}\\cos(x) + ${b}\\sin(x) + C$`,
                `$-${a}\\cos(x) - ${b}\\sin(x) + C$`
            ];
        } else if (subType === 1) {
            // \int (a*e^x + b/x) dx
            const a = randRange(2, 5);
            const b = randRange(2, 5);
            
            text = `Calcula la integral indefinida:\n$$ \\int \\left(${a}e^x + \\frac{${b}}{x}\\right) dx $$`;
            correctAnswer = `$${a}e^x + ${b}\\ln|x| + C$`;
            
            choices = [
                correctAnswer,
                `$${a}e^x - \\frac{${b}}{x^2} + C$`,
                `$e^x + ${b}\\ln|x| + C$`,
                `$${a}e^x - ${b}\\ln|x| + C$`
            ];
        } else {
            // \int a*sec^2(x) dx
            const a = randRange(2, 6);
            
            text = `Resuelve la integral indefinida:\n$$ \\int ${a}\\sec^2(x) \\, dx $$`;
            correctAnswer = `$${a}\\tan(x) + C$`;
            
            choices = [
                correctAnswer,
                `$${a}\\sec(x) + C$`,
                `$-${a}\\tan(x) + C$`,
                `$\\frac{${a}}{3}\\tan^3(x) + C$`
            ];
        }
    } else if (topic === 'integrales_sustitucion') {
        const subType = getShuffledIndexForTopic(shuffleKey + '_sub', 3, index);
        if (subType === 0) {
            // \int cos(a*x + b) dx
            const a = randRange(2, 5);
            const b = randRange(1, 5);
            
            text = `Resuelve la integral mediante sustitución:\n$$ \\int \\cos(${a}x + ${b}) \\, dx $$`;
            correctAnswer = `$\\frac{1}{${a}}\\sin(${a}x + ${b}) + C$`;
            
            choices = [
                correctAnswer,
                `$-\\frac{1}{${a}}\\sin(${a}x + ${b}) + C$`,
                `$\\sin(${a}x + ${b}) + C$`,
                `$${a}\\sin(${a}x + ${b}) + C$`
            ];
        } else if (subType === 1) {
            // \int x * e^{a * x^2} dx
            const a = randRange(2, 4);
            const coeff = 2 * a;
            
            text = `Resuelve la integral indefinida:\n$$ \\int ${coeff}x e^{${a}x^2} \\, dx $$`;
            correctAnswer = `$e^{${a}x^2} + C$`;
            
            choices = [
                correctAnswer,
                `$\\frac{1}{${a}} e^{${a}x^2} + C$`,
                `$${coeff} e^{${a}x^2} + C$`,
                `$x^2 e^{${a}x^2} + C$`
            ];
        } else {
            // \int x * (x^2 + a)^n dx
            const a = randRange(1, 5);
            const n = randRange(2, 4);
            
            text = `Resuelve la integral indefinida:\n$$ \\int 2x(x^2 + ${a})^{${n}} \\, dx $$`;
            const exponent = n + 1;
            correctAnswer = `$\\frac{(x^2 + ${a})^{${exponent}}}{${exponent}} + C$`;
            
            choices = [
                correctAnswer,
                `$\\frac{(x^2 + ${a})^{${exponent - 1}}}{${exponent - 1}} + C$`,
                `$(x^2 + ${a})^{${exponent}} + C$`,
                `$\\frac{x^2(x^2 + ${a})^{${exponent}}}{${exponent}} + C$`
            ];
        }
    } else { // integrales_partes
        const subType = getShuffledIndexForTopic(shuffleKey + '_sub', 2, index);
        if (subType === 0) {
            // \int x * e^{a*x} dx
            const a = randRange(2, 4);
            
            text = `Usa integración por partes para resolver:\n$$ \\int x e^{${a}x} \\, dx $$`;
            
            const term1 = `\\frac{x}{${a}}e^{${a}x}`;
            const term2 = `\\frac{1}{${a * a}}e^{${a}x}`;
            correctAnswer = `$${term1} - ${term2} + C$`;
            
            choices = [
                correctAnswer,
                `$${term1} + ${term2} + C$`,
                `$\\frac{x^2}{2}e^{${a}x} + C$`,
                `$${a}x e^{${a}x} - e^{${a}x} + C$`
            ];
        } else {
            // \int a * ln(x) dx
            const a = randRange(2, 5);
            
            text = `Usa integración por partes para resolver:\n$$ \\int ${a}\\ln(x) \\, dx $$`;
            correctAnswer = `$${a}x\\ln(x) - ${a}x + C$`;
            
            choices = [
                correctAnswer,
                `$${a}\\ln(x) - ${a}x + C$`,
                `$\\frac{${a}}{x} + C$`,
                `$${a}x\\ln(x) + ${a}x + C$`
            ];
        }
    }

    const uniqueChoices = [...new Set(choices)];
    while (uniqueChoices.length < 4) {
        uniqueChoices.push(`$x^2 + C$`);
    }

    return {
        text: text,
        correctAnswer: correctAnswer,
        inputType: 'multiple-choice',
        choices: shuffleArray(uniqueChoices),
        topicLabel: 'Integrales Indefinidas'
    };
}

// ==========================================================================
// DERIVADAS PARCIALES GENERATOR
// ==========================================================================
function generateDerivadasParcialesQuestion(topic, level, options, index, total) {
    let text = '';
    let correctAnswer = '';
    let choices = [];
    const shuffleKey = topic + '_parc_' + level;
    
    if (topic === 'parciales_dos_primer') {
        const subType = getShuffledIndexForTopic(shuffleKey + '_sub', 3, index);
        const askVar = getShuffledIndexForTopic(shuffleKey + '_var', 2, index) === 0 ? 'x' : 'y';
        
        if (subType === 0) {
            // Polynomial: f(x, y) = a*x^n*y^m + b*x^2 - c*y^3
            const a = randRange(2, 5);
            const n = randRange(2, 4);
            const m = randRange(2, 4);
            const b = randRange(2, 5);
            const c = randRange(2, 5);
            
            text = `Dada la función:\n$$ f(x,y) = ${a}x^{${n}}y^{${m}} + ${b}x^2 - ${c}y^3 $$`;
            
            if (askVar === 'x') {
                text += `\nCalcula la derivada parcial $\\frac{\\partial f}{\\partial x}$:`;
                const term1Val = a * n;
                const term1 = `${term1Val}x^{${n-1 > 1 ? n-1 : ''}}y^{${m}}`;
                correctAnswer = `$\\frac{\\partial f}{\\partial x} = ${term1} + ${2 * b}x$`;
                
                choices = [
                    correctAnswer,
                    `$\\frac{\\partial f}{\\partial x} = ${a}x^{${n-1}}y^{${m}} + ${2 * b}x$`,
                    `$\\frac{\\partial f}{\\partial x} = ${term1} + ${2 * b}x - ${3 * c}y^2$`,
                    `$\\frac{\\partial f}{\\partial x} = ${term1}$`
                ];
            } else {
                text += `\nCalcula la derivada parcial $\\frac{\\partial f}{\\partial y}$:`;
                const term1Val = a * m;
                const term1 = `${term1Val}x^{${n}}y^{${m-1 > 1 ? m-1 : ''}}`;
                correctAnswer = `$\\frac{\\partial f}{\\partial y} = ${term1} - ${3 * c}y^2$`;
                
                choices = [
                    correctAnswer,
                    `$\\frac{\\partial f}{\\partial y} = ${term1} + ${2 * b}x$`,
                    `$\\frac{\\partial f}{\\partial y} = ${a}x^{${n}}y^{${m-1}} - ${3 * c}y^2$`,
                    `$\\frac{\\partial f}{\\partial y} = ${term1} - ${c}y^2$`
                ];
            }
        } else if (subType === 1) {
            // Exponential: f(x, y) = e^{a*x*y}
            const a = randRange(2, 4);
            
            text = `Dada la función:\n$$ f(x,y) = e^{${a}xy} $$`;
            if (askVar === 'x') {
                text += `\nCalcula la derivada parcial $\\frac{\\partial f}{\\partial x}$:`;
                correctAnswer = `$\\frac{\\partial f}{\\partial x} = ${a}y e^{${a}xy}$`;
                
                choices = [
                    correctAnswer,
                    `$\\frac{\\partial f}{\\partial x} = ${a}x e^{${a}xy}$`,
                    `$\\frac{\\partial f}{\\partial x} = e^{${a}xy}$`,
                    `$\\frac{\\partial f}{\\partial x} = ${a} e^{${a}xy}$`
                ];
            } else {
                text += `\nCalcula la derivada parcial $\\frac{\\partial f}{\\partial y}$:`;
                correctAnswer = `$\\frac{\\partial f}{\\partial y} = ${a}x e^{${a}xy}$`;
                
                choices = [
                    correctAnswer,
                    `$\\frac{\\partial f}{\\partial y} = ${a}y e^{${a}xy}$`,
                    `$\\frac{\\partial f}{\\partial y} = e^{${a}xy}$`,
                    `$\\frac{\\partial f}{\\partial y} = ${a} e^{${a}xy}$`
                ];
            }
        } else {
            // Trigonometric / Log: f(x, y) = sin(a*x) + y*ln(x)
            const a = randRange(2, 5);
            
            text = `Dada la función:\n$$ f(x,y) = \\sin(${a}x) + y\\ln(x) $$`;
            if (askVar === 'x') {
                text += `\nCalcula la derivada parcial $\\frac{\\partial f}{\\partial x}$:`;
                correctAnswer = `$\\frac{\\partial f}{\\partial x} = ${a}\\cos(${a}x) + \\frac{y}{x}$`;
                
                choices = [
                    correctAnswer,
                    `$\\frac{\\partial f}{\\partial x} = \\cos(${a}x) + \\frac{y}{x}$`,
                    `$\\frac{\\partial f}{\\partial x} = ${a}\\cos(${a}x) + \\ln(x)$`,
                    `$\\frac{\\partial f}{\\partial x} = -${a}\\cos(${a}x) + \\frac{y}{x}$`
                ];
            } else {
                text += `\nCalcula la derivada parcial $\\frac{\\partial f}{\\partial y}$:`;
                correctAnswer = `$\\frac{\\partial f}{\\partial y} = \\ln(x)$`;
                
                choices = [
                    correctAnswer,
                    `$\\frac{\\partial f}{\\partial y} = \\frac{y}{x}$`,
                    `$\\frac{\\partial f}{\\partial y} = \\ln(x) + \\sin(${a}x)$`,
                    `$\\frac{\\partial f}{\\partial y} = 1$`
                ];
            }
        }
    } else if (topic === 'parciales_dos_segundo') {
        const askType = getShuffledIndexForTopic(shuffleKey + '_type', 3, index); // 0: f_xx, 1: f_yy, 2: f_xy
        
        const a = randRange(2, 4);
        const n = randRange(3, 4);
        const m = randRange(3, 4);
        
        text = `Dada la función:\n$$ f(x,y) = ${a}x^{${n}}y^{${m}} $$`;
        
        if (askType === 0) {
            text += `\nCalcula la derivada parcial de segundo orden $f_{xx} = \\frac{\\partial^2 f}{\\partial x^2}$:`;
            const val = a * n * (n - 1);
            correctAnswer = `$f_{xx} = ${val}x^{${n-2 > 1 ? n-2 : ''}}y^{${m}}$`;
            
            choices = [
                correctAnswer,
                `$f_{xx} = ${a * n}x^{${n-1}}y^{${m}}$`,
                `$f_{xx} = ${a * n * m}x^{${n-1}}y^{${m-1}}$`,
                `$f_{xx} = ${a * m * (m-1)}x^{${n}}y^{${m-2}}$`
            ];
        } else if (askType === 1) {
            text += `\nCalcula la derivada parcial de segundo orden $f_{yy} = \\frac{\\partial^2 f}{\\partial y^2}$:`;
            const val = a * m * (m - 1);
            correctAnswer = `$f_{yy} = ${val}x^{${n}}y^{${m-2 > 1 ? m-2 : ''}}$`;
            
            choices = [
                correctAnswer,
                `$f_{yy} = ${a * m}x^{${n}}y^{${m-1}}$`,
                `$f_{yy} = ${a * n * m}x^{${n-1}}y^{${m-1}}$`,
                `$f_{yy} = ${a * n * (n-1)}x^{${n-2}}y^{${m}}$`
            ];
        } else {
            text += `\nCalcula la derivada parcial mixta $f_{xy} = \\frac{\\partial^2 f}{\\partial y \\partial x}$:`;
            const val = a * n * m;
            correctAnswer = `$f_{xy} = ${val}x^{${n-1 > 1 ? n-1 : ''}}y^{${m-1 > 1 ? m-1 : ''}}$`;
            
            choices = [
                correctAnswer,
                `$f_{xy} = ${a * n * (n-1)}x^{${n-2}}y^{${m}}$`,
                `$f_{xy} = ${a * m * (m-1)}x^{${n}}y^{${m-2}}$`,
                `$f_{xy} = ${a}x^{${n-1}}y^{${m-1}}$`
            ];
        }
    } else if (topic === 'parciales_tres_primer') {
        const subType = getShuffledIndexForTopic(shuffleKey + '_sub', 2, index);
        const askVar = getShuffledIndexForTopic(shuffleKey + '_var', 3, index); // 0: x, 1: y, 2: z
        
        if (subType === 0) {
            // Polynomial: f(x, y, z) = a*x^n * y^m * z^q
            const a = randRange(2, 4);
            const n = randRange(2, 3);
            const m = randRange(2, 3);
            const q = randRange(2, 4);
            
            text = `Dada la función de tres variables:\n$$ f(x,y,z) = ${a}x^{${n}}y^{${m}}z^{${q}} $$`;
            
            if (askVar === 0) {
                text += `\nCalcula $\\frac{\\partial f}{\\partial x}$:`;
                const val = a * n;
                const xTerm = n - 1 > 1 ? `x^${n-1}` : 'x';
                correctAnswer = `$\\frac{\\partial f}{\\partial x} = ${val}${xTerm}y^{${m}}z^{${q}}$`;
                
                choices = [
                    correctAnswer,
                    `$\\frac{\\partial f}{\\partial x} = ${a}${xTerm}y^{${m}}z^{${q}}$`,
                    `$\\frac{\\partial f}{\\partial x} = ${a * m}x^{${n}}y^{${m-1}}z^{${q}}$`,
                    `$\\frac{\\partial f}{\\partial x} = ${a * q}x^{${n}}y^{${m}}z^{${q-1}}$`
                ];
            } else if (askVar === 1) {
                text += `\nCalcula $\\frac{\\partial f}{\\partial y}$:`;
                const val = a * m;
                const yTerm = m - 1 > 1 ? `y^${m-1}` : 'y';
                correctAnswer = `$\\frac{\\partial f}{\\partial y} = ${val}x^{${n}}${yTerm}z^{${q}}$`;
                
                choices = [
                    correctAnswer,
                    `$\\frac{\\partial f}{\\partial y} = ${a}x^{${n}}${yTerm}z^{${q}}$`,
                    `$\\frac{\\partial f}{\\partial y} = ${a * n}x^{${n-1}}y^{${m}}z^{${q}}$`,
                    `$\\frac{\\partial f}{\\partial y} = ${a * q}x^{${n}}y^{${m}}z^{${q-1}}$`
                ];
            } else {
                text += `\nCalcula $\\frac{\\partial f}{\\partial z}$:`;
                const val = a * q;
                const zTerm = q - 1 > 1 ? `z^${q-1}` : 'z';
                correctAnswer = `$\\frac{\\partial f}{\\partial z} = ${val}x^{${n}}y^{${m}}${zTerm}$`;
                
                choices = [
                    correctAnswer,
                    `$\\frac{\\partial f}{\\partial z} = ${a}x^{${n}}y^{${m}}${zTerm}$`,
                    `$\\frac{\\partial f}{\\partial z} = ${a * n}x^{${n-1}}y^{${m}}z^{${q}}$`,
                    `$\\frac{\\partial f}{\\partial z} = ${a * m}x^{${n}}y^{${m-1}}z^{${q}}$`
                ];
            }
        } else {
            // Function: f(x, y, z) = x^2 * y + y^2 * z + z^2 * x
            text = `Dada la función:\n$$ f(x,y,z) = x^2 y + y^2 z + z^2 x $$`;
            
            if (askVar === 0) {
                text += `\nCalcula $\\frac{\\partial f}{\\partial x}$:`;
                correctAnswer = `$\\frac{\\partial f}{\\partial x} = 2xy + z^2$`;
                
                choices = [
                    correctAnswer,
                    `$\\frac{\\partial f}{\\partial x} = 2xy + y^2$`,
                    `$\\frac{\\partial f}{\\partial x} = x^2 + z^2$`,
                    `$\\frac{\\partial f}{\\partial x} = 2xy + 2yz + 2zx$`
                ];
            } else if (askVar === 1) {
                text += `\nCalcula $\\frac{\\partial f}{\\partial y}$:`;
                correctAnswer = `$\\frac{\\partial f}{\\partial y} = x^2 + 2yz$`;
                
                choices = [
                    correctAnswer,
                    `$\\frac{\\partial f}{\\partial y} = x^2 + y^2$`,
                    `$\\frac{\\partial f}{\\partial y} = 2xy + 2yz$`,
                    `$\\frac{\\partial f}{\\partial y} = 2yz + z^2$`
                ];
            } else {
                text += `\nCalcula $\\frac{\\partial f}{\\partial z}$:`;
                correctAnswer = `$\\frac{\\partial f}{\\partial z} = y^2 + 2zx$`;
                
                choices = [
                    correctAnswer,
                    `$\\frac{\\partial f}{\\partial z} = z^2 + 2zx$`,
                    `$\\frac{\\partial f}{\\partial z} = y^2 + z^2$`,
                    `$\\frac{\\partial f}{\\partial z} = 2yz + 2zx$`
                ];
            }
        }
    } else { // parciales_gradiente
        const evalAtPoint = getShuffledIndexForTopic(shuffleKey + '_eval', 2, index) === 0;
        
        if (evalAtPoint) {
            // f(x,y) = x^2 + a*y^2 at point (xo, yo)
            const a = randRange(2, 4);
            const xo = randRange(1, 3);
            const yo = randRange(1, 3);
            
            text = `Calcula el vector gradiente de $f(x,y) = x^2 + ${a}y^2$ en el punto $(${xo}, ${yo})$:`;
            
            const gx = 2 * xo;
            const gy = 2 * a * yo;
            
            correctAnswer = `$\\nabla f(${xo}, ${yo}) = (${gx}, ${gy})$`;
            
            choices = [
                correctAnswer,
                `$\\nabla f(${xo}, ${yo}) = (${xo}, ${yo})$`,
                `$\\nabla f(${xo}, ${yo}) = (${gx}, ${a * yo})$`,
                `$\\nabla f(${xo}, ${yo}) = (${2 * xo}, ${2 * yo})$`
            ];
        } else {
            // Expression: f(x,y) = x^2*y^3
            const a = randRange(2, 4);
            text = `Calcula la expresión para el gradiente $\\nabla f(x,y)$ de la función:\n$$ f(x,y) = x^{${a}}y^3 $$`;
            
            const termX = `${a}x^{${a-1 > 1 ? a-1 : ''}}y^3`;
            const termY = `3x^{${a}}y^2`;
            
            correctAnswer = `$\\nabla f(x,y) = (${termX})\\mathbf{i} + (${termY})\\mathbf{j}$`;
            
            choices = [
                correctAnswer,
                `$\\nabla f(x,y) = (${termY})\\mathbf{i} + (${termX})\\mathbf{j}$`,
                `$\\nabla f(x,y) = (x^{${a}})y^3\\mathbf{i} + 3y^2\\mathbf{j}$`,
                `$\\nabla f(x,y) = (${a}x^{${a-1}}y^3)\\mathbf{i} + (x^{${a}}y^2)\\mathbf{j}$`
            ];
        }
    }

    const uniqueChoices = [...new Set(choices)];
    while (uniqueChoices.length < 4) {
        uniqueChoices.push(`$(0, 0)$`);
    }

    return {
        text: text,
        correctAnswer: correctAnswer,
        inputType: 'multiple-choice',
        choices: shuffleArray(uniqueChoices),
        topicLabel: 'Derivadas Parciales'
    };
}

// ==========================================================================
// INTEGRALES POR FRACCIONES PARCIALES GENERATOR
// ==========================================================================
function generateIntegralesFraccionesParcialesQuestion(topic, level, options, index, total) {
    let text = '';
    let correctAnswer = '';
    let choices = [];
    const shuffleKey = topic + '_frac_part_' + level;
    
    const formatBinomial = (v) => v > 0 ? `x - ${v}` : `x + ${Math.abs(v)}`;
    const formatSign = (v) => v > 0 ? `+ ${v}` : `- ${Math.abs(v)}`;

    if (topic === 'fracciones_parciales_simples') {
        const a = randRange(1, 3);
        let b = randRange(1, 4);
        while (b === a) { b = randRange(1, 4); }
        
        const A = randRange(1, 3);
        const B = randRange(1, 3);
        
        const numCoeffX = A + B;
        const numConst = - (A * b + B * a);
        
        const denB = - (a + b);
        const denC = a * b;
        
        const numText = `${numCoeffX}x ${numConst > 0 ? '+ ' + numConst : '- ' + Math.abs(numConst)}`;
        const denText = `x^2 ${denB > 0 ? '+ ' + denB : '- ' + Math.abs(denB)}x ${denC > 0 ? '+ ' + denC : '- ' + Math.abs(denC)}`;
        
        text = `Resuelve la integral utilizando descomposición en fracciones parciales (factores lineales distintos):\n$$ \\int \\frac{${numText}}{${denText}} \\, dx $$`;
        
        correctAnswer = `$${A}\\ln|${formatBinomial(a)}| ${formatSign(B)}\\ln|${formatBinomial(b)}| + C$`;
        
        choices = [
            correctAnswer,
            `$${A}\\ln|${formatBinomial(a)}| - ${B}\\ln|${formatBinomial(b)}| + C$`,
            `$\\ln|${formatBinomial(a)}| + \\ln|${formatBinomial(b)}| + C$`,
            `$${numCoeffX}\\ln|${denText}| + C$`
        ];
    } else if (topic === 'fracciones_parciales_repetidos') {
        const a = randRange(1, 3);
        const A = randRange(1, 3);
        const B = randRange(1, 3);
        
        const c = B - A * a;
        const denB = - 2 * a;
        const denC = a * a;
        
        const numText = `${A}x ${c > 0 ? '+ ' + c : c < 0 ? '- ' + Math.abs(c) : ''}`;
        const denText = `(x ${a > 0 ? '- ' + a : '+ ' + Math.abs(a)})^2`;
        
        text = `Resuelve la integral con factores lineales repetidos:\n$$ \\int \\frac{${numText}}{${denText}} \\, dx $$`;
        
        correctAnswer = `$${A}\\ln|${formatBinomial(a)}| - \\frac{${B}}{${formatBinomial(a)}} + C$`;
        
        choices = [
            correctAnswer,
            `$${A}\\ln|${formatBinomial(a)}| + \\frac{${B}}{${formatBinomial(a)}} + C$`,
            `$${A}\\ln|${formatBinomial(a)}| - \\frac{${B}}{(${formatBinomial(a)})^2} + C$`,
            `$${A}\\ln|${formatBinomial(a)}| + C$`
        ];
    } else { 
        const A = randRange(2, 4);
        const B = randRange(2, 4);
        
        const numText = `${A}x^2 + ${B}x + ${A}`;
        const denText = `x^3 + x`;
        
        text = `Resuelve la integral utilizando fracciones parciales con un factor cuadrático irreducible:\n$$ \\int \\frac{${numText}}{${denText}} \\, dx $$`;
        
        correctAnswer = `$${A}\\ln|x| + ${B}\\arctan(x) + C$`;
        
        choices = [
            correctAnswer,
            `$${A}\\ln|x| + \\frac{${B}}{2}\\ln(x^2 + 1) + C$`,
            `$${A}\\ln|x| - ${B}\\arctan(x) + C$`,
            `$\\ln|x^3 + x| + C$`
        ];
    }

    const uniqueChoices = [...new Set(choices)];
    while (uniqueChoices.length < 4) {
        uniqueChoices.push(`$\\ln|x| + C$`);
    }

    return {
        text: text,
        correctAnswer: correctAnswer,
        inputType: 'multiple-choice',
        choices: shuffleArray(uniqueChoices),
        topicLabel: 'Fracciones Parciales'
    };
}

// ==========================================================================
// INTEGRALES POR SUSTITUCIÓN TRIGONOMÉTRICA GENERATOR
// ==========================================================================
function generateIntegralesSustitucionTrigonometricaQuestion(topic, level, options, index, total) {
    let text = '';
    let correctAnswer = '';
    let choices = [];
    const shuffleKey = topic + '_sust_trig_' + level;
    
    if (topic === 'sust_trig_seno') {
        const subType = getShuffledIndexForTopic(shuffleKey + '_sub', 2, index);
        if (subType === 0) {
            const a = randRange(2, 6);
            const aSq = a * a;
            text = `Resuelve la integral utilizando la sustitución $x = ${a}\\sin(\\theta)$:\n$$ \\int \\frac{1}{\\sqrt{${aSq} - x^2}} \\, dx $$`;
            correctAnswer = `$\\arcsin\\left(\\frac{x}{${a}}\\right) + C$`;
            
            choices = [
                correctAnswer,
                `$\\frac{1}{${a}}\\arcsin\\left(\\frac{x}{${a}}\\right) + C$`,
                `$\\arccos\\left(\\frac{x}{${a}}\\right) + C$`,
                `$\\ln|x + \\sqrt{${aSq} - x^2}| + C$`
            ];
        } else {
            const a = randRange(2, 4) * 2; 
            const aSq = a * a;
            const halfSq = aSq / 2;
            text = `Resuelve utilizando la sustitución $x = ${a}\\sin(\\theta)$:\n$$ \\int \\sqrt{${aSq} - x^2} \\, dx $$`;
            correctAnswer = `$\\frac{x}{2}\\sqrt{${aSq} - x^2} + ${halfSq}\\arcsin\\left(\\frac{x}{${a}}\\right) + C$`;
            
            choices = [
                correctAnswer,
                `$\\frac{x}{2}\\sqrt{${aSq} - x^2} + ${aSq}\\arcsin\\left(\\frac{x}{${a}}\\right) + C$`,
                `$x\\sqrt{${aSq} - x^2} + ${halfSq}\\arcsin\\left(\\frac{x}{${a}}\\right) + C$`,
                `$\\frac{x}{2}\\sqrt{${aSq} - x^2} - ${halfSq}\\arccos\\left(\\frac{x}{${a}}\\right) + C$`
            ];
        }
    } else if (topic === 'sust_trig_tangente') {
        const subType = getShuffledIndexForTopic(shuffleKey + '_sub', 2, index);
        if (subType === 0) {
            const a = randRange(2, 5);
            const aSq = a * a;
            text = `Resuelve utilizando la sustitución $x = ${a}\\tan(\\theta)$:\n$$ \\int \\frac{1}{x^2 + ${aSq}} \\, dx $$`;
            correctAnswer = `$\\frac{1}{${a}}\\arctan\\left(\\frac{x}{${a}}\\right) + C$`;
            
            choices = [
                correctAnswer,
                `$\\arctan\\left(\\frac{x}{${a}}\\right) + C$`,
                `$\\frac{1}{${aSq}}\\arctan\\left(\\frac{x}{${a}}\\right) + C$`,
                `$\\frac{1}{${a}}\\ln|x^2 + ${aSq}| + C$`
            ];
        } else {
            const a = randRange(1, 4);
            const aSq = a * a;
            text = `Resuelve utilizando la sustitución $x = ${a}\\tan(\\theta)$:\n$$ \\int \\frac{1}{\\sqrt{x^2 + ${aSq}}} \\, dx $$`;
            correctAnswer = `$\\ln\\left|x + \\sqrt{x^2 + ${aSq}}\\right| + C$`;
            
            choices = [
                correctAnswer,
                `$\\frac{1}{${a}}\\ln\\left|x + \\sqrt{x^2 + ${aSq}}\\right| + C$`,
                `$\\ln\\left|\\sqrt{x^2 + ${aSq}}\\right| + C$`,
                `$\\frac{1}{${a}}\\arctan\\left(\\frac{x}{${a}}\\right) + C$`
            ];
        }
    } else { 
        const a = randRange(2, 5);
        const aSq = a * a;
        text = `Resuelve utilizando la sustitución $x = ${a}\\sec(\\theta)$:\n$$ \\int \\frac{1}{x\\sqrt{x^2 - ${aSq}}} \\, dx $$`;
        correctAnswer = `$\\frac{1}{${a}}\\operatorname{arcsec}\\left(\\frac{x}{${a}}\\right) + C$`;
        
        choices = [
            correctAnswer,
            `$\\operatorname{arcsec}\\left(\\frac{x}{${a}}\\right) + C$`,
            `$\\frac{1}{${a}}\\arcsin\\left(\\frac{x}{${a}}\\right) + C$`,
            `$\\frac{1}{${a}}\\ln\\left|x + \\sqrt{x^2 - ${aSq}}\\right| + C$`
        ];
    }

    const uniqueChoices = [...new Set(choices)];
    while (uniqueChoices.length < 4) {
        uniqueChoices.push(`$\\arctan(x) + C$`);
    }

    return {
        text: text,
        correctAnswer: correctAnswer,
        inputType: 'multiple-choice',
        choices: shuffleArray(uniqueChoices),
        topicLabel: 'Sustitución Trigonométrica'
    };
}

// ==========================================================================
// RECTA TANGENTE GENERATOR
// ==========================================================================
function generateRectaTangenteQuestion(topic, level, options, index, total) {
    let text = '';
    let correctAnswer = '';
    let choices = [];
    const shuffleKey = topic + '_recta_tan_' + level;
    
    if (topic === 'recta_tangente_algebraica') {
        const a = randRange(1, 2) * (Math.random() < 0.5 ? 1 : -1);
        const b = randRange(-3, 3);
        const c = randRange(-4, 4);
        const x0 = randRange(-1, 2);
        
        const fnText = `${a === 1 ? '' : a === -1 ? '-' : a}x^2 ${b > 0 ? '+ ' + b : b < 0 ? '- ' + Math.abs(b) : ''}x ${c > 0 ? '+ ' + c : c < 0 ? '- ' + Math.abs(c) : ''}`;
        text = `Encuentra la ecuación de la recta tangente a la curva de la función:\n$$ f(x) = ${fnText} $$\nen el valor de abscisa $x = ${x0}$.`;
        
        const y0 = a * x0 * x0 + b * x0 + c;
        const m = 2 * a * x0 + b;
        
        const intercept = y0 - m * x0;
        
        const formatLine = (slope, inter) => {
            let res = 'y = ';
            if (slope === 0) {
                res += inter;
            } else {
                res += `${slope === 1 ? '' : slope === -1 ? '-' : slope}x`;
                if (inter !== 0) {
                    res += ` ${inter > 0 ? '+ ' + inter : '- ' + Math.abs(inter)}`;
                }
            }
            return res;
        };
        
        correctAnswer = `$${formatLine(m, intercept)}$`;
        
        choices = [
            correctAnswer,
            `$${formatLine(m + 1, intercept - 2)}$`,
            `$${formatLine(-m, y0 + m * x0)}$`,
            `$y = ${m}x$`
        ];
    } else if (topic === 'recta_tangente_trig_exp') {
        const subType = getShuffledIndexForTopic(shuffleKey + '_sub', 2, index);
        if (subType === 0) {
            const a = randRange(2, 4);
            const b = randRange(2, 3);
            text = `Encuentra la ecuación de la recta tangente a la curva:\n$$ f(x) = ${a}e^{${b}x} $$\nen el punto donde $x = 0$.`;
            
            const y0 = a;
            const m = a * b;
            const intercept = y0;
            
            correctAnswer = `$y = ${m}x + ${intercept}$`;
            
            choices = [
                correctAnswer,
                `$y = ${b}x + ${a}$`,
                `$y = ${m}x$`,
                `$y = ${m}x - ${intercept}$`
            ];
        } else {
            const a = randRange(2, 5);
            text = `Encuentra la ecuación de la recta tangente a la curva:\n$$ f(x) = ${a}\\sin(x) $$\nen el punto donde $x = 0$.`;
            
            correctAnswer = `$y = ${a}x$`;
            
            choices = [
                correctAnswer,
                `$y = -${a}x$`,
                `$y = ${a}x + ${a}$`,
                `$y = x$`
            ];
        }
    } else { 
        const x0 = randRange(1, 2) * 2; 
        const a = x0 * x0; 
        const y0 = a / x0;
        
        text = `Determina la ecuación de la recta tangente a la curva de la función:\n$$ f(x) = \\frac{${a}}{x} $$\nen el punto dado $(${x0}, ${y0})$.`;
        
        const m = -1;
        const intercept = y0 - m * x0; 
        
        correctAnswer = `$y = -x + ${intercept}$`;
        
        choices = [
            correctAnswer,
            `$y = x + ${intercept - 2 * x0}$`,
            `$y = -x$`,
            `$y = -\\frac{1}{${x0}}x + ${y0 + 1}$`
        ];
    }

    const uniqueChoices = [...new Set(choices)];
    while (uniqueChoices.length < 4) {
        uniqueChoices.push(`$y = x$`);
    }

    return {
        text: text,
        correctAnswer: correctAnswer,
        inputType: 'multiple-choice',
        choices: shuffleArray(uniqueChoices),
        topicLabel: 'Recta Tangente'
    };
}

// ==========================================================================
// OPTIMIZACIÓN PRIMERA DERIVADA GENERATOR
// ==========================================================================
function generateOptimizacionPrimeraDerivadaQuestion(topic, level, options, index, total) {
    let text = '';
    let correctAnswer = '';
    let choices = [];
    
    const crit = "Criterio de la Primera Derivada:\n1. Hallar los puntos críticos donde f'(c) = 0 o no existe.\n2. Evaluar el signo de f'(x) a la izquierda y derecha de c:\n- Si cambia de (+) a (-), es un MÁXIMO.\n- Si cambia de (-) a (+), es un MÍNIMO.";
    
    if (topic === 'opt_1d_numeros') {
        const sum = randRange(3, 10) * 4; 
        text = `Encuentra dos números reales positivos cuya suma sea exactamente $${sum}$ y cuyo producto sea el máximo posible. ¿Cuáles son los números?`;
        
        const sol = sum / 2;
        correctAnswer = `$x = ${sol},\\, y = ${sol}$`;
        
        choices = [
            correctAnswer,
            `$x = ${sol - 2},\\, y = ${sol + 2}$`,
            `$x = ${sol - 4},\\, y = ${sol + 4}$`,
            `$x = ${sol / 2},\\, y = ${1.5 * sol}$`
        ];
    } else if (topic === 'opt_1d_areas') {
        const fence = randRange(5, 12) * 80; 
        text = `Un granjero desea cercar un terreno rectangular adyacente a un río recto (no se requiere cerca a lo largo del río). Dispone de $${fence}\\text{ metros}$ de cerca. Determina las dimensiones del terreno que maximizan su área.`;
        
        const width = fence / 4;
        const length = fence / 2;
        correctAnswer = `$x = ${width}\\text{ m (ancho)},\\, y = ${length}\\text{ m (largo)}$`;
        
        choices = [
            correctAnswer,
            `$x = ${width - 10}\\text{ m},\\, y = ${length + 20}\\text{ m}$`,
            `$x = ${fence / 3}\\text{ m},\\, y = ${fence / 3}\\text{ m}$`,
            `$x = ${width / 2}\\text{ m},\\, y = ${fence - width}\\text{ m}$`
        ];
    } else { 
        const side = randRange(2, 6) * 6; 
        text = `Se desea construir una caja abierta a partir de una hoja de cartón cuadrada de $${side}\\text{ cm}$ de lado, cortando un cuadrado de lado $x$ en cada esquina y doblando las pestañas hacia arriba. Determina el valor de $x$ que maximiza el volumen total de la caja.`;
        
        const sol = side / 6;
        correctAnswer = `$x = ${sol}\\text{ cm}$`;
        
        choices = [
            correctAnswer,
            `$x = ${sol + 1}\\text{ cm}$`,
            `$x = ${sol - 1}\\text{ cm}$`,
            `$x = ${side / 4}\\text{ cm}$`
        ];
    }

    const uniqueChoices = [...new Set(choices)];
    while (uniqueChoices.length < 4) {
        uniqueChoices.push(`$x = 2$`);
    }

    return {
        text: text,
        correctAnswer: correctAnswer,
        inputType: 'multiple-choice',
        choices: shuffleArray(uniqueChoices),
        topicLabel: 'Optimización (1ª Derivada)',
        criterion: crit
    };
}

// ==========================================================================
// OPTIMIZACIÓN SEGUNDA DERIVADA GENERATOR
// ==========================================================================
function generateOptimizacionSegundaDerivadaQuestion(topic, level, options, index, total) {
    let text = '';
    let correctAnswer = '';
    let choices = [];
    
    const crit = "Criterio de la Segunda Derivada:\n1. Hallar los puntos críticos resolviendo f'(c) = 0.\n2. Evaluar f''(c):\n- Si f''(c) < 0, es un MÁXIMO relativo.\n- Si f''(c) > 0, es un MÍNIMO relativo.";
    
    if (topic === 'opt_2d_costos') {
        const b = randRange(2, 6) * 50; 
        const c = randRange(2, 5) * 1000;
        text = `La función de beneficio mensual de una empresa al vender $x$ artículos está dada por:\n$$ B(x) = -x^2 + ${b}x - ${c} $$\nDetermina la cantidad $x$ de artículos que maximiza el beneficio usando el criterio de la segunda derivada.`;
        
        const sol = b / 2;
        correctAnswer = `$x = ${sol}$`;
        
        choices = [
            correctAnswer,
            `$x = ${sol - 10}$`,
            `$x = ${sol + 10}$`,
            `$x = ${b}$`
        ];
    } else if (topic === 'opt_2d_geometria') {
        const side = randRange(4, 10);
        const areaSq = side * side; 
        text = `De todos los rectángulos con un área de $${areaSq}\\text{ m}^2$, encuentra las dimensiones de aquel que minimiza su perímetro utilizando el criterio de la segunda derivada.`;
        
        correctAnswer = `$x = ${side}\\text{ m},\\, y = ${side}\\text{ m}$`;
        
        choices = [
            correctAnswer,
            `$x = ${side - 2}\\text{ m},\\, y = ${side + 2}\\text{ m}$`,
            `$x = ${side / 2}\\text{ m},\\, y = ${side * 2}\\text{ m}$`,
            `$x = 2\\text{ m},\\, y = ${areaSq / 2}\\text{ m}$`
        ];
    } else { 
        const xo = randRange(1, 3) * 5; 
        text = `Halla el punto sobre la recta $y = 2x$ que se encuentra a la distancia mínima del punto $(${xo}, 0)$ utilizando el criterio de la segunda derivada para confirmar el mínimo.`;
        
        const xSol = xo / 5;
        const ySol = 2 * xSol;
        correctAnswer = `$(${xSol}, ${ySol})$`;
        
        choices = [
            correctAnswer,
            `$(${xSol + 1}, ${2 * (xSol + 1)})$`,
            `$(${xSol - 1}, ${2 * (xSol - 1)})$`,
            `$(${xo}, 0)$`
        ];
    }

    const uniqueChoices = [...new Set(choices)];
    while (uniqueChoices.length < 4) {
        uniqueChoices.push(`$(0, 0)$`);
    }

    return {
        text: text,
        correctAnswer: correctAnswer,
        inputType: 'multiple-choice',
        choices: shuffleArray(uniqueChoices),
        topicLabel: 'Optimización (2ª Derivada)',
        criterion: crit
    };
}

// ==========================================================================
// OPTIMIZACIÓN FUNCIÓN CUADRÁTICA GENERATOR
// ==========================================================================
function generateOptimizacionCuadraticaQuestion(topic, level, options, index, total) {
    let text = '';
    let correctAnswer = '';
    let choices = [];
    const shuffleKey = topic + '_opt_cuad_' + level;
    
    const crit = "Optimización con Función Cuadrática:\nPara f(x) = ax^2 + bx + c:\n- Si a > 0, tiene un MÍNIMO en el vértice.\n- Si a < 0, tiene un MÁXIMO en el vértice.\n- El vértice ocurre en:\n$$ x = -\\frac{b}{2a} $$\n- El valor óptimo es f(-b/(2a)).";

    if (topic === 'opt_cuad_maximos') {
        const subType = getShuffledIndexForTopic(shuffleKey + '_sub', 2, index);
        if (subType === 0) {
            const b = randRange(3, 6) * 2; 
            const c = randRange(1, 4) * 5;  
            text = `Un proyectil es lanzado verticalmente hacia arriba desde una plataforma. Su altura en metros en función del tiempo $t$ (en segundos) se modela mediante la función cuadrática:\n$$ h(t) = -t^2 + ${b}t + ${c} $$\nDetermina en qué tiempo $t$ alcanza su altura máxima y el valor de dicha altura.`;
            
            const tSol = b / 2;
            const hSol = - (tSol * tSol) + b * tSol + c;
            correctAnswer = `$t = ${tSol}\\text{ s},\\, h = ${hSol}\\text{ m}$`;
            
            choices = [
                correctAnswer,
                `$t = ${tSol + 1}\\text{ s},\\, h = ${hSol - 2}\\text{ m}$`,
                `$t = ${tSol - 1}\\text{ s},\\, h = ${hSol - 4}\\text{ m}$`,
                `$t = ${b}\\text{ s},\\, h = ${c}\\text{ m}$`
            ];
        } else {
            const b = randRange(10, 30) * 4; 
            text = `El ingreso mensual $I(x)$ en dólares de una tienda de electrónica al vender $x$ unidades de un artículo está dado por la función cuadrática:\n$$ I(x) = -2x^2 + ${b}x $$\n¿Cuántas unidades $x$ deben venderse para obtener el ingreso máximo y a cuánto asciende dicho ingreso?`;
            
            const xSol = b / 4;
            const iSol = - 2 * (xSol * xSol) + b * xSol;
            correctAnswer = `$x = ${xSol}\\text{ unidades},\\, I = ${iSol}\\text{ USD}$`;
            
            choices = [
                correctAnswer,
                `$x = ${xSol - 5}\\text{ unidades},\\, I = ${iSol - 50}\\text{ USD}$`,
                `$x = ${xSol + 5}\\text{ unidades},\\, I = ${iSol - 50}\\text{ USD}$`,
                `$x = ${b/2}\\text{ unidades},\\, I = ${iSol / 2}\\text{ USD}$`
            ];
        }
    } else if (topic === 'opt_cuad_minimos') {
        const subType = getShuffledIndexForTopic(shuffleKey + '_sub', 2, index);
        if (subType === 0) {
            const b = randRange(6, 15) * 2; 
            const c = randRange(5, 15) * 15;
            text = `El costo de operación de una maquinaria industrial está dado por la función cuadrática:\n$$ C(x) = x^2 - ${b}x + ${c} $$\ndonde $x$ es la cantidad de horas de uso diario. ¿Cuántas horas $x$ minimizan el costo de operación y cuál es el costo mínimo?`;
            
            const xSol = b / 2;
            const cSol = (xSol * xSol) - b * xSol + c;
            correctAnswer = `$x = ${xSol}\\text{ horas},\\, C = ${cSol}\\text{ USD}$`;
            
            choices = [
                correctAnswer,
                `$x = ${xSol + 2}\\text{ horas},\\, C = ${cSol + 4}\\text{ USD}$`,
                `$x = ${xSol - 2}\\text{ horas},\\, C = ${cSol + 4}\\text{ USD}$`,
                `$x = ${b}\\text{ horas},\\, C = ${c}\\text{ USD}$`
            ];
        } else {
            const S = randRange(5, 12) * 2; 
            text = `Encuentra dos números reales cuya suma sea $${S}$ de tal manera que la suma de sus cuadrados sea la mínima posible. ¿Cuál es el valor mínimo de la suma de sus cuadrados?`;
            
            const sol = S / 2;
            const sumSq = 2 * (sol * sol);
            correctAnswer = `$x = ${sol},\\, y = ${sol}\\text{ (Suma de cuadrados = ${sumSq})}$`;
            
            choices = [
                correctAnswer,
                `$x = ${sol - 2},\\, y = ${sol + 2}\\text{ (Suma de cuadrados = ${sumSq + 8})}$`,
                `$x = ${sol - 4},\\, y = ${sol + 4}\\text{ (Suma de cuadrados = ${sumSq + 32})}$`,
                `$x = ${S},\\, y = 0\\text{ (Suma de cuadrados = ${S*S})$`
            ];
        }
    } else { 
        const subType = getShuffledIndexForTopic(shuffleKey + '_sub', 2, index);
        if (subType === 0) {
            const a = randRange(2, 4);
            const b = randRange(2, 4) * 2 * a; 
            const c = randRange(5, 15);
            text = `Dada la función cuadrática:\n$$ f(x) = ${a}x^2 - ${b}x + ${c} $$\nDetermina si la función posee un máximo o un mínimo, en qué valor de $x$ ocurre y el valor óptimo.`;
            
            const xSol = b / (2 * a);
            const fSol = a * (xSol * xSol) - b * xSol + c;
            correctAnswer = `Tiene un Mínimo de $${fSol}$ en $x = ${xSol}$`;
            
            choices = [
                correctAnswer,
                `Tiene un Máximo de $${fSol}$ en $x = ${xSol}$`,
                `Tiene un Mínimo de $${fSol + 2}$ en $x = ${xSol + 1}$`,
                `Tiene un Máximo de $${fSol + 2}$ en $x = ${xSol - 1}$`
            ];
        } else {
            const a = randRange(2, 4);
            const b = randRange(2, 4) * 2 * a; 
            const c = randRange(5, 15);
            text = `Dada la función cuadrática:\n$$ f(x) = -${a}x^2 + ${b}x + ${c} $$\nDetermina si la función posee un máximo o un mínimo, en qué valor de $x$ ocurre y el valor óptimo.`;
            
            const xSol = b / (2 * a);
            const fSol = - a * (xSol * xSol) + b * xSol + c;
            correctAnswer = `Tiene un Máximo de $${fSol}$ en $x = ${xSol}$`;
            
            choices = [
                correctAnswer,
                `Tiene un Mínimo de $${fSol}$ en $x = ${xSol}$`,
                `Tiene un Máximo de $${fSol - 4}$ en $x = ${xSol + 1}$`,
                `Tiene un Mínimo de $${fSol - 4}$ en $x = ${xSol - 1}$`
            ];
        }
    }

    const uniqueChoices = [...new Set(choices)];
    while (uniqueChoices.length < 4) {
        uniqueChoices.push(`Tiene un Mínimo de $0$ en $x = 0$`);
    }

    return {
        text: text,
        correctAnswer: correctAnswer,
        inputType: 'multiple-choice',
        choices: shuffleArray(uniqueChoices),
        topicLabel: 'Optimización Cuadrática',
        criterion: crit
    };
}

// ==========================================================================
// IDENTIDADES TRIGONOMÉTRICAS GENERATOR
// ==========================================================================
function generateIdentidadesTrigonometricasQuestion(topic, level, options, index, total) {
    let text = '';
    let correctAnswer = '';
    let choices = [];
    const shuffleKey = topic + '_trig_ident_' + level;
    
    if (topic === 'ident_pitagoricas') {
        const idx = getShuffledIndexForTopic(shuffleKey + '_pit', 6, index);
        if (idx === 0) {
            text = `Simplifica la expresión trigonométrica:\n$$ \\sin^2(x) + \\cos^2(x) $$`;
            correctAnswer = `$1$`;
            choices = [`$1$`, `$0$`, `$\\tan^2(x)$`, `$\\sec^2(x)$`];
        } else if (idx === 1) {
            text = `Simplifica la expresión trigonométrica:\n$$ 1 - \\sin^2(x) $$`;
            correctAnswer = `$\\cos^2(x)$`;
            choices = [`$\\cos^2(x)$`, `$\\sin^2(x)$`, `$1$`, `$-\\cos^2(x)$`];
        } else if (idx === 2) {
            text = `Simplifica la expresión trigonométrica:\n$$ \\sec^2(x) - \\tan^2(x) $$`;
            correctAnswer = `$1$`;
            choices = [`$1$`, `$0$`, `$\\cos^2(x)$`, `$\\csc^2(x)$`];
        } else if (idx === 3) {
            text = `Simplifica la expresión trigonométrica:\n$$ 1 + \\tan^2(x) $$`;
            correctAnswer = `$\\sec^2(x)$`;
            choices = [`$\\sec^2(x)$`, `$\\csc^2(x)$`, `$\\cos^2(x)$`, `$\\cot^2(x)$`];
        } else if (idx === 4) {
            text = `Simplifica la expresión trigonométrica:\n$$ \\csc^2(x) - \\cot^2(x) $$`;
            correctAnswer = `$1$`;
            choices = [`$1$`, `$\\sin^2(x)$`, `$0$`, `$\\cos^2(x)$`];
        } else {
            text = `Simplifica la expresión trigonométrica:\n$$ \\sec^2(x) - 1 $$`;
            correctAnswer = `$\\tan^2(x)$`;
            choices = [`$\\tan^2(x)$`, `$\\cot^2(x)$`, `$\\cos^2(x)$`, `$1$`];
        }
    } else if (topic === 'ident_cocientes_reciprocidades') {
        const idx = getShuffledIndexForTopic(shuffleKey + '_coc', 6, index);
        if (idx === 0) {
            text = `Simplifica utilizando identidades recíprocas o de cociente:\n$$ \\sin(x) \\sec(x) $$`;
            correctAnswer = `$\\tan(x)$`;
            choices = [`$\\tan(x)$`, `$\\cot(x)$`, `$\\cos(x)$`, `$1$`];
        } else if (idx === 1) {
            text = `Simplifica utilizando identidades recíprocas o de cociente:\n$$ \\cos(x) \\csc(x) $$`;
            correctAnswer = `$\\cot(x)$`;
            choices = [`$\\cot(x)$`, `$\\tan(x)$`, `$\\sin(x)$`, `$1$`];
        } else if (idx === 2) {
            text = `Simplifica la siguiente expresión:\n$$ \\tan(x) \\cos(x) $$`;
            correctAnswer = `$\\sin(x)$`;
            choices = [`$\\sin(x)$`, `$\\cos(x)$`, `$\\sec(x)$`, `$\\csc(x)$`];
        } else if (idx === 3) {
            text = `Simplifica la siguiente expresión:\n$$ \\cot(x) \\sin(x) $$`;
            correctAnswer = `$\\cos(x)$`;
            choices = [`$\\cos(x)$`, `$\\sin(x)$`, `$\\csc(x)$`, `$\\tan(x)$`];
        } else if (idx === 4) {
            text = `Simplifica la expresión trigonométrica:\n$$ \\frac{\\tan(x)}{\\sin(x)} $$`;
            correctAnswer = `$\\sec(x)$`;
            choices = [`$\\sec(x)$`, `$\\csc(x)$`, `$\\cos(x)$`, `$\\cot(x)$`];
        } else {
            text = `Simplifica la expresión trigonométrica:\n$$ \\frac{\\cot(x)}{\\cos(x)} $$`;
            correctAnswer = `$\\csc(x)$`;
            choices = [`$\\csc(x)$`, `$\\sec(x)$`, `$\\sin(x)$`, `$\\tan(x)$`];
        }
    } else { 
        const idx = getShuffledIndexForTopic(shuffleKey + '_sum', 5, index);
        if (idx === 0) {
            text = `Simplifica utilizando fórmulas de ángulo doble:\n$$ 2\\sin(x)\\cos(x) $$`;
            correctAnswer = `$\\sin(2x)$`;
            choices = [`$\\sin(2x)$`, `$\\cos(2x)$`, `$2\\sin(x)$`, `$\\tan(2x)$`];
        } else if (idx === 1) {
            text = `Simplifica utilizando fórmulas de ángulo doble:\n$$ \\cos^2(x) - \\sin^2(x) $$`;
            correctAnswer = `$\\cos(2x)$`;
            choices = [`$\\cos(2x)$`, `$\\sin(2x)$`, `$1$`, `$2\\cos(x)$`];
        } else if (idx === 2) {
            text = `Simplifica la expresión trigonométrica:\n$$ \\frac{\\sin(2x)}{2\\cos(x)} $$`;
            correctAnswer = `$\\sin(x)$`;
            choices = [`$\\sin(x)$`, `$\\cos(x)$`, `$\\tan(x)$`, `$\\sin(2x)$`];
        } else if (idx === 3) {
            text = `Simplifica la siguiente expresión:\n$$ 1 - 2\\sin^2(x) $$`;
            correctAnswer = `$\\cos(2x)$`;
            choices = [`$\\cos(2x)$`, `$\\sin(2x)$`, `$\\cos^2(x)$`, `$\\sin^2(x)$`];
        } else {
            text = `Simplifica la siguiente expresión:\n$$ 2\\cos^2(x) - 1 $$`;
            correctAnswer = `$\\cos(2x)$`;
            choices = [`$\\cos(2x)$`, `$\\sin(2x)$`, `$1$`, `$\\sec(2x)$`];
        }
    }

    const uniqueChoices = [...new Set(choices)];
    while (uniqueChoices.length < 4) {
        uniqueChoices.push(`$\\sin(x)$`);
    }

    return {
        text: text,
        correctAnswer: correctAnswer,
        inputType: 'multiple-choice',
        choices: shuffleArray(uniqueChoices),
        topicLabel: 'Identidades Trigonométricas'
    };
}

// ==========================================================================
// FACTORIZACIÓN DE EXPRESIONES CUADRÁTICAS GENERATOR
// ==========================================================================
function generateFactorizacionCuadraticaQuestion(topic, level, options, index, total) {
    let text = '';
    let correctAnswer = '';
    let choices = [];
    const shuffleKey = topic + '_fact_' + level;
    
    const critPoShenLoh = "Método de Po-Shen Loh (para x^2 + Bx + C):\n1. Las raíces r1, r2 sumadas son -B y su producto es C.\n2. El promedio es -B/2. Las raíces son -B/2 ± u.\n3. Se cumple: (-B/2 - u)(-B/2 + u) = C => (B^2)/4 - u^2 = C.\n4. Se halla u y luego las raíces r1, r2.\n5. Expresión factorizada: (x - r1)(x - r2).";
    const critGral = "Técnicas de Factorización Cuadrática:\n- Diferencia de Cuadrados:\n  x^2 - a^2 = (x - a)(x + a)\n- Trinomio Cuadrado Perfecto (TCP):\n  x^2 ± 2ax + a^2 = (x ± a)^2\n- Trinomios ax^2 + bx + c:\n  Búsqueda de dos binomios (px + q)(sx + t).";

    const formatFactor = (r) => r > 0 ? `x - ${r}` : `x + ${Math.abs(r)}`;
    const formatLinear = (coeff, k) => {
        let term = coeff === 1 ? 'x' : `${coeff}x`;
        if (k > 0) term += ` + ${k}`;
        else if (k < 0) term += ` - ${Math.abs(k)}`;
        return term;
    };

    if (topic === 'fact_poshenloh') {
        let r1 = randRange(-6, 6) || 2;
        let r2 = randRange(-6, 6) || 4;
        while (r1 === r2) { r2 = randRange(-6, 6) || 4; }
        
        const B = -(r1 + r2);
        const C = r1 * r2;
        
        const BPart = B === 1 ? '+ x' : B === -1 ? '- x' : B > 0 ? '+ ' + B + 'x' : B < 0 ? '- ' + Math.abs(B) + 'x' : '';
        const CPart = C > 0 ? '+ ' + C : C < 0 ? '- ' + Math.abs(C) : '';
        
        text = `Factoriza el siguiente trinomio de segundo grado utilizando el método de Po-Shen Loh:\n$$ x^2 ${BPart} ${CPart} $$`;
        
        correctAnswer = `$(${formatFactor(r1)})(${formatFactor(r2)})$`;
        
        choices = [
            correctAnswer,
            `$(${formatFactor(-r1)})(${formatFactor(-r2)})$`,
            `$(${formatFactor(r1)})(${formatFactor(-r2)})$`,
            `$(${formatFactor(-r1)})(${formatFactor(r2)})$`
        ];
    } else if (topic === 'fact_diferencia_tcp') {
        const subType = getShuffledIndexForTopic(shuffleKey + '_sub', 2, index);
        if (subType === 0) {
            const a = randRange(2, 10);
            const aSq = a * a;
            text = `Factoriza la siguiente diferencia de cuadrados:\n$$ x^2 - ${aSq} $$`;
            correctAnswer = `$(x - ${a})(x + ${a})$`;
            
            choices = [
                correctAnswer,
                `$(x - ${a})^2$`,
                `$(x + ${a})^2$`,
                `$x(x - ${aSq})$`
            ];
        } else {
            const a = randRange(2, 8) * (Math.random() < 0.5 ? 1 : -1);
            const mid = 2 * a;
            const last = a * a;
            
            text = `Factoriza el siguiente trinomio cuadrado perfecto:\n$$ x^2 ${mid > 0 ? '+ ' + mid : '- ' + Math.abs(mid)}x + ${last} $$`;
            
            correctAnswer = `$(${formatFactor(-a)})^2$`;
            
            choices = [
                correctAnswer,
                `$(${formatFactor(a)})^2$`,
                `$(${formatFactor(-a)})(${formatFactor(a)})$`,
                `$x(x ${mid > 0 ? '+ ' + mid : '- ' + Math.abs(mid)}) + ${last}$`
            ];
        }
    } else { 
        let p = randRange(2, 3);
        let s = randRange(1, 2);
        if (p * s === 1) { p = 2; }
        
        const q = randRange(-3, 3) || 1;
        const t = randRange(-3, 3) || 2;
        
        const a = p * s;
        const b = p * t + q * s;
        const c = q * t;
        
        const aPart = a === 1 ? '' : a === -1 ? '-' : a;
        const bPart = b === 1 ? '+ x' : b === -1 ? '- x' : b > 0 ? '+ ' + b + 'x' : b < 0 ? '- ' + Math.abs(b) + 'x' : '';
        const cPart = c > 0 ? '+ ' + c : c < 0 ? '- ' + Math.abs(c) : '';
        
        text = `Factoriza la siguiente expresión cuadrática con coeficiente principal $a \\neq 1$:\n$$ ${aPart}x^2 ${bPart} ${cPart} $$`;
        
        correctAnswer = `$(${formatLinear(p, q)})(${formatLinear(s, t)})$`;
        
        choices = [
            correctAnswer,
            `$(${formatLinear(p, -q)})(${formatLinear(s, -t)})$`,
            `$(${formatLinear(p, t)})(${formatLinear(s, q)})$`,
            `$(${formatLinear(p, -t)})(${formatLinear(s, -q)})$`
        ];
    }

    const uniqueChoices = [...new Set(choices)];
    while (uniqueChoices.length < 4) {
        uniqueChoices.push(`$(x - 1)(x - 2)$`);
    }

    return {
        text: text,
        correctAnswer: correctAnswer,
        inputType: 'multiple-choice',
        choices: shuffleArray(uniqueChoices),
        topicLabel: 'Factorización Cuadrática',
        criterion: topic === 'fact_poshenloh' ? critPoShenLoh : critGral,
        criterionHeader: topic === 'fact_poshenloh' ? "Método de Po-Shen Loh" : "Guía de Factorización"
    };
}

