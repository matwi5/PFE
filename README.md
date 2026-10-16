# Projet PFE24-T-262 : Analyse en Temps Réel des Courses de Formule 1

Equipe :
* Miraj REMTOULA (Cloud)
* Mathis BAUDRILLARD (Data / ML, chef de projet)
* Robin FOURN (Cybersécurité)
* Louis FONTANIE (Cybersécurité)
* Loïc LECERRE (Cybersécurité)
* Clément Jalouzet (Big Data)
* Tom GYTHIEL (Cybersécurité)

# Problématique :
**Comment analyser en temps réel des courses de Formule 1 afin de permettre aux spectateurs de comprendre les subtilités des performances et des stratégies ?**

La Formule 1 est un sport hautement technique et stratégique, avec une quantité énorme de données générées durant chaque course. Bien que les diffusions télévisées fournissent des informations de base, elles ne permettent pas aux spectateurs de saisir pleinement les subtilités des performances et des stratégies. Les spectateurs, qu'ils soient novices ou experts, cherchent des outils plus complets pour analyser les courses en temps réel. Une plateforme interactive pourrait combler ce manque en offrant des analyses détaillées et des visualisations dynamiques.


# Modèles et évaluation

> Section rédigée par Mathis Baudrillard. Les modèles sont entraînés hors de l'application, dans les notebooks du dossier [`ml/`](ml/). Leurs prédictions sont stockées dans Firestore, puis lues par le front Next.js.

**En bref** : 6 modèles LightGBM, avec hyperparamètres optimisés par Optuna et évaluation sur un découpage chronologique. Le modèle Upcoming de position à l'arrivée se trompe de 3,07 places en moyenne (MAE) sur la validation. Le modèle Live de dépassement obtient un F1 de 0,54 sur une classe qui ne représente que 3 % des tours.

## Deux pipelines, six modèles

| Pipeline | Modèle | Type LightGBM | Notebook |
|---|---|---|---|
| **Live** (tour par tour, par pilote) | Dépassement au tour suivant | binaire | [`ml/live/data-prediction-overtake.ipynb`](ml/live/data-prediction-overtake.ipynb) |
| Live | Fenêtre d'arrêt au stand (`Never`, `1-5`, `5-15`, `>15` tours) | multiclasse | [`ml/live/data-prediction-pitstops.ipynb`](ml/live/data-prediction-pitstops.ipynb) |
| Live | Prochain pneu (6 classes) | multiclasse | [`ml/live/data-prediction-tyre.ipynb`](ml/live/data-prediction-tyre.ipynb) |
| Live | Position finale (20 classes) | multiclasse | [`ml/live/data-prediction-position.ipynb`](ml/live/data-prediction-position.ipynb) |
| **Upcoming** (avant le Grand Prix) | Position en qualification (grille) | régression, objectif Poisson | [`ml/upcoming/prediction-position-upcoming.ipynb`](ml/upcoming/prediction-position-upcoming.ipynb) |
| Upcoming | Position à l'arrivée (utilise la grille prédite) | régression, objectif Poisson | même notebook |

- **Données Live.** API OpenF1 : 55 290 lignes (un pilote à un tour donné) réparties sur 58 sessions de course. Intégration dans [`ml/data/data-integration.ipynb`](ml/data/data-integration.ipynb). Les jeux de données ne sont pas versionnés.
- **Données Upcoming.** API Ergast, courses de 2010 à 2024. Les variables décrivent les 40 courses précédentes de chaque pilote (`create_driver_features`, `lookback=40`).
- **Lien avec l'application.** Les prédictions Live sont lues dans Firestore (`predictions_ia`, [`PredictionWidget.tsx`](pole_predict/src/app/live/components/PredictionWidget/PredictionWidget.tsx)), les prédictions Upcoming dans `upcoming_races` ([`upcoming-race/page.tsx`](pole_predict/src/app/upcoming-race/page.tsx)). Le widget des temps au tour n'utilise pas de modèle : c'est une extrapolation calculée dans le navigateur ([`laptimePredictions.ts`](pole_predict/src/app/live/utils/laptimePredictions.ts)).

