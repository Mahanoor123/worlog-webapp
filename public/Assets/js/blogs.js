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
  where,
} from "../js/firebase.config.js";

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

/********************* Handling User Authentication & Profile *********************/
/********************* Handling User Authentication & Profile *********************/
/********************* Handling User Authentication & Profile *********************/

const profilePic = document.querySelector(".profile");
const profilePopup = document.querySelector(".profile_popup");
const loginButton = document.querySelector(".login_btn");
const signupButton = document.querySelector(".signup_btn");
const writeBlogButton = document.querySelectorAll(".write_blog");

onAuthStateChanged(auth, async (user) => {
  if (user) {
    console.log("User Logged In", user.uid);

    if (loginButton) loginButton.style.display = "none";
    if (signupButton) signupButton.style.display = "none";
    if (profilePic) profilePic.style.display = "flex";

    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      const userData = userSnap.data();
      profilePic.src =
        userData.profileImage ||
        "/public/Assets/images/logos&illustration/user.png";
    }
  } else {
    if (loginButton) loginButton.style.display = "flex";
    if (signupButton) signupButton.style.display = "flex";
    if (profilePic) profilePic.style.display = "none";
  }
});

const openProfilePopoup = () => {
  profilePopup.style.display = "flex";
};

profilePic.addEventListener("click", (e) => {
  e.stopPropagation();
  openProfilePopoup();
});

document.querySelector(".view_profile").addEventListener("click", () => {
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
      window.location.href = "/index.html";
    }
  } catch (error) {
    console.error("Logout Error:", error.message);
  }
};

document.querySelector(".logOut").addEventListener("click", signOutUser);

/*********************  Button Navigation *********************/
/*********************  Button Navigation *********************/
/*********************  Button Navigation *********************/

writeBlogButton.forEach((button) => {
  button.addEventListener("click", () => {
    onAuthStateChanged(auth, async (user) => {
      if (!user) {
        const userConfirmed = confirm(
          "You need to be registered to write a blog. Do you want to sign up?"
        );
        if (userConfirmed) {
          window.location.href = "./public/Assets/html/signup.html";
        }
      }
    });
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
  });
});

loginButton.addEventListener("click", () => {
  window.location.replace("../html/login.html");
});

signupButton.addEventListener("click", () => {
  window.location.replace("../html/signup.html");
});


/********************* Utility: Loader *********************/
const showModernLoader = () => document.getElementById("modernLoader").classList.remove("hidden");
const hideModernLoader = () => document.getElementById("modernLoader").classList.add("hidden");

/********************* Utility: Format Date *********************/
const formatDate = (timestamp) => {
  if (!timestamp) return "Unknown Date";
  const date = timestamp.toDate();
  return date.toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" });
};

/********************* State & Config *********************/
let currentPage = 1;
const postsPerPage = 12;
let allBlogs = [];
let filteredBlogs = [];

const blogsContainer = document.getElementById("blogs_container");
const paginationContainer = document.getElementById("paginationContainer");
const searchInput = document.getElementById("searchInput");
const categoryLinks = document.querySelectorAll(".categorySelect");

/********************* Fetch All Blogs *********************/
const fetchAllBlogs = async () => {
  showModernLoader();
  const snapshot = await getDocs(collection(db, "blogs"));
  allBlogs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  filteredBlogs = [...allBlogs];
  hideModernLoader();
};

/********************* Display Blogs (with pagination) *********************/
const displayBlogs = () => {
  blogsContainer.innerHTML = "";

  const totalPages = Math.ceil(filteredBlogs.length / postsPerPage);
  const startIndex = (currentPage - 1) * postsPerPage;
  const paginated = filteredBlogs.slice(startIndex, startIndex + postsPerPage);

  if (paginated.length === 0) {
    blogsContainer.innerHTML = "<p>No blogs found.</p>";
    return;
  }

  paginated.forEach((blog) => {
    const date = formatDate(blog.createdAt);
    const card = document.createElement("div");
    card.className = "card";

    card.innerHTML = `
      <div class="card_head">
        <div class="card_date">
          Posted on: <span>${date}</span> - <span class="cat">${blog.category || "Uncategorized"}</span>
        </div>
      </div>
      <div class="card_title">${blog.title?.substring(0, 50) + "...."}</div>
      <div class="card_image">
        <img src="${blog.coverImage || "./public/Assets/images/card-imgs/default.png"}">
      </div>
      <div class="card_desc">
        ${blog.summary?.substring(0, 50) || blog.content?.substring(0, 50)}...
      </div>
      <div class="card_footer">
        <div class="card_info">
          <img src="${blog.author?.profileImage || "./default-profile.png"}" class="blogger">
          <div class="blog_info">
            <h5>${blog.author?.name || "Unknown"}</h5>
            <p>Blogger</p>
          </div>
        </div>
        <div class="card_link">
          <button class="blog_btn" data-id="${blog.id}">Read full</button>
        </div>
      </div>
    `;
    blogsContainer.appendChild(card);
  });

  renderPagination(totalPages);
  attachReadFullEvents();
};

/********************* Render Pagination *********************/
const renderPagination = (totalPages) => {
  paginationContainer.innerHTML = "";

  for (let i = 1; i <= totalPages; i++) {
    const btn = document.createElement("button");
    btn.textContent = i;
    if (i === currentPage) btn.classList.add("active");
    btn.addEventListener("click", () => {
      currentPage = i;
      displayBlogs();
    });
    paginationContainer.appendChild(btn);
  }
};

/********************* Search Functionality *********************/
searchInput.addEventListener("input", (e) => {
  const term = e.target.value.trim().toLowerCase();
  currentPage = 1;

  filteredBlogs = allBlogs.filter((blog) =>
    blog.title?.toLowerCase().includes(term) ||
    blog.summary?.toLowerCase().includes(term)
  );

  displayBlogs();
});

/********************* Category Filtering *********************/
categoryLinks.forEach((link) => {
  link.addEventListener("click", async (e) => {
    e.preventDefault();
    currentPage = 1;

    categoryLinks.forEach((l) => l.classList.remove("active-tab"));
    link.classList.add("active-tab");

    const category = link.innerText.trim();

    if (category === "All") {
      filteredBlogs = [...allBlogs];
    } else {
      filteredBlogs = allBlogs.filter((blog) => blog.category === category);
    }

    displayBlogs();
  });
});

/********************* Read Full Blog Click *********************/
const attachReadFullEvents = () => {
  document.querySelectorAll(".blog_btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const blogId = e.target.getAttribute("data-id");
      if (blogId) {
        localStorage.setItem("selectedBlogId", blogId);
        window.location.href = "../html/full-blog.html";
      }
    });
  });
};

/********************* Init: Load Everything on Page Load *********************/
window.addEventListener("DOMContentLoaded", async () => {
  await fetchAllBlogs();
  displayBlogs();

  categoryLinks.forEach((link) => {
    if (link.innerText.trim() === "All") link.classList.add("active-tab");
  });
});
