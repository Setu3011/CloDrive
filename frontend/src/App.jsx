import { Link, Route, Routes, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import axios from 'axios'

const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'

function Layout({ children }) {
  return (
    <div className="page-bg">
      <div className="orb orb-one" />
      <div className="orb orb-two" />
      <div className="container">{children}</div>
    </div>
  )
}

function Home() {
  return (
    <Layout>
      <section className="home-hero glass">
        <div className="logo-wrap" aria-label="CloDrive logo">
          <span className="logo-mark logo-big">CD</span>
          <h1 className="logo-title">CloDrive</h1>
        </div>

        <p className="badge">Secure • Fast • Beautiful</p>
        <h2 className="hero-title">Store and access your files anywhere</h2>
        <p className="hero-text">
          CloDrive is a modern cloud-style uploader with authentication,
          smooth interactions, and a clean dashboard experience.
        </p>

        <div className="hero-actions">
          <Link to="/signup" className="btn btn-primary">Create Account</Link>
          <Link to="/login" className="btn btn-secondary">Login</Link>
        </div>

        <div className="slideshow" aria-label="CloDrive feature slideshow">
          <div className="slide-track">
            <div className="slide-item">🔒 End-to-end secure uploads</div>
            <div className="slide-item">⚡ Fast file transfer</div>
            <div className="slide-item">📁 Smart dashboard controls</div>
            <div className="slide-item">🎨 Smooth transitions</div>
            <div className="slide-item">📱 Fully responsive layout</div>
            <div className="slide-item">☁️ Cloud-ready architecture</div>
          </div>
        </div>
      </section>

      <section className="feature-grid">
        <article className="feature-card glass">
          <h3>Upload with confidence</h3>
          <p>Authenticated access and secure storage flow built for reliability.</p>
        </article>
        <article className="feature-card glass">
          <h3>Elegant user experience</h3>
          <p>Polished animations, gradients, and hover effects across the app.</p>
        </article>
        <article className="feature-card glass">
          <h3>Responsive by design</h3>
          <p>Looks great on desktop, tablet, and mobile without layout breaks.</p>
        </article>
      </section>
    </Layout>
  )
}

function Signup() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ username: '', email: '', password: '' })

  const submit = async (e) => {
    e.preventDefault()
    await axios.post(`${API}/api/auth/signup`, form)
    navigate('/login')
  }

  return (
    <Layout>
      <section className="card glass">
        <h2>Create account</h2>
        <form onSubmit={submit} className="form">
          <input placeholder="Username" onChange={(e) => setForm({ ...form, username: e.target.value })} required />
          <input placeholder="Email" type="email" onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          <input placeholder="Password" type="password" onChange={(e) => setForm({ ...form, password: e.target.value })} required />
          <button className="btn btn-primary">Signup</button>
        </form>
      </section>
    </Layout>
  )
}

function Login() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })

  const submit = async (e) => {
    e.preventDefault()
    const res = await axios.post(`${API}/api/auth/login`, form)
    localStorage.setItem('token', res.data.token)
    navigate('/dashboard')
  }

  return (
    <Layout>
      <section className="card glass">
        <h2>Welcome back</h2>
        <form onSubmit={submit} className="form">
          <input placeholder="Email" type="email" onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          <input placeholder="Password" type="password" onChange={(e) => setForm({ ...form, password: e.target.value })} required />
          <button className="btn btn-primary">Login</button>
        </form>
      </section>
    </Layout>
  )
}

function Dashboard() {
  const [file, setFile] = useState(null)
  const [items, setItems] = useState([])

  const load = async () => {
    const token = localStorage.getItem('token')
    const res = await axios.get(`${API}/api/files`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    setItems(res.data.files)
  }

  const upload = async () => {
    const token = localStorage.getItem('token')
    const data = new FormData()
    data.append('file', file)
    await axios.post(`${API}/api/files/upload`, data, {
      headers: { Authorization: `Bearer ${token}` }
    })
    await load()
  }

  return (
    <Layout>
      <section className="card glass">
        <h2>Your Dashboard</h2>
        <div className="row">
          <input className="file-input" type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} />
          <button className="btn btn-primary upload-btn" onClick={upload} disabled={!file}>Upload</button>
          <button className="btn btn-secondary" onClick={load}>Refresh</button>
        </div>
        <ul className="file-list">
          {items.map((f) => (
            <li key={f.id}>
              <a href={`${API}${f.url}`} target="_blank" rel="noreferrer">{f.originalName}</a>
            </li>
          ))}
        </ul>
      </section>
    </Layout>
  )
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/login" element={<Login />} />
      <Route path="/dashboard" element={<Dashboard />} />
    </Routes>
  )
}
