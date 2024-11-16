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
 `pip install fastapi uvicorn passlib python-jose pyotp`
* Firebase : `npm install firebase`
* rechart : `npm install rechart`
 



