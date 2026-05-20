import { useState } from 'react'
import './AnalysisResult.css'

export default function AnalysisResult({ result, analysisType, outputLang }) {
  if (!result) return null

  const [copied, setCopied] = useState(false)

  const langLabel = { en: 'English', hi: 'Hindi', mr: 'Marathi' }[outputLang] || outputLang

  const copyToClipboard = () => {
    navigator.clipboard.writeText(result)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="analysis-result animate-fadeUp">
      <div className="ar-header">
        <div className="ar-meta">
          <span className="badge badge-amber">
            {analysisType === 'full' ? '📋 Full Analysis' : '🎯 Conclusion'}
          </span>
          <span className="badge badge-muted">{langLabel}</span>
        </div>
        <button className="btn btn-ghost ar-copy" onClick={copyToClipboard} title="Copy to clipboard">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <rect x="9" y="9" width="13" height="13" rx="2"/>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
          </svg>
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
      <div className="ar-divider" />
      <div className="ar-body">
        {result.split('\n').map((line, i) => {
          const trimmed = line.trim()
          if (!trimmed) return <br key={i} />

          const stripped = trimmed.replace(/\*\*(.*?)\*\*/g, '$1')

          const isHeading =
            /^\*\*.*\*\*$/.test(trimmed) ||          
            /^\d+[.)]\s/.test(trimmed) ||              
            /^#{1,3}\s/.test(trimmed) ||              
            /^[A-Z][A-Z\s]{4,}:/.test(trimmed) ||    
            /^[\u0900-\u097F][\u0900-\u097F\s]{2,}:/.test(trimmed) 

          if (isHeading) {
            return <p key={i} className="ar-heading">{stripped}</p>
          }
          return <p key={i} className="ar-line">{stripped}</p>
        })}
      </div>
    </div>
  )
}