import { useRef, useState } from 'react'
import './UploadZone.css'

const MAX_FILES = 5

const ALLOWED_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'application/pdf',
]

const isSingleFileType = (mime) => mime === 'application/pdf'

const fileIcon = (mime) => {
  if (mime === 'application/pdf') return '📄'
  return '🖼️'
}

export default function UploadZone({ onFiles, files = [] }) {
  const inputRef = useRef()
  const [dragging, setDragging] = useState(false)
  const [error, setError]       = useState('')

  const processFiles = (incoming) => {
    setError('')
    const all   = Array.from(incoming)
    const valid = all.filter((f) => ALLOWED_TYPES.includes(f.type))

    if (all.length > valid.length){
      setError(`${all.length - valid.length} file(s) skipped — only JPG, PNG, WEBP, PDF allowed`)
    }

    const hasSingleOnly = valid.some((f) => isSingleFileType(f.type))
    if (hasSingleOnly && (valid.length > 1 || files.length > 0)) {
      setError('PDF must be uploaded alone — remove existing files first.')
      return onFiles(valid.slice(0, 1))
    }

    if (files.some((f) => isSingleFileType(f.type))) {
      setError('Remove the existing PDF before adding more files.')
      return
    }

    const merged = [...files, ...valid].slice(0, MAX_FILES)
    if (merged.length < files.length + valid.length)
      setError(`Max ${MAX_FILES} files. Some were dropped.`)

    onFiles(merged)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragging(false)
    processFiles(e.dataTransfer.files)
  }

  const handleChange = (e) => {
    if (e.target.files.length) processFiles(e.target.files)
    e.target.value = ''
  }

  const removeFile = (i) => {
    onFiles(files.filter((_, idx) => idx !== i))
    setError('')
  }

  const isEmpty = files.length === 0

  return (
    <div className="upload-zone-wrap">
      <div
        className={`upload-zone ${dragging ? 'dragging' : ''} ${!isEmpty ? 'has-file' : ''}`}
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => isEmpty && inputRef.current.click()}>
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.jpg,.jpeg,.png,.webp"
          multiple
          onChange={handleChange}
          className="sr-only"
        />

        {isEmpty ? (
          <>
            <div className="upload-icon">
              <svg width="32" 
                   height="32" 
                   viewBox="0 0 24 24" 
                   fill="none" 
                   stroke="currentColor" 
                   strokeWidth="1.5">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="17 8 12 3 7 8"/>
                    <line x1="12" y1="3" x2="12" y2="15"/>
              </svg>
            </div>
            <p className="upload-label">
              {dragging ? 'Drop files here' : 'Drag & drop or click to upload'}
            </p>
            <p className="upload-hint">1 PDF · or up to 5 images (JPG, PNG, WEBP) · Max 10 MB each</p>
          </>
        ) : (
          <div className="upload-grid">
            {files.map((f, i) => (
              <div key={i} className="upload-thumb">
                <div className="upload-thumb-icon">{fileIcon(f.type)}</div>
                <p className="upload-thumb-name">{f.name}</p>
                <p className="upload-thumb-size">{(f.size / 1024 / 1024).toFixed(2)} MB</p>
                <button
                  className="upload-thumb-remove"
                  onClick={(e) => { e.stopPropagation(); removeFile(i) }}
                  title="Remove"
                >×</button>
              </div>
            ))}
            {files.length < MAX_FILES && !files.some((f) => isSingleFileType(f.type)) && (
              <div
                className="upload-thumb upload-thumb-add"
                onClick={(e) => { e.stopPropagation(); inputRef.current.click() }}>
                <span>+</span>
                <p>Add more</p>
              </div>
            )}
          </div>
        )}
      </div>

      {error && <p className="upload-error">{error}</p>}

      {files.length > 0 && (
        <p className="upload-count">
          {files.length} / {MAX_FILES} file{files.length > 1 ? 's' : ''} selected
        </p>
      )}
    </div>
  )
}