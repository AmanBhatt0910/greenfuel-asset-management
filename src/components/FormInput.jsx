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
        <label className="text-xs font-medium text-secondary">
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
          surface border border-default
          text-primary
          focus:outline-none focus:ring-2 focus:ring-[color:var(--accent)]/40
          transition-all
          ${
            readOnly
              ? "cursor-not-allowed surface-muted text-secondary"
              : "hover:border-[color:var(--border)]"
          }
        `}
      />
    </div>
  );
}
