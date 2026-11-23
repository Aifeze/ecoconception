/*
 * Quiz « Génération d'images par IA et écoconception ».
 *
 * Pour modifier le quiz, il suffit d'éditer le tableau `questions` :
 *   type        : "single" (choix unique), "multiple" (choix multiples) ou "truefalse"
 *   theme       : notion abordée, reprise dans le récapitulatif final
 *   question    : énoncé
 *   answers     : propositions ; `correct: true` pour les bonnes réponses,
 *                 `why` explique l'erreur de raisonnement d'une mauvaise réponse
 *   explanation : correction affichée après validation
 *   takeaway    : notion à retenir, affichée dans les résultats
 */
const questions = [
    {
        type: "single",
        theme: "Fonctionnement de la diffusion",
        question: "Comment un modèle de diffusion, utilisé par la plupart des générateurs d'images, crée-t-il une image ?",
        answers: [
            { text: "Il part d'un bruit aléatoire qu'il retire progressivement, étape par étape, en s'appuyant sur la description fournie.", correct: true },
            { text: "Il recherche sur Internet l'image la plus proche de la description, puis la modifie légèrement.", why: "Le modèle ne consulte pas Internet pendant la génération : il s'appuie sur ce qu'il a appris lors de son entraînement, enregistré dans ses paramètres." },
            { text: "Il assemble des morceaux d'images existantes, découpés dans ses données d'entraînement.", why: "Le modèle ne conserve pas une bibliothèque d'images à découper : il a appris des régularités statistiques et calcule de nouveaux pixels." },
            { text: "Il dessine l'image pixel par pixel, sans jamais revenir sur ce qu'il a déjà produit.", why: "La diffusion travaille au contraire sur l'image entière à chaque étape et la retouche progressivement." }
        ],
        explanation: "La diffusion est un processus itératif : à chaque étape, un réseau de neurones estime le bruit encore présent et en retire une partie. Dans beaucoup de modèles récents, ce travail se fait sur une version compressée de l'image (l'« espace latent »), qu'un décodeur transforme ensuite en pixels. Chaque étape est un passage complet dans le réseau, donc du calcul.",
        takeaway: "Une image générée par diffusion est obtenue en retirant progressivement du bruit, en plusieurs étapes de calcul."
    },
    {
        type: "truefalse",
        theme: "Rôle du GPU",
        question: "Vrai ou faux : le GPU (processeur graphique) accélère la génération parce qu'il réalise en parallèle un très grand nombre de calculs simples, notamment des multiplications de matrices.",
        answers: [
            { text: "Vrai", correct: true },
            { text: "Faux", why: "Le GPU ne sert pas qu'à l'affichage : son architecture massivement parallèle en fait l'outil principal des calculs d'IA." }
        ],
        explanation: "Un réseau de neurones repose surtout sur des multiplications de matrices, que l'on peut découper en milliers d'opérations indépendantes. Un GPU dispose de milliers d'unités de calcul capables de les traiter simultanément, là où un processeur classique (CPU) en traite beaucoup moins à la fois. Plus rapide ne veut pas dire sans impact : sous forte charge, un GPU peut consommer de quelques dizaines à plusieurs centaines de watts, et sa fabrication a aussi une empreinte.",
        takeaway: "Le GPU exécute en parallèle les calculs du modèle ; sa consommation dépend de sa charge et de la durée d'utilisation."
    },
    {
        type: "single",
        theme: "Influence de la résolution",
        question: "On passe d'une image de 512 × 512 pixels à une image de 1024 × 1024 pixels. Par combien est multiplié le nombre de pixels à produire ?",
        answers: [
            { text: "Par 2", why: "Chaque côté double, mais la surface dépend des deux côtés : 2 × 2 = 4." },
            { text: "Par 4", correct: true },
            { text: "Par 8", why: "8 correspondrait à un doublement selon trois dimensions ; une image n'en a que deux." },
            { text: "Il ne change pas : seule la netteté de l'image change.", why: "Une résolution plus élevée, c'est réellement plus de pixels, donc plus de données à calculer et à garder en mémoire." }
        ],
        explanation: "512 × 512 = 262 144 pixels et 1024 × 1024 = 1 048 576 pixels, soit quatre fois plus. Le coût de calcul suit au moins cette hausse et peut augmenter davantage, car certains mécanismes des modèles (l'« attention ») comparent chaque zone de l'image à toutes les autres. La mémoire nécessaire sur le GPU augmente elle aussi.",
        takeaway: "Doubler la largeur et la hauteur multiplie par quatre le nombre de pixels, et au moins d'autant les calculs."
    },
    {
        type: "truefalse",
        theme: "Influence du nombre d'étapes",
        question: "Vrai ou faux : doubler le nombre d'étapes de génération double la qualité de l'image.",
        answers: [
            { text: "Vrai", why: "La qualité n'évolue pas proportionnellement au nombre d'étapes : c'est le temps de calcul qui suit à peu près cette proportion." },
            { text: "Faux", correct: true }
        ],
        explanation: "Chaque étape étant un nouveau passage dans le réseau, le temps de calcul augmente à peu près proportionnellement au nombre d'étapes. La qualité, elle, progresse vite au début puis plafonne : au-delà d'un seuil propre à chaque modèle et à chaque méthode d'échantillonnage, les étapes supplémentaires changent peu le résultat visible tout en coûtant autant de calcul.",
        takeaway: "Plus d'étapes signifie plus de calcul, mais pas une qualité proportionnellement meilleure."
    },
    {
        type: "multiple",
        theme: "Génération standard et optimisée",
        question: "Une génération « standard » utilise 1024 × 1024 pixels et 30 étapes. Une génération « optimisée » utilise 512 × 512 pixels et 15 étapes, avec le même modèle. Quelles affirmations sont exactes ?",
        answers: [
            { text: "Chaque étape porte sur quatre fois moins de pixels.", correct: true },
            { text: "Le modèle effectue deux fois moins de passages.", correct: true },
            { text: "L'image est moins détaillée, mais peut suffire pour une vignette, un brouillon ou une illustration affichée en petit.", correct: true },
            { text: "L'image obtenue est identique, simplement plus petite.", why: "Moins de pixels et moins d'étapes changent le résultat : détails, textures et parfois composition peuvent différer." },
            { text: "Le calcul est forcément divisé par exactement 8.", why: "On peut raisonner un ordre de grandeur (4 fois moins de pixels, 2 fois moins d'étapes), mais le gain réel dépend du modèle, du matériel et des opérations fixes comme le chargement du modèle ou le décodage de l'image. Il doit être mesuré." }
        ],
        explanation: "Les deux leviers se combinent : moins de pixels à chaque étape et moins d'étapes. Le gain est important, mais il se paie en détails. Le bon réglage dépend de l'usage : inutile de générer en 1024 × 1024 une image qui sera affichée sur 300 pixels de large.",
        takeaway: "Réduire résolution et étapes diminue fortement les calculs, au prix de détails : le réglage doit suivre le besoin réel."
    },
    {
        type: "single",
        theme: "Modèles accélérés",
        question: "Certains modèles dits « accélérés » ou « distillés » produisent une image en 1 à 8 étapes. Pourquoi ne peut-on pas régler n'importe quel modèle sur 5 étapes ?",
        answers: [
            { text: "Parce que ces modèles ont été spécialement entraînés pour aboutir en peu d'étapes ; un modèle classique réglé sur 5 étapes donne souvent une image floue ou inachevée.", correct: true },
            { text: "Parce qu'un faible nombre d'étapes demande davantage de mémoire sur le GPU.", why: "La mémoire nécessaire dépend surtout de la taille du modèle et de la résolution, pas du nombre d'étapes." },
            { text: "Parce qu'en dessous de 10 étapes, seule la résolution 1024 × 1024 est possible.", why: "Le nombre d'étapes et la résolution sont deux réglages indépendants." },
            { text: "On le peut : tous les modèles donnent le même résultat en 5 étapes qu'en 30.", why: "C'est faux pour les modèles classiques : ils ont besoin de davantage d'étapes pour retirer correctement le bruit." }
        ],
        explanation: "La distillation consiste à entraîner un modèle « élève » à reproduire en quelques étapes ce qu'un modèle « maître » obtient en plusieurs dizaines. Le gain de temps est réel, mais il peut s'accompagner de compromis selon les modèles : moins de diversité, moins de fidélité à la consigne ou des détails moins fins. L'entraînement de ces modèles a lui-même un coût, amorti seulement s'ils sont beaucoup utilisés.",
        takeaway: "Générer en très peu d'étapes exige un modèle conçu pour cela, avec des compromis possibles sur le résultat."
    },
    {
        type: "multiple",
        theme: "Utilisation répétée",
        question: "Une personne génère 20 variantes d'une même idée pour n'en garder qu'une. Quelles affirmations sont exactes ?",
        answers: [
            { text: "L'énergie consommée correspond aux 20 générations, pas seulement à l'image retenue.", correct: true },
            { text: "Seule l'image conservée a un coût énergétique, puisque les autres sont effacées.", why: "Effacer une image n'annule pas le calcul déjà effectué : l'énergie a été consommée au moment de la génération." },
            { text: "Préciser sa demande avant de générer peut réduire le nombre d'essais nécessaires.", correct: true },
            { text: "Explorer d'abord en basse résolution, puis générer une seule version finale en haute résolution, peut limiter les calculs.", correct: true },
            { text: "À l'échelle d'un service en ligne, cet usage reste négligeable car chaque image est rapide à produire.", why: "Un coût unitaire faible, multiplié par des millions de requêtes chaque jour, devient important : c'est l'effet de volume." }
        ],
        explanation: "Chaque génération mobilise le matériel pendant toute sa durée et les coûts s'additionnent : 20 essais représentent environ 20 fois le calcul d'une image. À l'échelle d'une plateforme utilisée par des millions de personnes, la répétition des requêtes est l'un des principaux facteurs d'impact.",
        takeaway: "Chaque essai a un coût : mieux préparer sa demande évite des générations inutiles."
    },
    {
        type: "truefalse",
        theme: "Réutilisation d'images",
        question: "Vrai ou faux : lorsqu'une image déjà générée répond au besoin, la réutiliser plutôt que d'en générer une nouvelle évite tout le calcul d'une nouvelle génération.",
        answers: [
            { text: "Vrai", correct: true },
            { text: "Faux", why: "Une nouvelle génération recalcule toutes les étapes ; réutiliser une image existante n'en refait aucune." }
        ],
        explanation: "Réafficher une image existante demande seulement de la lire et de la transmettre. Ces opérations ont aussi un coût (stockage, réseau, affichage), mais elles ne sollicitent ni le modèle ni le GPU pour recalculer l'image. Conserver et organiser les images utiles, par exemple dans une banque d'images interne, est donc une bonne pratique.",
        takeaway: "Réutiliser une image pertinente évite une nouvelle génération ; seul son stockage et sa diffusion restent à prendre en compte."
    },
    {
        type: "multiple",
        theme: "Limites des estimations",
        question: "Pourquoi faut-il rester prudent face à un chiffre annonçant « l'énergie consommée par une image générée » ?",
        answers: [
            { text: "Le résultat dépend fortement du matériel utilisé (GPU, ordinateur, serveur) et de son efficacité.", correct: true },
            { text: "Une lecture instantanée de la puissance ne suffit pas : il faut la mesurer sur toute la durée de la génération.", correct: true },
            { text: "Selon la méthode, le chiffre inclut ou non le chargement du modèle, le refroidissement, le réseau ou la fabrication du matériel.", correct: true },
            { text: "Le nombre d'étapes suffit à calculer précisément l'énergie consommée.", why: "Les étapes donnent une tendance, pas une valeur : à nombre d'étapes égal, le modèle, la résolution et le matériel changent fortement le résultat." },
            { text: "La consommation est la même quel que soit l'ordinateur utilisé.", why: "Deux machines peuvent présenter des écarts importants de durée et de puissance pour une même génération." }
        ],
        explanation: "L'énergie se calcule ainsi : Énergie (Wh) = Puissance moyenne (W) × Durée (h). Par exemple, une puissance moyenne de 100 W pendant 36 secondes (0,01 h) correspond à 1 Wh. Sans connaître le matériel, la durée réelle et le périmètre pris en compte, un chiffre isolé reste une estimation : une mesure fiable précise toujours ses conditions.",
        takeaway: "Une consommation énergétique se mesure (puissance moyenne × durée) et n'a de sens qu'avec ses conditions de mesure."
    },
    {
        type: "single",
        theme: "Bonnes pratiques",
        question: "Quelle démarche est la plus cohérente avec l'écoconception lorsqu'on utilise un outil de génération d'images ?",
        answers: [
            { text: "Définir le besoin, choisir une résolution adaptée à l'affichage réel et un modèle suffisant, puis réutiliser les résultats pertinents.", correct: true },
            { text: "Toujours générer à la résolution maximale, pour pouvoir réduire l'image ensuite si besoin.", why: "Générer plus grand que nécessaire multiplie les calculs pour des détails qui ne seront jamais vus." },
            { text: "Activer le thème sombre de l'outil, ce qui compense la consommation de la génération.", why: "Un thème sombre peut réduire la consommation de certains écrans (OLED notamment) mais presque pas celle d'autres (LCD), et il n'a aucun effet sur le calcul réalisé par le GPU." },
            { text: "Relancer plusieurs fois la même demande pour être sûr d'obtenir la meilleure qualité.", why: "Chaque nouvel essai ajoute un calcul complet : mieux vaut affiner la demande." }
        ],
        explanation: "L'écoconception consiste à répondre au besoin avec le moins de ressources possible, sans sacrifier l'utilité du résultat : générer seulement quand c'est nécessaire, au bon format, avec un modèle adapté, et réutiliser ce qui existe déjà.",
        takeaway: "Générer seulement si nécessaire, au bon format, avec un modèle adapté, et réutiliser ce qui existe."
    }
];

