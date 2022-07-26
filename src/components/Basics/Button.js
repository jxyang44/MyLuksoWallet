import React from "react";

const Button = ({ buttonText, buttonFunc }) => {
  return (
    buttonText !== "" && (
      <button
        className="px-3 py-2 text-sky-100 xl:text-lg text-sm font-semibold rounded-lg transition-colors 
        border-2 border-black bg-gradient-to-r from-blue-700  to-blue-500  hover:from-teal-500  hover:to-teal-700 
        hover:shadow-xl hover:border-white hover:text-white"
        onClick={buttonFunc}>
        {buttonText}
      </button>
    )
  );
};

export default Button;
