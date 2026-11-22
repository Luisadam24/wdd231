
// Grid and List view
const businessContainer = document.querySelector("#business-container");
const gridButton = document.querySelector("#grid-button");
const listButton = document.querySelector("#list-button");

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


document.querySelector("#current-year").textContent =
    new Date().getFullYear();

document.querySelector("#last-modified").textContent =
    document.lastModified;
