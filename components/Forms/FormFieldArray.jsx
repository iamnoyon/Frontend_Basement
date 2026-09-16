// components/form/FormFieldArray.jsx
"use client";

import React from "react";
import { useFormContext, useFieldArray } from "react-hook-form";

const FormFieldArray = ({
  name,
  label,
  placeholder = "",
  required = false,
  remark = "",
  disabled = false,
  addButtonText = "+ Add",

  // style props
  wrapperClass = "",
  labelClass = "",
  inputClass = "",
  remarkClass = "",

  // item config
  defaultValue = "",
}) => {
  const {
    control,
    register,
    formState: { errors },
  } = useFormContext();

  const { fields, append, remove } = useFieldArray({ control, name });

  return (
    <div className={`w-full ${wrapperClass}`}>
      {label && (
        <label className={`mb-1 block text-sm font-medium text-[var(--color-gray-800)] ${labelClass}`}>
          {label}

          {required && (
            <span className="ml-1 text-[var(--color-red-700)]">*</span>
          )}
        </label>
      )}

      <div className="space-y-2">
        {fields.map((field, index) => (
          <div key={field.id} className="flex items-center gap-2">
            <input
              {...register(`${name}.${index}`)}
              placeholder={placeholder || `${label || name} ${index + 1}`}
              disabled={disabled}
              className={`
                w-full text-[var(--color-gray-800)] rounded-md border px-2 py-2 outline-none
                focus:ring-1 focus:ring-[var(--color-ring-black-40)]
                disabled:bg-[var(--color-gray-100)]
                ${errors[name]?.[index] ? "border-[var(--color-red-500)]" : "border-[var(--color-gray-300)]"}
                ${inputClass}
              `}
            />
            {!disabled && (
<button
              type="button"
              onClick={() => remove(index)}
              className="shrink-0 rounded-md bg-[var(--color-red-500)] px-3 py-2 text-sm text-[var(--color-white)] hover:bg-[var(--color-red-600)] cursor-pointer"
            >
                ✕
              </button>
            )}
          </div>
        ))}
      </div>

      {!disabled && (
        <button
          type="button"
          onClick={() => append(defaultValue)}
          className="mt-2 rounded-md border border-[var(--color-primary)] px-4 py-1.5 text-sm text-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-[var(--color-white)] cursor-pointer"
        >
          {addButtonText}
        </button>
      )}

      {remark && (
        <p className={`mt-1 ml-3 text-xs text-[var(--color-gray-500)] ${remarkClass}`}>
          {remark}
        </p>
      )}

      {errors[name] && !Array.isArray(errors[name]) && (
        <p className="mt-1 text-sm text-[var(--color-red-500)]">
          {errors[name]?.message}
        </p>
      )}
    </div>
  );
};

export default FormFieldArray;
