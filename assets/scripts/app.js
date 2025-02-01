document.addEventListener("DOMContentLoaded", function () {
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

    button.addEventListener("click", function (event) {
        event.preventDefault();
        const rankInput = document.querySelector("#marks");
        const categoryInput = document.querySelector('input[name="category"]:checked');
        const genderInput = document.querySelector('input[name="gender"]:checked');

        if (!rankInput || isNaN(rankInput.value)) {
            alert("Please enter a valid rank.");
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

        const rank = rankInput && !isNaN(rankInput.value) && rankInput.value.trim() !== ""
            ? parseInt(rankInput.value)
            : 1;

        const selectedCategory = categoryInput.value;
        const selectedGender = genderInput.value;

        fetch("data.json")
            .then(response => response.json())
            .then(data => {
                const matchingColleges = data.filter(college => {
                    const openingRank = parseInt(college.openingRank);
                    const closingRank = parseInt(college.closingRank);
                    const collegeCategory = college.category;
                    const collegeQuota = college.quota;
                    const collegeGender = college.gender;
                    const collegeInstitute = college.institute.trim();

                    const normalizeInstituteName = (name) => {
                        return name.toLowerCase().replace(/\s+/g, ' ').trim();
                    };

                    const isIIT = normalizeInstituteName(collegeInstitute).includes("indian institute of technology") ||
                        normalizeInstituteName(collegeInstitute).includes("iit");

                    const selectedInstitutes = [];
                    const nitCheckbox = document.querySelector('input[name="nit"]');
                    const iiitCheckbox = document.querySelector('input[name="iiit"]');
                    const gftiCheckbox = document.querySelector('input[name="gfti"]');
                    if (nitCheckbox.checked) selectedInstitutes.push("nit");
                    if (iiitCheckbox.checked) selectedInstitutes.push("iiit");
                    if (gftiCheckbox.checked) selectedInstitutes.push("gfti");

                    const normalizedInstituteName = normalizeInstituteName(collegeInstitute);

                    const isMatchingInstitute = selectedInstitutes.some(type => {
                        if (type === "nit") return normalizedInstituteName.includes("national institute of technology") || normalizedInstituteName.includes("nit");
                        if (type === "iiit") return normalizedInstituteName.includes("indian institute of information technology") || normalizedInstituteName.includes("iiit");
                        if (type === "gfti") return !normalizedInstituteName.includes("nit") && !normalizedInstituteName.includes("iiit");
                    });

                    if (selectedInstitutes.length > 0 && !isMatchingInstitute) return false;

                    return rank <= closingRank &&
                        (collegeQuota === "AI" || collegeQuota === "OS") &&
                        (selectedCategory === collegeCategory) &&
                        (selectedGender === collegeGender) &&
                        !isIIT;
                });

                allColleges = matchingColleges.sort((a, b) => {
                    const closingRankA = parseInt(a.closingRank);
                    const closingRankB = parseInt(b.closingRank);

                    const diffA = Math.abs(closingRankA - rank);
                    const diffB = Math.abs(closingRankB - rank);

                    return diffA - diffB;
                });

                applySearchFilter();
            })
            .catch(error => console.error("Error fetching data:", error));
    });

    function applySearchFilter() {
        const query = searchInput.value.toLowerCase().trim();

        filteredColleges = allColleges.filter(college => {
            return college.institute.toLowerCase().includes(query) ||
                college.branch.toLowerCase().includes(query);
        });

        currentPage = 1;
        paginateColleges();
    }

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
        resultSection.classList.add("result-section");
        resultSection.innerHTML = colleges.length > 0
            ? colleges.map(college => {
                let collegeName = college.institute.trim();
                collegeName = collegeName.replace(/Indian Institute of Technology/g, "IIT")
                    .replace(/National Institute of Technology/g, "NIT")
                    .replace(/Indian Institute of Information Technology/g, "IIIT");
                    const googleSearchUrl = `https://www.google.com/search?q=${encodeURIComponent(collegeName + ' college pravesh')}`;

                    return `
                        <div class="college-card" onclick="window.open('${googleSearchUrl}', '_blank')">
                            <h2 class="college-name">${collegeName}</h2>
                            <div class="details">
                                <p>${college.branch}</p>
                                ${college.category} | 
                                ${college.gender}</p>
                                <p><span class="or">OR: ${college.openingRank}</span> | <span class="cr">CR: ${college.closingRank}</span></p>
                            </div>
                        </div>
                    `;
            }).join("")
            : "<p>No matching colleges found for the given rank, category, and gender.</p>";

        const footer = document.querySelector(".footer");
        const pagination = document.querySelector(".pagination");

        if (footer && pagination) {
            pagination.parentNode.insertBefore(resultSection, footer); // Place result section before the footer
        } else {
            document.body.appendChild(resultSection); // If no footer, append to body
        }
    }
    function displayPagination(totalPages) {
        const paginationContainer = document.querySelector(".pagination") || document.createElement("div");
        paginationContainer.classList.add("pagination");
    
        paginationContainer.innerHTML = `
            <button class="prev" ${currentPage === 1 ? 'disabled' : ''}>-</button>
            <span> <input type="number" class="page-input" min="1" max="${totalPages}" value="${currentPage}"> / ${totalPages}</span>
            <button class="next" ${currentPage === totalPages ? 'disabled' : ''}>+</button>
        `;
    
        paginationContainer.querySelector(".prev").addEventListener("click", function () {
            if (currentPage > 1) {
                currentPage--;
                paginateColleges();
            }
        });
    
        paginationContainer.querySelector(".next").addEventListener("click", function () {
            if (currentPage < totalPages) {
                currentPage++;
                paginateColleges();
            }
        });
    
        paginationContainer.querySelector(".page-input").addEventListener("input", function (event) {
            const pageInput = event.target.value;
            const pageNum = parseInt(pageInput);
    
            if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= totalPages) {
                currentPage = pageNum;
                paginateColleges();
            }
        });
    
        const footer = document.querySelector(".footer");
    
        if (footer) {
            footer.parentNode.insertBefore(paginationContainer, footer); // Insert pagination before the footer
        }
    }
    

    searchInput.addEventListener('input', function () {});

    button.addEventListener('click', function () {
        applySearchFilter();
    });
    
});