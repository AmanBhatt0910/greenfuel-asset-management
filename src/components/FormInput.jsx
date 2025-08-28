export default function FormInput({ label, type = "text", placeholder, value, onChange, readOnly }) {
  return (
    <div className="flex flex-col">
      <label className="text-gray-300 text-sm mb-2">{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        readOnly={readOnly}
        className={`px-4 py-2 rounded-lg bg-gray-900 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 ${readOnly ? "cursor-not-allowed" : ""}`}
      />
    </div>
  );
}
