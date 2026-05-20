const CHIPS = [
  'Headache', 'Fever', 'Fatigue', 'Nausea', 'Vomiting',
  'Chest Pain', 'Shortness of Breath', 'Joint Pain', 'Back Pain',
  'Dizziness', 'Rash', 'Swelling',
]

export default function SymptomChips({ selected, onToggle }) {
  return (
    <div className="chips-wrap">
      {CHIPS.map((chip) => (
        <button
          key={chip}
          className={`chip ${selected.includes(chip) ? 'active' : ''}`}
          onClick={() => onToggle(chip)}
          type="button">
          {chip}
        </button>
      ))}
    </div>
  )
}