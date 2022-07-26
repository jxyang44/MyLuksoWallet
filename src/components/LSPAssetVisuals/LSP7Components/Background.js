//background for LSP7 coin

import React from "react";
import coinSilver from "../../../assets/MyLuksoWalletVisual/coinSilver.svg";

const Background = ({assetImage}) => {
  return (
    <>
      <img src={coinSilver} className="absolute w-full h-full opacity-70 select-none" style={{ userDrag: "false" }} alt="coin front" />
      {assetImage !== "" && (
        <div className={`absolute top-1/2 -translate-y-1/2 w-[77%] aspect-square flex justify-center items-center rounded-full opacity-50 p-2`}>
          {assetImage && <img src={assetImage} className="w-full aspect-square select-none rounded-full" style={{ userDrag: "false" }}></img>}
        </div>
      )}
    </>
  );
};

export default Background;
