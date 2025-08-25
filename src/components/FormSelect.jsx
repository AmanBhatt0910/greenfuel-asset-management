// components/FormSelect.jsx
export default function FormSelect({ label, options }) {
  return (
    <div className="flex flex-col">
      <label className="text-gray-300 text-sm mb-2">{label}</label>
      <select className="px-4 py-2 rounded-lg bg-gray-900 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-green-500">
        {options.map((opt, i) => (
          <option key={i} value={opt}>{opt}</option>
        ))}
      </select>
    </div>
  );
}
