import React, { useEffect, useState, useRef, useCallback } from "react";

const Form = () => {
  const [states, setStates] = useState([]);
  const [allColleges, setAllColleges] = useState([]);
  const [filteredColleges, setFilteredColleges] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [rankInput, setRankInput] = useState("");
  const [percentileInput, setPercentileInput] = useState("");
  const [isRankDisabled, setIsRankDisabled] = useState(false);
  const [isPercentileDisabled, setIsPercentileDisabled] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("OPEN");
  const [selectedGender, setSelectedGender] = useState("Gender-Neutral");
  const [searchInput, setSearchInput] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [selectedInstitutes, setSelectedInstitutes] = useState([]);
  const [selectedMainBranch, setSelectedMainBranch] = useState([]);
  const [selectedProbability, setSelectedProbability] = useState([]);
  const branchScrollRef = useRef(null);
  const itemsPerPage = 10;
  const totalCandidates = 1575143;
  const rankErrorFactor = 0.115;
  const maxRankDifferenceForLowProb = 3000; // New absolute limit

  const mainBranchOptions = [
    {
      value: "cse",
      label: "CSE",
      keywords: ["comp", "softw", "artifi", "data", "infor"],
    },
    {
      value: "elec",
      label: "ELEC",
      keywords: ["comm", "electronics", "electrical", "instru", "vlsi"],
    },
    { value: "mnc", label: "MNC", keywords: ["mathematics and"] },
    { value: "mech", label: "MECH", keywords: ["mech"] },
    { value: "civil", label: "CIVIL", keywords: ["civil"] },
    { value: "chem", label: "CHEMICAL", keywords: ["chem", "production"] },
    { value: "biotech", label: "BIOTECH", keywords: ["biotechnology", "bio"] },
    { value: "mtlrgy", label: "METALLURGY", keywords: ["metall", "material"] },
    { value: "mining", label: "MINING", keywords: ["mining"] },
    { value: "textile", label: "TEXTILE", keywords: ["textile"] },
    { value: "food", label: "FOOD", keywords: ["food"] },
    { value: "engphy", label: "ENG PHY", keywords: ["engineering physics"] },
  ];

  const probabilityOptions = ["Low", "Medium", "High"];

  useEffect(() => {
    const fetchStates = async () => {
      try {
        const response = await fetch("cs.json", { cache: "no-store" });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        const sortedStates = Object.keys(data).sort();
        setStates(sortedStates);
      } catch (error) {
        console.error("Error loading cs.json:", error);
        // Optionally set an error state to display a message to the user
      }
    };
    fetchStates();
  }, [setStates]); // Corrected: setStates is stable, but the effect depends on fetching data
  const calculatePercentileFromRank = useCallback((rank) => {
    if (!rank || isNaN(rank) || rank <= 0 || rank > totalCandidates) return "";
    return ((1 - rank / totalCandidates) * 100).toFixed(6);
  }, [totalCandidates]);
  const calculateRankFromPercentile = useCallback((percentile) => {
    if (!percentile || isNaN(percentile) || percentile < 0 || percentile > 100)
      return "";
    return Math.round((1 - percentile / 100) * totalCandidates);
  }, []); // Dependencies are correct as it uses totalCandidates

  const calculateCategoryRank = useCallback((crlRank, category) => {
    const categoryPercentages = {
      EWS: 0.14,
      "OBC-NCL": 0.31,
      SC: 0.1,
      ST: 0.065,
    };
    if (!categoryPercentages[category]) return crlRank;
    return Math.round(crlRank * categoryPercentages[category]);
  }, []); // Dependencies are correct as it uses categoryPercentages

  const applySearchFilter = useCallback(
    (
      colleges,
      categoryRank,
      selectedCategory,
      selectedGender,
      query,
      selectedState,
      selectedInstitutes
    ) => {
      if (!colleges) return [];
      const lowerCaseQuery = query ? query.toLowerCase() : "";
      const lowerCaseSelectedState = selectedState
        ? selectedState.toLowerCase()
        : "";

      return colleges
        .filter((college) => {
          const isHomeState =
            college.state.toLowerCase() === lowerCaseSelectedState;
          const isHSQuota = college.quota?.trim().toLowerCase() === "hs";
          const isOSQuota = college.quota?.trim().toLowerCase() === "os";
          const isAIQuota = college.quota?.trim().toLowerCase() === "ai";

          if (lowerCaseSelectedState && isHomeState && !isHSQuota) return false;
          if (
            lowerCaseSelectedState &&
            !isHomeState &&
            !isOSQuota &&
            !isAIQuota
          )
            return false;

          const normalizedInstitute = college.institute?.toLowerCase() || "";
          const normalizedBranch = college.branch?.toLowerCase() || "";
          const matchesSearch =
            !lowerCaseQuery ||
            normalizedInstitute.includes(lowerCaseQuery) ||
            normalizedBranch.includes(lowerCaseQuery);
          const matchesGender = college.gender === selectedGender;
          const matchesCategory = college.category === selectedCategory;
          const isArchitectureOrPlanning =
            normalizedInstitute.includes("architecture") ||
            normalizedInstitute.includes("planning") ||
            normalizedBranch.includes("architecture") ||
            normalizedBranch.includes("planning") ||
            normalizedBranch.includes("arch");

          return (
            matchesSearch &&
            matchesGender &&
            matchesCategory &&
            !isArchitectureOrPlanning
          );
        })
        .filter((college) => {
          const collegeType = college.type?.toUpperCase() || "";
          let instituteTypeMatch = false;

          if (selectedInstitutes.length > 0) {
            instituteTypeMatch = selectedInstitutes.includes(collegeType);
          } else {
            instituteTypeMatch = collegeType !== "IIT";
          }
          return instituteTypeMatch;
        })
        .sort(
          (a, b) =>
            (parseInt(a.closingRank, 10) || Infinity) -
            (parseInt(b.closingRank, 10) || Infinity)
        );
    },
    [selectedCategory, selectedGender, selectedInstitutes] // Removed calculateCategoryRank as it's used internally and doesn't change the function's behavior for different renders.
  );

  const filterByMainBranch = useCallback(
    (colleges, selectedMainBranch) => {
      if (!colleges) return [];
      if (!selectedMainBranch || selectedMainBranch.length === 0) {
        return colleges.filter(
          (college) =>
            !(
              college.branch?.toLowerCase().includes("architecture") ||
              college.branch?.toLowerCase().includes("planning") ||
              college.branch?.toLowerCase().includes("arch")
            )
        );
      }
      return colleges.filter((college) => {
        const normalizedBranch = college.branch?.toLowerCase() || "";
        return selectedMainBranch.some((selectedBranch) => {
          const branchOption = mainBranchOptions.find(
            (opt) => opt.value === selectedBranch
          );
          return (
            branchOption &&
            branchOption.keywords.some((keyword) =>
              normalizedBranch.includes(keyword)
            )
          );
        });
      });
    },
    [mainBranchOptions] // Correct dependency as it uses mainBranchOptions
  );

  const filterByProbability = useCallback(
    (colleges, selectedProbability) => {
      if (!colleges) return [];
      const userRank = parseInt(rankInput, 10);
      if (isNaN(userRank)) {
        return colleges; // If no rank, don't filter by probability
      }

      return colleges
        .map((college) => {
          // Map first to assign probability
          const openingRank = parseInt(college.openingRank, 10);
          const closingRank = parseInt(college.closingRank, 10);
          let probability = null; // Initialize as null

          if (!isNaN(openingRank) && !isNaN(closingRank)) {
            if (userRank >= openingRank && userRank <= closingRank) {
              probability = "Medium";
            } else if (userRank < openingRank) {
              probability = "High";
            } else if (
              userRank > closingRank &&
              userRank <= closingRank * (1 + rankErrorFactor) &&
              userRank - closingRank <= maxRankDifferenceForLowProb
            ) {
              probability = "Low";
            }
          }
          return { ...college, probability }; // Return new object with probability
        })
        .filter((college) => {
          // Then filter based on selectedProbability and if probability is assigned
          if (selectedProbability && selectedProbability.length > 0) {
            return (
              college.probability &&
              selectedProbability.includes(college.probability)
            );
          }
          return college.probability !== null; // Only show if a probability was determined
        });
    },
    [rankInput, rankErrorFactor, maxRankDifferenceForLowProb] // Correct dependencies
  );

  const handleInputChange = useCallback(
    (event) => {
      const { name, value, type, checked } = event.target;
      if (name === "marks") {
        const parsedValue = parseInt(value, 10);
        setRankInput(value);
        setPercentileInput(calculatePercentileFromRank(parsedValue));
        setIsPercentileDisabled(!!value);
        setIsRankDisabled(false);
      } else if (name === "perc") {
        const parsedValue = parseFloat(value);
        setPercentileInput(value);
        setRankInput(calculateRankFromPercentile(parsedValue));
        setIsRankDisabled(!!value);
        setIsPercentileDisabled(false);
      } else if (name === "category") {
        setSelectedCategory(value);
      } else if (name === "gender") {
        setSelectedGender(value);
      } else if (name === "search") {
        setSearchInput(value);
      } else if (name === "state") {
        setSelectedState(value);
      } else if (type === "checkbox") {
        const upperCaseValue = value.toUpperCase();
        if (checked) {
          setSelectedInstitutes((prev) => [...prev, upperCaseValue]);
        } else {
          setSelectedInstitutes((prev) =>
            prev.filter((item) => item !== upperCaseValue)
          );
        }
      }
    },
    [calculatePercentileFromRank, calculateRankFromPercentile, setRankInput, setPercentileInput, setIsPercentileDisabled, setIsRankDisabled, setSelectedCategory, setSelectedGender, setSearchInput, setSelectedState, setSelectedInstitutes] // Added all state updaters that are directly used.
  );

  const updateFilteredColleges = useCallback(() => {
    const rank =
      rankInput || calculateRankFromPercentile(parseFloat(percentileInput));
    const categoryRank = !isNaN(parseInt(rank, 10))
      ? calculateCategoryRank(parseInt(rank, 10), selectedCategory)
      : Infinity;

    const initiallyFiltered = applySearchFilter(
      allColleges,
      categoryRank,
      selectedCategory,
      selectedGender,
      searchInput,
      selectedState,
      selectedInstitutes
    );
    const filteredByBranch = filterByMainBranch(
      initiallyFiltered,
      selectedMainBranch
    );
    const finalFiltered = filterByProbability(
      filteredByBranch,
      selectedProbability
    );

    setFilteredColleges(finalFiltered);
    setCurrentPage(1); // Reset to the first page after filtering
  }, [
    rankInput,
    percentileInput,
    selectedCategory,
    selectedGender,
    searchInput,
    selectedState,
    selectedInstitutes,
    selectedMainBranch,
    selectedProbability,
    allColleges,
    calculateCategoryRank,
    applySearchFilter,
    filterByMainBranch,
    filterByProbability,
    calculateRankFromPercentile, // Added as it's used within the callback
    setFilteredColleges, // Added as it's directly used
    setCurrentPage, // Added as it's directly used
  ]);

  const handleMainBranchClick = useCallback(
    (branchValue) => {
      let newSelectedMainBranch = [];
      if (branchValue === null) {
        newSelectedMainBranch = [];
      } else if (selectedMainBranch.includes(branchValue)) {
        newSelectedMainBranch = selectedMainBranch.filter(
          (b) => b !== branchValue
        );
      } else {
        newSelectedMainBranch = [...selectedMainBranch, branchValue];
      }
      setSelectedMainBranch(newSelectedMainBranch);
      updateFilteredColleges();
    },
    [selectedMainBranch, setSelectedMainBranch, updateFilteredColleges] // Added setSelectedMainBranch
  );

  const handleProbabilityClick = useCallback(
    (probabilityValue) => {
      let newSelectedProbability = [...selectedProbability];

      if (probabilityValue === null) {
        newSelectedProbability = []; // Clicked "ALL" - deselect all
      } else if (newSelectedProbability.includes(probabilityValue)) {
        newSelectedProbability = newSelectedProbability.filter(
          (p) => p !== probabilityValue
        ); // Deselect if already selected
      } else {
        newSelectedProbability.push(probabilityValue); // Select if not already selected
      }

      setSelectedProbability(newSelectedProbability);
      updateFilteredColleges();
    },
    [selectedProbability, setSelectedProbability, updateFilteredColleges] // Added setSelectedProbability
  );

  const handleContinue = useCallback(
    (event) => {
      event.preventDefault();
      fetch("data.json")
        .then((response) => {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response.json();
        })
        .then((data) => {
          setAllColleges(data);
          // Update filtered colleges when data is initially loaded
          updateFilteredColleges();
        })
        .catch((error) => {
          console.error("Error fetching data:", error);
          // Optionally set an error state to display a message to the user
        });
    },
    [setAllColleges, updateFilteredColleges] // Added setAllColleges
  );

  // Update filtered colleges whenever the core filtering criteria change
  useEffect(() => {
    if (allColleges.length > 0) {
      updateFilteredColleges();
    }
  }, [
    allColleges,
    rankInput,
    percentileInput,
    selectedCategory,
    selectedGender,
    searchInput,
    selectedState,
    selectedInstitutes,
    selectedMainBranch,
    selectedProbability,
    updateFilteredColleges, // Added as the effect depends on this function
  ]);

  const totalPages = useCallback(() => {
    return Math.ceil(filteredColleges.length / itemsPerPage) || 1; // Avoid division by zero
  }, [filteredColleges.length, itemsPerPage]); // Correct dependencies

  const paginateColleges = useCallback(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredColleges.slice(startIndex, endIndex);
  }, [currentPage, filteredColleges, itemsPerPage]); // Correct dependencies

  const handlePagination = useCallback(
    (direction) => {
      if (direction === "prev") {
        setCurrentPage((prev) => Math.max(1, prev - 1));
      } else if (direction === "next") {
        setCurrentPage((prev) => Math.min(totalPages(), prev + 1));
      }
    },
    [totalPages, setCurrentPage] // Correct dependencies
  );

  const displayColleges = useCallback(
    (colleges) => {
      if (!colleges || colleges.length === 0) {
        return <p>No colleges found matching your criteria.</p>;
      }

      return colleges.map((college, index) => {
        let collegeName = college.institute?.trim() || "Unnamed College";
        collegeName = collegeName
          .replace(/Indian Institute of Technology/g, "IIT")
          .replace(/National Institute of Technology/g, "NIT")
          .replace(/Indian Institute of Information Technology/g, "IIIT");
        const googleSearchUrl = `https://www.google.com/search?q=${encodeURIComponent(collegeName + " college pravesh"
        )}`;
        const isHS = college.quota?.trim().toLowerCase() === "hs";
        const collegeType = college.type?.toUpperCase() || "";
        const probability = college.probability; // Get probability from the college object
        let probabilityClass = "";

        if (probability === "Medium") {
          probabilityClass = "med";
        } else if (probability === "High") {
          probabilityClass = "hh";
        } else if (probability === "Low") {
          probabilityClass = "lw";
        }

        return (
          probability && ( // Only render if probability is not null
            <div
              className={`college-card ${
                isHS ? "hs" : ""
              } ${collegeType.toLowerCase()}`}
              key={index}
              onClick={() => window.open(googleSearchUrl, "_blank")}
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
                  <span className="or">OR: {college.openingRank || "N/A"}</span>{" "}
                  |{" "}
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
          )
        );
      });
    },
    [] // Dependencies are correct as college object now has probability
  );

  return (
    <>
      <section className="area1">
        <div className="form">
          <input
            type="number"
            id="marks"
            name="marks"
            className="input"
            placeholder="CRL/Category Rank"
            value={rankInput}
            onChange={handleInputChange}
            disabled={isRankDisabled}
          />
          <input
            type="number"
            id="perc"
            name="perc"
            min="0"
            max="100"
            className="input"
            placeholder="or Percentile"
            value={percentileInput}
            onChange={handleInputChange}
            disabled={isPercentileDisabled}
          />
          <div className="container1">
            <label htmlFor="state">Home State</label>
            <select
              id="state"
              name="state"
              className="state-select"
              required
              onChange={handleInputChange}
              value={selectedState} // Added value prop for controlled component
            >
              <option value="">Select</option>
              {states.map((state) => (
                <option key={state} value={state.toLowerCase()}>
                  {state}
                </option>
              ))}
            </select>
            <div className="mydict">
              <div>
                <label>
                  <input
                    type="radio"
                    name="gender"
                    value="Gender-Neutral"
                    checked={selectedGender === "Gender-Neutral"} // Controlled component
                    onChange={handleInputChange}
                  />
                  <span>Male</span>
                </label>
                <label>
                  <input
                    type="radio"
                    name="gender"
                    value="Female-only (including Supernumerary)"
                    checked={
                      selectedGender === "Female-only (including Supernumerary)"
                    } // Controlled component
                    onChange={handleInputChange}
                  />
                  <span>Female</span>
                </label>
                <label>
                  <input
                    type="radio"
                    name="gender"
                    value="Others"
                    checked={selectedGender === "Others"} // Controlled component
                    onChange={handleInputChange}
                  />
                  <span>Others</span>
                </label>
              </div>
            </div>
            <div className="mydict">
              <div>
                <label>
                  <input
                    type="radio"
                    name="category"
                    value="EWS"
                    checked={selectedCategory === "EWS"} // Controlled component
                    onChange={handleInputChange}
                  />
                  <span>EWS</span>
                </label>
                <label>
                  <input
                    type="radio"
                    name="category"
                    value="OBC-NCL"
                    checked={selectedCategory === "OBC-NCL"} // Controlled component
                    onChange={handleInputChange}
                  />
                  <span>OBC</span>
                </label>
                <label>
                  <input
                    type="radio"
                    name="category"
                    value="SC"
                    checked={selectedCategory === "SC"} // Controlled component
                    onChange={handleInputChange}
                  />
                  <span>SC</span>
                </label>
                <label>
                  <input
                    type="radio"
                    name="category"
                    value="ST"
                    checked={selectedCategory === "ST"} // Controlled component
                    onChange={handleInputChange}
                  />
                  <span>ST</span>
                </label>
                <label>
                  <input
                    type="radio"
                    name="category"
                    value="OPEN"
                    checked={selectedCategory === "OPEN"} // Controlled component
                    onChange={handleInputChange}
                  />
                  <span>OPEN</span>
                </label>
              </div>
              <div className="mydict">
                <label>
                  <input
                    type="checkbox"
                    name="nit"
                    value="NIT"
                    checked={selectedInstitutes.includes("NIT")} // Controlled component
                    onChange={handleInputChange}
                  />
                  <span>NIT</span>
                </label>
                <label>
                  <input
                    type="checkbox"
                    name="iiit"
                    value="IIIT"
                    checked={selectedInstitutes.includes("IIIT")} // Controlled component
                    onChange={handleInputChange}
                  />
                  <span>IIIT</span>
                </label>
                <label>
                  <input
                    type="checkbox"
                    name="gfti"
                    value="GFTI"
                    checked={selectedInstitutes.includes("GFTI")} // Controlled component
                    onChange={handleInputChange}
                  />
                  <span>GFTI</span>
                </label>
              </div>
              <div className="mydict">
                <label>
                  <input
                    type="text"
                    id="search"
                    name="search"
                    className="input inp1"
                    placeholder="Specific City/Branch"
                    value={searchInput} // Controlled component
                    onChange={handleInputChange}
                  />
                </label>
              </div>
            </div>
          </div>
          <div className="button-container">
            <button
              className="custom-button"
              onClick={handleContinue}
              disabled={!rankInput && !percentileInput && !selectedState}
            >
              <div className="button-content">
                <span>Continue</span>
              </div>
            </button>
          </div>
        </div>
      </section>
      <section className="results">
        <div className="branch-filter-container">
          <div className="branch-filter" ref={branchScrollRef}>
            {mainBranchOptions.map((branchOption) => (
              <button
                key={branchOption.value}
                className={`branch-filter-button ${
                  selectedMainBranch.includes(branchOption.value)
                    ? "active"
                    : ""
                }`}
                onClick={() => handleMainBranchClick(branchOption.value)}
              >
                {branchOption.label}
              </button>
            ))}
            <button
              key="all-branch"
              className={`branch-filter-button ${
                selectedMainBranch.length === 0 ? "active" : ""
              }`}
              onClick={() => handleMainBranchClick(null)}
            >
              ALL
            </button>
          </div>
          <div className="branch-filter-overlay"></div>
        </div>

        {/* Conditionally render Probability Filter */}
        {(rankInput || percentileInput) && (
          <div className="branch-filter-container">
            <div className="branch-filter">
              {probabilityOptions.map((prob) => (
                <button
                  key={prob}
                  className={`branch-filter-button ${
                    selectedProbability.includes(prob) ? "active" : ""
                  }`}
                  onClick={() => handleProbabilityClick(prob)}
                >
                  {prob}
                </button>
              ))}
              <button
                key="all-prob"
                className={`branch-filter-button ${
                  selectedProbability.length === 0 ? "active" : ""
                }`}
                onClick={() => handleProbabilityClick(null)}
              >
                ALL
              </button>
            </div>
            <div className="branch-filter-overlay"></div>
          </div>
        )}

        {displayColleges(paginateColleges())}
      </section>

      {filteredColleges.length > itemsPerPage && (
        <section className="pagination-section">
          <div className="pagination">
            <button
              className="prev"
              onClick={() => handlePagination("prev")}
              disabled={currentPage === 1}
            >
              &lt;
            </button>
            <span>
              {currentPage} / {totalPages()}
            </span>
            <button
              className="next"
              onClick={() => handlePagination("next")}
              disabled={currentPage === totalPages()}
            >
              &gt;
            </button>
          </div>
        </section>
      )}
    </>
  );
};

export default Form;