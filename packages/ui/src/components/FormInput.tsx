export type FormInputProps = {
  name: string;
  className?: string;
  autoComplete?: string;
  disabled?: boolean;
  label?: string;
  placeholder?: string;
  required?: boolean;
  type?: "email" | "hidden" | "number" | "password" | "search" | "tel" | "text" | "url";
  value?: string;
};

export function FormInput({
  autoComplete,
  className,
  disabled = false,
  label,
  name,
  placeholder,
  required = false,
  type = "text",
  value,
}: FormInputProps) {
  const inputClassName = ["factory-form-input", className].filter(Boolean).join(" ");
  const input = (
    <input
      autoComplete={autoComplete}
      className={inputClassName}
      defaultValue={value}
      disabled={disabled}
      name={name}
      placeholder={placeholder}
      required={required}
      type={type}
    />
  );

  if (!label || type === "hidden") {
    return input;
  }

  return (
    <label className="factory-form-input-label">
      {label}
      {input}
    </label>
  );
}
