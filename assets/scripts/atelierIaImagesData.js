/*
 * Données de l'atelier « Génération d'images par IA et écoconception ».
 *
 * Ce fichier ne contient QUE des données : modifiez-le pour changer les
 * configurations ou renseigner de vraies mesures, sans toucher à l'interface
 * (assets/scripts/atelierIaImages.js).
 *
 * ─── Statuts possibles d'une donnée ───────────────────────────────────────
 *   "mesure"     : valeur réellement obtenue lors d'une expérimentation documentée.
 *   "estime"     : ordre de grandeur calculé à partir d'une hypothèse explicite
 *                  (jamais présenté comme une mesure).
 *   "simule"     : valeur fictive servant uniquement à illustrer un scénario.
 *   "non-mesure" : aucune donnée disponible → affiché « Donnée non mesurée ».
 *
 * ─── Renseigner une vraie mesure ──────────────────────────────────────────
 * Pour chaque configuration, compléter l'objet `mesure` :
 *   - tempsSecondes      : durée de génération d'UNE image (moyenne de plusieurs essais) ;
 *   - puissanceMoyenneW  : puissance électrique moyenne pendant la génération ;
 *   - energieWh          : laisser null pour qu'elle soit calculée automatiquement
 *                          (Énergie (Wh) = Puissance moyenne (W) × Durée (h)),
 *                          ou renseigner directement une énergie intégrée mesurée ;
 *   - materiel, modele, date, protocole : contexte indispensable à la lecture.
 * Exemple de protocole : échantillonner la puissance GPU toutes les 100 ms
 * (ex. `nvidia-smi --query-gpu=power.draw --format=csv -lms 100`) pendant toute
 * la génération, puis intégrer (somme puissance × intervalle) plutôt que de
 * relever une valeur instantanée. Penser à préciser si la mesure couvre le GPU
 * seul ou toute la machine (wattmètre à la prise).
 * Une fois une mesure renseignée, passer `statut` à "mesure".
 */

