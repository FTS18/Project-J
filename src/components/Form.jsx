import React, {
  useEffect,
  useState,
  useRef,
  useCallback,
  useMemo,
} from "react";
import CollegeCard from "./CollegeCard";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { getDatabase, ref, get } from "firebase/database";
import { getApp } from "firebase/app";

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
  const [selectedInstitutes, setSelectedInstitutes] = useState([
    "NIT",
    "IIIT",
    "GFTI",
  ]); // Default checked
  const [selectedMainBranch, setSelectedMainBranch] = useState([]);
  const [selectedProbability, setSelectedProbability] = useState([]);
  const branchScrollRef = useRef(null);
  const itemsPerPage = 10;
  const totalCandidates = 1575143;
  const rankErrorFactor = 0.115;
  const maxRankDifferenceForLowProb = 3000;
  const [lastInteractedInput, setLastInteractedInput] = useState(null); // Added state for tracking input
  const isAKTUChecked = useMemo(
    () => selectedInstitutes.includes("AKTU"),
    [selectedInstitutes]
  );
  const isHomeStateUP = useMemo(
    () => selectedState.toLowerCase() === "uttar pradesh",
    [selectedState]
  );
  const shouldDisableGenderCategory = useMemo(() => {
    return isAKTUChecked && !isHomeStateUP;
  }, [isAKTUChecked, isHomeStateUP]);

  const mainBranchOptions = useMemo(
    () => [
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
      {
        value: "biotech",
        label: "BIOTECH",
        keywords: ["biotechnology", "bio"],
      },
      {
        value: "mtlrgy",
        label: "METALLURGY",
        keywords: ["metall", "material"],
      },
      { value: "mining", label: "MINING", keywords: ["mining"] },
      { value: "textile", label: "TEXTILE", keywords: ["textile"] },
      { value: "food", label: "FOOD", keywords: ["food"] },
      { value: "engphy", label: "ENG PHY", keywords: ["engineering physics"] },
    ],
    []
  );

  const probabilityOptions = ["Low", "Medium", "High"];
  const [downloadOption, setDownloadOption] = useState("");
  const app = getApp();
  const database = getDatabase(app);
  const [userIp, setUserIp] = useState(null); // Add state for user IP

  const getIPAddress = useCallback(async () => {
    try {
      const response = await fetch("https://api.ipify.org?format=json");
      const data = await response.json();
      setUserIp(data.ip);
    } catch (error) {
      console.error("Error getting IP address:", error);
      setUserIp("unknown_ip");
    }
  }, []);

  useEffect(() => {
    getIPAddress(); // Fetch IP address when Form component mounts
  }, [getIPAddress]);

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
      }
    };
    fetchStates();
  }, [setStates]);

  const calculatePercentileFromRank = useCallback(
    (rank) => {
      if (!rank || isNaN(rank) || rank <= 0 || rank > totalCandidates)
        return "";
      return ((1 - rank / totalCandidates) * 100).toFixed(6);
    },
    [totalCandidates]
  );

  const calculateRankFromPercentile = useCallback(
    (percentile) => {
      if (
        !percentile ||
        isNaN(percentile) ||
        percentile < 0 ||
        percentile > 100
      )
        return "";
      return Math.round((1 - percentile / 100) * totalCandidates);
    },
    [totalCandidates]
  );

  const calculateCategoryRank = useCallback((crlRank, category) => {
    const categoryPercentages = {
      EWS: 0.14,
      "OBC-NCL": 0.31,
      SC: 0.1,
      ST: 0.065,
    };
    if (!categoryPercentages[category]) return crlRank;
    return Math.round(crlRank * categoryPercentages[category]);
  }, []);

  const applySearchFilter = useCallback(
    (
      colleges,
      categoryRank,
      query,
      selectedState,
      selectedInstitutes,
      selectedGender
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
          const collegeType = college.type?.toUpperCase() || "";
          const mappedType = collegeType === "JAC" ? "GFTI" : collegeType; // Treat JAC as GFTI
          const isInstituteSelected = selectedInstitutes.includes(mappedType);

          const shouldIncludeBasedOnState = () => {
            if (selectedInstitutes.includes("AKTU")) {
              if (!lowerCaseSelectedState) {
                return true; // If no state is selected, show all (HS, OS, AI)
              } else if (isHomeState) {
                return isHSQuota || isAIQuota; // If home state, show HS and AI
              } else {
                return isOSQuota || isAIQuota; // If other state, show OS and AI
              }
            }
            if (!lowerCaseSelectedState) return true; // No state selected, include all (for other institutes)
            if (isHomeState && isHSQuota) return true; // Home state selected, include HS quota (for other institutes)
            if (!isHomeState && isOSQuota) return true; // Other state selected, include OS quota (for other institutes)
            return isAIQuota; // Always include AI quota (for other institutes)
          };
          if (!shouldIncludeBasedOnState() && isInstituteSelected) {
            return false; // Filter out if state doesn't match and institute is selected
          }

          const normalizedInstitute = college.institute?.toLowerCase() || "";
          const normalizedBranch = college.branch?.toLowerCase() || "";
          const matchesSearch =
            !lowerCaseQuery ||
            normalizedInstitute.includes(lowerCaseQuery) ||
            normalizedBranch.includes(lowerCaseQuery);
          const matchesGender = college.gender === selectedGender;
          const matchesCategory = college.category === selectedCategory;
          const closingRank = parseInt(college.closingRank, 10) || Infinity;
          // Add this condition to filter by closing rank
          if (closingRank > 600000) {
            return false; // Exclude colleges with closing rank greater than 6 lakh
          }
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
            !isArchitectureOrPlanning &&
            isInstituteSelected // Ensure only selected institutes are included here
          );
        })
        .filter((college) => {
          const collegeType = college.type?.toUpperCase() || "";
          const mappedType = collegeType === "JAC" ? "GFTI" : collegeType; // Treat JAC as GFTI
          let instituteTypeMatch = false;

          if (selectedInstitutes.length > 0) {
            instituteTypeMatch = selectedInstitutes.includes(mappedType);
          } else {
            instituteTypeMatch = collegeType !== "IIT";
          }
          return instituteTypeMatch;
        })
        .sort((a, b) => {
          const rankA = parseInt(a.closingRank, 10) || Infinity;
          const rankB = parseInt(b.closingRank, 10) || Infinity;
          return rankA <= 600000 && rankB <= 600000
            ? rankA - rankB
            : rankA <= 600000
            ? -1
            : 1;
        });
    },
    [selectedCategory, selectedGender, selectedInstitutes]
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
    [mainBranchOptions]
  );

  const filterByProbability = useCallback(
    (colleges, selectedProbability) => {
      if (!colleges) return [];
      const userRank = parseInt(rankInput, 10);
      if (isNaN(userRank)) {
        return colleges.map((college) => ({ ...college, probability: null })); // Add probability: null if no valid rank
      }

      return colleges
        .map((college) => {
          const openingRank = parseInt(college.openingRank, 10);
          const closingRank = parseInt(college.closingRank, 10);
          let probability = null;

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
          return { ...college, probability };
        })
        .filter((college) => {
          if (selectedProbability && selectedProbability.length > 0) {
            return (
              college.probability &&
              selectedProbability.includes(college.probability)
            );
          }
          return college.probability !== null;
        });
    },
    [rankInput, rankErrorFactor, maxRankDifferenceForLowProb]
  );

  const handleInputChange = useCallback(
    (event) => {
      const { name, value, type, checked } = event.target;
      if (name === "marks") {
        setRankInput(value);
        setLastInteractedInput("rank");
        setIsPercentileDisabled(!!value);
        setIsRankDisabled(false);
      } else if (name === "perc") {
        setPercentileInput(value);
        setRankInput(calculateRankFromPercentile(parseFloat(value)));
        setLastInteractedInput("percentile");
        setIsRankDisabled(!!value);
        setIsPercentileDisabled(false);
        setSelectedCategory("OPEN");
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
    [
      calculateRankFromPercentile,
      setRankInput,
      setPercentileInput,
      setIsPercentileDisabled,
      setIsRankDisabled,
      setSelectedCategory,
      setSelectedGender,
      setSearchInput,
      setSelectedState,
      setSelectedInstitutes,
      setLastInteractedInput, // Added here
    ]
  );

  const shouldDisableCategory = useMemo(() => {
    return (
      (lastInteractedInput === "percentile" && !!percentileInput) ||
      shouldDisableGenderCategory
    );
  }, [lastInteractedInput, percentileInput, shouldDisableGenderCategory]);

  const shouldDisableGender = useMemo(() => {
    return shouldDisableGenderCategory;
  }, [shouldDisableGenderCategory]);

  useEffect(() => {
    if (lastInteractedInput === "rank" && rankInput !== "") {
      setPercentileInput(calculatePercentileFromRank(parseInt(rankInput, 10)));
    }
  }, [
    rankInput,
    lastInteractedInput,
    calculatePercentileFromRank,
    setPercentileInput,
  ]);

  const updateFilteredColleges = useCallback(() => {
    const rank =
      rankInput || calculateRankFromPercentile(parseFloat(percentileInput));
    const categoryRank = !isNaN(parseInt(rank, 10))
      ? calculateCategoryRank(parseInt(rank, 10), selectedCategory)
      : Infinity;

    const initiallyFiltered = applySearchFilter(
      allColleges,
      categoryRank,
      searchInput,
      selectedState,
      selectedInstitutes,
      selectedGender
    );
    const filteredByBranchResult = filterByMainBranch(
      // Call filterByMainBranch here
      initiallyFiltered,
      selectedMainBranch
    );
    const finalFilteredWithProbability = filterByProbability(
      // Call filterByProbability here
      filteredByBranchResult,
      selectedProbability
    );

    setFilteredColleges(finalFilteredWithProbability);
    setCurrentPage(1);
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
    filterByMainBranch, // Added to dependency array
    filterByProbability, // Added to dependency array
    calculateRankFromPercentile,
    setFilteredColleges,
    setCurrentPage,
  ]);

  const handleMainBranchClick = useCallback((branchValue) => {
    setSelectedMainBranch((prev) => {
      if (branchValue === null) {
        return [];
      } else if (prev.includes(branchValue)) {
        return prev.filter((b) => b !== branchValue);
      } else {
        return [...prev, branchValue];
      }
    });
  }, []);

  const handleProbabilityClick = useCallback((probabilityValue) => {
    setSelectedProbability((prev) => {
      if (probabilityValue === null) {
        return [];
      } else if (prev.includes(probabilityValue)) {
        return prev.filter((p) => p !== probabilityValue);
      } else {
        return [...prev, probabilityValue];
      }
    });
  }, []);

  useEffect(() => {
    updateFilteredColleges();
  }, [
    updateFilteredColleges,
    selectedMainBranch,
    selectedProbability,
    selectedCategory,
    selectedGender,
    searchInput,
    selectedState,
    selectedInstitutes,
  ]);

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
          updateFilteredColleges();
        })
        .catch((error) => {
          console.error("Error fetching data:", error);
        });
    },
    [setAllColleges, updateFilteredColleges]
  );

  const displayColleges = useCallback(
    (colleges) => {
      if (!colleges || colleges.length === 0) {
        return <p>No colleges found matching your criteria.</p>;
      }

      return colleges.map((college, index) => (
        <CollegeCard
          key={index}
          college={college}
          probability={college.probability}
          viewerIp={userIp} // Pass the userIp prop here
        />
      ));
    },
    [userIp] // Add userIp to the dependency array
  );

  const downloadPdfData = useCallback((collegesToDownload) => {
    if (collegesToDownload.length === 0) {
      alert("No colleges to download.");
      return;
    }

    const doc = new jsPDF();
    autoTable(doc, {
      head: [
        [
          "Institute",
          "Branch",
          "Category",
          "Quota",
          "Gender",
          "Opening Rank",
          "Closing Rank",
          "Probability",
        ],
      ],
      body: collegesToDownload // Use the correct argument here
        .map((college) => [
          college.institute,
          college.branch,
          college.category,
          college.quota,
          college.gender,
          college.openingRank,
          college.closingRank,
          college.probability,
        ]),
      styles: { fontSize: 8 },
      columnStyles: { 7: { halign: "center" } },
    });

    doc.save("PJ Choices.pdf");
  }, []);
  const handleDownloadChange = useCallback(
    (event) => {
      setDownloadOption(event.target.value);
    },
    [setDownloadOption]
  );

  const sanitizePath = useCallback((name) => {
    return name.replace(/[^a-zA-Z0-9_-]/g, "_");
  }, []);
  const handleDownloadClick = useCallback(async () => {
    if (downloadOption === "saved") {
      if (!userIp || userIp === "unknown_ip") {
        alert("Could not determine your IP address. Please try again later.");
        return;
      }

      const hyphenatedIp = userIp.replace(/\./g, "-");

      const fetchFirebaseSavedChoices = async (hyphenatedIp) => {
        try {
          const allCollegesRef = ref(database, "colleges");
          const snapshot = await get(allCollegesRef);

          if (!snapshot.exists()) {
            alert("No saved college data found.");
            return [];
          }

          const savedCollegeNames = [];
          snapshot.forEach((childSnapshot) => {
            const collegeName = childSnapshot.key;
            const collegeData = childSnapshot.val();
            if (collegeData?.savedBy?.[hyphenatedIp]) {
              savedCollegeNames.push(collegeName);
            }
          });
          return savedCollegeNames;
        } catch (error) {
          console.error("Error fetching saved college data:", error);
          alert("Error fetching saved choices.");
          return [];
        }
      };

      const savedCollegeNames = await fetchFirebaseSavedChoices(hyphenatedIp);

      const collegesToDownload = filteredColleges.filter((college) => {
        const collegeNameForSanitize = (
          college.institute?.trim() || "Unnamed College"
        )
          .replace(/Indian Institute of Technology/g, "IIT")
          .replace(/National Institute of Technology/g, "NIT")
          .replace(/Indian Institute of Information Technology/g, "IIIT");
        const sanitizedInstituteName = sanitizePath(collegeNameForSanitize);
        return savedCollegeNames.includes(sanitizedInstituteName);
      });

      if (collegesToDownload.length > 0) {
        downloadPdfData(collegesToDownload);
      } else {
        alert(`No saved choices found for your IP address.`);
      }
    } else if (downloadOption === "all") {
      downloadPdfData(filteredColleges);
    } else {
      alert("Please select an option from the dropdown.");
    }
  }, [
    downloadOption,
    filteredColleges,
    downloadPdfData,
    database,
    sanitizePath,
    userIp,
  ]); // Added userIp to dependencies

  const totalPages = useCallback(() => {
    return Math.ceil(filteredColleges.length / itemsPerPage) || 1;
  }, [filteredColleges.length, itemsPerPage]);

  const paginateColleges = useCallback(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredColleges.slice(startIndex, endIndex);
  }, [currentPage, filteredColleges, itemsPerPage]);

  const handlePagination = useCallback(
    (direction) => {
      if (direction === "prev") {
        setCurrentPage((prev) => Math.max(1, prev - 1));
      } else if (direction === "next") {
        setCurrentPage((prev) => Math.min(totalPages(), prev + 1));
      }
    },
    [totalPages, setCurrentPage]
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
              value={selectedState}
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
                    checked={selectedGender === "Gender-Neutral"}
                    onChange={handleInputChange}
                    disabled={shouldDisableGender}
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
                    }
                    onChange={handleInputChange}
                    disabled={shouldDisableGender}
                  />
                  <span>Female</span>
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
                    checked={selectedCategory === "EWS"}
                    onChange={handleInputChange}
                    disabled={shouldDisableCategory}
                  />
                  <span>EWS</span>
                </label>
                <label>
                  <input
                    type="radio"
                    name="category"
                    value="OBC-NCL"
                    checked={selectedCategory === "OBC-NCL"}
                    onChange={handleInputChange}
                    disabled={shouldDisableCategory}
                  />
                  <span>OBC</span>
                </label>
                <label>
                  <input
                    type="radio"
                    name="category"
                    value="SC"
                    checked={selectedCategory === "SC"}
                    onChange={handleInputChange}
                    disabled={shouldDisableCategory}
                  />
                  <span>SC</span>
                </label>
                <label>
                  <input
                    type="radio"
                    name="category"
                    value="ST"
                    checked={selectedCategory === "ST"}
                    onChange={handleInputChange}
                    disabled={shouldDisableCategory}
                  />
                  <span>ST</span>
                </label>
                <label>
                  <input
                    type="radio"
                    name="category"
                    value="OPEN"
                    checked={selectedCategory === "OPEN"}
                    onChange={handleInputChange}
                    disabled={shouldDisableCategory}
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
                    checked={selectedInstitutes.includes("NIT")}
                    onChange={handleInputChange}
                  />
                  <span>NIT</span>
                </label>
                <label>
                  <input
                    type="checkbox"
                    name="iiit"
                    value="IIIT"
                    checked={selectedInstitutes.includes("IIIT")}
                    onChange={handleInputChange}
                  />
                  <span>IIIT</span>
                </label>
                <label>
                  <input
                    type="checkbox"
                    name="gfti"
                    value="GFTI"
                    checked={selectedInstitutes.includes("GFTI")}
                    onChange={handleInputChange}
                  />
                  <span>GFTI</span>
                </label>
                <label>
                  <input
                    type="checkbox"
                    name="aktu"
                    value="AKTU"
                    checked={selectedInstitutes.includes("AKTU")}
                    onChange={handleInputChange}
                  />
                  <span>AKTU</span>
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
                    value={searchInput}
                    onChange={handleInputChange}
                  />
                </label>
                <div className="info">
                  Note: For now I have only compiled JoSSA,JAC Delhi & AkTU's data here.
                  Haven't added CSAB/MhTCET/COMEDK/other counsellings
                  ka data yet. So keep this in mind while using this predictor!
                  <br />
                  <span className="ff">Asuvidha ke liye khed haiii!</span>
                </div>
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

        {filteredColleges.length > 0 && (
          <div className="download-container">
            <select
              id="downloadOption"
              className="state-select"
              value={downloadOption}
              onChange={handleDownloadChange}
            >
              <option value="">Select Download Option</option>
              <option value="saved">Download Saved Choices (PDF)</option>
              <option value="all">Download All Results (PDF)</option>
            </select>
            <button
              className="custom-button later"
              onClick={handleDownloadClick}
              disabled={!downloadOption}
            >
              <div className="button-content">
                <span>Download</span>
              </div>
            </button>
          </div>
        )}
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
