import {
  auth,
  onAuthStateChanged,
  doc,
  db,
  getDoc,
  signOut,
  collection,
  getDocs,
  query,
  orderBy,
  limit,
  where,
} from "../js/firebase.config.js";

/********************* Navbar Toggle *********************/
/********************* Navbar Toggle *********************/
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

/********************* Utility: Toaster *********************/

function showToast(message, type = "info", options = {}) {
  const {
    duration = 4000,
    position = "center"
  } = options;

  const containerId = `toast-container-${position}`;
  let toastContainer = document.getElementById(containerId);

  if (!toastContainer) {
    toastContainer = document.createElement("div");
    toastContainer.id = containerId;
    toastContainer.className = `toast-container ${position}`;
    document.body.appendChild(toastContainer);
  }

  const toast = document.createElement("div");
  toast.classList.add("toast", `toast-${type}`);
  toast.innerHTML = `
    <span class="toast-icon">${getIcon(type)}</span>
    <span class="toast-message">${message}</span>
    <span class="toast-close" onclick="this.parentElement.remove()">×</span>
    <div class="toast-progress" style="animation-duration:${duration}ms"></div>
  `;

  toastContainer.appendChild(toast);

  setTimeout(() => toast.remove(), duration);
}

function getIcon(type) {
  switch (type) {
    case "success": return "✅";
    case "error": return "❌";
    case "warning": return "⚠️";
    case "info": default: return "ℹ️";
  }
}


/********************* Handling User Authentication & Profile *********************/
/********************* Handling User Authentication & Profile *********************/
/********************* Handling User Authentication & Profile *********************/

const profilePic = document.querySelector(".profile");
const profilePopup = document.querySelector(".profile_popup");
const loginButton = document.querySelector(".login_btn");
const signupButton = document.querySelector(".signup_btn");
const exploreButton = document.querySelector(".explore_btn");
const writeBlogButton = document.querySelectorAll(".write_blog");

onAuthStateChanged(auth, async (user) => {
  if (user) {
    const isVerified = user.emailVerified;
    console.log("User Logged In:", user.uid, "Verified:", isVerified);

    localStorage.setItem("isAuthenticated", "true");
    localStorage.setItem("isEmailVerified", isVerified);
    localStorage.setItem("currentUserId", user.uid);

    if (loginButton) loginButton.style.display = "none";
    if (signupButton) signupButton.style.display = "none";
    if (profilePic) profilePic.style.display = "flex";

    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      const userData = userSnap.data();
      profilePic.src =
        userData.profileImage ||
        "../images/logos&illustration/user.png";

        if (isVerified) {
          showToast(`Welcome back! ${userData.username} to WORLOG.`, "info", {
            duration: 4000
          });
        } else {
          showToast("Please verify your email to unlock full features!", "warning", {
            duration: 5000
          });
        }
    }
    
  } else {
    localStorage.clear();
    if (loginButton) loginButton.style.display = "flex";
    if (signupButton) signupButton.style.display = "flex";
    if (profilePic) profilePic.style.display = "none";
  }
});

const openProfilePopoup = () => {
  profilePopup.style.display = "flex";
};

profilePic.addEventListener("click", (e) => {
  if (!isUserVerified()) {
    showToast("Please verify your email to access your profile.", "warning");
    return;
  }
  e.stopPropagation();
  openProfilePopoup();
});

document.querySelector(".view_profile").addEventListener("click", () => {
  if (!isUserVerified()) {
    showToast("Please verify your email to access your profile.", "warning");
    return;
  };
  window.location.replace("./public/Assets/html/profile.html");
});

document.addEventListener("click", (e) => {
  if (!profilePopup.contains(e.target) && !profilePic.contains(e.target)) {
    profilePopup.style.display = "none";
  }
});

const signOutUser = async () => {
  try {
    const confirmLogout = confirm("Are you sure to logout?");
    if (confirmLogout) {
      await signOut(auth);
      profilePopup.style.display = "none";
      window.location.href = "/";
    }
  } catch (error) {
    console.error("Logout Error:", error.message);
  }
};

document.querySelector(".logOut").addEventListener("click", signOutUser);

/*********************  User Email Verification *********************/

function isUserVerified() {
  return (
    localStorage.getItem("isAuthenticated") === "true" &&
    localStorage.getItem("isEmailVerified") === "true"
  );
}

/*********************  Button Navigation *********************/
/*********************  Button Navigation *********************/
/*********************  Button Navigation *********************/

writeBlogButton.forEach((button) => {
  button.addEventListener("click", () => {
    if (!isUserVerified()) {
      const userConfirmed = confirm(
        "You need to verify your email to write a blog. Go to email inbox and confirm verification link. Want to resend verification email?"
      );

      if (auth.currentUser && userConfirmed) {
        sendEmailVerification(auth.currentUser)
          .then(() => {
            showToast("Verification email resent. Check your inbox!", "info");
          })
          .catch((err) => {
            showToast("Error resending email.", "error");
          });
      }

      return;
    }

    window.location.href = "./public/Assets/html/add-blog.html";
   /*  onAuthStateChanged(auth, async (user) => {
      if (user) {
        console.log("User is authenticated:", user);
        window.location.href = "./public/Assets/html/add-blog.html";
      } else {
        const userConfirmed = confirm(
          "You need to be registered to write a blog. Do you want to sign up?"
        );
        if (userConfirmed) {
          window.location.href = "./public/Assets/html/signup.html";
        }
      }
    }); */
  });
});

loginButton.addEventListener("click", () => {
  window.location.replace("./public/Assets/html/login.html");
});

signupButton.addEventListener("click", () => {
  window.location.replace("./public/Assets/html/signup.html");
});