## Méthode

- **Découpage chronologique.**
  - Live : entraînement sur les 46 premières sessions, test sur les 12 courses suivantes, à partir du 1er septembre 2024 (`split_data_chronologically`, journal de sortie du notebook).
  - Upcoming : entraînement sur les 80 % de courses les plus anciennes, validation sur les 20 % les plus récentes (`quantile(0.8)` sur la date).
- **Optuna.**
  - Live : 50 essais par modèle. Chaque essai est noté par une validation croisée LightGBM à 5 plis stratifiés (`lgb.cv(nfold=5, stratified=True)`), calculée sur l'ensemble d'entraînement uniquement.
  - Upcoming : 50 essais avec l'échantillonneur TPE, qui minimisent la MAE sur l'ensemble de validation.
- **Déséquilibre de classes.** Pour le modèle de dépassement, le poids de la classe minoritaire `scale_pos_weight` est lui-même optimisé par Optuna, entre 1 et 10.

## Résultats

**Live**, sur l'ensemble de test (12 courses, 10 512 observations ; 10 001 pour la position, après retrait des valeurs manquantes) :

| Modèle | Accuracy | Ce qu'il faut regarder | Rapport |
|---|---|---|---|
| Dépassement | 0,97 | classe dépassement (334 cas, 3,2 %) : précision 0,62, rappel 0,48, **F1 0,54** | [`overtake.txt`](ml/live/reports/overtake.txt) |
| Arrêt au stand | 0,71 | F1 macro 0,57 ; F1 de 0,89 sur `Never`, 0,44 sur `1-5` | [`pitstops.txt`](ml/live/reports/pitstops.txt) |
| Prochain pneu | 0,90 | F1 macro 0,64 ; SOFT : précision 0,98 mais rappel 0,19 ; WET : F1 0,00 | [`tyre.txt`](ml/live/reports/tyre.txt) |
| Position finale | 0,23 | 0,13 sur les 10 premiers tours, 0,72 sur les 10 derniers (120 observations chacun) | [`position.txt`](ml/live/reports/position.txt) |

**Upcoming**, sur l'ensemble de validation ([`ml/upcoming/results.txt`](ml/upcoming/results.txt)) :

| Modèle | MAE (places) | RMSE | R² | MAE en entraînement |
|---|---|---|---|---|
| Qualification | 3,468 | 4,540 | 0,379 | 2,921 |
| Position à l'arrivée | **3,071** | 3,885 | **0,546** | 2,562 |

## Limites

- **Accuracy peu informative pour le dépassement.** 96,8 % des tours n'ont pas de dépassement : un modèle qui ne prédit jamais de dépassement obtiendrait déjà une accuracy proche de 0,97. Le F1 de 0,54 sur la classe dépassement est la mesure pertinente.
- **Classes rares mal reconnues.** Pneus pluie (WET, 113 cas) : F1 nul. Pneus tendres : rappel de 0,19. Position finale : 0,13 de positions exactes sur les 10 premiers tours.
- **Scores probablement optimistes.**
  - Live : l'arrêt anticipé (early stopping) du modèle final s'appuie sur l'ensemble de test lui-même (`valid_sets=[valid_data]`, construit à partir de `X_test`).
  - Upcoming : le même ensemble de validation sert à Optuna, à l'arrêt anticipé et au calcul de la MAE. Il n'y a pas d'ensemble de test resté intact.
  - Les plis de la validation croisée Live sont tirés aléatoirement, sans respecter l'ordre du temps : des tours d'une même course peuvent se retrouver à la fois en entraînement et en validation.
