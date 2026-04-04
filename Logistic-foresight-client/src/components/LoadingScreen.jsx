import LoadingLogo from "../assets/images/logo16-9.png";
const Loading = () => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white z-50">
      <div className="text-xl font-semibold">
        <img className="" src={LoadingLogo} alt="Loading..." />
        <svg className="mx-auto "
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 100 100"
          preserveAspectRatio="xMidYMid"
          width="100"
          height="100"
          style={{ shapeRendering: "auto", display: "block", background: "transparent" }}>
          <g>
            <rect fill="#bc3c3c" height="44" width="9" y="28" x="20.5">
              <animate
                begin="-0.18518518518518517s"
                keySplines="0 0.5 0.5 1;0 0.5 0.5 1"
                values="14.799999999999997;28;28"
                keyTimes="0;0.5;1"
                calcMode="spline"
                dur="0.9259259259259258s"
                repeatCount="indefinite"
                attributeName="y"></animate>
              <animate
                begin="-0.18518518518518517s"
                keySplines="0 0.5 0.5 1;0 0.5 0.5 1"
                values="70.4;44;44"
                keyTimes="0;0.5;1"
                calcMode="spline"
                dur="0.9259259259259258s"
                repeatCount="indefinite"
                attributeName="height"></animate>
            </rect>
            <rect fill="#bc3c3c" height="44" width="9" y="28" x="45.5">
              <animate
                begin="-0.09259259259259259s"
                keySplines="0 0.5 0.5 1;0 0.5 0.5 1"
                values="18.099999999999994;28;28"
                keyTimes="0;0.5;1"
                calcMode="spline"
                dur="0.9259259259259258s"
                repeatCount="indefinite"
                attributeName="y"></animate>
              <animate
                begin="-0.09259259259259259s"
                keySplines="0 0.5 0.5 1;0 0.5 0.5 1"
                values="63.80000000000001;44;44"
                keyTimes="0;0.5;1"
                calcMode="spline"
                dur="0.9259259259259258s"
                repeatCount="indefinite"
                attributeName="height"></animate>
            </rect>
            <rect fill="#bc3c3c" height="44" width="9" y="28" x="70.5">
              <animate
                keySplines="0 0.5 0.5 1;0 0.5 0.5 1"
                values="18.099999999999994;28;28"
                keyTimes="0;0.5;1"
                calcMode="spline"
                dur="0.9259259259259258s"
                repeatCount="indefinite"
                attributeName="y"></animate>
              <animate
                keySplines="0 0.5 0.5 1;0 0.5 0.5 1"
                values="63.80000000000001;44;44"
                keyTimes="0;0.5;1"
                calcMode="spline"
                dur="0.9259259259259258s"
                repeatCount="indefinite"
                attributeName="height"></animate>
            </rect>
            <g></g>
          </g>
        </svg>
      </div>
    </div>
  );
};

export default Loading;