exploreButton.addEventListener("click", () => {
  window.location.replace("./public/Assets/html/blogs.html");
});

/********************* Utility: Loader *********************/
const showModernLoader = () =>
  document.getElementById("modernLoader").classList.remove("hidden");
const hideModernLoader = () =>
  document.getElementById("modernLoader").classList.add("hidden");


/********************* Hero Section Slider *********************/
/********************* Hero Section Slider *********************/
/********************* Hero Section Slider *********************/

const heroImages = [
  "/public/Assets/images/backgrounds/background.jpg",
  "/public/Assets/images/backgrounds/background3.png",
  "/public/Assets/images/backgrounds/background2.jpg",
  "/public/Assets/images/backgrounds/background3.png",
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
document.querySelector(".left_carousel").addEventListener("click", leftArrow);
document.querySelector(".right_carousel").addEventListener("click", rightArrow);

/********************* Format date *********************/

const formatDate = (timestamp) => {
  if (!timestamp) return "Unknown Date";

  const date = timestamp.toDate();
  const options = { day: "2-digit", month: "short", year: "numeric" };
  return date.toLocaleDateString("en-US", options);
};

/********************* HTML Element *********************/

const latestContainer = document.querySelector(".latest_container");
const categoryLinks = document.querySelectorAll(".categorySelect");
const searchInput = document.getElementById("searchInput");

/********************* Category Selection *********************/
/********************* Category Selection *********************/
/********************* Category Selection *********************/

const getBlogsByCategory = async (category) => {
  const q = query(
    collection(db, "blogs"),
    where("category", "==", category),
    orderBy("createdAt", "desc"),
    limit(10)
  );
  const querySnapshot = await getDocs(q);

  const blogs = querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));

  if (blogs.length === 0) {
    latestContainer.innerHTML = "<p>No blogs found in this category.</p>";
  }

  return blogs;
};

/********************* Category Filtering *********************/

categoryLinks.forEach((link) => {
  link.addEventListener("click", async (e) => {
    e.preventDefault();

    categoryLinks.forEach((l) => l.classList.remove("active-tab"));
    link.classList.add("active-tab");

    const category = link.innerText.trim();

    let blogs = [];

    if (category === "All") {
      blogs = await fetchLatestBlogs();
    } else {
      blogs = await getBlogsByCategory(category);
    }

    displayBlogs(blogs);
  });
});

/********************* Search Functionality *********************/

let currentDisplayedBlogs = [];

searchInput.addEventListener("input", (e) => {
  const term = e.target.value.trim().toLowerCase();

  const filteredBlogs = currentDisplayedBlogs.filter(
    (blog) =>
      blog.title?.toLowerCase().includes(term) ||
      blog.summary?.toLowerCase().includes(term)
  );

  displayBlogs(filteredBlogs);
});

/********************* Feed data in cards *********************/
/********************* Feed data in cards *********************/
/********************* Feed data in cards *********************/

const fetchLatestBlogs = async () => {
  try {
    showModernLoader();
    const blogsRef = collection(db, "blogs");
    const q = query(blogsRef, orderBy("createdAt", "desc"), limit(12));
    const querySnapshot = await getDocs(q);

    const blogs = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    hideModernLoader();
    showToast("Welcome to WorLog, Login to get premium features", "info", {
      duration: 3000
    });
    return blogs;
  } catch (error) {
    console.error("Error fetching blogs:", error);
    hideModernLoader();
    return [];
  }
};

const displayBlogs = (blogs) => {
  latestContainer.innerHTML = "";

  blogs.forEach((blog, index) => {
    const date = formatDate(blog.createdAt);
    const blogCard = document.createElement("div");
    blogCard.classList.add("latest_card");
    if (index === 0) blogCard.classList.add("active");
    blogCard.setAttribute("data-index", index);

    blogCard.innerHTML = `
        <div class="card_date">
        <p>Posted on:</p>
        <span>${date}</span>
        <span class="cat">${
        blog.category || "Uncategorized"
    }</span>
      </div>
        <div class="card_title">
          ${blog.title.substring(0, 40)}...
        </div>
        <div class="card_desc">
          ${blog.summary.substring(0, 100) || blog.content.substring(0, 100)}...
        </div>
        <div class="card_image">
          <img src="${
            blog.coverImage || "./public/Assets/images/card-imgs/default.png"
          }">
        </div>
        <div class="card_link">
          <div class="blog_info">
            <img class="author-image" src="${blog.author.profileImage}">
            <p class="author-name">${blog.author.name}</p>
          </div>
          <button class="blog_btn" data-id="${blog.id}")">Read full</button>
        </div>
      `;
    latestContainer.appendChild(blogCard);
  });

  addExpandFunctionality();
  attachReadFullEvents();
};

/********************* Card expand functionality *********************/

const addExpandFunctionality = () => {
  const latestCards = document.querySelectorAll(".latest_card");

  latestCards.forEach((card) => {
    card.addEventListener("click", () => {
      latestCards.forEach((c) => c.classList.remove("active"));
      card.classList.add("active");
    });
  });
};

/********************* Read Full Blog Click *********************/

const attachReadFullEvents = () => {
  document.querySelectorAll(".blog_btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const blogId = e.target.getAttribute("data-id");
      console.log(blogId);

      if (blogId) {
        localStorage.setItem("selectedBlogId", blogId);
        window.location.href = "./public/Assets/html/full-blog.html";
      }
    });
  });
};

window.addEventListener("DOMContentLoaded", async () => {
  currentDisplayedBlogs = await fetchLatestBlogs();
  displayBlogs(currentDisplayedBlogs);
});
