/*
 * Interface de l'atelier « Génération d'images par IA et écoconception ».
 *
 * - Lit les données de window.ATELIER_IA_DATA (atelierIaImagesData.js).
 * - Aucune dépendance, aucune requête réseau hormis le chargement des images
 *   réellement affichées (les images non visibles ne sont jamais téléchargées).
 * - Le rendu est fait une seule fois au chargement ; les interactions ne font
 *   ensuite que basculer des classes ou mettre à jour quelques nœuds.
 */
(function () {
    "use strict";

    const DATA = window.ATELIER_IA_DATA;
    if (!DATA) {
        return;
    }

    const CONFIGS = DATA.configurations;
    const REFERENCE_PIXELS = 512 * 512;

    /* Libellés et icônes de chaque statut : jamais la couleur seule. */
    const STATUTS = {
        "mesure": { libelle: "Mesuré", icone: "fa-solid fa-circle-check" },
        "estime": { libelle: "Estimation théorique", icone: "fa-solid fa-calculator" },
        "simule": { libelle: "Valeur simulée", icone: "fa-solid fa-flask" },
        "non-mesure": { libelle: "Donnée non mesurée", icone: "fa-solid fa-circle-question" }
    };

    const nf = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 2 });

    function esc(text) {
        return String(text)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;");
    }

    function badge(statut) {
        const s = STATUTS[statut] || STATUTS["non-mesure"];
        return `<span class="ia-badge ia-badge--${esc(statut)}"><i class="${s.icone}" aria-hidden="true"></i>${esc(s.libelle)}</span>`;
    }

    /* Énergie (Wh) = Puissance moyenne (W) × Durée (h). */
    function energieWh(mesure) {
        if (typeof mesure.energieWh === "number") {
            return mesure.energieWh;
        }
        if (typeof mesure.puissanceMoyenneW === "number" && typeof mesure.tempsSecondes === "number") {
            return mesure.puissanceMoyenneW * (mesure.tempsSecondes / 3600);
        }
        return null;
    }

    /*
     * Indice de calcul théorique : (pixels / 512²) × étapes, ramené à 100 pour la
     * configuration la plus coûteuse. Hypothèse volontairement simplifiée,
     * affichée comme une estimation et jamais comme une mesure.
     */
    const indicesBruts = CONFIGS.map(c => (c.largeur * c.hauteur / REFERENCE_PIXELS) * c.etapes);
    const indiceMax = Math.max.apply(null, indicesBruts);
    function indiceCalcul(config) {
        const brut = (config.largeur * config.hauteur / REFERENCE_PIXELS) * config.etapes;
        return (brut / indiceMax) * 100;
    }

    function valeurMesure(statut, valeur, unite) {
        if (statut === "non-mesure" || valeur === null || valeur === undefined) {
            return badge("non-mesure");
        }
        return `<strong>${nf.format(valeur)} ${esc(unite)}</strong> ${badge(statut)}`;
    }

    function ligneIndicateurs(config) {
        const m = config.mesure;
        const e = energieWh(m);
        const indice = indiceCalcul(config);
        return {
            resolution: `${config.largeur} × ${config.hauteur} px`,
            pixels: `${nf.format(config.largeur * config.hauteur / 1e6)} million${config.largeur * config.hauteur >= 2e6 ? "s" : ""} de pixels`,
            etapes: `${config.etapes} étapes`,
            temps: valeurMesure(m.statut, m.tempsSecondes, "s"),
            energie: valeurMesure(m.statut, e, "Wh"),
            qualite: valeurMesure(config.qualite.statut, config.qualite.valeur, ""),
            indice: indice,
            indiceTexte: `${nf.format(Math.round(indice * 10) / 10)} / 100`
        };
    }

    function contexteMesure(m) {
        if (m.statut === "non-mesure") {
            return "";
        }
        const items = [
            ["Matériel", m.materiel],
            ["Modèle", m.modele],
            ["Puissance moyenne", typeof m.puissanceMoyenneW === "number" ? `${nf.format(m.puissanceMoyenneW)} W` : null],
            ["Date", m.date],
            ["Protocole", m.protocole]
        ].filter(item => item[1]);
        if (!items.length) {
            return "";
        }
        return `<dl class="ia-context">${items.map(i => `<dt>${esc(i[0])}</dt><dd>${esc(i[1])}</dd>`).join("")}</dl>`;
    }

    /* ── 1. Schéma du débruitage ───────────────────────────────────────── */
    function initDebruitage() {
        const range = document.getElementById("ia-denoise-range");
        const img = document.getElementById("ia-denoise-img");
        const caption = document.getElementById("ia-denoise-caption");
        const etat = document.getElementById("ia-denoise-state");
        if (!range || !img || !caption) {
            return;
        }
        const etats = DATA.debruitage;
        range.max = String(etats.length - 1);

        function maj() {
            const i = Number(range.value);
            img.src = etats[i].src;
            img.alt = `Schéma du débruitage, état ${i} sur ${etats.length - 1} : ${etats[i].legende}`;
            caption.textContent = etats[i].legende;
            etat.textContent = `État ${i} / ${etats.length - 1}`;
            range.setAttribute("aria-valuetext", `État ${i} sur ${etats.length - 1} : ${etats[i].legende}`);
        }
        range.addEventListener("input", maj);
        maj();
    }

    /* ── 2. Sélection d'une configuration ──────────────────────────────── */
    function renderDetail(config) {
        const l = ligneIndicateurs(config);
        const lienPleineTaille = config.image.pleineTaille
            ? `<a class="ia-fullsize-link" href="${esc(config.image.pleineTaille)}" target="_blank" rel="noopener">
                   Ouvrir l'illustration en ${config.largeur} × ${config.hauteur} px (32 Ko)
                   <span class="sr-only">(nouvel onglet)</span></a>`
            : "";
        return `
            <div class="ia-detail-media">
                <img src="${esc(config.image.apercu)}" alt="${esc(config.image.alt)}"
                     width="512" height="512" decoding="async">
                <p class="ia-image-label"><i class="fa-solid fa-paintbrush" aria-hidden="true"></i>
                    Illustration pédagogique, non générée par IA</p>
                ${lienPleineTaille}
            </div>
            <div class="ia-detail-body">
                <p class="ia-detail-kicker">Configuration ${esc(config.lettre)}</p>
                <h3 id="ia-detail-title">${esc(config.nom)}</h3>
                <p class="ia-detail-summary">${esc(config.resume)}</p>

                <div class="ia-param-cards">
                    <div class="ia-param-card">
                        <i class="fa-solid fa-expand" aria-hidden="true"></i>
                        <span class="ia-param-name">Résolution</span>
                        <span class="ia-param-value">${esc(l.resolution)}</span>
                        <span class="ia-param-sub">${esc(l.pixels)}</span>
                    </div>
                    <div class="ia-param-card">
                        <i class="fa-solid fa-stairs" aria-hidden="true"></i>
                        <span class="ia-param-name">Étapes de débruitage</span>
                        <span class="ia-param-value">${config.etapes}</span>
                        <span class="ia-param-sub">passages du modèle</span>
                    </div>
                </div>

                <dl class="ia-measures">
                    <dt>Temps de génération</dt><dd>${l.temps}</dd>
                    <dt>Consommation énergétique</dt><dd>${l.energie}</dd>
                    <dt>Qualité visuelle (score)</dt><dd>${l.qualite}</dd>
                    <dt>Volume de calcul relatif</dt>
                    <dd><strong>${esc(l.indiceTexte)}</strong> ${badge("estime")}</dd>
                </dl>
                ${contexteMesure(config.mesure)}

                <h4>Méthode</h4>
                <p>${esc(config.methode)}</p>
                <div class="ia-vigilance" role="note">
                    <i class="fa-solid fa-triangle-exclamation" aria-hidden="true"></i>
                    <p><strong>Point de vigilance :</strong> ${esc(config.vigilance)}</p>
                </div>
                <p class="ia-expected"><strong>Qualité attendue :</strong> ${esc(config.qualite.attendu)}</p>
            </div>`;
    }

    function initSelection() {
        const selector = document.getElementById("ia-config-selector");
        const detail = document.getElementById("ia-config-detail");
        if (!selector || !detail) {
            return;
        }

        selector.innerHTML = CONFIGS.map((c, i) => `
            <label class="ia-choice">
                <input type="radio" name="ia-config" value="${esc(c.id)}" ${i === 0 ? "checked" : ""}>
                <span class="ia-choice-box">
                    <span class="ia-choice-letter" aria-hidden="true">${esc(c.lettre)}</span>
                    <span class="ia-choice-text">
                        <span class="ia-choice-name">${esc(c.nom)}</span>
                        <span class="ia-choice-params">${c.largeur} × ${c.hauteur} px · ${c.etapes} étapes</span>
                    </span>
                </span>
            </label>`).join("");

        function afficher(id) {
            const config = CONFIGS.find(c => c.id === id) || CONFIGS[0];
            detail.innerHTML = renderDetail(config);
        }

        selector.addEventListener("change", event => {
            if (event.target.name === "ia-config") {
                afficher(event.target.value);
            }
        });
        afficher(CONFIGS[0].id);
    }

    /* ── 3. Comparaison côte à côte ────────────────────────────────────── */
    function initComparaison() {
        const grid = document.getElementById("ia-compare-grid");
        const tbody = document.getElementById("ia-compare-tbody");
        const toggle = document.getElementById("ia-view-toggle");
        if (!grid || !tbody) {
            return;
        }

        grid.innerHTML = CONFIGS.map(c => {
            const l = ligneIndicateurs(c);
            return `
            <article class="ia-compare-card" aria-labelledby="ia-cmp-${esc(c.id)}">
                <h3 id="ia-cmp-${esc(c.id)}"><span class="ia-choice-letter" aria-hidden="true">${esc(c.lettre)}</span> ${esc(c.nom)}</h3>
                <p class="ia-compare-params">${esc(l.resolution)} · ${c.etapes} étapes</p>
                <figure class="ia-compare-figure">
                    <img class="ia-view-whole" src="${esc(c.image.apercu)}" alt="${esc(c.image.alt)}"
                         width="512" height="512" loading="lazy" decoding="async">
                    <img class="ia-view-detail" data-src="${esc(c.image.detail)}" alt="${esc(c.image.altDetail)}"
                         width="${c.image.detailTaille}" height="${c.image.detailTaille}" decoding="async" hidden>
                    <figcaption class="ia-view-caption">
                        <span class="ia-view-whole">Vue d'ensemble, affichée à taille égale</span>
                        <span class="ia-view-detail" hidden>Même zone, ${c.image.detailTaille} × ${c.image.detailTaille} pixels réels agrandis</span>
                    </figcaption>
                </figure>
                <div class="ia-meter" aria-hidden="true">
                    <span class="ia-meter-label">Volume de calcul relatif (estimation)</span>
                    <span class="ia-meter-track"><span class="ia-meter-fill" style="width:${Math.max(l.indice, 1.5).toFixed(1)}%"></span></span>
                    <span class="ia-meter-value">${esc(l.indiceTexte)}</span>
                </div>
                <dl class="ia-compare-measures">
                    <dt>Temps</dt><dd>${l.temps}</dd>
                    <dt>Énergie</dt><dd>${l.energie}</dd>
                </dl>
            </article>`;
        }).join("");

        tbody.innerHTML = CONFIGS.map(c => {
            const l = ligneIndicateurs(c);
            return `
            <tr>
                <th scope="row">${esc(c.lettre)} — ${esc(c.nom)}</th>
                <td>${esc(l.resolution)}</td>
                <td>${c.etapes}</td>
                <td>${l.temps}</td>
                <td>${l.energie}</td>
                <td>${l.qualite}</td>
                <td>${esc(l.indiceTexte)} ${badge("estime")}</td>
            </tr>`;
        }).join("");

        if (!toggle) {
            return;
        }
        toggle.addEventListener("change", event => {
            const detail = event.target.value === "detail";
            grid.classList.toggle("is-detail", detail);
            grid.querySelectorAll("img.ia-view-detail").forEach(img => {
                // Les recadrages ne sont téléchargés qu'à la première demande.
                if (detail && !img.getAttribute("src")) {
                    img.src = img.dataset.src;
                }
            });
            grid.querySelectorAll(".ia-view-whole").forEach(el => { el.hidden = detail; });
            grid.querySelectorAll(".ia-view-detail").forEach(el => { el.hidden = !detail; });
        });
    }

    /* ── 4. Calculateur d'énergie ──────────────────────────────────────── */
    function initCalculateur() {
        const form = document.getElementById("ia-calc");
        const out = document.getElementById("ia-calc-result");
        if (!form || !out) {
            return;
        }
        const puissance = form.elements["ia-calc-power"];
        const duree = form.elements["ia-calc-duration"];
        const nombre = form.elements["ia-calc-count"];

        function lire(input) {
            const v = parseFloat(String(input.value).replace(",", "."));
            return Number.isFinite(v) && v >= 0 ? v : null;
        }

        function maj() {
            const p = lire(puissance);
            const t = lire(duree);
            const n = lire(nombre) || 1;
            if (p === null || t === null) {
                out.textContent = "Renseignez une puissance et une durée pour lancer le calcul.";
                return;
            }
            const parImage = p * (t / 3600);
            const total = parImage * n;
            out.innerHTML =
                `${nf.format(p)} W × ${nf.format(t)} s ÷ 3 600 = <strong>${nf.format(parImage)} Wh</strong> par image` +
                (n > 1 ? `, soit <strong>${nf.format(total)} Wh</strong> pour ${nf.format(n)} images.` : ".") +
                ` <span class="ia-calc-note">Résultat calculé à partir de vos valeurs : ce n'est une mesure que si elles ont été mesurées.</span>`;
        }

        form.addEventListener("input", maj);
        form.addEventListener("submit", event => event.preventDefault());
        maj();
    }

    document.addEventListener("DOMContentLoaded", () => {
        initDebruitage();
        initSelection();
        initComparaison();
        initCalculateur();
    });
})();
