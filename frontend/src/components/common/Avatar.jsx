import React from "react";

const sizeClasses = {
  xs: "w-6 h-6 text-xs",
  sm: "w-8 h-8 text-sm",
  md: "w-10 h-10 text-base",
  lg: "w-14 h-14 text-lg",
  xl: "w-20 h-20 text-2xl",
};

const statusColors = {
  online: "bg-green-500",
  offline: "bg-gray-400",
  away: "bg-yellow-500",
};

/**
 * Reusable avatar component that shows either an image or the
 * first character of the user's name inside a coloured circle.
 */
export default function Avatar({
  src,
  name = "",
  size = "md",
  showStatus = false,
  isOnline = false,
  className = "",
}) {
  const sizeClass = sizeClasses[size] || sizeClasses.md;
  const initial = name ? name.charAt(0).toUpperCase() : "?";

  // Generate a deterministic background colour from the name
  const hue = name
    ? name.split("").reduce((acc, ch) => acc + ch.charCodeAt(0), 0) % 360
    : 200;

  return (
    <div className={`relative inline-block ${className}`}>
      {src ? (
        <img
          src={src}
          alt={name}
          className={`${sizeClass} rounded-full object-cover border-2 border-white shadow-sm`}
        />
      ) : (
        <div
          className={`${sizeClass} rounded-full flex items-center justify-center font-semibold text-white shadow-sm`}
          style={{ backgroundColor: `hsl(${hue}, 60%, 55%)` }}
        >
          {initial}
        </div>
      )}

      {showStatus && (
        <span
          className={`absolute bottom-0 right-0 block rounded-full ring-2 ring-white
            ${isOnline ? statusColors.online : statusColors.offline}
            ${size === "xs" || size === "sm" ? "w-2 h-2" : "w-3 h-3"}`}
        />
      )}
    </div>
  );
}
