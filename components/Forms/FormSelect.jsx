// components/form/FormSelect.jsx
"use client";

import React from "react";
import Select from "react-select";
import { Controller, useFormContext } from "react-hook-form";

const defaultStyles = {
  control: (provided, state) => ({
    ...provided,
    minHeight: "44px",
    borderRadius: "10px",
    borderColor: state.isFocused
      ? "#000"
      : "#d1d5db",
    boxShadow: "none",
    "&:hover": {
      borderColor: "#000",
    },
  }),

  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isSelected
      ? "#000"
      : state.isFocused
      ? "#f3f4f6"
      : "#fff",
    color: state.isSelected ? "#fff" : "#111827",
    cursor: "pointer",
  }),

  placeholder: (provided) => ({
    ...provided,
    color: "#9ca3af",
  }),

  menu: (provided) => ({
    ...provided,
    zIndex: 9999,
  }),

  multiValue: (provided) => ({
    ...provided,
    backgroundColor: "#000",
    borderRadius: "6px",
  }),

  multiValueLabel: (provided) => ({
    ...provided,
    color: "#fff",
  }),

  multiValueRemove: (provided) => ({
    ...provided,
    color: "#fff",
    cursor: "pointer",

    ":hover": {
      backgroundColor: "#dc2626",
      color: "#fff",
    },
  }),
};

const FormSelect = ({
  name,
  label,

  // data
  options = [],

  // customize keys
  labelKey = "label",
  valueKey = "id",

  // select config
  placeholder = "Select...",
  isMulti = false,
  isClearable = true,
  isDisabled = false,
  required = false,

  // remarks
  remark = "",

  // class names
  wrapperClass = "",
  labelClass = "",
  selectClass = "",
  remarkClass = "",

  // custom style
  customStyles = {},

  // extra props
  ...props
}) => {
  const {
    control,
    formState: { errors },
  } = useFormContext();

  // dynamic option convert
  const formattedOptions = options?.map((item) => ({
    label: item?.[labelKey],
    value: item?.[valueKey],
    raw: item,
  }));

  // merge styles
  const mergedStyles = {
    ...defaultStyles,
    ...customStyles,
  };

  return (
    <div className={`w-full ${wrapperClass}`}>
      {label && (
        <label
          htmlFor={name}
          className={`mb-1 text-gray-800 block text-sm font-medium ${labelClass}`}
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
        render={({ field }) => {
          const selectedValue = isMulti
            ? formattedOptions.filter((option) =>
                field.value?.includes(option.value)
              )
            : formattedOptions.find(
                (option) => option.value === field.value
              ) || null;

          return (
            <Select
              {...props}
              inputId={name}
              options={formattedOptions}
              isMulti={isMulti}
              isClearable={isClearable}
              isDisabled={isDisabled}
              placeholder={placeholder}
              className={selectClass}
              styles={mergedStyles}
              value={selectedValue}
              onChange={(selected) => {
                if (isMulti) {
                  field.onChange(
                    selected
                      ? selected.map((item) => item.value)
                      : []
                  );
                } else {
                  field.onChange(selected?.value || "");
                }
              }}
            />
          );
        }}
      />

      {remark && (
        <p
          className={`mt-1 text-xs text-gray-500 ${remarkClass}`}
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

export default FormSelect;