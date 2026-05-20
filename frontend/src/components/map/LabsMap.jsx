import { useEffect, useRef } from 'react'
import './LabsMap.css'

export default function LabsMap({ labs = [], userCoords }) {
  const mapRef      = useRef(null)
  const instanceRef = useRef(null)

  useEffect(() => {
    // Tear down any previous instance first
    if (instanceRef.current) {
      instanceRef.current.remove()
      instanceRef.current = null
    }

    // Wait until we have both the DOM node AND coords
    if (!window.L || !mapRef.current || !userCoords) return

    const L   = window.L
    const map = L.map(mapRef.current, {
      center: [userCoords.lat, userCoords.lon],
      zoom: 13,
      zoomControl: true,
      attributionControl: false,
    })

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
    }).addTo(map)

    // User marker
    const userIcon = L.divIcon({
      html:      '<div class="map-user-pin"></div>',
      iconSize:  [14, 14],
      className: '',
    })
    L.marker([userCoords.lat, userCoords.lon], { icon: userIcon })
      .addTo(map)
      .bindPopup('<b>Your Location</b>')
      .bindTooltip('You are here', {
        permanent:  false,
        direction:  'top',
        offset:     [0, -10],
        className:  'lab-tooltip',
      })

    // Lab markers
    if (labs.length > 0) {
      labs.forEach((lab) => {
        const labIcon = L.divIcon({
          html: '<div class="map-lab-pin">+</div>',
          iconSize:  [28, 28],
          className: '',
        })

        const marker = L.marker([lab.lat, lab.lon], { icon: labIcon }).addTo(map)

        marker.bindPopup(`
          <div style="font-family: Outfit, sans-serif; min-width:180px; padding:2px 0">
            <b style="color:#0db8a0; font-size:0.85rem">${lab.name}</b><br/>
            ${lab.address ? `<small style="color:#7ea8cc">${lab.address}</small><br/>` : ''}
            <small style="color:#3d5a7a">${lab.distance} km · ${lab.type}</small>
          </div>
        `)

        marker.bindTooltip(lab.name, {
          permanent:  false,
          direction:  'top',
          offset:     [0, -16],
          className:  'lab-tooltip',
        })

        marker.on('mouseover', () => marker.openTooltip())
        marker.on('mouseout', () => marker.closeTooltip())
        marker.on('click', () => { marker.closeTooltip(); marker.openPopup() })
      })

      const bounds = L.latLngBounds([
        [userCoords.lat, userCoords.lon],
        ...labs.map(l => [l.lat, l.lon])
      ])
      map.fitBounds(bounds, { padding: [40, 40] })
    }

    instanceRef.current = map

    setTimeout(() => map.invalidateSize(), 150)

    return () => {
      if (instanceRef.current) {
        instanceRef.current.remove()
        instanceRef.current = null
      }
    }
  }, [labs, userCoords])
  
  return (
    <div className="labs-map-wrap">
      <div className="labs-map-header">
        <h3 className="section-title">
          {labs.length > 0 ? 'Nearby Labs & Hospitals' : 'Your Location'}
        </h3>
        {labs.length > 0 && (
          <span className="badge badge-green">{labs.length} found</span>
        )}
      </div>

      <div ref={mapRef} className="labs-map">
        {!userCoords && (
          <div className="labs-map-waiting">
            <span>📍</span>
            <p>Waiting for location…</p>
          </div>
        )}
      </div>

      {labs.length > 0 && (
        <ul className="labs-list">
          {labs.map((lab, i) => (
            <li key={i} className="lab-item">
              <div className="lab-index">{i + 1}</div>
              <div className="lab-info">
                <p className="lab-name">{lab.name}</p>
                {lab.address && <p className="lab-addr">{lab.address}</p>}
              </div>
              <span className="badge badge-muted">{lab.distance} km</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}