import React, { useCallback, useMemo } from "react";

const CollegeCard = ({ college, probability }) => {
  const collegeName = useMemo(() => {
    return (college.institute?.trim() || "Unnamed College")
      .replace(/Indian Institute of Technology/g, "IIT")
      .replace(/National Institute of Technology/g, "NIT")
      .replace(/Indian Institute of Information Technology/g, "IIIT");
  }, [college.institute]);

  const googleSearchUrl = useMemo(() => {
    return `https://www.google.com/search?q=${encodeURIComponent(
      collegeName + " college pravesh"
    )}`;
  }, [collegeName]);

  const isHS = useMemo(() => college.quota?.trim().toLowerCase() === "hs", [college.quota]);
  const collegeType = useMemo(() => college.type?.toUpperCase() || "", [college.type]);
  const probabilityClass = useMemo(() => {
    if (probability === "Medium") return "med";
    if (probability === "High") return "hh";
    if (probability === "Low") return "lw";
    return "";
  }, [probability]);

  const handleCardClick = useCallback(() => {
    window.open(googleSearchUrl, "_blank");
  }, [googleSearchUrl]);

  return (
    <div
      className={`college-card ${isHS ? "hs" : ""} ${collegeType.toLowerCase()}`}
      onClick={handleCardClick}
    >
      <h2 className="college-name">{collegeName}</h2>
      <div className="details">
        <p>{college.branch || "Branch Not Specified"}</p>
        <p>
          {college.category || "Category Not Specified"} |{" "}
          {college.gender || "Gender NotSpecified"} |{" "}
          <span className="quota">
            {college.quota || "Quota Not Specified"}
          </span>
        </p>
        <p>
          <span className="or">OR: {college.openingRank || "N/A"}</span> |{" "}
          <span className="cr">CR: {college.closingRank || "N/A"}</span>
        </p>
        <div>
          {college.city || "City Not Specified"},{" "}
          {college.state || "State Not Specified"}
          {probability && (
            <div className={`probability ${probabilityClass}`}>
              {probability}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CollegeCard;