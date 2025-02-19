document.addEventListener("DOMContentLoaded", function () {
    const rankInput = document.getElementById("marks");
    const percentileInput = document.getElementById("perc");
    const totalCandidates = 1475000; 
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
        if (percentileInput.value.trim() !== "") {
            categoryInputs.forEach(input => {
                input.disabled = input.value !== "general";
            });
            genderInputs.forEach(input => {
                input.disabled = input.value !== "male";
            });
        } else {
            categoryInputs.forEach(input => input.disabled = false);
            genderInputs.forEach(input => input.disabled = false);
        }
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

    button.addEventListener("click", function (event) {
        event.preventDefault();
        const categoryInput = document.querySelector('input[name="category"]:checked');
        const genderInput = document.querySelector('input[name="gender"]:checked');
        
        
        let rank = rankInput.value.trim();
        let percentile = percentileInput.value.trim();
        
        if (percentile !== "") {
            alert("If you enter your percentile, we can only show you predicted colleges as per your CRL (not based on any of category/gender based reservations). If you have an idea of your category ranks then enter them in the rank field.");
            rank = calculateRankFromPercentile(parseFloat(percentile));
            rankInput.value = rank; // Update rank field only when percentile is entered
        } else if (rank === "" || isNaN(rank)) {
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
// Function to update the year
function updateYear() {
    var currentYear = new Date().getFullYear();
    document.getElementById("year").textContent =currentYear;
}
window.onload = function() {
    updateYear();
};
window.addEventListener("scroll", function () {
    const nav = document.querySelector(".nav");
    if (window.scrollY > 400) {
        nav.style.background = "#25252592";
    } else {
        nav.style.background = "#006e3b21"; // Original color
    }
});

// Function to update the year
function updateYear() {
    var currentYear = new Date().getFullYear();
    var yearElement = document.getElementById("year");

    if (yearElement) {
        yearElement.textContent = currentYear;
    }
}
  // Your web app's Firebase configuration
  const firebaseConfig = {
    apiKey: "AIzaSyDc1TevGso9fI3sBSEaqE5_WqsBGA-_zXk",
    authDomain: "views-4576f.firebaseapp.com",
    databaseURL: "https://views-4576f-default-rtdb.firebaseio.com",
    projectId: "views-4576f",
    storageBucket: "views-4576f.firebasestorage.app",
    messagingSenderId: "666092567983",
    appId: "1:666092567983:web:c868e1973002f7bcb6435a"
  };

const app = firebase.initializeApp(firebaseConfig);

function get_viewers_ip(json) {
    const viewers_ip = json.ip;
    count_view(viewers_ip);
}
function count_view(viewers_ip) {
    const ip_to_string = viewers_ip.toString().replace(/\./g, '-');
    const dbRef = app.database().ref("viewers/" + ip_to_string);

    dbRef.once("value", function (snapshot) {
        if (!snapshot.exists()) { // If IP is new
            dbRef.set(true); // Mark IP as visited

            // Increase ProjectJ count by 1
            const projectRef = app.database().ref("project_clicks/ProjectJ");
            projectRef.transaction(function (currentViews) {
                return (currentViews || 0) + 1;
            });
        }
    });

    // Display updated ProjectJ views
    app.database().ref("project_clicks/ProjectJ").on("value", function (snapshot) {
        const projectJViews = snapshot.val() || 0;
        document.getElementById("vct").innerHTML = "Views: " + projectJViews;
    });
}
