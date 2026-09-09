import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

// Test on http://localhost:8081/demographics

export function CustomInput({ placeholder, label, ...rest }: InputProps) {
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
}

/////////////////////////////////////////////////



interface PainSliderProps extends React.InputHTMLAttributes<HTMLInputElement> {
  painLevel?: string;
  painDescription?: string;
}


export function PainSliderInput({painLevel, painDescription}: PainSliderProps) {
  return (
    <div className="w-full max-w-sm">
      <p>Yes</p>

    </div>

  );

}