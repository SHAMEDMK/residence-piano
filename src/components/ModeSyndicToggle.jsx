function ModeSyndicToggle({ checked, onChange }) {
  return (
    <label className="flex cursor-pointer items-center gap-3 rounded-full bg-indigo-50 px-4 py-3 text-sm font-semibold text-indigo-950">
      <span>Mode Syndic</span>
      <input
        checked={checked}
        className="h-5 w-5 accent-indigo-600"
        onChange={(event) => onChange(event.target.checked)}
        type="checkbox"
      />
    </label>
  )
}

export default ModeSyndicToggle
