function ModeSyndicToggle({ checked, onChange }) {
  return (
    <label className="flex cursor-pointer items-center gap-3 rounded-full bg-[#aa3bff]/10 px-4 py-3 text-sm font-semibold text-[#2e0f44]">
      <span>Mode Syndic</span>
      <input
        checked={checked}
        className="h-5 w-5 accent-[#aa3bff]"
        onChange={(event) => onChange(event.target.checked)}
        type="checkbox"
      />
    </label>
  )
}

export default ModeSyndicToggle
