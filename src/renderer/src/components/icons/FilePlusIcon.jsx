/**
 * FilePlus icon component
 * @param {Object} props - Component props
 * @param {string} [props.className] - Optional class name
 * @returns {JSX.Element} Rendered component
 */
function FilePlusIcon({ className }) {
  return (
    <svg
      viewBox="0 0 20 24"
      xmlns="http://www.w3.org/2000/svg"
      stroke="none"
      strokeWidth="1"
      fill="none"
      fillRule="evenodd"
      strokeLinecap="round"
    >
      <g>
        <g stroke="#000000" strokeWidth="2">
          <g transform="translate(2, 2)" strokeLinejoin="round">
            <path d="M10.5,0 L2,0 C0.8954305,0 0,0.8954305 0,2 L0,18 C0,19.1045695 0.8954305,20 2,20 L14,20 C15.1045695,20 16,19.1045695 16,18 L16,5.5 L10.5,0 Z"></path>
            <polyline id="Path" points="10 0 10 6 16 6"></polyline>
          </g>
          <line x1="6.5" y1="14.5" x2="13.5" y2="14.5" id="Line"></line>
          <line x1="9.99995" y1="18" x2="9.99995" y2="11" id="Line"></line>
        </g>
      </g>
    </svg>
  );
}

export default FilePlusIcon;
