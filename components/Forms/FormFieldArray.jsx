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
        <label className={`mb-1 block text-sm font-medium text-gray-800 ${labelClass}`}>
          {label}

          {required && (
            <span className="ml-1 text-red-700">*</span>
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
                w-full text-gray-800 rounded-md border px-2 py-2 outline-none
                focus:ring-1 focus:ring-black/40
                disabled:bg-gray-100
                ${errors[name]?.[index] ? "border-red-500" : "border-gray-300"}
                ${inputClass}
              `}
            />
            {!disabled && (
              <button
                type="button"
                onClick={() => remove(index)}
                className="shrink-0 rounded-md bg-red-500 px-3 py-2 text-sm text-white hover:bg-red-600 cursor-pointer"
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
          className="mt-2 rounded-md border border-[#043570] px-4 py-1.5 text-sm text-[#043570] hover:bg-[#043570] hover:text-white cursor-pointer"
        >
          {addButtonText}
        </button>
      )}

      {remark && (
        <p className={`mt-1 ml-3 text-xs text-gray-500 ${remarkClass}`}>
          {remark}
        </p>
      )}

      {errors[name] && !Array.isArray(errors[name]) && (
        <p className="mt-1 text-sm text-red-500">
          {errors[name]?.message}
        </p>
      )}
    </div>
  );
};

export default FormFieldArray;
