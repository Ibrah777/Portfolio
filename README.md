# Portfolio — El Hadj Ibrahima Dione

Portfolio professionnel avec jeux intégrés, section news gaming et panel admin.

**Stack :** React + FastAPI + MongoDB

---

## 🚀 Déploiement (gratuit)

### Étape 1 — Base de données : MongoDB Atlas

1. Crée un compte sur [mongodb.com/atlas](https://www.mongodb.com/cloud/atlas/register)
2. Crée un **cluster gratuit** (M0 Free)
3. Dans **Database Access** → crée un utilisateur avec mot de passe
4. Dans **Network Access** → ajoute `0.0.0.0/0` (accès depuis partout)
5. Clique **Connect** → **Drivers** → copie l'URL de connexion
   - Elle ressemble à : `mongodb+srv://user:password@cluster0.xxxxx.mongodb.net/`

---

### Étape 2 — Backend : Render

1. Crée un compte sur [render.com](https://render.com)
2. **New → Web Service** → connecte ton GitHub et sélectionne ce repo
3. Configuration :
   - **Root Directory :** `backend`
   - **Runtime :** Python 3
   - **Build Command :** `pip install -r requirements.txt`
   - **Start Command :** `uvicorn server:app --host 0.0.0.0 --port $PORT`
4. Dans **Environment Variables**, ajoute :
   ```
   MONGO_URL        = (ton URL MongoDB Atlas)
   DB_NAME          = portfolio
   RAWG_API_KEY     = (ta clé RAWG, gratuite sur rawg.io)
   ADMIN_PASSWORD   = (un mot de passe de ton choix)
   ```
5. Clique **Deploy** — note l'URL générée (ex: `https://portfolio-api-xxxx.onrender.com`)

> ⚠️ Sur le plan gratuit, Render "endort" le service après 15 min d'inactivité. Le premier appel met ~30s à répondre. C'est normal.

---

### Étape 3 — Frontend : Vercel

1. Crée un compte sur [vercel.com](https://vercel.com)
2. **New Project** → importe ton repo GitHub
3. Configuration :
   - **Root Directory :** `frontend`
   - **Framework Preset :** Create React App
   - **Build Command :** `yarn build`
   - **Output Directory :** `build`
4. Dans **Environment Variables**, ajoute :
   ```
   REACT_APP_BACKEND_URL = https://portfolio-api-xxxx.onrender.com
   ```
   (l'URL Render de l'étape 2, **sans slash final**)
5. Clique **Deploy**

---

## 🔧 Développement local

### Backend
```bash
cd backend
pip install -r requirements.txt
cp .env.example .env   # remplis les variables
uvicorn server:app --reload
```

### Frontend
```bash
cd frontend
yarn install
cp .env.example .env   # mets REACT_APP_BACKEND_URL=http://localhost:8000
yarn start
```

---

## ✏️ Modifier le contenu du portfolio

Tout le contenu (nom, parcours, projets, compétences, veille) se trouve dans un seul fichier :

```
frontend/src/mock.js
```

Modifie ce fichier, puis redéploie sur Vercel (automatique si GitHub est connecté).

---

## 📁 Structure du projet

```
portfolio/
├── backend/
│   ├── server.py          # API FastAPI (contact, scores, articles, admin)
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── mock.js        # ← TOUT LE CONTENU EST ICI
│   │   ├── pages/
│   │   │   ├── Home.jsx        # Page principale
│   │   │   ├── Articles.jsx    # News gaming (RAWG)
│   │   │   ├── Admin.jsx       # Panel admin
│   │   │   └── games/          # Snake, Tetris, Platformer
│   │   └── components/
│   └── .env.example
└── README.md
```
