# Portfolio — El Hadj Ibrahima Dione

Portfolio personnel développé avec React, FastAPI et MongoDB.

## Fonctionnalités

* Présentation de mon parcours
* Présentation de mes projets
* Formulaire de contact
* Section actualités gaming
* Jeux intégrés (Snake, Tetris, Platformer)
* Espace administrateur

## Technologies utilisées

### Frontend

* React
* React Router
* CSS

### Backend

* FastAPI
* Python
* MongoDB

## Installation

### Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn server:app --reload
```

Créer un fichier `.env` avec :

```env
MONGO_URL=
DB_NAME=portfolio
RAWG_API_KEY=
ADMIN_PASSWORD=
```

### Frontend

```bash
cd frontend
yarn install
yarn start
```

Créer un fichier `.env` :

```env
REACT_APP_BACKEND_URL=http://localhost:8000
```

## Déploiement

Le projet peut être déployé avec :

* MongoDB Atlas pour la base de données
* Render pour l'API FastAPI
* Vercel pour l'application React

## Structure du projet

```text
portfolio/
├── backend/
│   ├── server.py
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   └── mock.js
│   └── public/
│
└── README.md
```

## Personnalisation

Les informations du portfolio (présentation, compétences, projets, veille technologique) peuvent être modifiées dans :

```text
frontend/src/mock.js
```
