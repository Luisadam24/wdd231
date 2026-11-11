const directory = document.querySelector("#member-directory");
const resultCount = document.querySelector("#result-count");
const searchInput = document.querySelector("#member-search");
const viewAnnouncement = document.querySelector("#view-announcement");
const viewButtons = document.querySelectorAll("[data-view]");
const menuToggle = document.querySelector(".menu-toggle");
const primaryNavigation = document.querySelector("#primary-navigation");
let members = [];
let currentView = "grid";

document.querySelector("#current-year").textContent = new Date().getFullYear();

const modifiedDate = new Date(document.lastModified);
document.querySelector("#last-modified").textContent = Number.isNaN(modifiedDate.getTime())
    ? "Date unavailable"
    : new Intl.DateTimeFormat("en", { dateStyle: "long" }).format(modifiedDate);

menuToggle.addEventListener("click", () => {
    const isExpanded = menuToggle.getAttribute("aria-expanded") === "true";
    menuToggle.setAttribute("aria-expanded", String(!isExpanded));
    menuToggle.setAttribute("aria-label", isExpanded ? "Open navigation" : "Close navigation");
    primaryNavigation.classList.toggle("is-open", !isExpanded);
});

primaryNavigation.addEventListener("click", (event) => {
    if (event.target.closest("a") && window.matchMedia("(max-width: 639px)").matches) {
        menuToggle.setAttribute("aria-expanded", "false");
        menuToggle.setAttribute("aria-label", "Open navigation");
        primaryNavigation.classList.remove("is-open");
    }
});

viewButtons.forEach((button) => {
    button.addEventListener("click", () => {
        currentView = button.dataset.view;
        directory.classList.toggle("grid-view", currentView === "grid");
        directory.classList.toggle("list-view", currentView === "list");
        viewButtons.forEach((control) => {
            const isSelected = control === button;
            control.classList.toggle("is-active", isSelected);
            control.setAttribute("aria-pressed", String(isSelected));
        });
        viewAnnouncement.textContent = `${currentView === "grid" ? "Grid" : "List"} view selected.`;
    });
});

searchInput.addEventListener("input", () => renderMembers());

function makeDetail(label, value, { isLink = false, href = "" } = {}) {
    const row = document.createElement("div");
    row.className = "member-detail";

    const labelElement = document.createElement("span");
    labelElement.className = "detail-label";
    labelElement.textContent = label;

    const valueElement = isLink ? document.createElement("a") : document.createElement("span");
    valueElement.className = isLink ? "detail-value member-link" : "detail-value";
    valueElement.textContent = value;
    if (isLink) {
        valueElement.href = href;
        valueElement.target = "_blank";
        valueElement.rel = "noopener noreferrer";
    }

    row.append(labelElement, valueElement);
    return row;
}

function makeMemberCard(member) {
    const article = document.createElement("article");
    article.className = "member-card";

    const top = document.createElement("div");
    top.className = "member-card-top";

    const logo = document.createElement("img");
    logo.className = "member-logo";
    logo.src = `images/${member.image}`;
    logo.alt = `${member.name} logo`;
    logo.width = 96;
    logo.height = 96;
    logo.loading = "lazy";

    const heading = document.createElement("div");
    heading.className = "member-heading";
    const category = document.createElement("span");
    category.className = "member-category";
    category.textContent = member.category;
    const name = document.createElement("h3");
    name.textContent = member.name;
    heading.append(category, name);
    top.append(logo, heading);

    const description = document.createElement("p");
    description.className = "member-description";
    description.textContent = member.description;

    const details = document.createElement("div");
    details.className = "member-details";
    details.append(
        makeDetail("Address", member.address),
        makeDetail("Phone", member.phone),
        makeDetail("Website", "Sample website ↗", { isLink: true, href: member.website })
    );

    const level = document.createElement("span");
    level.className = "membership-badge";
    level.dataset.level = String(member.membershipLevel);
    level.textContent = `${member.membershipName} member`;
    details.append(level);

    article.append(top, description, details);
    return article;
}

function renderMembers() {
    const query = searchInput.value.trim().toLocaleLowerCase();
    const visibleMembers = members.filter((member) => {
        const searchableText = `${member.name} ${member.category} ${member.address} ${member.description}`.toLocaleLowerCase();
        return searchableText.includes(query);
    });

    directory.replaceChildren();
    directory.classList.toggle("grid-view", currentView === "grid");
    directory.classList.toggle("list-view", currentView === "list");
    resultCount.textContent = `${visibleMembers.length} ${visibleMembers.length === 1 ? "business" : "businesses"} ${query ? "found" : "in the directory"}`;

    if (visibleMembers.length === 0) {
        const empty = document.createElement("p");
        empty.className = "empty-state";
        const title = document.createElement("strong");
        title.textContent = "No matches just yet.";
        empty.append(title, document.createTextNode("Try another search to find a local connection."));
        directory.append(empty);
        return;
    }

    directory.append(...visibleMembers.map(makeMemberCard));
}

async function loadMembers() {
    try {
        const response = await fetch("data/members.json");
        if (!response.ok) {
            throw new Error(`Member data returned ${response.status}.`);
        }

        members = await response.json();
        directory.setAttribute("aria-busy", "false");
        renderMembers();
    } catch (error) {
        directory.setAttribute("aria-busy", "false");
        resultCount.textContent = "Directory unavailable";
        const message = document.createElement("p");
        message.className = "empty-state";
        const title = document.createElement("strong");
        title.textContent = "We couldn't load the directory.";
        message.append(title, document.createTextNode("Please try again when the page is served from the website."));
        directory.replaceChildren(message);
        console.error("Unable to load member directory:", error);
    }
}

loadMembers();
