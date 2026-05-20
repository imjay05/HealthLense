import { useState } from 'react'
import api from '../../api/axios'
import UploadZone from '../../components/report/upload/UploadZone'
import AnalysisResult from '../../components/report/analysis/AnalysisResult'
import { toast } from '../../utils/toast'
import './AnalyzePage.css'

const LANGS = [
  { value: 'en', label: 'English' },
  { value: 'hi', label: 'हिंदी'  },
  { value: 'mr', label: 'मराठी'  },
]

export default function AnalyzePage() {
  const [files, setFiles] = useState([])
  const [analysisType, setAnalysisType] = useState('full')
  const [outputLang, setOutputLang] = useState('en')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [progress, setProgress] = useState('')

  const submit = async () => {
    if (files.length === 0) return toast.error('Please upload at least one file')
    setLoading(true)
    setResult(null)

    const messages = [
      `Uploading ${files.length > 1 ? `${files.length} images` : 'file'} to HealthLense…`,
      'Reading document with HealthLense Vision…',
      'Analyzing medical content…',
      'Generating ' + (analysisType === 'full' ? 'full analysis' : 'conclusion') + '…',
    ]

    let idx = 0
    setProgress(messages[0])
    const interval = setInterval(() => {
      idx = Math.min(idx + 1, messages.length - 1)
      setProgress(messages[idx])
    }, 3500)

    try {
      const fd = new FormData()
      files.forEach((f) => fd.append('files', f))
      fd.append('analysisType', analysisType)
      fd.append('outputLang', outputLang)

      const { data } = await api.post('/reports/analyze', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setResult(data.report)
      toast.success('Report analyzed successfully')
    } catch (err) {
      if (err.response?.status === 429) {
        toast.error(`Rate limit reached. Retry in ${err.response.data.retryAfter}s`)
      } else {
        toast.error(err.response?.data?.message || 'Analysis failed')
      }
    } finally {
      clearInterval(interval)
      setLoading(false)
      setProgress('')
    }
  }

  return (
    <div className="analyze-page">

      {/* ── Upload ── */}
      <div className="card animate-fadeUp ap-upload-card">
        <h3 className="section-title">Upload Report</h3>
        <p className="upload-hint" style={{ marginBottom: 16 }}>
          PDF, JPG, PNG, WEBP · Max 10 MB
        </p>
        <UploadZone files={files} onFiles={setFiles} />
      </div>

      {/* ── Options + Result ── */}
      <div className="card animate-fadeUp delay-1">
        <h3 className="section-title">Analysis Options</h3>
        <div className="options-grid">
          <div>
            <label className="form-label">Analysis Type</label>
            <div className="option-toggle">
              {[
                { 
                  v: 'full',       
                  label: 'Full Analysis', 
                  desc: 'All test results + interpretation' 
                },
                { 
                  v: 'conclusion', 
                  label: 'Conclusion',    
                  desc: 'Key findings only' 
                },
              ].map(({ v, label, desc }) => (
                <button
                  key={v}
                  className={`option-btn ${analysisType === v ? 'active' : ''}`}
                  onClick={() => setAnalysisType(v)}>
                  <span className="option-label">{label}</span>
                  <span className="option-desc">{desc}</span>
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="form-label">Output Language</label>
            <div className="lang-tabs">
              {LANGS.map(({ value, label }) => (
                <button
                  key={value}
                  className={`lang-tab ${outputLang === value ? 'active' : ''}`}
                  onClick={() => setOutputLang(value)}>
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
        <button
          className="btn btn-primary analyze-btn"
          onClick={submit}
          disabled={loading || files.length === 0}>
          {loading
            ? <><span className="spinner" /> {progress}</>
            : `⚡ Analyze Report${files.length > 1 
            ? ` (${files.length} pages)` : ''}`
          }
        </button>
      </div>

      {result && (
        <div className="animate-fadeUp">
          <AnalysisResult
            result={result.analysisResult}
            analysisType={result.analysisType}
            outputLang={result.outputLang} />
        </div>
      )}

    </div>
  )
}