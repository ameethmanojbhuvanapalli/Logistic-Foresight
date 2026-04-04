const Spinner = ({ spinColor, backgroundColor }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      preserveAspectRatio="xMidYMid"
      width="30"
      height="30"
      style={{ shapeRendering: 'auto', background: backgroundColor , display: 'inline-block'}}
    >
      <g>
        <circle
          strokeDasharray="164.93361431346415 56.97787143782138"
          r="35"
          strokeWidth="11"
          stroke= {spinColor}
          fill="none"
          cy="50"
          cx="50"
        >
          <animateTransform
            keyTimes="0;1"
            values="0 50 50;360 50 50"
            dur="1s"
            repeatCount="indefinite"
            type="rotate"
            attributeName="transform"
          ></animateTransform>
        </circle>
      </g>
    </svg>
  );
};

export default Spinner;

