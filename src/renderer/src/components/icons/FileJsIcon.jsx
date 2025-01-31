/**
 * JavaScript file icon component
 * @param {Object} props - Component props
 * @param {string} [props.className] - Optional class name
 * @returns {JSX.Element} Rendered component
 */
function FileJsIcon({ className }) {
  return (
    <svg 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
      <polyline points="14 2 14 8 20 8"/>
      <text x="7" y="18" fontSize="8" fill="currentColor" stroke="none">JS</text>
    </svg>
  );
}

export default FileJsIcon;