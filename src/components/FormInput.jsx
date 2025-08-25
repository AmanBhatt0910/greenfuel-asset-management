// components/FormInput.jsx
export default function FormInput({ label, type = "text", placeholder }) {
  return (
    <div className="flex flex-col">
      <label className="text-gray-300 text-sm mb-2">{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        className="px-4 py-2 rounded-lg bg-gray-900 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500"
      />
    </div>
  );
}
