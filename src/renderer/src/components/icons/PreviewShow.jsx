/**
 * Github logo icon component
 * @param {Object} props - Component props
 * @param {string} [props.className] - Optional class name
 * @returns {JSX.Element} Rendered component
 */
function PreviewShowIcon({ className }) {
  return (
    <svg viewBox="0 0 22 22" xmlns="http://www.w3.org/2000/svg">
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
            <path d="M0,4 L0,2 C0,0.8954305 0.8954305,0 2,0 L4,0"></path>
            <path d="M14,0 L16,0 C17.1045695,0 18,0.8954305 18,2 L18,4"></path>
            <path d="M18,14 L18,16 C18,17.1045695 17.1045695,18 16,18 L14,18"></path>
            <path d="M4,18 L2,18 C0.8954305,18 0,17.1045695 0,16 L0,14"></path>
            <circle cx="9" cy="9" r="1"></circle>
            <path d="M2,9 C2,9 4.5,4 9,4 C13.5,4 16,9 16,9 C16,9 13.5,14 9,14 C4.5,14 2,9 2,9"></path>
          </g>
        </g>
      </g>
    </svg>
  );
}

export default PreviewShowIcon;
