// components/form/FormInput.jsx
"use client";

import React from "react";
import { useFormContext } from "react-hook-form";

const FormInput = ({
  name,
  label,
  type = "text",
  placeholder = "",
  required = false,
  remark = "",
  disabled = false,

  // style props
  wrapperClass = "",
  labelClass = "",
  inputClass = "",
  remarkClass = "",
}) => {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  return (
    <div className={`w-full ${wrapperClass}`}>
      {label && (
        <label
          htmlFor={name}
          className={`mb-1 block text-sm font-medium text-[var(--color-gray-800)] ${labelClass}`}
        >
          {label}

          {required && (
            <span className="ml-1 text-[var(--color-red-700)]">*</span>
          )}
        </label>
      )}

      <input
        id={name}
        type={type}
        placeholder={placeholder}
        disabled={disabled}
        {...register(name, {
          required: required
            ? `${label || name} is required`
            : false,
        })}
        className={`
          w-full text-[var(--color-gray-800)] rounded-md border px-2 py-2 outline-none
          focus:ring-1 focus:ring-[var(--color-ring-black-40)]
          disabled:bg-[var(--color-gray-100)]
          ${errors[name] ? "border-[var(--color-red-500)]" : "border-[var(--color-gray-300)]"}
          ${inputClass}
        `}
      />

      {remark && (
        <p
          className={`mt-1 ml-3 text-xs text-[var(--color-gray-500)] ${remarkClass}`}
        >
          {remark}
        </p>
      )}

      {errors[name] && (
        <p className="mt-1 text-sm text-[var(--color-red-500)]">
          {errors[name]?.message}
        </p>
      )}
    </div>
  );
};

export default FormInput;