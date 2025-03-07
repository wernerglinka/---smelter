/**
 * Add icon component
 * @param {Object} props - Component props
 * @param {string} [props.className] - Optional class name
 * @returns {JSX.Element} Rendered component
 */
function AddIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
      <g
        stroke="none"
        strokeWidth="1"
        fill="none"
        fillRule="evenodd"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <g stroke="#000000" strokeWidth="2">
          <g transform="translate(2, 2)">
            <circle cx="10" cy="10" r="10"></circle>
            <line x1="6" y1="10" x2="14" y2="10"></line>
            <line x1="10" y1="6" x2="10" y2="14"></line>
          </g>
        </g>
      </g>
    </svg>
  );
}

export default AddIcon;
