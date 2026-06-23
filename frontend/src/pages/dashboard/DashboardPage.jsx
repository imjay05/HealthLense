import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../api/axios'
import useAuthStore from '../../store/authStore'
import './DashboardPage.css'

export default function DashboardPage() {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const [data, setData]     = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/history/dashboard')
      .then(r => setData(r.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const stats = [
    { 
      label: 'Reports Analyzed', 
      value: data?.recentReports?.length ?? '—', 
      icon: '📄' 
    },
    { 
      label: 'Symptom Queries',  
      value: data?.recentQueries?.length  ?? '—', 
      icon: '🩺' 
    },
  ]

  return (
    <div className="dashboard">
      <div className="dash-welcome animate-fadeUp">
        <div>
          <h2 className="dash-greeting">
            Good {getTimeOfDay()}, <span>{user?.name?.split(' ')[0]}</span>
          </h2>
          <p className="dash-tagline">Here's your health intelligence overview.</p>
        </div>
      </div>

      <div className="dash-stats">
        {stats.map((s, i) => (
          <div key={s.label} className={`card dash-stat animate-fadeUp delay-${i + 1}`}>
            <div className="stat-icon">{s.icon}</div>
            <div className="stat-value">
              {loading
                ? <span className="skeleton" style={{ width: 40, height: 28, display: 'inline-block' }} />
                : s.value}
            </div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="dash-grid">
        <div className="card dash-recent animate-fadeUp delay-2">
          <div className="card-head">
            <h3 className="card-title">Recent Reports</h3>
            <button className="text-link" onClick={() => navigate('/history')}>View all</button>
          </div>
          {loading ? <SkeletonList /> : data?.recentReports?.length ? (
            <ul className="recent-list">
              {data.recentReports.map((r) => (
                <li key={r._id} className="recent-item" onClick={() => navigate('/history')}>
                  <div className="recent-thumb">
                    {r.thumbnailUrl
                      ? <img src={r.thumbnailUrl} alt="" />
                      : <span>{r.fileType === 'pdf' ? '📄' : '🖼'}</span>}
                  </div>
                  <div className="recent-info">
                    <p className="recent-name">
                      {r.fileType?.toUpperCase() ?? '?'} — {r.analysisType === 'full' ? 'Full Analysis' : 'Conclusion'}
                    </p>
                    <p className="recent-date">{fmtDate(r.createdAt)}</p>
                  </div>
                  <span className={`badge ${r.outputLang === 'hi' ? 'badge-blue' : r.outputLang === 'mr' ? 'badge-green' : 'badge-muted'}`}>
                    {r.outputLang?.toUpperCase() ?? '—'}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="dash-empty"><p>No reports yet.</p></div>
          )}
        </div>

        <div className="card dash-queries animate-fadeUp delay-3">
          <div className="card-head">
            <h3 className="card-title">Recent Symptom Queries</h3>
            <button className="text-link" onClick={() => navigate('/history')}>View all</button>
          </div>
          {loading ? <SkeletonList /> : data?.recentQueries?.length ? (
            <ul className="recent-list">
              {data.recentQueries.map((q) => (
                <li key={q._id} className="recent-item">
                  <div className="recent-pulse">⚡</div>
                  <div className="recent-info">
                    <p className="recent-name">{q.inputText?.slice(0, 60)}{q.inputText?.length > 60 ? '…' : ''}</p>
                    <p className="recent-date">{fmtDate(q.createdAt)} · {q.suggestions?.length || 0} suggestions</p>
                  </div>
                  <span className="badge badge-muted">{q.detectedLang ?? '—'}</span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="dash-empty"><p>No symptom queries yet.</p></div>
          )}
        </div>
      </div>
    </div>
  )
}

function SkeletonList() {
  return (
    <ul className="recent-list">
      {[1,2,3].map(i => (
        <li key={i} className="recent-item">
          <div className="skeleton" style={{ width:40, height:40, borderRadius:8 }} />
          <div style={{ flex:1, display:'flex', flexDirection:'column', gap:6 }}>
            <div className="skeleton" style={{ width:'60%', height:12 }} />
            <div className="skeleton" style={{ width:'40%', height:10 }} />
          </div>
        </li>
      ))}
    </ul>
  )
}

const getTimeOfDay = () => {
  const h = new Date().getHours()
  if (h < 12) return 'morning'
  if (h < 17) return 'afternoon'
  return 'evening'
}

const fmtDate = (d) =>
  new Date(d).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })