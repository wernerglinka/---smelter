/**
 * Delete icon component
 * @param {Object} props - Component props
 * @param {string} [props.className] - Optional class name
 * @returns {JSX.Element} Rendered component
 */
function MinusIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M8 12h8" />
    </svg>
  );
}

export default MinusIcon;
