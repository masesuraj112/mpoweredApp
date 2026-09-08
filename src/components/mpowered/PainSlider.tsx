import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

// Test on http://localhost:8081/demographics

export const CustomInput: React.FC<InputProps> = ({ placeholder, label, ...rest }) => {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-sm font-medium">{label}</label>}
      <input
        placeholder={placeholder ?? "Type something..."}
        className="px-3 py-2 border rounded-md"
        {...rest}
      />
    </div>
  );
};
