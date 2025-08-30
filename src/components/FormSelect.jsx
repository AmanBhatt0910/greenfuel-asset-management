export default function FormSelect({ label, options, value, onChange }) {
  return (
    <div className="flex flex-col">
      <label className="text-gray-300 text-sm mb-2">{label}</label>
      <select
        value={value}
        onChange={onChange}
        className="px-4 py-2 rounded-lg bg-gray-900 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
      >
        <option value="">Select...</option>
        {options.map((opt, i) => (
          <option key={i} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}