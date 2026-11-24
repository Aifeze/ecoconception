(() => {
    if (typeof tp05Data === 'undefined' || typeof tp05Evaluator === 'undefined') return;
    const { exercises, languages } = tp05Data;
    const { evaluateExpression, parseExpression } = tp05Evaluator;

    const byId = id => document.getElementById(id);
    const form = byId('atelier');
    const languageSelect = byId('language');
    const exerciseSelect = byId('exercise');
    const answer = byId('answer');
    const feedback = byId('feedback');
    const results = byId('results');
    const drafts = new Map();
    const format = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 1 });
    let currentKey;

    function addOptions(select, entries) {
        select.replaceChildren(...entries.map(([value, label]) => new Option(label, value)));
    }

    addOptions(languageSelect, Object.entries(languages).map(([key, language]) => [key, language.name]));
    addOptions(exerciseSelect, Object.entries(exercises).map(([key, exercise]) => [key, exercise.title]));

    function resetResults() {
        feedback.textContent = '';
        delete feedback.dataset.success;
        results.hidden = true;
    }

    function showExercise() {
        if (currentKey) drafts.set(currentKey, answer.value);

        const languageKey = languageSelect.value;
        const exerciseKey = exerciseSelect.value;
        const language = languages[languageKey];
        const exercise = exercises[exerciseKey];
        currentKey = `${languageKey}/${exerciseKey}`;
        answer.value = drafts.get(currentKey) ?? '';
        resetResults();
        form.querySelector('details').open = false;
        byId('exercise-title').textContent = exercise.title;
        byId('exercise-description').textContent = exercise.description;
        byId('baseline').textContent = language[exerciseKey];
        byId('baseline-note').textContent = exercise.note;
        byId('hint').textContent = exercise.hint;
        byId('language-guide').href = `../langages/${languageKey}.html`;
        byId('language-guide').textContent = `Guide ${language.name}`;
        const names = exercise.inputs.map(name => languageKey === 'php' ? `$${name}` : name);
        byId('inputs').textContent = `Variables : ${names.join(', ')}. ${exercise.domain}`;
        const booleanAnd = languageKey === 'python' ? 'and' : '&&';
        const syntax = {
            sum: language.division === 'intdiv'
                ? 'Division entière : intdiv(a, b).'
                : `Opérateur de division pour cet exercice : ${language.division}.`,
            contains: `Pour combiner deux comparaisons, utilisez ${booleanAnd}.`,
            read: `Pour lire un élément, utilisez les crochets : ${names[0]}[…].`,
        };
        byId('syntax').textContent = `${syntax[exerciseKey]} Saisissez l’expression seule, sans fonction ni point-virgule.`;
    }

    function describeInputs(inputs) {
        return Object.entries(inputs).map(([name, value]) => {
            if (!Array.isArray(value)) return `${name} = ${value}`;
            return `${name} = [${value.slice(0, 5).join(', ')}${value.length > 5 ? ', …' : ''}]`;
        }).join(', ');
    }

    function assertCorrect(expression, exercise, language, inputs) {
        const expected = exercise.reference(inputs);
        const actual = evaluateExpression(expression, inputs, language);
        if (actual.value !== expected.value) {
            throw new Error(`Résultat différent pour ${describeInputs(inputs)}. Attendu : ${expected.value}. Obtenu : ${actual.value}.`);
        }
        return { expected, actual };
    }

    form.addEventListener('submit', event => {
        event.preventDefault();
        resetResults();
        const language = languageSelect.value;
        const exercise = exercises[exerciseSelect.value];

        try {
            const expression = parseExpression(answer.value, language, exercise.inputs, exercise.resultType);
            for (const inputs of exercise.cases) assertCorrect(expression, exercise, language, inputs);
            const { expected, actual } = assertCorrect(expression, exercise, language, exercise.benchmark);
            if (actual.operations >= expected.operations && !expected.memory) {
                feedback.textContent = 'Les résultats sont corrects. Essayez de réduire le nombre d’opérations sur le cas de comparaison.';
                return;
            }
            byId('benchmark').textContent = exercise.measure;
            byId('before-operations').textContent = format.format(expected.operations);
            byId('after-operations').textContent = format.format(actual.operations);
            byId('before-memory').textContent = format.format(expected.memory);
            const removed = expected.operations - actual.operations;
            const operations = removed > 0 ? `${format.format(removed)} opérations comptées en moins` : 'Pas de réduction des opérations comptées';
            const memory = expected.memory ? ` et ${format.format(expected.memory)} éléments temporaires évités` : '';
            byId('gain').textContent = `${operations}${memory} sur ce jeu de données.`;
            results.hidden = false;
            feedback.dataset.success = 'true';
            feedback.textContent = `Optimisation validée sur ${exercise.cases.length + 1} jeux de données. La comparaison est affichée sous l’éditeur.`;
        } catch (error) {
            feedback.textContent = error.message;
        }
    });

    languageSelect.addEventListener('change', showExercise);
    exerciseSelect.addEventListener('change', showExercise);
    answer.addEventListener('input', resetResults);
    showExercise();
    byId('atelier-controls').disabled = false;
    byId('atelier-status').hidden = true;
})();
