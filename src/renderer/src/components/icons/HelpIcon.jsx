/**
 * Help icon component
 * @param {Object} props - Component props
 * @param {string} [props.className] - Optional class name
 * @returns {JSX.Element} Rendered component
 */
function HelpIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4" />
      <path d="M12 8h.01" />
    </svg>
  );
}

export default HelpIcon;
