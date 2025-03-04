"use strict";

self.addEventListener("message", function (event) {
    const { colleges, query, categoryRank, selectedCategory, selectedGender, selectedState, selectedInstitutes } = event.data;

    const filteredColleges = colleges.filter(college => {
        const openingRank = parseInt(college.openingRank);
        const closingRank = parseInt(college.closingRank);
        const collegeCategory = college.category;
        const collegeQuota = college.quota;
        const collegeGender = college.gender;
        const collegeInstitute = college.institute.trim();
        const collegeState = college.state.toLowerCase();

        const normalizeInstituteName = (name) => {
            return name.toLowerCase().replace(/\s+/g, " ").trim();
        };

        const normalizedInstituteName = normalizeInstituteName(collegeInstitute);

        const isIIT = normalizedInstituteName.includes("indian institute of technology") || normalizedInstituteName.includes("iit");
        const isNIT = normalizedInstituteName.includes("national institute of technology") || normalizedInstituteName.includes("nit");
        const isIIIT = normalizedInstituteName.includes("indian institute of information technology") || normalizedInstituteName.includes("iiit");
        const isPEC = normalizedInstituteName.includes("punjab engineering college"); // Exception for PEC
        const isGFTI = !isNIT && !isIIIT && !isPEC; // If not NIT, IIIT, or PEC, it’s GFTI

        const isMatchingInstitute = selectedInstitutes.length === 0 || selectedInstitutes.some(type => {
            if (type === "nit") return isNIT;
            if (type === "iiit") return isIIIT;
            if (type === "gfti") return isGFTI;
            return false;
        });

        if (selectedInstitutes.length > 0 && !isMatchingInstitute) return false;

        const isHomeState = collegeState === selectedState;

        return (
            categoryRank <= closingRank &&
            (
                (isHomeState && collegeQuota === "HS") ||
                (!isHomeState && (collegeQuota === "OS" || collegeQuota === "AI"))
            ) &&
            selectedCategory === collegeCategory &&
            selectedGender === collegeGender &&
            !isIIT &&
            (college.institute.toLowerCase().includes(query) || college.branch.toLowerCase().includes(query))
        );
    });

    self.postMessage(filteredColleges);
});
