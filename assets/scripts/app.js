document.addEventListener("DOMContentLoaded", function () {
    const button = document.querySelector(".custom-button");

    if (!button) {
        console.error("Button element not found.");
        return;
    }

    let allColleges = []; // Store all colleges globally

    // Set the default value of the branch dropdown to "Select Branch"
    const branchInput = document.querySelector('select[name="branch"]');
    branchInput.value = "Select Branch"; // Ensure "Select Branch" is the default

    button.addEventListener("click", function (event) {
        event.preventDefault();

        const rankInput = document.querySelector("#marks");
        const categoryInput = document.querySelector('input[name="category"]:checked');
        const genderInput = document.querySelector('input[name="gender"]:checked'); // Get selected gender

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

        const rank = parseInt(rankInput.value);
        const selectedCategory = categoryInput.value;
        const selectedGender = genderInput.value;
        const selectedBranch = branchInput.value; // Get the branch selection

        fetch("data.json")
            .then(response => response.json())
            .then(data => {
                // Debugging: log all colleges
                console.log("All Colleges: ", data);

                // Filter colleges based on rank, category, gender, and excluding IITs
                const matchingColleges = data.filter(college => {
                    const openingRank = parseInt(college.openingRank);
                    const closingRank = parseInt(college.closingRank);
                    const collegeCategory = college.category;
                    const collegeQuota = college.quota;
                    const collegeGender = college.gender;
                    const collegeInstitute = college.institute.trim(); // Trim spaces

                    // Normalize the institute name and check for IIT variations (case insensitive)
                    const normalizeInstituteName = (name) => {
                        return name.toLowerCase().replace(/\s+/g, ' ').trim();
                    };

                    // Check for IIT exclusion logic
                    const isIIT = normalizeInstituteName(collegeInstitute).includes("indian institute of technology") || 
                                   normalizeInstituteName(collegeInstitute).includes("iit");

                    // If a branch is selected, filter based on branch as well
                    const isBranchMatching = selectedBranch === "Select Branch" || selectedBranch === college.branch;

                    return rank <= closingRank &&
                        (collegeQuota === "AI" || collegeQuota === "OS") && // Filter for AI or OS quota
                        (selectedCategory === collegeCategory) &&
                        (selectedGender === collegeGender) &&
                        !isIIT && // Exclude IITs, keep NITs and IIITs
                        isBranchMatching; // Proceed if branch matches or is "Select Branch"
                });

                const branchPriority = (branch) => {
                    const highPriorityKeywords = ['elec', 'computer', 'mathematics', 'mechanical', 'ai', 'machine', 'data', 'artificial'];
                
                    // Check if the branch contains any of the high priority keywords
                    for (let keyword of highPriorityKeywords) {
                        if (new RegExp(keyword, 'i').test(branch)) {
                            return 1; // High priority for AI, ML, Data Science, and related branches
                        }
                    }
                
                    // Low priority for architecture, food, life sciences, or bio-related branches
                    if (/architecture/i.test(branch) || /food/i.test(branch) || /life/i.test(branch) || /production/i.test(branch) || /bio/i.test(branch)) {
                        return 3; // Low priority for architecture, food, life, bio branches
                    }
                
                    return 2; // Default medium priority for other branches
                };
                

                // Sort colleges based on the closeness to the rank (absolute difference) and branch priority
                allColleges = matchingColleges.sort((a, b) => {
                    const closingRankA = parseInt(a.closingRank);
                    const closingRankB = parseInt(b.closingRank);

                    const diffA = Math.abs(closingRankA - rank); // Difference from rank
                    const diffB = Math.abs(closingRankB - rank); // Difference from rank

                    const priorityA = branchPriority(a.branch);
                    const priorityB = branchPriority(b.branch);

                    // First, sort by branch priority, then by closeness to rank
                    if (priorityA === priorityB) {
                        return diffA - diffB; // If priorities are the same, sort by rank closeness
                    }

                    return priorityA - priorityB; // Sort by branch priority
                });

                // Call the pagination function with the sorted colleges
                paginateColleges();
            })
            .catch(error => console.error("Error fetching data:", error));
    });

    let currentPage = 1;
    const itemsPerPage = 20;

    function paginateColleges() {
        const totalPages = Math.ceil(allColleges.length / itemsPerPage);
        const start = (currentPage - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        const collegesToDisplay = allColleges.slice(start, end);

        // Display the colleges for the current page
        displayColleges(collegesToDisplay);

        // Display pagination controls
        displayPagination(totalPages);
    }

    function displayColleges(colleges) {
        const resultSection = document.querySelector(".result-section") || document.createElement("section");
        resultSection.classList.add("result-section");
        resultSection.innerHTML = colleges.length > 0
            ? colleges.map(college => {
                // Replace full names with short versions
                let collegeName = college.institute.trim();
                collegeName = collegeName.replace(/Indian Institute of Technology/g, "IIT")
                                         .replace(/National Institute of Technology/g, "NIT")
                                         .replace(/Indian Institute of Information Technology/g, "IIIT");

                return `
                    <div class="college-card">
                        <h2 class="college-name">${collegeName}</h2>
                        <div class="details">
                            <p>${college.branch}</p>
                            <p>Category: ${college.category}</p>
                            <p>Gender: ${college.gender}</p>
                            <p><span class="or">OR: ${college.openingRank}</span>, <span class="cr">CR: ${college.closingRank}</span></p>
                        </div>
                    </div>
                `;
            }).join("")
            : "<p>No matching colleges found for the given rank, category, and gender.</p>";

        document.body.appendChild(resultSection);
    }

    function displayPagination(totalPages) {
        const paginationContainer = document.querySelector(".pagination") || document.createElement("div");
        paginationContainer.classList.add("pagination");

        paginationContainer.innerHTML = `
            <button class="prev" ${currentPage === 1 ? 'disabled' : ''}>-</button>
            <span> <input type="number" class="page-input" min="1" max="${totalPages}" value="${currentPage}">
             / ${totalPages}</span>
           <button class="next" ${currentPage === totalPages ? 'disabled' : ''}>+</button>
        `;

        paginationContainer.querySelector(".prev").addEventListener("click", function() {
            if (currentPage > 1) {
                currentPage--;
                paginateColleges();
            }
        });

        paginationContainer.querySelector(".next").addEventListener("click", function() {
            if (currentPage < totalPages) {
                currentPage++;
                paginateColleges();
            }
        });

        // Handle direct page input
        paginationContainer.querySelector(".page-input").addEventListener("input", function(event) {
            const pageInput = event.target.value;
            const pageNum = parseInt(pageInput);

            if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= totalPages) {
                currentPage = pageNum;
                paginateColleges();
            }
        });

        document.body.appendChild(paginationContainer);
    }
});
