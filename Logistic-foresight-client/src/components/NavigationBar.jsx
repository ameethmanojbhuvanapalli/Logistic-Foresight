import { useState } from "react";
import { useLocation, Link } from "react-router-dom";
import Logo from "../assets/Logo.png";
import LogoWide from "../assets/LogoWide.png";
import RightArrow from "../assets/icons/rightArrow.svg";
import { motion } from "framer-motion";

import { BarChart2, HelpCircle } from "lucide-react";

const variants = {
  expanded: { width: "20%" },
  notExpanded: { width: "5%" }
};

function NavigationBar() {
  const [isExpanded, setIsExpanded] = useState(false);
  const location = useLocation(); // Get the current route

  return (
    <motion.div
      animate={isExpanded ? "expanded" : "notExpanded"}
      transition={{ easeOut: [0.17, 0.67, 0.83, 0.67] }}
      variants={variants}
      className={
        "py-12 flex flex-col border border-r-1 w-1/5 h-screen fixed bg-white z-[3] font-poppins font-medium" +
        (isExpanded ? "px-9" : "px-2")
      }>
      <div className="logo-div flex space-x-3 items-center">
        <img src={isExpanded ? LogoWide : Logo} />
      </div>
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-6 h-6 bg-[#FF8C8C] rounded-full absolute -right-2.5 top-12 flex items-center justify-center p-1">
        <img src={RightArrow} className="w-[8px]" />
      </div>

      <div className="mt-10 flex flex-col space-y-8 ">
        {/* Dashboard Link */}
        <Link to="/">
          <div
            className={
              "flex space-x-3 w-full p-2 rounded " +
              (location.pathname === "/"
                ? " bg-[#FF8C8C] text-white font-semibold"
                : " text-black")
            }>
            <BarChart2 />
            <span className={isExpanded ? "block" : "hidden"}>Dashboard</span>
          </div>
        </Link>

        {/* About Us Link */}
        <Link to="/about">
          <div
            className={
              "flex space-x-3 w-full p-2 rounded " +
              (location.pathname === "/about"
                ? " bg-[#FF8C8C] text-white font-semibold"
                : " text-black")
            }>
            <HelpCircle />
            <span className={isExpanded ? "block" : "hidden"}>About us</span>
          </div>
        </Link>
      </div>
    </motion.div>
  );
}

export default NavigationBar;
