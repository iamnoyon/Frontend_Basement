"use client";

import { X } from "lucide-react";

const GROUP_COLORS = {
  auth: { bg: "bg-[var(--color-purple-100)]", text: "text-[var(--color-purple-800)]", border: "border-[var(--color-purple-300)]" },
  user: { bg: "bg-[var(--color-blue-100)]", text: "text-[var(--color-blue-800)]", border: "border-[var(--color-blue-300)]" },
  business: { bg: "bg-[var(--color-teal-100)]", text: "text-[var(--color-teal-800)]", border: "border-[var(--color-teal-300)]" },
  category: { bg: "bg-[var(--color-orange-100)]", text: "text-[var(--color-orange-800)]", border: "border-[var(--color-orange-300)]" },
  product: { bg: "bg-[var(--color-green-100)]", text: "text-[var(--color-green-800)]", border: "border-[var(--color-green-300)]" },
  table: { bg: "bg-[var(--color-amber-100)]", text: "text-[var(--color-amber-800)]", border: "border-[var(--color-amber-300)]" },
  order: { bg: "bg-[var(--color-pink-100)]", text: "text-[var(--color-pink-800)]", border: "border-[var(--color-pink-300)]" },
  expense: { bg: "bg-[var(--color-red-100)]", text: "text-[var(--color-red-800)]", border: "border-[var(--color-red-300)]" },
  upload: { bg: "bg-[var(--color-gray-100)]", text: "text-[var(--color-gray-800)]", border: "border-[var(--color-gray-300)]" },
};

const DEFAULT_COLOR = { bg: "bg-[var(--color-gray-100)]", text: "text-[var(--color-gray-700)]", border: "border-[var(--color-gray-300)]" };

function getGroup(value) {
  if (!value) return DEFAULT_COLOR;
  const group = value.split(":")[0];
  return GROUP_COLORS[group] || DEFAULT_COLOR;
}

export default function PermissionTag({
  value,
  name,
  removable = false,
  onRemove,
  size = "md",
  className = "",
}) {
  const colors = getGroup(value);

  const sizeClasses = {
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-3 py-1",
    lg: "text-base px-4 py-1.5",
  };

  const label = name || value;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-medium border whitespace-nowrap
        ${colors.bg} ${colors.text} ${colors.border}
        ${sizeClasses[size]}
        ${className}`}
    >
      <span>{label}</span>
      {removable && onRemove && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove(value);
          }}
          className="ml-0.5 rounded-full p-0.5 transition-colors hover:cursor-pointer hover:bg-[var(--color-overlay-black-50)]"
        >
          <X size={size === "sm" ? 12 : 14} />
        </button>
      )}
    </span>
  );
}

export function PermissionTagList({
  permissions = [],
  removable = false,
  onRemove,
  size = "md",
  className = "",
}) {
  if (!permissions || permissions.length === 0) return null;

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {permissions.map((perm) => {
        const value = typeof perm === "string" ? perm : perm.value;
        const name = typeof perm === "string" ? perm : perm.name;
        return (
          <PermissionTag
            key={value}
            value={value}
            name={name}
            removable={removable}
            onRemove={onRemove}
            size={size}
          />
        );
      })}
    </div>
  );
}
