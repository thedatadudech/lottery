import React from "react";

// Navigation component using window.location for navigation
export function Navigation({ links }: { links: { label: string, path: string }[] }) {
  const handleNavigation = (path: string) => {
    window.location.href = path; // Navigate to the path
  };

  return (
    <div className="flex-1">
      <ul className="menu menu-horizontal px-1 space-x-2">
        {links.map(({ label, path }) => (
          <li key={path}>
            <button
              className="hover:underline"
              onClick={() => handleNavigation(path)}
            >
              {label}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
