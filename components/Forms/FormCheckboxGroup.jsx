"use client";

import React from "react";
import { Controller, useFormContext } from "react-hook-form";
import { FiCheck } from "react-icons/fi";

const COL_MAP = {
  1: "grid-cols-1",
  2: "grid-cols-2",
  3: "grid-cols-3",
  4: "grid-cols-4",
  5: "grid-cols-5",
  6: "grid-cols-6",
};

const getGridClasses = (columns = {}) => {
  const {
    sm = 1,
    md,
    lg,
    xl,
    "2xl": xxl,
  } = columns;

  return [
    COL_MAP[sm],
    md && `md:${COL_MAP[md]}`,
    lg && `lg:${COL_MAP[lg]}`,
    xl && `xl:${COL_MAP[xl]}`,
    xxl && `2xl:${COL_MAP[xxl]}`,
  ]
    .filter(Boolean)
    .join(" ");
};

const FormCheckboxGroup = ({
  name,
  label,

  // data
  options = [],

  // customize keys
  labelKey = "label",
  valueKey = "id",

  // validation
  required = false,

  // responsive columns
  columns = {
    sm: 1,
    md: 2,
    lg: 3,
  },

  // remarks
  remark = "",

  // classes
  wrapperClass = "",
  labelClass = "",
  gridClass = "",
  itemClass = "",
  remarkClass = "",

  // disable
  disabled = false,

  ...props
}) => {
  const {
    control,
    formState: { errors },
  } = useFormContext();

  const gridColumnsClass = getGridClasses(columns);

  return (
    <div className={`w-full ${wrapperClass}`}>
      {label && (
        <label
          className={`mb-2 block text-sm font-medium text-gray-800 ${labelClass}`}
        >
          {label}

          {required && (
            <span className="ml-1 text-red-600">*</span>
          )}
        </label>
      )}

      <Controller
        name={name}
        control={control}
        defaultValue={[]}
        rules={{
          validate: (value) => {
            if (
              required &&
              (!value || value.length === 0)
            ) {
              return `${label || name} is required`;
            }

            return true;
          },
        }}
        render={({ field }) => (
          <div
            className={`grid gap-3 ${gridColumnsClass} ${gridClass}`}
          >
            {options?.map((item) => {
              const optionLabel =
                item?.[labelKey];

              const optionValue =
                item?.[valueKey];

              const checked =
                field.value?.includes(
                  optionValue
                );

              const handleToggle = () => {
                if (disabled) return;

                const currentValues =
                  field.value || [];

                const updatedValues = checked
                  ? currentValues.filter(
                      (v) => v !== optionValue
                    )
                  : [
                      ...currentValues,
                      optionValue,
                    ];

                field.onChange(updatedValues);
              };

              return (
                <div
                  key={optionValue}
                  onClick={handleToggle}
                  className={`
                    flex items-center gap-3
                    rounded-xl border
                    p-3
                    transition-all
                    duration-200
                    cursor-pointer
                    select-none

                    ${
                      checked
                        ? "border-black bg-gray-50"
                        : "border-gray-200 bg-white"
                    }

                    ${
                      disabled
                        ? "opacity-60 cursor-not-allowed"
                        : "hover:border-black"
                    }

                    ${itemClass}
                  `}
                >
                  <div
                    className={`
                      flex h-5 w-5 items-center justify-center rounded border transition-all

                      ${
                        checked
                          ? "border-black bg-black text-white"
                          : "border-gray-300 bg-white"
                      }
                    `}
                  >
                    {checked && (
                      <FiCheck size={14} />
                    )}
                  </div>

                  <span className="text-sm text-gray-700">
                    {optionLabel}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      />

      {remark && (
        <p
          className={`mt-1 text-xs text-gray-500 ${remarkClass}`}
        >
          {remark}
        </p>
      )}

      {errors[name] && (
        <p className="mt-2 text-sm text-red-500">
          {errors[name]?.message}
        </p>
      )}
    </div>
  );
};

export default FormCheckboxGroup;