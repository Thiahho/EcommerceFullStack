import React from "react";

const Banner = ({ data }) => {
  if (!data) return null;
  const backgroundColor = data.bgColor ?? "transparent";

  return (
    <section
      className="w-full py-10 text-center"
      style={{ backgroundColor }}
    >
      <p className="text-sm uppercase tracking-wide mb-2 opacity-80">
        {data.discount || data.date}
      </p>
      <h2 className="text-2xl font-bold mb-1">
        {data.title2 || data.title || "Banner"}
      </h2>
      {data.title3 && (
        <h3 className="text-lg font-semibold opacity-90">{data.title3}</h3>
      )}
      {data.title4 && (
        <p className="text-sm max-w-xl mx-auto opacity-80 mt-2">{data.title4}</p>
      )}
    </section>
  );
};

export default Banner;

