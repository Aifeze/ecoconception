/*
 * Bouton "Copier" sur les blocs de code des pages langages.
 *
 * Choix éco-conçus :
 *  - Aucun travail au chargement de la page : les boutons ne sont créés
 *    que lorsqu'une règle est ouverte (le code n'existe pas avant).
 *  - Un seul écouteur d'événement pour toute la page (délégation),
 *    au lieu d'un écouteur par bouton.
 *  - Pas de MutationObserver, pas de setInterval, pas de bibliothèque.
 *  - API native navigator.clipboard, icône Font Awesome déjà chargée.
 */
(function () {
    'use strict';

    function addCopyButtons(rule) {
        var blocks = rule.querySelectorAll('.code-block');

        for (var i = 0; i < blocks.length; i++) {
            if (blocks[i].querySelector('.copy-btn')) {
                continue; // déjà équipé
            }

            var btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'copy-btn';
            btn.setAttribute('aria-label', 'Copier le code');
            btn.innerHTML = '<i class="fas fa-copy" aria-hidden="true"></i> Copier';
            blocks[i].appendChild(btn);
        }
    }

    function showFeedback(btn, ok) {
        btn.innerHTML = ok
            ? '<i class="fas fa-check" aria-hidden="true"></i> Copié !'
            : 'Ctrl+C pour copier';
        btn.disabled = true;

        setTimeout(function () {
            btn.innerHTML = '<i class="fas fa-copy" aria-hidden="true"></i> Copier';
            btn.disabled = false;
        }, 2000);
    }

    function copyCode(btn) {
        var code = btn.parentElement.querySelector('code');
        if (!code) {
            return;
        }

        // textContent ignore les <span> de coloration : on copie le code brut.
        var text = code.textContent.trim();

        if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard.writeText(text).then(
                function () { showFeedback(btn, true); },
                function () { selectCode(code); showFeedback(btn, false); }
            );
        } else {
            // Contexte non sécurisé (http) : on sélectionne le code pour Ctrl+C.
            selectCode(code);
            showFeedback(btn, false);
        }
    }

    function selectCode(code) {
        var range = document.createRange();
        range.selectNodeContents(code);
        var sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
    }

    // Écouteur unique : se déclenche après le script de la page (phase de bouillonnement),
    // donc le contenu de la règle est déjà injecté quand on ajoute les boutons.
    document.addEventListener('click', function (e) {
        var copyBtn = e.target.closest('.copy-btn');
        if (copyBtn) {
            copyCode(copyBtn);
            return;
        }

        var header = e.target.closest('.rule-header');
        if (header) {
            var rule = header.closest('.eco-rule');
            if (rule && rule.classList.contains('active')) {
                addCopyButtons(rule);
            }
        }
    });
})();