window.ATELIER_IA_DATA = {
    /* Description de l'illustration affichée pour chaque configuration. */
    illustrationNote:
        "Les images de cet atelier sont des illustrations dessinées par un script " +
        "(assets/img/atelier-ia/generer-illustrations.py), et non des images générées par un modèle d'IA. " +
        "Elles figurent les différences attendues entre les configurations, sans prétendre en être le résultat réel.",

    /* États du schéma « du bruit à l'image » (section 2). */
    debruitage: [
        { src: "../../assets/img/atelier-ia/debruitage-0.webp", legende: "Départ : un bruit aléatoire, sans aucune image." },
        { src: "../../assets/img/atelier-ia/debruitage-1.webp", legende: "Premières étapes : le modèle devine les grandes masses de couleur." },
        { src: "../../assets/img/atelier-ia/debruitage-2.webp", legende: "Les formes principales (ciel, montagnes) se dessinent." },
        { src: "../../assets/img/atelier-ia/debruitage-3.webp", legende: "La composition est en place, le bruit diminue." },
        { src: "../../assets/img/atelier-ia/debruitage-4.webp", legende: "Dernières étapes : les détails fins sont affinés." },
        { src: "../../assets/img/atelier-ia/debruitage-5.webp", legende: "Fin : l'image est entièrement débruitée." }
    ],

    configurations: [
        {
            id: "standard",
            lettre: "A",
            nom: "Standard",
            resume: "Génération classique par diffusion.",
            largeur: 1024,
            hauteur: 1024,
            etapes: 30,
            methode:
                "Modèle de diffusion classique, utilisé avec un nombre d'étapes habituel. " +
                "C'est la référence de comparaison.",
            vigilance:
                "La résolution la plus élevée multiplie le nombre de pixels à calculer : " +
                "intéressant pour un tirage ou un grand écran, souvent superflu pour une vignette.",
            image: {
                apercu: "../../assets/img/atelier-ia/config-a-apercu.webp",
                pleineTaille: "../../assets/img/atelier-ia/config-a-1024.webp",
                detail: "../../assets/img/atelier-ia/detail-a.webp",
                detailTaille: 256,
                alt: "Illustration d'un paysage de montagnes au coucher du soleil, avec un lac et des herbes au premier plan, représentant la configuration standard en 1024 × 1024 pixels.",
                altDetail: "Zoom sur les herbes au bord du lac : les brins sont fins et nets, chaque détail occupe de nombreux pixels."
            },
            mesure: {
                statut: "non-mesure",
                tempsSecondes: null,
                puissanceMoyenneW: null,
                energieWh: null,
                materiel: null,
                modele: null,
                date: null,
                protocole: null
            },
            qualite: {
                statut: "non-mesure",
                valeur: null,
                methode: null,
                attendu: "Image la plus détaillée des trois : sert de référence."
            }
        },
        {
            id: "optimisee",
            lettre: "B",
            nom: "Optimisée",
            resume: "Résolution et nombre d'étapes réduits.",
            largeur: 512,
            hauteur: 512,
            etapes: 15,
            methode:
                "Même principe de diffusion, avec une image quatre fois moins grande en pixels " +
                "et deux fois moins d'étapes de débruitage.",
            vigilance:
                "Un modèle entraîné pour produire du 1024 × 1024 peut donner de moins bonnes images en 512 × 512. " +
                "Il faut vérifier que la résolution choisie est adaptée au modèle utilisé.",
            image: {
                apercu: "../../assets/img/atelier-ia/config-b-apercu.webp",
                pleineTaille: null,
                detail: "../../assets/img/atelier-ia/detail-b.webp",
                detailTaille: 128,
                alt: "Même paysage de montagnes au coucher du soleil, représentant la configuration optimisée en 512 × 512 pixels.",
                altDetail: "Zoom sur la même zone d'herbes : l'image contient quatre fois moins de pixels, les brins apparaissent plus grossiers et pixelisés."
            },
            mesure: {
                statut: "non-mesure",
                tempsSecondes: null,
                puissanceMoyenneW: null,
                energieWh: null,
                materiel: null,
                modele: null,
                date: null,
                protocole: null
            },
            qualite: {
                statut: "non-mesure",
                valeur: null,
                methode: null,
                attendu: "Moins de détails fins ; souvent suffisant pour un affichage web de taille modeste."
            }
        },
        {
            id: "acceleree",
            lettre: "C",
            nom: "Accélérée",
            resume: "Très peu d'étapes, avec un modèle conçu pour cela.",
            largeur: 512,
            hauteur: 512,
            etapes: 5,
            methode:
                "Nécessite un modèle ou une méthode compatible avec la génération en peu d'étapes " +
                "(par exemple un modèle « distillé » ou de type Latent Consistency Model). " +
                "Ces modèles sont entraînés spécialement pour produire une image en quelques étapes.",
            vigilance:
                "Ce n'est pas une optimisation universelle : avec un modèle de diffusion classique, " +
                "5 étapes donnent en général une image floue, bruitée ou inachevée. " +
                "Même avec un modèle adapté, la fidélité et la finesse des détails peuvent baisser.",
            image: {
                apercu: "../../assets/img/atelier-ia/config-c-apercu.webp",
                pleineTaille: null,
                detail: "../../assets/img/atelier-ia/detail-c.webp",
                detailTaille: 128,
                alt: "Même paysage de montagnes, légèrement plus doux et moins détaillé, représentant la configuration accélérée en 512 × 512 pixels et 5 étapes.",
                altDetail: "Zoom sur la même zone d'herbes : en plus d'être pixelisés, les brins sont adoucis et les détails fins ont en partie disparu."
            },
            mesure: {
                statut: "non-mesure",
                tempsSecondes: null,
                puissanceMoyenneW: null,
                energieWh: null,
                materiel: null,
                modele: null,
                date: null,
                protocole: null
            },
            qualite: {
                statut: "non-mesure",
                valeur: null,
                methode: null,
                attendu: "Détails fins atténués, rendu parfois plus lisse ou moins fidèle à la demande."
            }
        }
    ]
};
