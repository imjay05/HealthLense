import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../../api/axios'
import useAuthStore from '../../store/authStore'
import { toast } from '../../utils/toast'
import './AuthPage.css'

export default function LoginPage() {
  const [form, setForm]     = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const { setAuth } = useAuthStore()
  const navigate = useNavigate()
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { data } = await api.post('/auth/login', form)
      setAuth(data.user, data.token)
      navigate('/')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      {/* ── Left panel ── */}
      <div className="auth-left">
        <div className="auth-left-inner">
          <img src="/healthLense.png" alt="HealthLense" className="auth-hero-logo" />
          <h2 className="auth-hero-title">Welcome Back!</h2>
          <p className="auth-hero-sub">
            Your health data, analysis history and symptom insights are all right here,
            ready and waiting for you.
          </p>
          <div className="auth-stats-preview">
            <div className="auth-stat-card">
              <span className="auth-stat-num">10k+</span>
              <span className="auth-stat-label">Reports Analyzed</span>
            </div>
            <div className="auth-stat-card">
              <span className="auth-stat-num">3</span>
              <span className="auth-stat-label">Languages</span>
            </div>
            <div className="auth-stat-card">
              <span className="auth-stat-num">97%</span>
              <span className="auth-stat-label">Accuracy</span>
            </div>
          </div>
          <div className="auth-pulse-ring" />
          <div className="auth-left-orbs">
            <div className="orb orb-1" />
            <div className="orb orb-2" />
            <div className="orb orb-3" />
          </div>
        </div>
      </div>

      {/* ── Right panel ── */}
      <div className="auth-right">
        <div className="auth-box animate-fadeUp">
          <div className="auth-header">
            <h1 className="auth-title">Sign In</h1>
            <p className="auth-desc">Access your health intelligence dashboard</p>
          </div>

          <form className="auth-form" onSubmit={submit}>
            <div className="auth-field">
              <label className="form-label">Email</label>
              <input className="input" type="email" placeholder="you@example.com"
                value={form.email} onChange={e => set('email', e.target.value)} required />
            </div>
            <div className="auth-field">
              <label className="form-label">Password</label>
              <input className="input" type="password" placeholder="••••••••"
                value={form.password} onChange={e => set('password', e.target.value)}
                required minLength={6} />
            </div>
            <button className="btn btn-primary auth-submit" disabled={loading}>
              {loading ? <span className="spinner" /> : null}
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          <p className="auth-switch">
            Don't have an account?{' '}
            <Link to="/signup" className="auth-switch-link">Create one</Link>
          </p>
          <p className="auth-footnote">
            Supports <strong>English</strong>, <strong>Hindi</strong> & <strong>Marathi</strong>
          </p>
        </div>
      </div>

      <div className="auth-bg" aria-hidden="true">
        <div className="auth-bg-grid" />
      </div>
    </div>
  )
}