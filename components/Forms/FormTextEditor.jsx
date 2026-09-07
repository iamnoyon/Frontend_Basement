"use client";

import React from "react";
import dynamic from "next/dynamic";
import { Controller, useFormContext } from "react-hook-form";

const ReactQuill = dynamic(
  () => import("react-quill-new"),
  { ssr: false }
);

import "react-quill-new/dist/quill.snow.css";

const FormTextEditor = ({
  name,
  label,
  placeholder = "",
  required = false,
  remark = "",
  disabled = false,

  // style props
  wrapperClass = "",
  labelClass = "",
  editorClass = "",
  remarkClass = "",
}) => {
  const {
    control,
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

      <Controller
        name={name}
        control={control}
        rules={{
          required: required
            ? `${label || name} is required`
            : false,
        }}
        render={({ field }) => (
          <div
            className={`
              rounded-md overflow-hidden
              ${errors[name] ? "border border-red-500" : "border border-gray-300"}
              ${editorClass}
            `}
          >
            <ReactQuill
              theme="snow"
              value={field.value || ""}
              onChange={field.onChange}
              placeholder={placeholder}
              readOnly={disabled}
              className="text-black"
            />
          </div>
        )}
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

export default FormTextEditor;