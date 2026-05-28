import { Link, Route, Routes, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";

import {
  FaPlus,
  FaFileAlt,
  FaImage,
  FaFilePdf,
  FaTrash,
  FaDownload,
  FaSearch,
} from "react-icons/fa";

const API =
  import.meta.env.VITE_API_BASE_URL ||
  "http://localhost:5000";

/* ================= LAYOUT ================= */

function Layout({ children }) {
  return (
    <div className="page-bg">

      <div className="orb orb-one" />
      <div className="orb orb-two" />

      <div className="container">
        {children}
      </div>

    </div>
  );
}

/* ================= HOME ================= */

function Home() {
  return (
    <Layout>

      <section className="home-hero glass">

        <div className="logo-wrap">

          <span className="logo-mark logo-big">
            CD
          </span>

          <h1 className="logo-title">
            CloDrive
          </h1>

        </div>

        <p className="badge">
          Secure • Fast • Beautiful
        </p>

        <h2 className="hero-title">
          Store and access your files anywhere
        </h2>

        <p className="hero-text">
          Modern cloud storage dashboard
          with upload, sharing, starred
          files, trash, and responsive UI.
        </p>

        <div className="hero-actions">

          <Link
            to="/signup"
            className="btn btn-primary"
          >
            Create Account
          </Link>

          <Link
            to="/login"
            className="btn btn-secondary"
          >
            Login
          </Link>

        </div>

      </section>

    </Layout>
  );
}

/* ================= SIGNUP ================= */

function Signup() {

  const navigate = useNavigate();

  const [form, setForm] =
    useState({
      username: "",
      email: "",
      password: "",
    });

  const submit = async (e) => {

    e.preventDefault();

    try {

      await axios.post(
        `${API}/api/auth/signup`,
        form
      );

      navigate("/login");

    } catch (err) {

      console.log(err);

      alert("Signup failed");
    }
  };

  return (
    <Layout>

      <section className="card glass">

        <h2>Create Account</h2>

        <form
          onSubmit={submit}
          className="form"
        >

          <input
            placeholder="Username"
            required
            onChange={(e) =>
              setForm({
                ...form,
                username:
                  e.target.value,
              })
            }
          />

          <input
            type="email"
            placeholder="Email"
            required
            onChange={(e) =>
              setForm({
                ...form,
                email:
                  e.target.value,
              })
            }
          />

          <input
            type="password"
            placeholder="Password"
            required
            onChange={(e) =>
              setForm({
                ...form,
                password:
                  e.target.value,
              })
            }
          />

          <button className="btn btn-primary">
            Signup
          </button>

        </form>

      </section>

    </Layout>
  );
}

/* ================= LOGIN ================= */

function Login() {

  const navigate = useNavigate();

  const [form, setForm] =
    useState({
      email: "",
      password: "",
    });

  const submit = async (e) => {

    e.preventDefault();

    try {

      const res = await axios.post(
        `${API}/api/auth/login`,
        form
      );

      localStorage.setItem(
        "token",
        res.data.token
      );

      navigate("/dashboard");

    } catch (err) {

      console.log(err);

      alert("Login failed");
    }
  };

  return (
    <Layout>

      <section className="card glass">

        <h2>Welcome Back</h2>

        <form
          onSubmit={submit}
          className="form"
        >

          <input
            type="email"
            placeholder="Email"
            required
            onChange={(e) =>
              setForm({
                ...form,
                email:
                  e.target.value,
              })
            }
          />

          <input
            type="password"
            placeholder="Password"
            required
            onChange={(e) =>
              setForm({
                ...form,
                password:
                  e.target.value,
              })
            }
          />

          <button className="btn btn-primary">
            Login
          </button>

        </form>

      </section>

    </Layout>
  );
}

/* ================= DASHBOARD ================= */

function Dashboard() {

  const [items, setItems] =
    useState([]);

  const [search, setSearch] =
    useState("");

  const [activePage, setActivePage] =
    useState("files");

  const token =
    localStorage.getItem("token");

  /* ================= LOAD PAGE ================= */

  const loadPage = async (page) => {

    try {

      let endpoint = "/api/files";

      if (page === "starred") {
        endpoint =
          "/api/files/starred";
      }

      if (page === "recent") {
        endpoint =
          "/api/files/recent";
      }

      if (page === "trash") {
        endpoint =
          "/api/files/trash";
      }

      const res = await axios.get(
        `${API}${endpoint}`,
        {
          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );

      setItems(res.data.files);

    } catch (err) {

      console.log(err);
    }
  };

  useEffect(() => {
    loadPage("files");
  }, []);

  /* ================= UPLOAD ================= */

  const upload = async (selectedFile) => {

    try {

      if (!selectedFile) return;

      const data = new FormData();

      data.append(
        "file",
        selectedFile
      );

      await axios.post(
        `${API}/api/files/upload`,
        data,
        {
          headers: {
            Authorization:
              `Bearer ${token}`,
            "Content-Type":
              "multipart/form-data",
          },
        }
      );

      loadPage(activePage);

    } catch (err) {

      console.log(err);

      alert("Upload failed");
    }
  };

  /* ================= ICON ================= */

  const getIcon = (name) => {

    if (name.endsWith(".pdf")) {
      return <FaFilePdf />;
    }

    if (
      name.endsWith(".png") ||
      name.endsWith(".jpg") ||
      name.endsWith(".jpeg")
    ) {
      return <FaImage />;
    }

    return <FaFileAlt />;
  };

  /* ================= SEARCH ================= */

  const filteredFiles = items.filter(
    (f) =>
      f.originalName
        .toLowerCase()
        .includes(
          search.toLowerCase()
        )
  );

  /* ================= RENDER FILES ================= */

  const renderFiles = () => {

    return filteredFiles.map((f) => (

      <div
        className="file-card"
        key={f.id}
      >

        <div className="file-top">

          <div className="file-icon">
            {getIcon(
              f.originalName
            )}
          </div>

          <div className="file-type">
            FILE
          </div>

        </div>

        <h4>{f.originalName}</h4>

        <div className="file-actions">

          {/* VIEW */}

          <a
            href={`${API}${f.url}`}
            target="_blank"
            rel="noreferrer"
            title="View"
          >
            👁
          </a>

          {/* DOWNLOAD */}

          <a
            href={`${API}${f.url}`}
            download
            title="Download"
          >
            <FaDownload />
          </a>

          {/* STAR */}

          <button
            title="Star"
            onClick={async () => {

              try {

                await axios.put(
                  `${API}/api/files/star/${f.id}`,
                  {},
                  {
                    headers: {
                      Authorization:
                        `Bearer ${token}`,
                    },
                  }
                );

                loadPage(activePage);

              } catch (err) {

                console.log(err);
              }
            }}
          >
            ⭐
          </button>

          {/* SHARE */}

          <button
            title="Share"
            onClick={() => {

              navigator.clipboard.writeText(
                `${API}${f.url}`
              );

              alert(
                "Share link copied!"
              );
            }}
          >
            🔗
          </button>

          {/* DELETE */}

          <button
            title="Delete"
            onClick={async () => {

              try {

                await axios.delete(
                  `${API}/api/files/${f.id}`,
                  {
                    headers: {
                      Authorization:
                        `Bearer ${token}`,
                    },
                  }
                );

                loadPage(activePage);

              } catch (err) {

                console.log(err);

                alert(
                  "Delete failed"
                );
              }
            }}
          >
            <FaTrash />
          </button>

        </div>

      </div>
    ));
  };

  return (
    <Layout>

      <div className="dashboard-layout">

        {/* SIDEBAR */}

        <aside className="sidebar glass">

          <div>

            <div className="sidebar-logo">

              <span className="logo-mark">
                CD
              </span>

              <h2>CloDrive</h2>

            </div>

            <div className="sidebar-menu">

              <button
                className={
                  activePage === "files"
                    ? "active"
                    : ""
                }
                onClick={() => {
                  setActivePage("files");
                  loadPage("files");
                }}
              >
                📁 My Files
              </button>

              <button
                className={
                  activePage === "starred"
                    ? "active"
                    : ""
                }
                onClick={() => {
                  setActivePage(
                    "starred"
                  );

                  loadPage(
                    "starred"
                  );
                }}
              >
                ⭐ Starred
              </button>

              <button
                className={
                  activePage === "recent"
                    ? "active"
                    : ""
                }
                onClick={() => {
                  setActivePage(
                    "recent"
                  );

                  loadPage(
                    "recent"
                  );
                }}
              >
                🕒 Recent
              </button>

              <button
                className={
                  activePage === "trash"
                    ? "active"
                    : ""
                }
                onClick={() => {
                  setActivePage(
                    "trash"
                  );

                  loadPage(
                    "trash"
                  );
                }}
              >
                🗑 Trash
              </button>

              <button
                className={
                  activePage === "settings"
                    ? "active"
                    : ""
                }
                onClick={() =>
                  setActivePage(
                    "settings"
                  )
                }
              >
                ⚙ Settings
              </button>

            </div>

          </div>

          {/* STORAGE */}

          <div className="storage-box">

            <p>Storage Used</p>

            <div className="storage-bar">

              <div className="storage-fill"></div>

            </div>

            <span>
              0.1GB of 15GB
            </span>

          </div>

        </aside>

        {/* MAIN */}

        <main className="dashboard-main">

          {/* TOPBAR */}

          <div className="topbar">

            <h2>My Drive</h2>

            <div className="search-box">

              <FaSearch />

              <input
                type="text"
                placeholder="Search files..."
                onChange={(e) =>
                  setSearch(
                    e.target.value
                  )
                }
              />

            </div>

          </div>

          {/* SETTINGS */}

          {activePage ===
            "settings" && (

            <div className="page-card glass">

              <h1>
                ⚙ Settings
              </h1>

              <p>
                Manage your dashboard
                settings here.
              </p>

            </div>
          )}

          {/* FILES */}

          {activePage === "files" && (

            filteredFiles.length === 0 ? (

              <div className="empty-state glass">

                <div className="empty-icon">
                  ☁
                </div>

                <h3>
                  No Files Uploaded
                </h3>

                <p>
                  Upload files using
                  the + button
                </p>

              </div>

            ) : (

              <div className="file-grid">
                {renderFiles()}
              </div>

            )
          )}

          {/* STARRED */}

          {activePage ===
            "starred" && (

            filteredFiles.length === 0 ? (

              <div className="page-card glass">

                <h1>
                  ⭐ Starred Files
                </h1>

                <p>
                  No starred files yet.
                </p>

              </div>

            ) : (

              <div className="file-grid">
                {renderFiles()}
              </div>

            )
          )}

          {/* RECENT */}

          {activePage ===
            "recent" && (

            filteredFiles.length === 0 ? (

              <div className="page-card glass">

                <h1>
                  🕒 Recent Files
                </h1>

                <p>
                  No recent files found.
                </p>

              </div>

            ) : (

              <div className="file-grid">
                {renderFiles()}
              </div>

            )
          )}

          {/* TRASH */}

          {activePage ===
            "trash" && (

            filteredFiles.length === 0 ? (

              <div className="page-card glass">

                <h1>
                  🗑 Trash
                </h1>

                <p>
                  Trash is empty.
                </p>

              </div>

            ) : (

              <div className="file-grid">
                {renderFiles()}
              </div>

            )
          )}

          {/* FLOATING UPLOAD */}

          <label className="floating-upload">

            <FaPlus />

            <input
              type="file"
              hidden
              onChange={(e) => {
                upload(
                  e.target.files[0]
                );
              }}
            />

          </label>

        </main>

      </div>

    </Layout>
  );
}

/* ================= APP ================= */

export default function App() {
  return (
    <Routes>

      <Route
        path="/"
        element={<Home />}
      />

      <Route
        path="/signup"
        element={<Signup />}
      />

      <Route
        path="/login"
        element={<Login />}
      />

      <Route
        path="/dashboard"
        element={<Dashboard />}
      />

    </Routes>
  );
}