/********************* Navbar Toggle *********************/

document.addEventListener("DOMContentLoaded", function () {
  const menuToggle = document.querySelector(".menu-toggle");
  const navLinks = document.querySelector(".navbar2");

  menuToggle.addEventListener("click", function () {
    navLinks.classList.toggle("active");
  });

  document.addEventListener("click", function (event) {
    if (
      !menuToggle.contains(event.target) &&
      !navLinks.contains(event.target)
    ) {
      navLinks.classList.remove("active");
    }
  });
});


/********************* Hero Section Slider *********************/

const heroImages = [
  "./public/Assets/images/backgrounds/background.jpg",
  "./public/Assets/images/backgrounds/background3.png",
  "./public/Assets/images/backgrounds/background2.jpg",
  "./public/Assets/images/backgrounds/background3.png",
];

let currentIdx = 0;
let currentImage = document.querySelector(".current_img");

function rightArrow() {
  if (currentIdx === heroImages.length - 1) {
    currentIdx = 0;
  } else {
    currentIdx++;
  }
  currentImage.src = heroImages[currentIdx];
}
function leftArrow() {
  if (currentIdx === 0) {
    currentIdx = heroImages.length - 1;
  } else {
    currentIdx--;
  }
  currentImage.src = heroImages[currentIdx];
}

/********************* Hero Section Button Navigation *********************/

document.querySelector(".write_blog").addEventListener("click", ()=>{
  window.location.replace('./public/Assets/html/add-blog.html')
})

document.querySelector(".explore_btn").addEventListener("click", ()=>{
  window.location.replace('./public/Assets/html/blogs.html')
})


/********************* Cards Section *********************/

document.addEventListener("DOMContentLoaded", function () {
  const cards = document.querySelectorAll(".latest_card");

  cards.forEach((card) => {
    card.addEventListener("click", function () {
      if (!this.classList.contains("active")) {
        cards.forEach((c) => c.classList.remove("active"));
        this.classList.add("active");
      } else {
        if (this.dataset.index === "0") {
          cards.forEach((c) => c.classList.remove("active"));
          cards[0].classList.add("active");
        }
      }
    });
  });
});
