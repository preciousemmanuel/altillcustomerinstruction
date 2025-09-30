const fixedInputClass =
  'rounded-md appearance-none relative block w-full mt-2 px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-purple-500 focus:border-purple-500 focus:z-10 sm:text-sm'

export default function AccountNumberInput({
  handleChange,
  value,
  labelText,
  labelFor,
  id,
  name,
  isRequired = false,
  placeholder,
  customClass,
  disabled,
  maxLength=10,
  handleInput,
  onBlur,
}: {
  handleChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  value: string;
  labelText: string;
  labelFor: string;
  id: string;
  name: string;
  type: string;
  isRequired?: boolean;
  placeholder?: string;
  customClass?: string;
  disabled?: boolean;
  maxLength?: number;
  onBlur?: () => void;
  handleInput?: (event: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <div className="my-5">
      <label
        htmlFor={labelFor}
        className="block mb-2 text-sm font-medium text-gray-900"
      >
        {labelText}
      </label>
      <input
        onChange={handleChange}
        value={value}
        id={id}
        name={name}
        type="text"
        disabled={disabled}
        required={isRequired}
        onBlur={onBlur} 
        maxLength={maxLength}
        onInput={handleInput}
        className={customClass !== undefined ? customClass : fixedInputClass}
        placeholder={placeholder}
      />
    </div>
  );
}
