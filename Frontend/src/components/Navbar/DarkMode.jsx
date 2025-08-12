import React from "react";

const DarkMode = () => {
  const [isDark, setIsDark] = React.useState(false);

  React.useEffect(() => {
    const root = window.document.documentElement;
    if (isDark) root.classList.add("dark");
    else root.classList.remove("dark");
  }, [isDark]);

  return (
    <button
      aria-label="Toggle dark mode"
      onClick={() => setIsDark((v) => !v)}
      className="px-3 py-1 rounded-full border border-gray-300 dark:border-gray-700 text-sm"
    >
      {isDark ? "Light" : "Dark"}
    </button>
  );
};

export default DarkMode;

