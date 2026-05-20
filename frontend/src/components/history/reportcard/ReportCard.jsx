import { useState } from 'react'
import api from '../../../api/axios'
import './ReportCard.css'

const fmtDate = (d) =>
  new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })

export default function ReportCard({ report, expanded, onExpand, onDelete }) {
  const [fullReport, setFullReport]       = useState(null)
  const [loadingFull, setLoadingFull]     = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const handleExpand = async () => {
    onExpand()
    if (!expanded && !fullReport) {
      setLoadingFull(true)
      try {
        const { data } = await api.get(`/reports/${report._id}`)
        setFullReport(data.report)
      } catch {
        // silently fail
      } finally {
        setLoadingFull(false)
      }
    }
  }

  const handleDownload = (e) => {
    e.stopPropagation()
    window.open(report.fileUrl, '_blank', 'noopener,noreferrer')
  }

  const displayReport = fullReport || report

  return (
    <div className={`report-card card ${expanded ? 'expanded' : ''}`}>
      <div className="rc-header" onClick={handleExpand}>

        <div className="rc-thumb">
          {report.thumbnailUrl ? (
            <img src={report.thumbnailUrl} alt="" />
          ) : (
            <span>{report.fileType === 'pdf' ? '📄' : '🖼'}</span>
          )}
        </div>

        <div className="rc-meta">
          <div className="rc-top">
            <span className="rc-type">
              {report.fileType?.toUpperCase()} —{' '}
              {report.analysisType === 'full' ? 'Full Analysis' : 'Conclusion'}
            </span>
            <div className="rc-badges">
              <span className={`badge ${
                report.outputLang === 'hi' ? 'badge-blue'
                : report.outputLang === 'mr' ? 'badge-green'
                : 'badge-muted'
              }`}>
                {report.outputLang?.toUpperCase()}
              </span>
              <span className="badge badge-muted">report</span>
            </div>
          </div>
          <span className="rc-date">{fmtDate(report.createdAt)}</span>
        </div>

        <div className="rc-actions" onClick={(e) => e.stopPropagation()}>

          <button
            className="btn btn-ghost rc-action-btn rc-download"
            title="Download original file"
            onClick={handleDownload}>
            <DownloadIcon />
          </button>

          <button className="btn btn-ghost rc-action-btn" title="Expand" onClick={handleExpand}>
            <ChevronIcon up={expanded} />
          </button>

          {!confirmDelete ? (
            <button
              className="btn btn-ghost rc-action-btn rc-delete"
              title="Delete"
              onClick={() => setConfirmDelete(true)}>
              <TrashIcon />
            </button>
          ) : (
            <div className="rc-confirm">
              <button className="btn btn-ghost rc-action-btn" onClick={() => setConfirmDelete(false)}>
                Cancel
              </button>
              <button
                className="btn rc-action-btn rc-confirm-btn"
                onClick={() => { setConfirmDelete(false); onDelete() }}>
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {expanded && (
        <div className="rc-body animate-fadeIn">
          <div className="rc-divider" />
          {loadingFull ? (
            <div className="rc-loading"><span className="spinner" /> Loading analysis…</div>
          ) : displayReport.analysisResult ? (
            <div className="rc-analysis">
              {displayReport.analysisResult.split('\n').map((line, i) => {
                if (!line.trim()) return <br key={i} />
                const stripped = line.trim()
                  .replace(/\*\*(.*?)\*\*/g, '$1')
                  .replace(/^#{1,3}\s/, '')
                if (/^(\d+\.|#{1,3}\s|[A-Z][A-Z\s]{4,}:)/.test(line.trim())) {
                  return <p key={i} className="rc-heading">{stripped}</p>
                }
                return <p key={i} className="rc-line">{stripped}</p>
              })}
            </div>
          ) : (
            <p className="rc-no-analysis">Analysis text not available.</p>
          )}
        </div>
      )}
    </div>
  )
}

function ChevronIcon({ up }) {
  return (
    <svg width="14" 
         height="14" 
         viewBox="0 0 24 24" 
         fill="none" 
         stroke="currentColor" 
         strokeWidth="2" 
         style={{ 
                 transform: up ? 'rotate(180deg)' : 'none', 
                 transition: 'transform 0.2s' 
                 }}>
                  <polyline points="6 9 12 15 18 9" />
    </svg>
  )
}

function TrashIcon() {
  return (
    <svg width="13" 
         height="13" 
         viewBox="0 0 24 24" 
         fill="none" 
         stroke="currentColor" 
         strokeWidth="1.8">
          <polyline points="3 6 5 6 21 6" />
          <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
          <path d="M10 11v6M14 11v6" />
          <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </svg>
  )
}

function DownloadIcon() {
  return (
    <svg width="13" 
         height="13" 
         viewBox="0 0 24 24" 
         fill="none" 
         stroke="currentColor" 
         strokeWidth="1.8">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
          <polyline points="7 10 12 15 17 10"/>
          <line x1="12" y1="15" x2="12" y2="3"/>
    </svg>
  )
}