const TYPE_LABELS = {
    single: "Choix unique",
    multiple: "Choix multiples : sélectionnez toutes les réponses valides",
    truefalse: "Vrai ou faux"
};

// Bonne réponse si et seulement si l'ensemble sélectionné est exactement l'ensemble des bonnes réponses.
function isAnswerCorrect(question, selectedIndexes) {
    const expected = question.answers
        .map((answer, index) => (answer.correct ? index : -1))
        .filter(index => index !== -1);

    return selectedIndexes.length === expected.length
        && expected.every(index => selectedIndexes.includes(index));
}

function getAppreciation(score) {
    if (score <= 3) return "Les bases sont encore à découvrir";
    if (score <= 6) return "Les notions principales sont comprises";
    if (score <= 8) return "Bonne compréhension de l'écoconception";
    return "Très bonne maîtrise du sujet";
}

if (typeof document !== "undefined") {
    let currentQuestionIndex = 0;
    let results = [];
    let isLocked = false;

    const validateButton = document.getElementById("validate-btn");
    const nextButton = document.getElementById("next-btn");
    const questionContainer = document.getElementById("question-container");
    const infoWrapper = document.getElementById("info");
    const infoText = document.getElementById("info-text");
    const progressBar = document.getElementById("progress-bar");
    const progressText = document.getElementById("quiz-progress-text");

    validateButton.addEventListener("click", validateAnswer);
    nextButton.addEventListener("click", loadNextQuestion);

    function getSelectedIndexes() {
        return Array.from(document.querySelectorAll('input[name="answer"]:checked'))
            .map(input => Number(input.value));
    }

    function loadQuestion(index) {
        const questionData = questions[index];
        const inputType = questionData.type === "multiple" ? "checkbox" : "radio";

        isLocked = false;
        updateProgress(index);

        questionContainer.innerHTML = `
            <fieldset class="quiz-ia-fieldset">
                <legend>
                    <span class="quiz-ia-type">${TYPE_LABELS[questionData.type]}</span>
                    <h2 id="question-title" tabindex="-1">${questionData.question}</h2>
                </legend>
                <div class="answers-list">
                    ${questionData.answers.map((answer, answerIndex) => `
                        <label class="answer-option">
                            <input type="${inputType}" name="answer" value="${answerIndex}">
                            <span>${answer.text}</span>
                        </label>
                    `).join("")}
                </div>
            </fieldset>
        `;

        questionContainer.querySelectorAll('input[name="answer"]').forEach(input => {
            input.addEventListener("change", () => {
                validateButton.disabled = getSelectedIndexes().length === 0;
            });
        });

        infoWrapper.style.display = "none";
        infoText.innerHTML = "";

        validateButton.disabled = true;
        validateButton.style.display = "inline-block";
        nextButton.style.display = "none";
    }

    function validateAnswer() {
        const selectedIndexes = getSelectedIndexes();

        if (isLocked || selectedIndexes.length === 0) {
            return;
        }

        isLocked = true;

        const questionData = questions[currentQuestionIndex];
        const correct = isAnswerCorrect(questionData, selectedIndexes);
        results.push(correct);

        document.querySelectorAll('input[name="answer"]').forEach(input => {
            input.disabled = true;

            const answer = questionData.answers[Number(input.value)];
            const label = input.closest(".answer-option");

            if (answer.correct) {
                label.classList.add("is-correct");
                label.insertAdjacentHTML("beforeend", '<span class="answer-badge"><i class="fa-solid fa-check" aria-hidden="true"></i> Bonne réponse</span>');
            } else if (input.checked) {
                label.classList.add("is-wrong");
                label.insertAdjacentHTML("beforeend", '<span class="answer-badge"><i class="fa-solid fa-xmark" aria-hidden="true"></i> Votre choix, incorrect</span>');
            }
        });

        showCorrection(questionData, selectedIndexes, correct);

        validateButton.style.display = "none";
        nextButton.textContent = currentQuestionIndex === questions.length - 1 ? "Voir les résultats" : "Question suivante";
        nextButton.style.display = "inline-block";
        nextButton.focus();
    }

    function showCorrection(questionData, selectedIndexes, correct) {
        const correctAnswers = questionData.answers.filter(answer => answer.correct);
        const wrongChoices = selectedIndexes
            .map(index => questionData.answers[index])
            .filter(answer => !answer.correct);
        const missedAnswers = correctAnswers
            .filter(answer => !selectedIndexes.includes(questionData.answers.indexOf(answer)));

        let mistakes = "";

        if (wrongChoices.length > 0) {
            mistakes += `
                <p><strong class="strong-yellow">Pourquoi votre choix ne convient pas :</strong></p>
                <ul>${wrongChoices.map(answer => `<li><em>« ${answer.text} »</em> ${answer.why}</li>`).join("")}</ul>
            `;
        }

        if (questionData.type === "multiple" && missedAnswers.length > 0) {
            mistakes += `
                <p><strong class="strong-yellow">Réponse${missedAnswers.length > 1 ? "s" : ""} valide${missedAnswers.length > 1 ? "s" : ""} oubliée${missedAnswers.length > 1 ? "s" : ""} :</strong></p>
                <ul>${missedAnswers.map(answer => `<li>${answer.text}</li>`).join("")}</ul>
            `;
        }

        infoWrapper.classList.toggle("is-correct", correct);
        infoWrapper.classList.toggle("is-wrong", !correct);

        infoText.innerHTML = `
            <p class="quiz-ia-status">
                <i class="fa-solid ${correct ? "fa-circle-check" : "fa-circle-xmark"}" aria-hidden="true"></i>
                ${correct ? "Bonne réponse !" : "Réponse incorrecte."}
            </p>
            ${correctAnswers.length > 1
                ? `<p><strong>Les bonnes réponses :</strong></p>
                   <ul>${correctAnswers.map(answer => `<li>${answer.text}</li>`).join("")}</ul>`
                : `<p><strong>La bonne réponse :</strong> ${correctAnswers[0].text}</p>`}
            <p><strong>Explication :</strong> ${questionData.explanation}</p>
            ${mistakes}
        `;

        infoWrapper.style.display = "block";
    }

    function loadNextQuestion() {
        currentQuestionIndex++;

        if (currentQuestionIndex < questions.length) {
            loadQuestion(currentQuestionIndex);
            document.getElementById("question-title").focus();
        } else {
            showResults();
        }
    }

    function updateProgress(index) {
        progressText.textContent = `Question ${index + 1} sur ${questions.length}`;
        progressBar.style.width = `${((index + 1) / questions.length) * 100}%`;
    }

    function showResults() {
        const score = results.filter(Boolean).length;
        const percentage = Math.round((score / questions.length) * 100);

        infoWrapper.style.display = "none";
        validateButton.style.display = "none";
        nextButton.style.display = "none";

        progressText.textContent = "Quiz terminé";
        progressBar.style.width = "100%";

        questionContainer.innerHTML = `
            <h2 class="quiz-results-title" id="question-title" tabindex="-1">
                Résultat : <strong>${getAppreciation(score)}</strong>
            </h2>

            <div class="result-grid">
                <div class="result-card">
                    <p class="result-value">${score} / ${questions.length}</p>
                    <p class="result-label">bonnes réponses</p>
                </div>

                <div class="result-card">
                    <p class="result-value">${percentage} %</p>
                    <p class="result-label">de réussite</p>
                </div>
            </div>

            <h3 class="quiz-ia-recap-title">Notions à retenir</h3>
            <ul class="quiz-ia-recap">
                ${questions.map((question, index) => `
                    <li class="${results[index] ? "is-correct" : "is-wrong"}">
                        <i class="fa-solid ${results[index] ? "fa-check" : "fa-rotate-left"}" aria-hidden="true"></i>
                        <span>
                            <strong>${question.theme}</strong>
                            <span class="quiz-ia-recap-state">(${results[index] ? "acquise" : "à revoir"})</span> :
                            ${question.takeaway}
                        </span>
                    </li>
                `).join("")}
            </ul>

            <div class="button-container quiz-results-actions">
                <button type="button" id="restart-btn" class="button">Recommencer le quiz</button>
                <a href="./quizz-access.html" class="button-secondary">Autres quiz</a>
            </div>
        `;

        document.getElementById("restart-btn").addEventListener("click", restartQuiz);
        document.getElementById("question-title").focus();
    }

    function restartQuiz() {
        currentQuestionIndex = 0;
        results = [];
        loadQuestion(0);
        document.getElementById("question-title").focus();
    }

    loadQuestion(currentQuestionIndex);
}

if (typeof module !== "undefined") {
    module.exports = { questions, isAnswerCorrect, getAppreciation };
}
