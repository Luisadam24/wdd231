// Grid and List view
const businessContainer = document.querySelector("#business-container");
const gridButton = document.querySelector("#grid-button");
const listButton = document.querySelector("#list-button");

// Fetch business members from the JSON file
async function getMembers() {
    try {
        const response = await fetch("data/members.json");

        if (!response.ok) {
            throw new Error("Unable to load business members.");
        }

        const members = await response.json();

        displayMembers(members);

    } catch (error) {
        console.error("Error:", error);
        businessContainer.innerHTML =
            "<p>Unable to load business members. Please try again later.</p>";
    }
}

// Display business members
function displayMembers(members) {
    businessContainer.innerHTML = "";

    const membershipLevels = {
        1: "Member",
        2: "Silver Member",
        3: "Gold Member"
    };

    members.forEach((member) => {
        const card = document.createElement("article");
        card.classList.add("business-card");

        card.innerHTML = `
            <h2>${member.name}</h2>

            <p class="tagline">
                ${membershipLevels[member.membership] || "Member"}
            </p>

            <div class="business-details">
                <img 
                    src="images/${member.image}" 
                    alt="${member.name}"
                    width="400"
                    height="250"
                    loading="lazy"
                >

                <div>
                    <p>
                        <strong>Address:</strong>
                        ${member.address}
                    </p>

                    <p>
                        <strong>Phone:</strong>
                        ${member.phone}
                    </p>

                    <p>
                        <strong>Website:</strong>
                        <a href="${member.website}" 
                           target="_blank" 
                           rel="noopener noreferrer">
                            Visit website
                        </a>
                    </p>
                </div>
            </div>

            <p class="description">
                ${member.description}
            </p>
        `;

        businessContainer.appendChild(card);
    });
}

// Grid and List view
gridButton.addEventListener("click", () => {
    businessContainer.classList.remove("list-view");

    gridButton.classList.add("selected");
    listButton.classList.remove("selected");

    gridButton.setAttribute("aria-pressed", "true");
    listButton.setAttribute("aria-pressed", "false");
});

listButton.addEventListener("click", () => {
    businessContainer.classList.add("list-view");

    listButton.classList.add("selected");
    gridButton.classList.remove("selected");

    listButton.setAttribute("aria-pressed", "true");
    gridButton.setAttribute("aria-pressed", "false");
});

// Mobile navigation
const menuButton = document.querySelector("#menu-button");
const navigation = document.querySelector("#navigation");

menuButton.addEventListener("click", () => {
    const isOpen = navigation.classList.toggle("show");

    menuButton.classList.toggle("show", isOpen);
    menuButton.setAttribute("aria-expanded", String(isOpen));
});

// Dark mode
const themeButton = document.querySelector("#theme-button");

themeButton.addEventListener("click", () => {
    const isDark = document.body.classList.toggle("dark-mode");

    themeButton.setAttribute("aria-pressed", String(isDark));
});

// Footer dates
document.querySelector("#current-year").textContent =
    new Date().getFullYear();

document.querySelector("#last-modified").textContent =
    document.lastModified;

// Load business members
getMembers();