- **Petit ensemble de test Live.** 12 courses, toutes de fin de saison 2024.
- **Écart de version (Upcoming).** `results.txt` contient un R², que le notebook versionné ne calcule pas (il calcule MAE, RMSE et Spearman) : les chiffres viennent d'une version du script absente du dépôt.
- **Chiffres affichés dans l'application.** [`constants.ts`](pole_predict/src/app/live/constants.ts#L35-L60) affiche 25 % pour la position (0,23 dans le rapport), 89 % pour le pneu (0,90) et « 98 % for soft tires », qui est une précision (le rappel n'est que de 0,19).
- **Reproductibilité partielle.** Les jeux de données et les modèles entraînés ne sont pas dans le dépôt.

## Résumés de course par LLM

La route [`api/summary/route.ts`](pole_predict/src/app/api/summary/route.ts) envoie à Gemini (`gemini-2.0-flash-exp`) les données OpenF1 de la course : session, météo, positions et messages de la direction de course. Le récit obtenu s'affiche dans [`GPSummaryCard.tsx`](pole_predict/src/app/components/pastComponent/GPSummaryCard.tsx). Cette partie a été développée par Clément Jalouzet (`ed26a2b`, `c915995`, `2c2e108`) ; j'en ai fait la mise en forme (`034e4c9`).

## Mon rôle

- **Pilotage et responsabilité data / ML.** Dans la matrice RACI du cahier des charges ([`docs/raci.md`](docs/raci.md)), je suis approbateur (A) de la gestion de projet, du suivi de l'avancement, de la communication, des risques et de la documentation, ainsi que des prédictions Live et Upcoming, des services de Machine Learning et du pipeline de données. Le cahier des charges me désigne « Responsable des modèles prédictifs et du traitement des données en temps réel ». Clément Jalouzet et Miraj Remtoula y figurent comme réalisateurs (R) des services de Machine Learning.
- **Modèles.** Notebooks d'entraînement et d'évaluation des 6 modèles, et intégration des données, dans [`ml/`](ml/).
- **Intégration dans l'application.** 44 des 152 commits de `main`. Pages Live et Upcoming et widgets de prédiction : commits `287a9b9`, `0ba4b1c`, `b218f1d` et `e1c3d53` sur la branche `Mathis`, intégrés à `main` par `047d2a1` et `22ff31e`.


# Lien utiles
## API
* OpenF1 API : https://openf1.org/#api-methods
* shadcn : https://ui.shadcn.com/docs/installation/next

# Fonctionnement
aller dans le dossier `pole_predict`

## Test et developpement
`npm install` puis `npm run dev`
Si les dépendance sont déjà installer sur votre PC : `npm run dev`  

## Build et Production
Sinon : `docker build -t <app_name> .`
Ensuite :`docker run -p 8080:8080 <app_name>` (ne changer pas les port svp)

Docker créer un build de l'application donc est plus stable et se rapproche de la réalité.

## Monitoring 
Permet de verifier le traffic des API 

> Note : en l'état, `prometheus.yml` interroge `/api/drivers`, qui renvoie du JSON et non des métriques Prometheus ; la route `/api/metrics` (basée sur `prom-client`) a été supprimée au commit `2257f05`.

Un fichier docker-compose est dispo pour lancer les outils nécessaires Prometheus et Grapahan (potentiellement ELK Stach pour moniitorer les log mais pour plus tard).

**Attention** l'image prise pour lancer l'appli est celui sur DockerHub donc faudra faire un repo commun pour les images de l'appli.

Lancer le docker-compose : `docker-compose up -d`
Arreter le docker-compose : `docker-compose down`
Mettre en veille : `docker-compose stop`


# Installation 
## Pré-requis (si pas Docker ou pas npm install)
* NodeJS
* NextJS
* typewriter : Effet de texte frapper au clavier
 `npm i typewriter-effect`
* FastApi : `pip install fastapi uvicorn`
* Firebase : `npm install firebase`
* recharts : `npm install recharts`
 



