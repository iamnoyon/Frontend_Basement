"use client";

import React from "react";
import { Controller, useFormContext } from "react-hook-form";

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

const FormRadioGroup = ({
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
          className={`mb-2 block text-sm font-medium text-[var(--color-gray-800)] ${labelClass}`}
        >
          {label}

          {required && (
            <span className="ml-1 text-[var(--color-red-600)]">*</span>
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
            className={`grid gap-3 ${gridColumnsClass} ${gridClass}`}
          >
            {options?.map((item) => {
              const optionLabel = item?.[labelKey];
              const optionValue = item?.[valueKey];
              const checked = field.value === optionValue;

              const handleSelect = () => {
                if (disabled) return;
                field.onChange(optionValue);
              };

              return (
                <div
                  key={optionValue}
                  onClick={handleSelect}
                  className={`
                    flex items-center gap-3
                    rounded-lg border
                    p-3
                    transition-all
                    duration-200
                    cursor-pointer
                    select-none

                    ${
                      checked
                        ? "border-[var(--color-black)] bg-[var(--color-gray-50)]"
                        : "border-[var(--color-gray-200)] bg-[var(--color-white)]"
                    }

                    ${
                      disabled
                        ? "opacity-60 cursor-not-allowed"
                        : "hover:border-[var(--color-black)]"
                    }

                    ${itemClass}
                  `}
                >
                  <div
                    className={`
                      flex h-5 w-5 items-center justify-center rounded-full border transition-all

                      ${
                        checked
                          ? "border-[var(--color-black)]"
                          : "border-[var(--color-gray-300)]"
                      }
                    `}
                  >
                    {checked && (
                      <span className="h-2.5 w-2.5 rounded-full bg-[var(--color-black)]" />
                    )}
                  </div>

                  <span className="text-sm text-[var(--color-gray-700)]">
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
          className={`mt-1 text-xs text-[var(--color-gray-500)] ${remarkClass}`}
        >
          {remark}
        </p>
      )}

      {errors[name] && (
        <p className="mt-2 text-sm text-[var(--color-red-500)]">
          {errors[name]?.message}
        </p>
      )}
    </div>
  );
};

export default FormRadioGroup;
