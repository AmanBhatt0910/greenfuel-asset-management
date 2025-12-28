export default function FormSelect({
  label,
  options = [],
  value,
  onChange,
}) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-xs font-medium text-secondary">
          {label}
        </label>
      )}

      <select
        value={value ?? ""}
        onChange={onChange}
        className="
          w-full px-4 py-2.5 rounded-xl text-sm
          surface border border-default
          text-primary
          focus:outline-none focus:ring-2 focus:ring-[color:var(--accent)]/40
          transition-all hover:border-[color:var(--border)]
        "
      >
        <option value="">
          Select...
        </option>

        {options.map((opt, i) => {
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
