import { useEffect, useState } from 'react'
import api from '../../api/axios'
import ReportCard from '../../components/history/reportcard/ReportCard'
import SymptomCard from '../../components/history/symptomcard/SymptomCard'
import { toast } from '../../utils/toast'
import './HistoryPage.css'

export default function HistoryPage() {
  const [history, setHistory]     = useState([])
  const [loading, setLoading]     = useState(true)
  const [activeTab, setActiveTab] = useState('all')
  const [expandedId, setExpandedId] = useState(null)

  useEffect(() => {
    api.get('/history')
      .then(r => setHistory(r.data.history || []))
      .catch(() => toast.error('Failed to load history'))
      .finally(() => setLoading(false))
  }, [])

  const handleDeleteReport = async (id) => {
    try {
      await api.delete(`/reports/${id}`)
      setHistory(prev => prev.filter(item => !(item._id === id && item.itemType === 'report')))
      toast.success('Report deleted')
    } catch { toast.error('Failed to delete report') }
  }

  const handleDeleteSymptom = async (id) => {
    try {
      await api.delete(`/symptoms/${id}`)
      setHistory(prev => prev.filter(item => !(item._id === id && item.itemType === 'symptom')))
      toast.success('Query deleted')
    } catch { toast.error('Failed to delete query') }
  }

  const filtered = history.filter(item => {
    if (activeTab === 'reports')  return item.itemType === 'report'
    if (activeTab === 'symptoms') return item.itemType === 'symptom'
    return true
  })

  const tabs = [
    { 
      id: 'all',      
      label: 'All',      
      count: history.length 
    },
    { 
      id: 'reports',  
      label: 'Reports',  
      count: history.filter(i => i.itemType === 'report').length 
    },
    { 
      id: 'symptoms', 
      label: 'Symptoms', 
      count: history.filter(i => i.itemType === 'symptom').length 
    },
  ]

  return (
    <div className="history-page">
      <div className="history-tabs animate-fadeUp">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`history-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}>
            {tab.label}
            {tab.count > 0 && <span className="tab-count">{tab.count}</span>}
          </button>
        ))}
      </div>

      <div className="history-list">
        {loading ? <SkeletonList /> : filtered.length === 0 ? (
          <div className="history-empty card animate-fadeUp">
            <div className="empty-icon">📂</div>
            <p className="empty-title">Nothing here yet</p>
            <p className="empty-sub">
              {activeTab === 'reports'  ? 'Upload a medical report to get started.'
                                        : activeTab === 'symptoms' ? 'Describe your symptoms to see suggestions.'
                                                                   : 'Your activity will appear here.'}
            </p>
          </div>
        ) : filtered.map((item, i) => (
          <div key={`${item._id}-${item.itemType}`} className={`animate-fadeUp delay-${Math.min(i % 4 + 1, 4)}`}>
            {item.itemType === 'report' ? (
              <ReportCard
                report={item}
                expanded={expandedId === item._id}
                onExpand={() => setExpandedId(expandedId === item._id ? null : item._id)}
                onDelete={() => handleDeleteReport(item._id)} />
            ) : (
              <SymptomCard
                query={item}
                expanded={expandedId === item._id}
                onExpand={() => setExpandedId(expandedId === item._id ? null : item._id)}
                onDelete={() => handleDeleteSymptom(item._id)} />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}


function SkeletonList() {
  return (
    <div className="history-list">
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="card history-skeleton">
          <div className="skeleton" style={{ width: 48, height: 48, borderRadius: 8 }} />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div className="skeleton" style={{ width: '45%', height: 13 }} />
            <div className="skeleton" style={{ width: '25%', height: 10 }} />
          </div>
          <div className="skeleton" style={{ width: 60, height: 22, borderRadius: 99 }} />
        </div>
      ))}
    </div>
  )
}