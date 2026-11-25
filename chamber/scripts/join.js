// footer dates
document.querySelector("#current-year").textContent =
    new Date().getFullYear();

document.querySelector("#last-modified").textContent =
    document.lastModified;
// timestamp
const timestamp = document.querySelector("#timestamp");

timestamp.value = new Date().toISOString();
// Open membership dialogs
const membershipLinks = document.querySelectorAll(".membership-link");

membershipLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
        event.preventDefault();

        const modalId = link.getAttribute("href");
        const modal = document.querySelector(modalId);

        modal.showModal();
    });
});
// Close membership dialogs
const closeButtons = document.querySelectorAll(".close-modal");

closeButtons.forEach((button) => {
    button.addEventListener("click", () => {
        button.closest("dialog").close();
    });
});