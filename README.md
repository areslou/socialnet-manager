# SocialNet Manager · LBYCPG3

**Lab Activity 7 · Online Technologies Laboratory**

A Social Network Profile Manager App built with HTML, CSS, Bootstrap 5, and Supabase.

## 🚀 Live Demo

> **Vercel URL:** *(deploy to Vercel and paste here)*  
> **GitHub Repo:** *(paste your GitHub repo URL here)*

---

## ✨ Features

- Add, search, and delete profiles
- View profile details: name, status, avatar, favorite quote, and friends
- Edit profile status, picture path, and quote in real-time
- Bidirectional friends management (add / remove)
- Fully responsive: 3-panel desktop layout collapses to single-column on mobile
- All data persisted to Supabase (PostgreSQL)

## 🗂 Project Structure

```
socialnet-manager/
├── index.html              ← Main app
├── css/
│   └── style.css           ← Custom design system (dark editorial theme)
├── js/
│   └── app.js              ← All Supabase logic & DOM interactions
├── resources/
│   └── images/             ← Profile images (default.png + individual portraits)
└── README.md
```

## ⚙️ Setup

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Run the SQL blocks from the lab guide (Phases 1–2)
3. Open `js/app.js` and replace:
   ```js
   const SUPABASE_URL = 'https://YOUR-PROJECT-ID.supabase.co'
   const SUPABASE_PUBLISHABLE_KEY = 'YOUR-PUBLISHABLE-KEY'
   ```
4. Open `index.html` in a browser or deploy to Vercel

## 🛠 Tech Stack

| Tool | Purpose |
|------|---------|
| HTML5 | Structure |
| CSS3 + Bootstrap 5.3 | Responsive layout & components |
| Vanilla JavaScript (ES2020) | App logic, Supabase queries |
| Supabase | Hosted PostgreSQL backend |
| Vercel | Static site deployment |

## 📋 Bootstrap 5 CDN

```html
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.min.css" rel="stylesheet">
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/js/bootstrap.bundle.min.js"></script>
```

## 🏫 Course Information

- **Course:** LBYCPG3 · Online Technologies Laboratory  
- **Activity:** Laboratory Activity 7 (Part I)  
- **Prerequisites:** HTML, CSS, Bootstrap 5, JavaScript basics
