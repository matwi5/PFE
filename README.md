# Projet PFE24-T-262 : Analyse en Temps Réel des Courses de Formule 1

Equipe :
* Miraj REMTOULA (Cloud)
* Mathis BAUDRILLARD (Big Data)
* Robin FOURN (Cybersécurité)
* Louis FONTANIE (Cybersécurité)
* Loïc LECERRE (Cybersécurité)
* Clément Jalouzet (Big Data)
* Tom GYTHIEL (Cybersécurité)

# Problématique :
**Comment analyser en temps réel des courses de Formule 1 afin de permettre aux spectateurs de comprendre les subtilités des performances et des stratégies ?**

La Formule 1 est un sport hautement technique et stratégique, avec une quantité énorme de données générées durant chaque course. Bien que les diffusions télévisées fournissent des informations de base, elles ne permettent pas aux spectateurs de saisir pleinement les subtilités des performances et des stratégies. Les spectateurs, qu'ils soient novices ou experts, cherchent des outils plus complets pour analyser les courses en temps réel. Une plateforme interactive pourrait combler ce manque en offrant des analyses détaillées et des visualisations dynamiques.


# Lien utiles
## API
OpenF1 API : https://openf1.org/#api-methods

# Fonctionnement
aller dans le dossier `pole_predict`

Si les dépendance sont déjà installer sur votre PC : `npm run dev`  

Sinon : `docker build -t <app_name> .`
Ensuite :`docker run -p 3000:3000 <app_name>`

Docker créer un build de l'application donc est plus stable et se rapproche de la réalité.


 

# Installation 
## Pré-requis (si pas Docker)
* NodeJS
* NextJS
* typewriter : Effet de texte frapper au clavier
 `npm i typewriter-effect`
* Django : `pip insrall django` (pas nécessaire pour le moment)
* FastApi : `pip install fastapi uvicorn`
 `pip install fastapi uvicorn passlib python-jose pyotp`
* Firebase : `npm install firebase`
* rechart : `npm install rechart`
* shadcn : https://ui.shadcn.com/docs/installation/next



