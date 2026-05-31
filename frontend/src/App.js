import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Parcours from "./pages/Parcours";
import Projets from "./pages/Projets";
import Veille from "./pages/Veille";
import Contact from "./pages/Contact";
import Snake from "./pages/games/Snake";
import Tetris from "./pages/games/Tetris";
import Platformer from "./pages/games/Platformer";
import Articles from "./pages/Articles";
import ArticleDetail from "./pages/ArticleDetail";
import BlogArticle from "./pages/BlogArticle";
import Admin from "./pages/Admin";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/parcours" element={<Parcours />} />
          <Route path="/projets" element={<Projets />} />
          <Route path="/veille" element={<Veille />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/games/snake" element={<Snake />} />
          <Route path="/games/tetris" element={<Tetris />} />
          <Route path="/games/platformer" element={<Platformer />} />
          <Route path="/news" element={<Articles />} />
          <Route path="/news/:id" element={<ArticleDetail />} />
          <Route path="/blog/:id" element={<BlogArticle />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
