/**
 * Open folder icon component
 * @param {Object} props - Component props
 * @param {string} [props.className] - Optional class name
 * @returns {JSX.Element} Rendered component
 */
function FolderOpenIcon({ className }) {
  return (
    <svg viewBox="0 0 24 21" xmlns="http://www.w3.org/2000/svg">
      <g
        stroke="none"
        stroke-width="1"
        fill="none"
        fill-rule="evenodd"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <g stroke="#000000" stroke-width="2">
          <g transform="translate(2, 1.9999)">
            <g transform="translate(0, 0)">
              <path
                d="M4,11.0000965 L5.5,8.10009645 C5.83228802,7.44017497 6.50133987,7.01721115 7.24,7.00009645 L18,7.00009645 C18.6191913,6.99901004 19.2039687,7.2847812 19.5835739,7.77396313 C19.963179,8.26314505 20.094799,8.90056638 19.94,9.50009645 L18.4,15.5000965 C18.1707604,16.388024 17.3670212,17.0062849 16.45,17.0001425 L2,17.0001425 C0.8954305,17.0001425 0,16.104666 0,15.0000965 L0,2.00009645 C0,0.895526954 0.8954305,-8.8817842e-16 2,-8.8817842e-16 L5.9,-8.8817842e-16 C6.57966741,-0.00656712118 7.21619763,0.332413469 7.59,0.900096454 L8.4,2.10009645 C8.76992247,2.66181679 9.39741368,2.9999857 10.07,3.00009645 L16,3.00009645 C17.1045695,3.00009645 18,3.89552695 18,5.00009645 L18,7.00009645"
              ></path>
            </g>
          </g>
        </g>
      </g>
    </svg>
  );
}

export default FolderOpenIcon;
