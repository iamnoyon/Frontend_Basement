// components/form/FormTextarea.jsx
"use client";

import React from "react";
import { useFormContext } from "react-hook-form";

const FormTextarea = ({
  name,
  label,
  placeholder = "",
  required = false,
  remark = "",
  disabled = false,
  rows = 4,

  // style props
  wrapperClass = "",
  labelClass = "",
  textareaClass = "",
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
          className={`mb-1 block text-sm font-medium text-gray-800 ${labelClass}`}
        >
          {label}

          {required && (
            <span className="ml-1 text-red-700">*</span>
          )}
        </label>
      )}

      <textarea
        id={name}
        placeholder={placeholder}
        disabled={disabled}
        rows={rows}
        {...register(name, {
          required: required
            ? `${label || name} is required`
            : false,
        })}
        className={`
          w-full text-gray-800 rounded-md border px-2 py-2 outline-none
          focus:ring-1 focus:ring-black/40
          disabled:bg-gray-100 resize-y
          ${errors[name] ? "border-red-500" : "border-gray-300"}
          ${textareaClass}
        `}
      />

      {remark && (
        <p
          className={`mt-1 ml-3 text-xs text-gray-500 ${remarkClass}`}
        >
          {remark}
        </p>
      )}

      {errors[name] && (
        <p className="mt-1 text-sm text-red-500">
          {errors[name]?.message}
        </p>
      )}
    </div>
  );
};

export default FormTextarea;
