import {
  auth,
  onAuthStateChanged,
  doc,
  db,
  getDoc,
  signOut,
} from "../js/firebase.config.js";

/********************* Handling User Authentication & Profile *********************/
/********************* Handling User Authentication & Profile *********************/
/********************* Handling User Authentication & Profile *********************/

const profilePic = document.querySelector(".profile");
const loginButton = document.querySelector(".login_btn");
const favoriteBtn = document.querySelector(".wishlist");

onAuthStateChanged(auth, async (user) => {
  if (user) {
    console.log("User Logged In", user.uid);

    if (loginButton) loginButton.style.display = "none";
    if (profilePic) profilePic.style.display = "flex";
    if (favoriteBtn) favoriteBtn.style.display = "flex";

    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      const userData = userSnap.data();
      profilePic.src =
        userData.profileImage ||
        "/public/Assets/images/logos&illustration/user.png";
    }
  } else {
    if (loginButton) loginButton.style.display = "block";
    if (profilePic) profilePic.style.display = "none";
    if (favoriteBtn) favoriteBtn.style.display = "none";
  }
});

const openProfilePopoup = () => {
  document.querySelector(".profile_popup").style.display = "flex";
};
profilePic.addEventListener("click", openProfilePopoup);

document.querySelector(".view_profile").addEventListener("click", () => {
  window.location.replace("./public/Assets/html/profile.html");
});

const signOutUser = async () => {
  try {
    const confirmLogout = confirm("Are you sure to logout?");
    if (confirmLogout) {
      await signOut(auth);
      profilePopup.style.display = "none";
    }
  } catch (error) {
    console.error("Logout Error:", error.message);
  }
};

document.querySelector(".logOut").addEventListener("click", signOutUser);

/********************* Utility: Loader *********************/
const showModernLoader = () =>
  document.getElementById("modernLoader").classList.remove("hidden");
const hideModernLoader = () =>
  document.getElementById("modernLoader").classList.add("hidden");

/********************* Utility: Format Date *********************/
const formatDate = (timestamp) => {
  if (!timestamp) return "Unknown Date";
  const date = timestamp.toDate();
  return date.toLocaleDateString("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

/********************* Display blog data  *********************/
/********************* Display blog data  *********************/
/********************* Display blog data  *********************/

const blogContainer = document.querySelector(".blog-container");

const fetchFullBlog = async () => {
  showModernLoader();
  const blogId = localStorage.getItem("selectedBlogId");

  if (!blogId) {
    blogContainer.innerHTML = "<p>Error: Blog not found!</p>";
    return;
  }

  try {
    const blogRef = doc(db, "blogs", blogId);
    const blogSnap = await getDoc(blogRef);

    if (blogSnap.exists()) {
      const blog = blogSnap.data();
      console.log(blog);

      // Set Formatted date
      const formattedDate = blog.createdAt ? formatDate(blog.createdAt) : "N/A";

      // Set SEO Title in Browser
      document.title = blog.seoTitle || blog.title;

      // Ensure additionalImages is an array before mapping
      const additionalImagesHTML =
        Array.isArray(blog.additionalImages) && blog.additionalImages.length > 0
          ? blog.additionalImages
              .map((imgUrl) => `<img src="${imgUrl}">`)
              .join("")
          : "<p>No additional images.</p>";

      // Tags
      const tagsHTML = blog.tags
        ? blog.tags
            .map((tag) => `<span class="blog-tag">-${tag}</span>`)
            .join(" ")
        : "<p>No tags available.</p>";

      // Reading Link
      const readingLinkHTML = blog.readingURL
        ? `<div class="reading-link">
           <h3>Further Reading:</h3>
           <a href="${blog.readingLink}" target="_blank">Click here to read my blog</a>
         </div>`
        : "";

      blogContainer.innerHTML = `
            <div class="blog-top-options">
                <a href="#" class="back"><i class="fa-solid fa-less-than"></i></a>
                <a href="#"><i class="fa-solid fa-list"></i></a>
            </div>
            <header class="blog-header">
                <h1 class="blog-title">${blog.title}<h1>
                <p class="blog_category">(${blog.category})</p>
                <div class="blog-meta">
                    <div class="author_info">
                        <img src="${
                          blog.author.profileImage
                        }" alt="Author" class="author-img">
                        <span class="author-name">${blog.author.name}</span> |
                        <div class="blog_detail">
                            <span class="post-time">Published on ${formattedDate}</span> -
                            <span class="post-read">${
                              blog.readingTime + " read"
                            }</span>
                        </div>
                    </div>
                    <div class="actions">
                        <i class="fas fa-bookmark"></i>
                        <i class="fa-solid fa-star"></i>
                    </div>
                </div>
            </header>   
            <!-- Blog Cover -->
             <div class="blog-cover">
                <img src="${
                  blog.coverImage || "default-image.jpg"
                }" alt="Blog Cover">
            </div>
            <!-- Blog Summary -->
            <div class="blog_summary">
                ${blog.summary || blog.content.substring(0, 100)}...
             </div>
            <!-- Blog Content -->
             <div class="blog-content">
             ${blog.content || blog.content.substring(0, 100)}
            </div>
            <!-- Additional Images -->
            <div class="additional_images">
                ${additionalImagesHTML}
            </div>
            <!-- Tags & Keywords -->
            <div class="blog-tags">
                <h3>Important Tags:</h3>
                ${tagsHTML}
            </div>
            <div class="blog-keywords">
                <h3>Important Keywords:</h3>
                ${blog.keywords}
            </div>
            <!-- Reading Link -->
              ${readingLinkHTML}
       
            <div class="engagement">
                <button class="like-btn"><i class="fa-solid fa-hands-clapping"></i> </button>
                <button class="rate-btn"><i class="fa-solid fa-comment"></i></button>
                <button class="share-btn"><i class="fas fa-share-alt"></i></button>
            </div>
            <div class="comments">
                <h3>Comments</h3>
                <div class="comment-box">
                    <input type="text" placeholder="Write a comment...">
                    <button>Post</button>
                </div>
                <div class="comment">
                    <img src="../images/logos&illustration/blogger1.png" alt="User">
                    <p><strong>Jane Doe</strong>: This article is amazing! Very insightful.</p>
                </div>
            </div>
      `;
    } else {
      blogContainer.innerHTML = "<p>Blog not found.</p>";
    }
    hideModernLoader();
  } catch (error) {
    console.error("Error fetching full blog:", error);
  }
};

fetchFullBlog();

