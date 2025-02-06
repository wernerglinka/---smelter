/**
 * Collapse icon component
 * @param {Object} props - Component props
 * @param {string} [props.className] - Optional class name
 * @returns {JSX.Element} Rendered component
 */
function CollapseIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
    >
      <g
        stroke="none"
        strokeWidth="1"
        fill="none"
        fillRule="evenodd"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <g transform="translate(-2, 0)" stroke="#FFFFFF" strokeWidth="2">
          <g stroke="#FFFFFF" strokeWidth="2">
            <line x1="12" y1="22" x2="12" y2="16" id="Path"></line>
            <line x1="12" y1="8" x2="12" y2="2" id="Path"></line>
            <line x1="4" y1="12" x2="2" y2="12" id="Path"></line>
            <line x1="10" y1="12" x2="8" y2="12" id="Path"></line>
            <line x1="16" y1="12" x2="14" y2="12" id="Path"></line>
            <line x1="22" y1="12" x2="20" y2="12" id="Path"></line>
            <polyline id="Path" points="15 19 12 16 9 19"></polyline>
            <polyline id="Path" points="15 5 12 8 9 5"></polyline>
          </g>
        </g>
      </g>
    </svg>
  );
}

export default CollapseIcon;
