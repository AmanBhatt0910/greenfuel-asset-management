export default function FormInput({
  label,
  type = "text",
  placeholder = "",
  value,
  onChange,
  readOnly = false,
}) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-xs font-medium text-gray-400">
          {label}
        </label>
      )}

      <input
        type={type}
        placeholder={placeholder}
        value={value ?? ""}
        onChange={onChange}
        readOnly={readOnly}
        className={`
          w-full px-4 py-2.5 rounded-xl text-sm
          bg-gray-800 border border-gray-700
          text-white placeholder-gray-500
          focus:outline-none focus:ring-2 focus:ring-green-500/40
          transition-all
          ${
            readOnly
              ? "cursor-not-allowed bg-gray-900 text-gray-400"
              : "hover:border-gray-600"
          }
        `}
      />
    </div>
  );
}
