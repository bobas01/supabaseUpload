# supabaseUpload

Mini application web React + Supabase :
- Authentification (inscription/connexion)
- Upload d'images dans une galerie personnelle
- Affichage et suppression des images

## Prérequis
- Node.js >= 16
- Un projet Supabase configuré (URL + clé anonyme)

## Installation

1. **Clone le projet**
   ```bash
   git clone <url-du-repo>
   cd supabaseUpload
   ```

2. **Installe les dépendances**
   ```bash
   npm install
   ```

3. **Configure les variables d'environnement**
   - Crée un fichier `.env` à la racine du projet avec :
     ```env
     VITE_SUPABASE_URL=ton_url_supabase
     VITE_SUPABASE_ANON_KEY=ta_cle_anon
     ```

4. **Lance le serveur de développement**
   ```bash
   npm run dev
   ```
   L'application sera accessible sur [http://localhost:5173](http://localhost:5173)

## Fonctionnalités
- Inscription et connexion via Supabase Auth
- Upload d’images dans un bucket Storage privé
- Affichage des images sous forme de grille
- Suppression d’images de la galerie

## Déploiement
- Déploiement possible sur Vercel, Netlify, etc. (penser à configurer les variables d'environnement sur la plateforme)

## Schémas
Pour les schémas d'architecture, voir le dossier `/docs` ou générer via Mermaid Live Editor.