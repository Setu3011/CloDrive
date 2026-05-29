import { Link, Route, Routes, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import Profile from "./profile";
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

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const submit = async (e) => {

    e.preventDefault();

    if (isSubmitting) return;

    setIsSubmitting(true);

    try {

    const res = await axios.post(
  `${API}/api/auth/signup`,
  form
);

console.log("Signup Success:", res.data);


      navigate("/login");

    } catch (err) {

      console.log(err);

      alert(
        err.response?.data?.message ||
          "Signup failed"
      );
    } finally {
      setIsSubmitting(false);
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
            disabled={isSubmitting}
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
            disabled={isSubmitting}
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
            disabled={isSubmitting}
            onChange={(e) =>
              setForm({
                ...form,
                password:
                  e.target.value,
              })
            }
          />

          <button
            className="btn btn-primary btn-loading-wrap"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span className="btn-spinner" />
                Creating...
              </>
            ) : (
              "Signup"
            )}
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

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const submit = async (e) => {

    e.preventDefault();

    if (isSubmitting) return;

    setIsSubmitting(true);

    try {

      const res = await axios.post(
        `${API}/api/auth/login`,
        form
      );

     
    localStorage.setItem(
      "user",
      JSON.stringify(res.data.user)
    );

    localStorage.setItem(
      "token",
      res.data.token
    );

    localStorage.setItem(
  "userId",
  res.data.user.id
);

      navigate("/dashboard");

    } catch (err) {

      console.log(err);

      alert(
        err.response?.data?.message ||
          "Login failed"
      );
    } finally {
      setIsSubmitting(false);
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
            disabled={isSubmitting}
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
            disabled={isSubmitting}
            onChange={(e) =>
              setForm({
                ...form,
                password:
                  e.target.value,
              })
            }
          />

          <button
            className="btn btn-primary btn-loading-wrap"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span className="btn-spinner" />
                Logging in...
              </>
            ) : (
              "Login"
            )}
          </button>

        </form>

      </section>

    </Layout>
  );
}

/* ================= DASHBOARD ================= */

function Dashboard() {

  const navigate = useNavigate();

  const [items, setItems] =
    useState([]);

  const [user, setUser] =
    useState(null);

  const [search, setSearch] =
    useState("");

  const [activePage, setActivePage] =
    useState("files");

  const token =
    localStorage.getItem("token");

  const profileInitial =
    (user?.username || user?.email || "U")
      .charAt(0)
      .toUpperCase();

  const profileName =
    user?.username || "Profile";

  const profileEmail =
    user?.email || "";
    

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
    const storedUser =
      localStorage.getItem("user");

    if (storedUser) {
      setUser(
        JSON.parse(storedUser)
      );
    }

    loadPage("files");
  }, []);

  /* ================= UPLOAD ================= */

  const upload = async (selectedFiles) => {

    try {

      if (!token) {
        alert(
          "Please login again before uploading."
        );

        navigate("/login");

        return;
      }

      const files =
        Array.from(selectedFiles || []);

      if (files.length === 0) return;

      const data = new FormData();

      files.forEach((file) => {
        data.append("files", file);

        data.append(
          "relativePaths",
          file.webkitRelativePath ||
            file.name
        );
      });

      await axios.post(
        `${API}/api/files/upload`,
        data,
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

      const message =
        [
          err.response?.data?.message,
          err.response?.data?.code,
          err.response?.data?.statusCode,
        ]
          .filter(Boolean)
          .join(" ") ||
        "Upload failed";

      alert(message);
    }
  };

  /* ================= ICON ================= */

  const getIcon = (name) => {

    const fileName =
      name.toLowerCase();

    if (fileName.endsWith(".pdf")) {
      return <FaFilePdf />;
    }

    if (
      fileName.endsWith(".png") ||
      fileName.endsWith(".jpg") ||
      fileName.endsWith(".jpeg")
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

  const getFileUrl = (file) => {
    if (
      file.url?.startsWith("http://") ||
      file.url?.startsWith("https://")
    ) {
      return file.url;
    }

    return `${API}${file.url}`;
  };

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
            href={getFileUrl(f)}
            target="_blank"
            rel="noreferrer"
            title="View"
          >
            👁
          </a>

          {/* DOWNLOAD */}

          <a
            href={getFileUrl(f)}
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
                getFileUrl(f)
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

                const message =
                  [
                    err.response?.data?.message,
                    err.response?.data?.code,
                    err.response?.data?.statusCode,
                  ]
                    .filter(Boolean)
                    .join(" ") ||
                  "Delete failed";

                alert(message);
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

            <div className="topbar-actions">

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

              <button
                className="profile-chip"
                type="button"
                title="Profile"
                onClick={() =>
                  navigate("/profile")
                }
              >
                <span className="profile-avatar">
                  {profileInitial}
                </span>

                <span className="profile-details">
                  <span>{profileName}</span>
                  {profileEmail && (
                    <small>{profileEmail}</small>
                  )}
                </span>
              </button>

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
              multiple
              hidden
              onChange={(e) => {
                upload(
                  e.target.files
                );

                e.target.value = "";
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
  const [isLoading, setIsLoading] =
    useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 3000);

    return () =>
      clearTimeout(timer);
  }, []);

  return (
    <>
      {isLoading && (
        <div className="preloader">

          <div className="preloader-ring">

            <span className="preloader-logo">
              CD
            </span>

          </div>

          <h1>CloDrive</h1>

          <div className="preloader-bar">
            <span />
          </div>

        </div>
      )}

      <div
        className={
          isLoading
            ? "app-shell app-shell-loading"
            : "app-shell"
        }
      >
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

      <Route
        path="/profile"
        element={<Profile />}
/>
        </Routes>
      </div>
    </>
  );
  
}
