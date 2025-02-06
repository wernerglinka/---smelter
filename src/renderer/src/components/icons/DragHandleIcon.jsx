/**
 * Draghandle icon component
 * @param {Object} props - Component props
 * @param {string} [props.className] - Optional class name
 * @returns {JSX.Element} Rendered component
 */
function DragHandleIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 14 22"
    >
      <g
        stroke="none"
        strokeWidth="1"
        fill="none"
        fillRule="evenodd"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <g stroke="#FFFFFF" strokeWidth="2">
          <circle cx="4" cy="11" r="1"></circle>
          <circle cx="4" cy="4" r="1"></circle>
          <circle cx="4" cy="18" r="1"></circle>
          <circle cx="10" cy="11" r="1"></circle>
          <circle cx="10" cy="4" r="1"></circle>
          <circle cx="10" cy="18" r="1"></circle>
        </g>
      </g>
    </svg>
  );
}

export default DragHandleIcon;
