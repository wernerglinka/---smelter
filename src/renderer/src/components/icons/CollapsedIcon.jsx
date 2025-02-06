/**
 * Collapsed icon component
 * @param {Object} props - Component props
 * @param {string} [props.className] - Optional class name
 * @returns {JSX.Element} Rendered component
 */
function CollapsedIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
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
            <g transform="translate(2, 2)">
                <line x1="10" y1="20" x2="10" y2="14" id="Path"></line>
                <line x1="10" y1="6" x2="10" y2="0" id="Path"></line>
                <line x1="2" y1="10" x2="0" y2="10" id="Path"></line>
                <line x1="8" y1="10" x2="6" y2="10" id="Path"></line>
                <line x1="14" y1="10" x2="12" y2="10" id="Path"></line>
                <line x1="20" y1="10" x2="18" y2="10" id="Path"></line>
                <polyline id="Path" points="13 17 10 20 7 17"></polyline>
                <polyline id="Path" points="13 3 10 0 7 3"></polyline>
            </g>
        </g>
      </g>
    </svg>
  );
}

export default CollapsedIcon;
