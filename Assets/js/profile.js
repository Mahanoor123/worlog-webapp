document.addEventListener("DOMContentLoaded", function () {
    const links = document.querySelectorAll(".tab-link");
    const contents = document.querySelectorAll(".tab-content");

    links.forEach(link => {
        link.addEventListener("click", function () {
            const target = this.getAttribute("data-target");

            links.forEach(l => l.classList.remove("active"));
            this.classList.add("active");

            contents.forEach(content => content.classList.remove("active"));

            document.getElementById(target).classList.add("active");
        });
    });
});
