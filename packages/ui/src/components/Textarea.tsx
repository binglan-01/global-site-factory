export type TextareaProps = {
  name: string;
  className?: string;
  autoComplete?: string;
  disabled?: boolean;
  label?: string;
  placeholder?: string;
  required?: boolean;
  rows?: number;
};

export function Textarea({
  autoComplete,
  className,
  disabled = false,
  label,
  name,
  placeholder,
  required = false,
  rows = 5,
}: TextareaProps) {
  const textareaClassName = ["factory-textarea", className].filter(Boolean).join(" ");
  const textarea = (
    <textarea
      autoComplete={autoComplete}
      className={textareaClassName}
      disabled={disabled}
      name={name}
      placeholder={placeholder}
      required={required}
      rows={rows}
    />
  );

  if (!label) {
    return textarea;
  }

  return (
    <label className="factory-textarea-label">
      {label}
      {textarea}
    </label>
  );
}
