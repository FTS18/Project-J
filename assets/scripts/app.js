"use strict";

document.addEventListener("DOMContentLoaded", function () {
    fetchAndCacheData().then(() => {
        console.log("Data loaded and cached (if necessary).");
        // applySearchFilter(); // Optionally, trigger initial filter
    }).catch(err => console.error(err));

    populateStates();

    const rankInput = document.getElementById("marks");
    const percentileInput = document.getElementById("perc");
    const totalCandidates = 1600000;
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

        const footer = document.querySelector(".footer");
        const pagination = document.querySelector(".pagination");

        if (footer && pagination) {
            pagination.parentNode.insertBefore(resultSection, footer);
        } else {
            document.body.appendChild(resultSection);
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

document.addEventListener("DOMContentLoaded", async function () {
    await populateStates();
});
async function populateStates() {
    try {
        const response = await fetch("assets/scripts/python/cs.json", { cache: "no-store" });
        const data = await response.json();

        const stateDropdown = document.getElementById("state");
        if (!stateDropdown) return console.error("Dropdown element #state not found!");

        const fragment = document.createDocumentFragment();

        // Add "Select" option at the top
        const defaultOption = document.createElement("option");
        defaultOption.value = "select";
        defaultOption.textContent = "Select";
        fragment.appendChild(defaultOption);

        // Sort states alphabetically
        const sortedStates = Object.keys(data).sort();

        sortedStates.forEach(state => {
            const option = document.createElement("option");
            option.value = state.toLowerCase();
            option.textContent = state;
            fragment.appendChild(option);
        });

        stateDropdown.replaceChildren(fragment);
    } catch (error) {
        console.error("Error loading cs.json:", error);
    }
}
async function fetchAndCacheData() {
    const dbName = "collegeDB";
    const collegesStore = "colleges";
    const statesStore = "stateData";

    return new Promise(async (resolve, reject) => {
        const request = indexedDB.open("collegeDB", 3); // Increase version if needed

        request.onupgradeneeded = function (event) {
            const db = event.target.result;

            if (!db.objectStoreNames.contains("colleges")) {
                db.createObjectStore("colleges");
            }
            if (!db.objectStoreNames.contains("stateData")) {
                db.createObjectStore("stateData");
            }
        };

        request.onerror = function () {
            console.error("IndexedDB error:", request.error);
        };

        request.onsuccess = function (event) {
            const db = event.target.result;

            // Check if the necessary object store exists before using it
            if (!db.objectStoreNames.contains("stateData")) {
                console.error("stateData store not found!");
                return;
            }

            checkAndCacheCsJson(db);
        };
    });
}

function checkAndCacheCsJson(db) {
    const transaction = db.transaction("stateData", "readonly");
    const store = transaction.objectStore("stateData");
    const getCsData = store.get("csJson");

    getCsData.onsuccess = async function () {
        if (!getCsData.result) {
            console.log("🔄 Fetching cs.json permanently...");
            fetchAndCacheCsJson(db);
        }
    };
}

function checkAndCacheDataJson(db, resolve, reject) {
    const transaction = db.transaction("colleges", "readonly");
    const store = transaction.objectStore("colleges");
    const getCollegeData = store.get("collegeData");

    getCollegeData.onsuccess = async function () {
        const cachedData = getCollegeData.result;

        fetch("version.json", { cache: "no-store" })
            .then(response => response.json())
            .then(versionData => {
                const serverVersion = versionData.version;

                if (cachedData && cachedData.version === serverVersion) {
                    console.log("✅ Using cached data (Up-to-date)");
                    resolve(cachedData.data);
                } else {
                    console.log("🔄 Updating cache with new data...");
                    fetchAndCacheDataJson(db, serverVersion, resolve, reject);
                }
            })
            .catch(error => {
                console.error("❌ Error fetching version:", error);
                cachedData ? resolve(cachedData.data) : reject("No cached data available");
            });
    };
}

async function fetchAndCacheCsJson(db) {
    try {
        const response = await fetch("assets/scripts/python/cs.json", { cache: "no-store" });
        const csData = await response.json();

        const transaction = db.transaction("stateData", "readwrite");
        const store = transaction.objectStore("stateData");
        store.put(csData, "csJson");

        console.log("✅ cs.json permanently stored");
    } catch (error) {
        console.error("❌ Error fetching cs.json:", error);
    }
}

async function fetchAndCacheDataJson(db, serverVersion, resolve, reject) {
    try {
        const response = await fetch("data.json", { cache: "no-store" });
        const fullData = await response.json();

        const transaction = db.transaction("colleges", "readwrite");
        const store = transaction.objectStore("colleges");
        store.put({ version: serverVersion, data: fullData }, "collegeData");

        console.log("✅ data.json updated successfully");
        resolve(fullData);
    } catch (error) {
        console.error("❌ Error fetching data.json:", error);
        reject("Failed to update data.json");
    }
}

// Usage
fetchAndCacheData().then(data => {
    console.log("📂 Loaded Data:", data);
}).catch(err => console.error(err));

// JavaScript
function toggleDarkMode() {
    document.body.classList.toggle('inverted');
}
