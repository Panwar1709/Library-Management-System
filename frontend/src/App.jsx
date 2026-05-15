import { useLayoutEffect, useState } from "react";
import AuthorsSection from "./components/AuthorsSection.jsx";
import BooksSection from "./components/BooksSection.jsx";
import CategoriesSection from "./components/CategoriesSection.jsx";
import UsersSection from "./components/UsersSection.jsx";

const TABS = [
  { id: "books", label: "Books" },
  { id: "authors", label: "Authors" },
  { id: "categories", label: "Categories" },
  { id: "users", label: "Members" },
];

const THEME_KEY = "library-theme";

function initialTheme() {
  if (typeof document === "undefined") return "light";
  const d = document.documentElement.getAttribute("data-theme");
  if (d === "dark" || d === "light") return d;
  return "light";
}

export default function App() {
  const [tab, setTab] = useState("books");
  const [theme, setTheme] = useState(initialTheme);

  useLayoutEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch (_) {
      /* ignore */
    }
  }, [theme]);

  return (
    <div className="shell">
      <header className="shell-header">
        <div className="shell-header-inner">
          <div className="brand">
            <div className="brand-mark">
              <div className="brand-icon" aria-hidden="true">
                LM
              </div>
              <div>
                <h1>Library Management</h1>
                <p className="brand-tagline">
                  Catalogue, members, and circulation in one place.
                </p>
              </div>
            </div>
          </div>
          <div className="header-tools">
            <div className="theme-switch" role="group" aria-label="Color theme">
              <button
                type="button"
                className={theme === "light" ? "is-on" : ""}
                aria-pressed={theme === "light"}
                onClick={() => setTheme("light")}
              >
                Light
              </button>
              <button
                type="button"
                className={theme === "dark" ? "is-on" : ""}
                aria-pressed={theme === "dark"}
                onClick={() => setTheme("dark")}
              >
                Dark
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="shell-nav-wrap">
        <nav className="shell-nav" role="tablist" aria-label="Main sections">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={tab === t.id}
              className={tab === t.id ? "is-active" : ""}
              onClick={() => setTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </nav>
      </div>

      <main className="shell-main">
        {tab === "books" && <BooksSection />}
        {tab === "authors" && <AuthorsSection />}
        {tab === "categories" && <CategoriesSection />}
        {tab === "users" && <UsersSection />}
      </main>
    </div>
  );
}
