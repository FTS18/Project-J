
document.addEventListener("DOMContentLoaded", function () {
    const rankInput = document.getElementById("marks");
    const percentileInput = document.getElementById("perc");
    const totalCandidates = 1575143; 
    const categoryInputs = document.querySelectorAll('input[name="category"]');
    const genderInputs = document.querySelectorAll('input[name="gender"]');

    function toggleInputs() {
        if (rankInput.value.trim() !== "") {
            percentileInput.disabled = true;
        } else {
            percentileInput.disabled = false;
        }

        if (percentileInput.value.trim() !== "") {
            rankInput.disabled = true;
        } else {
            rankInput.disabled = false;
        }
    }

    function restrictOptions() {
        categoryInputs.forEach(input => input.disabled = false);
        genderInputs.forEach(input => input.disabled = false);
    }

    rankInput.addEventListener("input", toggleInputs);
    percentileInput.addEventListener("input", () => {
        toggleInputs();
        restrictOptions();
    });

    function calculateRankFromPercentile(percentile) {
        return Math.round((1 - (percentile / 100)) * totalCandidates);
    }
    rankInput.addEventListener("input", toggleInputs);
    percentileInput.addEventListener("input", toggleInputs);
    const button = document.querySelector(".custom-button");
    const searchInput = document.getElementById('search');
    let allColleges = [];
    let filteredColleges = [];
    let currentPage = 1;
    const itemsPerPage = 20;

    if (!button) {
        console.error("Button element not found.");
        return;
    }
    function calculateCategoryRank(crlRank, category) {
        const categoryPercentages = {
            "EWS": 0.14,      // 11.34%
            "OBC-NCL": 0.31,  // 40.61%
            "SC": 0.10,       // 10.42%
            "ST": 0.065       // 3.41%
        };

        if (!categoryPercentages[category]) return crlRank;

        return Math.round(crlRank * categoryPercentages[category]);
    }

    const worker = new Worker('worker.js'); // Initialize the Web Worker
    button.addEventListener("click", function (event) {
        event.preventDefault();
        const categoryInput = document.querySelector('input[name="category"]:checked');
        const genderInput = document.querySelector('input[name="gender"]:checked');
    
        let rank = rankInput.value.trim();
        let percentile = percentileInput.value.trim();
    
        if (percentile !== "") {
            rank = calculateRankFromPercentile(parseFloat(percentile));
            rankInput.value = rank;
        } else if (rank === "") {
            alert("Please enter a valid rank or percentile.");
            return;
        }
    
        // Ensure rank is a number
        rank = parseInt(rank, 10); // Parse as integer
    
        if (isNaN(rank)) {
            alert("Please enter a valid rank or percentile.");
            return;
        }
    
        if (!categoryInput) {
            alert("Please select a category.");
            return;
        }
    
        if (!genderInput) {
            alert("Please select a gender.");
            return;
        }
    
        const selectedCategory = document.querySelector('input[name="category"]:checked').value;
        const categoryRank = calculateCategoryRank(rank, selectedCategory);
        const selectedGender = genderInput.value;
    
        fetch("data.json")
            .then(response => response.json())
            .then(data => {
                allColleges = data;
                applySearchFilter(categoryRank, selectedCategory, selectedGender);
            })
            .catch(error => console.error("Error fetching data:", error));
    });

    const preferredKeywords = ["Com", "Artif", "Elec", "Data", "Mech"]; // Preferred keywords

    const normalizeInstituteName = (name) => {
        return name ? name.toLowerCase().replace(/\s+/g, ' ').trim() : "";
    }; function applySearchFilter(categoryRank, selectedCategory, selectedGender) {
        const query = searchInput.value.toLowerCase().trim();
        const stateInput = document.getElementById("state");
        const selectedState = stateInput.value.toLowerCase();
        const nitCheckbox = document.querySelector('input[name="nit"]');
        const iiitCheckbox = document.querySelector('input[name="iiit"]');
        const gftiCheckbox = document.querySelector('input[name="gfti"]');
        const selectedInstitutes = [];

        if (nitCheckbox.checked) selectedInstitutes.push("nit");
        if (iiitCheckbox.checked) selectedInstitutes.push("iiit");
        if (gftiCheckbox.checked) selectedInstitutes.push("gfti");
        let gftiLogCount = 0; // Counter for logged GFTIs
        let sortedColleges = allColleges
        .filter(college => college.closingRank >= categoryRank)
        .map((college) => {
            const normalizedName = normalizeInstituteName(college.institute).toLowerCase(); // 🔥 Convert to lowercase
            const isNIT = normalizedName.includes("national institute of technology") || normalizedName.includes("nit");
            const isIIIT = normalizedName.includes("indian institute of information technology") || normalizedName.includes("iiit");
            const isPEC = normalizedName.includes("punjab engineering college");
            const isGFTI = !(isNIT || isIIIT || isPEC); // 🔥 Now it properly excludes NITs, IIITs, PEC
    
            let baseRank = Math.min(college.openingRank, college.closingRank);
            let modifiedRank = baseRank;
    
            if (isGFTI) {
                modifiedRank = baseRank * 1.75;
            }
    
            console.log(`College: ${college.institute}, NIT: ${isNIT}, IIIT: ${isIIIT}, GFTI: ${isGFTI}, Base Rank: ${baseRank}, Modified Rank: ${modifiedRank}`);
    
            return { ...college, modifiedRank };
        })
        .sort((a, b) => a.modifiedRank - b.modifiedRank);
    
        
        function collegeMatchesKeyword(college, keyword) {
            return (
                (college.name && college.name.toLowerCase().includes(keyword.toLowerCase())) ||
                (college.branch && college.branch.toLowerCase().includes(keyword.toLowerCase()))
            );
        }
        worker.postMessage({
            colleges: sortedColleges,
            query: query,
            categoryRank: categoryRank,
            selectedCategory: selectedCategory,
            selectedGender: selectedGender,
            selectedState: selectedState,
            selectedInstitutes: selectedInstitutes
        });
    }

    worker.onmessage = function (event) {
        filteredColleges = event.data;
        currentPage = 1;
        paginateColleges();
    };
    function paginateColleges() {
        const totalPages = Math.ceil(filteredColleges.length / itemsPerPage);
        const start = (currentPage - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        const collegesToDisplay = filteredColleges.slice(start, end);

        displayColleges(collegesToDisplay);
        displayPagination(totalPages);
    }
    function displayColleges(colleges) {
        const resultSection = document.querySelector(".result-section") || document.createElement("section");
        resultSection.classList.add("result-section"); resultSection.innerHTML = colleges.length > 0
            ? colleges.map(college => {
                let collegeName = college.institute.trim();
                collegeName = collegeName.replace(/Indian Institute of Technology/g, "IIT")
                    .replace(/National Institute of Technology/g, "NIT")
                    .replace(/Indian Institute of Information Technology/g, "IIIT");

                const googleSearchUrl = `https://www.google.com/search?q=${encodeURIComponent(collegeName + ' college pravesh')}`;

                const hsClass = college.quota.trim().toLowerCase() === "hs" ? "hs" : "";

                return `
                <div class="college-card ${hsClass}" onclick="window.open('${googleSearchUrl}', '_blank')">
                    <h2 class="college-name">${collegeName}</h2>
                    <div class="details">
                    <p>${college.branch}</p>
                    <p>${college.category} | ${college.gender} | <span class="quota">${college.quota}</span></p>
                    <p><span class="or">OR: ${college.openingRank}</span> | <span class="cr">CR: ${college.closingRank}</span></p>
                    <p>${college.city}, ${college.state}</p>
                    </div>
                    </div>
                    `;
            }).join("")
            : "<p>No matching colleges found for the given rank, category, and gender.</p>";

        const commentBox = document.querySelector(".comment-box");
        const pagination = document.querySelector(".pagination") || document.createElement("div");
        pagination.classList.add("pagination");
    
        if (commentBox) {
            // Insert resultSection before commentBox
            commentBox.parentNode.insertBefore(resultSection, commentBox);
    
            // Insert pagination after resultSection, but before commentBox
            resultSection.parentNode.insertBefore(pagination, commentBox);
        } else {
            // Fallback: append to body if comments are not found
            document.body.appendChild(resultSection);
            document.body.appendChild(pagination);
        }
    
    } function displayPagination(totalPages) {
        let paginationContainer = document.querySelector(".pagination");

        if (!paginationContainer) {
            paginationContainer = document.createElement("div");
            paginationContainer.classList.add("pagination");
            document.body.appendChild(paginationContainer);
        }

        paginationContainer.innerHTML = `
            <button class="prev">-</button>
            <span> <input type="number" class="page-input" min="1" max="${totalPages}" value="${currentPage}"> / ${totalPages}</span>
            <button class="next">+</button>
        `;

        const prevButton = paginationContainer.querySelector(".prev");
        const nextButton = paginationContainer.querySelector(".next");
        const pageInput = paginationContainer.querySelector(".page-input");

        // **🔄 Infinite Pagination for Backward (-)**
        prevButton.addEventListener("click", function () {
            currentPage = (currentPage === 1) ? totalPages : currentPage - 1;
            paginateColleges();
            updatePagination();
        });

        // **🔄 Infinite Pagination for Forward (+)**
        nextButton.addEventListener("click", function () {
            currentPage = (currentPage === totalPages) ? 1 : currentPage + 1;
            paginateColleges();
            updatePagination();
        });

        // **✅ Direct Page Jump Handling**
        pageInput.addEventListener("input", function (event) {
            let pageNum = parseInt(event.target.value);

            if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= totalPages) {
                currentPage = pageNum;
                paginateColleges();
                updatePagination();
            }
        });

        // **🎯 Function to Update Page Number in Input**
        function updatePagination() {
            pageInput.value = currentPage;
        }
        const footer = document.querySelector(".footer");

        if (footer) {
            footer.parentNode.insertBefore(paginationContainer, footer);
        }
    }

    searchInput.addEventListener('input', function () {
        applySearchFilter(calculateCategoryRank(rankInput.value, document.querySelector('input[name="category"]:checked').value), document.querySelector('input[name="category"]:checked').value, document.querySelector('input[name="gender"]:checked').value);
    });

    button.addEventListener('click', function () {
        applySearchFilter(calculateCategoryRank(rankInput.value, document.querySelector('input[name="category"]:checked').value), document.querySelector('input[name="category"]:checked').value, document.querySelector('input[name="gender"]:checked').value);
    });

});

// Function to update the year
function updateYear() {
    var currentYear = new Date().getFullYear();
    document.getElementById("year").textContent = currentYear;
}
window.onload = function () {
    updateYear();
};
window.addEventListener("scroll", function () {
    const nav = document.querySelector(".nav");
    if (window.scrollY > 400) {
        nav.style.background = "#25252592";
    } else {
        nav.style.background = "#006e3b21";
    }
});

// Function to update the year
function updateYear() {
    var currentYear = new Date().getFullYear();
    var yearElement = document.getElementById("year");

    if (yearElement) {
        yearElement.textContent = currentYear;
    }
}function toggleDarkMode() {
    document.body.classList.toggle('inverted');
}
