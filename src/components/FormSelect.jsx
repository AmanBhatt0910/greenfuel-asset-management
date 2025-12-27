export default function FormSelect({
  label,
  options = [],
  value,
  onChange,
}) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-xs font-medium text-gray-400">
          {label}
        </label>
      )}

      <select
        value={value ?? ""}
        onChange={onChange}
        className="
          w-full px-4 py-2.5 rounded-xl text-sm
          bg-gray-800 border border-gray-700
          text-white
          focus:outline-none focus:ring-2 focus:ring-green-500/40
          transition-all hover:border-gray-600
        "
      >
        <option value="" className="text-gray-500">
          Select...
        </option>

        {options.map((opt, i) => {
          // Supports both string[] and {label,value}[]
          const val = typeof opt === "string" ? opt : opt.value;
          const labelText = typeof opt === "string" ? opt : opt.label;

          return (
            <option key={i} value={val}>
              {labelText}
            </option>
          );
        })}
      </select>
    </div>
  );
}
