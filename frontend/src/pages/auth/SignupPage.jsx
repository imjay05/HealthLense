import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../../api/axios'
import useAuthStore from '../../store/authStore'
import { toast } from '../../utils/toast'
import './AuthPage.css'

export default function SignupPage() {
  const [form, setForm]     = useState({ name: '', email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const { setAuth } = useAuthStore()
  const navigate = useNavigate()
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { data } = await api.post('/auth/register', form)
      setAuth(data.user, data.token)
      navigate('/')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed')
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
          <h2 className="auth-hero-title">Start Your Health Journey</h2>
          <p className="auth-hero-sub">
           Get instant AI-powered analysis of your medical reports, smart symptom insights, 
           and personalized health recommendations — all in one secure platform.
          </p>
          <div className="auth-features">
            {[
              { icon: '🔬', text: 'AI-powered report analysis' },
              { icon: '💬', text: 'Multilingual support' },
              { icon: '📍', text: 'Nearby lab finder' },
              { icon: '🔒', text: 'Secure & private' },
            ].map(f => (
              <div key={f.text} className="auth-feature-item">
                <span className="auth-feature-icon">{f.icon}</span>
                <span>{f.text}</span>
              </div>
            ))}
          </div>
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
            <h1 className="auth-title">Create Account</h1>
            <p className="auth-desc">Your health intelligence starts here</p>
          </div>

          <form className="auth-form" onSubmit={submit}>
            <div className="auth-field animate-fadeIn">
              <label className="form-label">Full Name</label>
              <input className="input" placeholder="Aarav Shah"
                value={form.name} onChange={e => set('name', e.target.value)} required />
            </div>
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
              {loading ? 'Creating account…' : 'Create Account'}
            </button>
          </form>

          <p className="auth-switch">
            Already have an account?{' '}
            <Link to="/login" className="auth-switch-link">Sign in</Link>
          </p>
        </div>
      </div>

      {/* background grid */}
      <div className="auth-bg" aria-hidden="true">
        <div className="auth-bg-grid" />
      </div>
    </div>
  )
}