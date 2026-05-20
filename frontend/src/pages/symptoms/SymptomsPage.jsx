import { useState, useEffect } from 'react'
import api from '../../api/axios'
import SymptomChips from '../../components/symptoms/SymptomChips'
import TestSuggestions from '../../components/symptoms/TestSuggestions'
import LabsMap from '../../components/map/LabsMap'
import { useGeolocation } from '../../hooks/useGeolocation'
import { toast } from '../../utils/toast'
import './SymptomsPage.css'

export default function SymptomsPage() {
  const [inputText, setInputText] = useState('')
  const [selectedChips, setSelectedChips] = useState([])
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const { coords, error: geoError, request: requestGeo } = useGeolocation()

  useEffect(() => {
    requestGeo()
  }, [])

  const toggleChip = (chip) => {
    const alreadySelected = selectedChips.includes(chip)
    if (alreadySelected) {
      setSelectedChips(prev => prev.filter(c => c !== chip))
      setInputText(prev =>
        prev.split('\n').filter(l => l.trim() !== chip).join('\n').trim()
      )
    } else {
      setSelectedChips(prev => [...prev, chip])
      setInputText(prev => {
        const base = prev.trim()
        return base ? `${base}\n${chip}` : chip
      })
    }
  }

  const submit = async () => {
    if (!inputText.trim()) return toast.error('Please describe your symptoms')
    setLoading(true)
    setResult(null)
    try {
      const { data } = await api.post('/symptoms/analyze', {
        inputText,
        selectedChips,
        lat: coords?.lat,
        lon: coords?.lon,
      })
      setResult(data)
      toast.success('Analysis complete')
    } catch (err) {
      if (err.response?.status === 429) {
        toast.error(`Rate limit reached. Retry in ${err.response.data.retryAfter}s`)
      } else {
        toast.error(err.response?.data?.message || 'Analysis failed')
      }
    } finally {
      setLoading(false)
    }
  }

  const nearbyLabs = result?.nearbyLabs || []

  return (
    <div className="symptoms-page">

      {/* ── LEFT: Symptoms input card ──────────────────────────── */}
      <div className="symp-left">
        <div className="card animate-fadeUp">
          <h3 className="section-title">Describe Your Symptoms</h3>
          <p className="section-sub" style={{ marginBottom: 14 }}>
            Write in English, Hindi, Marathi, or Hinglish — we'll auto-detect.
          </p>

          <textarea
            className="input textarea"
            placeholder="e.g. Kal se sir dard ho raha hai… or Headache since yesterday with mild fever…"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}/>

          <div style={{ marginTop: 14 }}>
            <label className="form-label">Quick Add Symptoms</label>
            <div style={{ marginTop: 8 }}>
              <SymptomChips selected={selectedChips} onToggle={toggleChip} />
            </div>
          </div>

          {geoError && (
            <p className="geo-status" style={{ marginTop: 10 }}>
              📍 Location unavailable — nearby labs won't be shown
            </p>
          )}

          <button
            className="btn btn-primary symp-submit"
            onClick={submit}
            disabled={loading || !inputText.trim()}>
            {loading ? <><span className="spinner" /> Analyzing…</> : '⚡ Analyze Symptoms'}
          </button>
        </div>
      </div>

      {/* ── RIGHT: Test suggestions card (or placeholder) ─────── */}
      <div className="symp-right">
        {result ? (
          <div className="card animate-fadeUp">
            <TestSuggestions
              suggestions={result.suggestions}
              summary={result.summary}
              detectedLang={result.detectedLang} />
          </div>
        ) : (
          <div className="symp-placeholder card animate-fadeIn">
            <div className="placeholder-icon">🩺</div>
            <p className="placeholder-title">Your analysis will appear here</p>
            <p className="placeholder-sub">
              Describe your symptoms and click Analyze to get personalized test recommendations.
            </p>
          </div>
        )}
      </div>

      <div className="symp-map animate-fadeUp delay-1">
        <LabsMap labs={nearbyLabs} userCoords={coords} />
      </div>

    </div>
  )
}