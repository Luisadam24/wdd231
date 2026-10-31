const navButton = document.querySelector("#ham-btn");
const navLinks = document.querySelector("#nav-bar");

if (navButton && navLinks) {
    navButton.addEventListener("click", () => {
        const isOpen = navButton.getAttribute("aria-expanded") === "true";

        navButton.classList.toggle("show", !isOpen);
        navLinks.classList.toggle("show", !isOpen);
        navButton.setAttribute("aria-expanded", String(!isOpen));
        navButton.setAttribute(
            "aria-label",
            isOpen ? "Open navigation" : "Close navigation"
        );
    });
}

const year = document.querySelector("#currentyear");
if (year) {
    year.textContent = new Date().getFullYear();
}

const lastModified = document.querySelector("#lastModified");

const date = new Date(document.lastModified);

lastModified.dateTime = date.toISOString();
lastModified.textContent = date.toLocaleString();

const filterButtons = document.querySelectorAll(".filter-button");
const courses = document.querySelectorAll(".course-list li");

filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
        const filter = button.dataset.filter;

        filterButtons.forEach((item) => {
            const isActive = item === button;
            item.classList.toggle("active", isActive);
            item.setAttribute("aria-pressed", String(isActive));
        });

        courses.forEach((course) => {
            course.hidden =
                filter !== "all" && course.dataset.category !== filter;
        });
    });
});