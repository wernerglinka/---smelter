/**
 * Folder icon component
 * @param {Object} props - Component props
 * @param {string} [props.className] - Optional class name
 * @returns {JSX.Element} Rendered component
 */
function FolderIcon({ className }) {
  return (
    <svg 
      width="22" 
      height="19" 
      viewBox="0 0 22 19" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <g stroke="none" strokeWidth="1" fill="none" fillRule="evenodd" strokeLinecap="round" strokeLinejoin="round">
        <g transform="translate(1, 1)" stroke="currentColor">
          <path d="M18,17 C19.1045695,17 20,16.1045695 20,15 L20,5 C20,3.8954305 19.1045695,3 18,3 L10.1,3 C9.42033259,3.00666358 8.78380237,2.66768298 8.41,2.1 L7.6,0.9 C7.23007753,0.338279669 6.60258632,0 5.93,0 L2,0 C0.8954305,0 0,0.8954305 0,2 L0,15 C0,16.1045695 0.8954305,17 2,17 L18,17 Z" />
        </g>
      </g>
    </svg>
  );
}

export default FolderIcon;