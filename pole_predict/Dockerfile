# Étape 1 : construction de l'application
FROM node:18 AS builder

# Définir le répertoire de travail
WORKDIR /app

# Copier les fichiers de package et installer les dépendances
COPY package.json package-lock.json ./

#Installer les dépendance
RUN npm install

# Copier le reste de l'application
COPY . .

# Construire l'application
RUN npm run build

# Étape 2 : créer l'image de production
FROM node:18 AS runner

WORKDIR /app

# Copier les fichiers construits depuis l'étape de build
COPY --from=builder /app/ .

# Exposer le port sur lequel l'application écoutera
EXPOSE 8080

# Démarrer l'application
CMD ["npm", "start"]
