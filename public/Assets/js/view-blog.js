import {
  auth,
  onAuthStateChanged,
  doc,
  db,
  collection,
  getDoc,
  getDocs,
  updateDoc,
  signOut,
  deleteDoc,
  arrayUnion,
  arrayRemove,
} from "../js/firebase.config.js";

/********************* Utility: Toaster *********************/

function showToast(message, type = "info", options = {}) {
  const { duration = 4000, position = "center" } = options;

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
    case "success":
      return "✅";
    case "error":
      return "❌";
    case "warning":
      return "⚠️";
    case "info":
    default:
      return "ℹ️";
  }
}

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
    const isVerified = user.emailVerified;

    localStorage.setItem("isAuthenticated", "true");
    localStorage.setItem("isEmailVerified", isVerified);
    localStorage.setItem("currentUserId", user?.uid);

    if (loginButton) loginButton.style.display = "none";
    if (signupButton) signupButton.style.display = "none";
    if (profilePic) profilePic.style.display = "flex";

    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      const userData = userSnap.data();

      localStorage.setItem("currentUserImage", userData?.profileImage);
      localStorage.setItem("currentUserName", userData?.username);

      profilePic.src =
        userData.profileImage || "../images/logos&illustration/blogger1.png";

      if (isVerified) {
        showToast(`Welcome back! ${userData.username} to WORLOG.`, "info", {
          duration: 6000,
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
  }
  window.location.replace("../html/profile.html");
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
    onAuthStateChanged(auth, async (user) => {
      if (!user) {
        const userConfirmed = confirm(
          "You need to be registered to write a blog. Do you want to sign up?"
        );
        if (userConfirmed) {
          window.location.href = "../html/signup.html";
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

    window.location.href = "../html/add-blog.html";
  });
});

loginButton.addEventListener("click", () => {
  window.location.replace("../html/login.html");
});

signupButton.addEventListener("click", () => {
  window.location.replace("../html/signup.html");
});

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

/********************* Utility: GetCurrentUser *********************/

const getCurrentUserId = () => localStorage.getItem("currentUserId");

/********************* Utility: GetBlogId *********************/
const blogId =
  new URLSearchParams(window.location.search).get("id") ||
  localStorage.getItem("selectedBlogId");
if (!blogId) {
  alert("No blog selected!");
  window.location.href = "/";
}

let currentUserId = getCurrentUserId();
let blogData = null;

const fetchFullBlog = async () => {
  showModernLoader();
  try {
    const blogRef = doc(db, "blogs", blogId);
    const blogSnap = await getDoc(blogRef);

    if (!blogSnap.exists()) {
      alert("Blog not found!");
      return;
    }

    blogData = blogSnap.data();
    console.log(blogData);

    displayBlog(blogData);
    hideModernLoader();
  } catch (error) {
    console.error("Error fetching blog:", error.message);
  }
};

const displayBlog = (data) => {
  // Set Formatted date
  const formattedDate = data.createdAt ? formatDate(data.createdAt) : "N/A";

  // Set SEO Title in Browser
  document.title = data.seoTitle || data.title;

  // Ensure additionalImages is an array before mapping
  const additionalImagesHTML =
    Array.isArray(data.additionalImages) && data.additionalImages.length > 0
      ? data.additionalImages.map((imgUrl) => `<img src="${imgUrl}">`).join("")
      : "<p>No additional images.</p>";

  // Tags
  const tagsHTML = data.tags
    ? data.tags.map((tag) => `<span class="blog-tag">-${tag}</span>`).join(" ")
    : "<p>No tags available.</p>";

  // Reading Link
  const readingLinkHTML = data.readingURL
    ? `<div class="reading-link">
       <h3>Further Reading:</h3>
       <a href="${data.readingLink}" target="_blank">Click here to read my blog</a>
     </div>`
    : "";

  document.querySelector(".blog-title").textContent = data.title;
  document.querySelector(".blog_category").textContent = data.category;
  document.querySelector(".author-img").src = data.author.profileImage;
  document.querySelector(".author-name").textContent = data.author.name;
  document.querySelector(".post-time").textContent = formattedDate;
  document.querySelector(".post-read").textContent =
    data.readingTime + " reading";
  document.querySelector(".blog-cover").src = data.coverImage;
  document.querySelector(".blog_summary").textContent = data.summary;
  document.querySelector(".additional_images").innerHTML = additionalImagesHTML;
  document.querySelector(".blog-tags").innerHTML += tagsHTML;
  document.querySelector(".blog-keywords").innerHTML += data.keywords;
  document.querySelector(".blog-reading-link").innerHTML = readingLinkHTML;
  document.querySelector(".blog-content").innerHTML = data.content;
  document.querySelector(".like-count").textContent = data?.likes?.length || "";
  document.querySelector(".comment-count").textContent =
    data?.comments?.length || "";
  document.querySelector(".rating-display").textContent = data?.avgRating || "";
  document.querySelector(".sharing-display").textContent =
    data?.shareCount || "";

  /********************* Delete/Edit blog Function *********************/

  const ellipsisIcon = document.querySelector(".fa-ellipsis-vertical");
  const optionsPopup = document.querySelector(".blog-options-popup");
  const editBlogButton = document.querySelector(".edit-blog-btn");
  const deleteBlogButton = document.querySelector(".delete-blog-btn");

  if (currentUserId === data.author.uid) {
    ellipsisIcon.style.display = "block";
  } else {
    ellipsisIcon.style.display = "none";
  }

  ellipsisIcon.addEventListener("click", () => {
    optionsPopup.classList.toggle("show");
  });

  document.addEventListener("click", (e) => {
    if (!ellipsisIcon.contains(e.target) && !optionsPopup.contains(e.target)) {
      optionsPopup.classList.remove("show");
    }
  });

  const openBlogForm = () => {
    localStorage.setItem("editMode", "true");
    localStorage.setItem("editBlogId", blogId);
    const confirmEdit = confirm("Do you want to edit this blog");
    if (confirmEdit) {
      window.location.href = "../html/add-blog.html";
    }
  };

  const deleteBlog = () => {
    const confirmCode = Math.floor(1000 + Math.random() * 9000);
    const userCode = prompt(
      `To confirm deletion, enter this code: ${confirmCode}`
    );

    if (parseInt(userCode) === confirmCode) {
      deleteDoc(doc(db, "blogs", blogId))
        .then(() => {
          showToast("Your blog has been deleted successfully.");
          window.location.href = "../html/blogs.html";
        })
        .catch((error) => {
          console.error("Error deleting blog:", error);
          showToast("Failed to delete blog. Please try again.");
        });
    } else {
      showToast("Incorrect code. Blog deletion cancelled.");
    }
  };

  editBlogButton.addEventListener("click", openBlogForm);

  deleteBlogButton.addEventListener("click", deleteBlog);
};

/********************* Like Blog Function *********************/
const likeIcon = document.querySelector(".like-icon i");
const bookmarkIcon = document.querySelector(".bookmark-btn i");

const likeBlog = async () => {
  const likeCount = document.querySelector(".like-count");
  const likeIcon = document.querySelector(".like-icon i");

  if (!currentUserId && !isUserVerified()) {
    showToast("You must be login to like blog!");
    return;
  }

  likeIcon.disabled = true;

  try {
    const blogRef = doc(db, "blogs", blogId);
    const blogSnap = await getDoc(blogRef);
    const blogData = blogSnap.data();

    const existingLikes = blogData.likes || [];

    if (existingLikes.includes(currentUserId)) {
      showToast("You've already liked this blog.");
      return;
    }

    const userId = String(currentUserId);
    const updatedLikes = [...existingLikes, userId];

    if (
      Array.isArray(updatedLikes) &&
      updatedLikes.every((item) => typeof item === "string")
    ) {
      await updateDoc(blogRef, { likes: updatedLikes });

      likeCount.textContent = updatedLikes.length;
      likeIcon.classList.add("liked");
      showToast("Thanks for liking 🎉");
    } else {
      throw new Error("Invalid data format for likes.");
    }
  } catch (error) {
    console.error("Error liking the blog:", error);
  } finally {
    likeIcon.disabled = false;
  }
};

likeIcon.addEventListener("click", likeBlog);

/********************* Bookmark Blog Function *********************/

const toggleBookmark = async (blogId, userId) => {
  try {
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      showToast("User not found.");
      return;
    }

    const userData = userSnap.data();
    const currentBookmarks = userData.bookmarks || [];

    let updatedBookmarks;
    let isBookmarked;

    if (currentBookmarks.includes(blogId)) {
      await updateDoc(userRef, {
        bookmarks: arrayRemove(blogId),
      });
      updatedBookmarks = currentBookmarks.filter((id) => id !== blogId);
      isBookmarked = false;
    } else {
      await updateDoc(userRef, {
        bookmarks: arrayUnion(blogId),
      });
      updatedBookmarks = [...currentBookmarks, blogId];
      isBookmarked = true;
      showToast("Blog has been added to your bookmarks!", "success");
    }

    updateBookmarkIcon(isBookmarked);
  } catch (error) {
    console.error("Error toggling bookmark:", error.message);
  }
};

const updateBookmarkIcon = (isBookmarked) => {
  if (isBookmarked) {
    bookmarkIcon.classList.add("bookmarked");
  } else {
    bookmarkIcon.classList.remove("bookmarked");
  }
};

bookmarkIcon.addEventListener("click", () => {
  const userId = localStorage.getItem("currentUserId");
  if (!userId && !isUserVerified()) {
    showToast("Please log in to bookmark.");
    return;
  }
  toggleBookmark(blogId, userId);
});

/********************* Comments Function *********************/

const fetchComments = async () => {
  const blogRef = doc(db, "blogs", blogId);
  const blogSnap = await getDoc(blogRef);

  if (!blogSnap.exists()) {
    alert("Blog not found!");
    return;
  }

  const blogData = blogSnap.data();
  const comments = blogData.comments || [];

  const commentCount = document.querySelector(".comment-count");
  commentCount.textContent = comments.length;

  renderComments(comments);
};

const renderComments = (comments) => {
  const commentsList = document.querySelector(".comments-container");
  commentsList.innerHTML = "";

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const options = { year: "numeric", month: "short", day: "numeric" };
    return date.toLocaleDateString("en-US", options);
  };

  comments.forEach((comment) => {
    const commentElement = document.createElement("div");
    commentElement.classList.add("comment");

    const commentContent = `
                <img src="${comment.userImg}">
                <div class="comment-info">
                <p class="user-name">${comment.userName}</p>
                <p class="user-message">"${comment.text}"</p>
                <p class="timestamp">${formatDate(comment.timestamp)}</p>
                </div>
    `;

    commentElement.innerHTML = commentContent;
    commentsList.appendChild(commentElement);
  });
};

const postComment = async () => {
  const commentInput = document.querySelector(".comment-input");
  const commentText = commentInput.value.trim();
  let userImage = localStorage.getItem("currentUserImage");
  let userName = localStorage.getItem("currentUserName");

  if (!commentText) {
    alert("Please write a comment!");
    return;
  }

  if (!currentUserId) {
    showToast("You must be logged in to comment.", "warning");
    return;
  }

  try {
    const newComment = {
      uid: currentUserId,
      userImg: userImage,
      userName: userName,
      text: commentText,
      timestamp: new Date().toISOString(),
    };

    const blogRef = doc(db, "blogs", blogId);
    await updateDoc(blogRef, {
      comments: arrayUnion(newComment),
    });

    showToast("Thanks for commenting 🎉");

    commentInput.value = "";

    fetchComments();
  } catch (error) {
    console.error("Error posting comment:", error);
    showToast("Failed to post comment. Please try again.", "error");
  }
};

document
  .querySelector(".comment-post-btn")
  .addEventListener("click", postComment);
fetchComments();

/********************* Rating Function *********************/

const stars = document.querySelectorAll(".rating-star i");
const ratingDisplay = document.querySelector(".rating-display");

stars.forEach((star, index) => {
  star.addEventListener("click", async () => {
    if (!currentUserId) {
      showToast("You must be logged in to rate.", "warning");
      return;
    }
    const selectedRating = index + 1;
    const blogRef = doc(db, "blogs", blogId);
    const blogSnap = await getDoc(blogRef);
    const blogData = blogSnap.data();

    let ratings = blogData.ratings || [];

    stars.forEach((s, i) => {
      if (i <= index) {
        s.classList.add("active");
      } else {
        s.classList.remove("active");
      }
    });

    const existingRatingIndex = ratings.findIndex(
      (r) => r.userId === currentUserId
    );

    if (existingRatingIndex !== -1) {
      ratings[existingRatingIndex].value = selectedRating;
    } else {
      ratings.push({ userId: currentUserId, value: selectedRating });
    }

    ratings = ratings.filter((r) => r.value && !isNaN(r.value));

    const total = ratings.reduce((sum, r) => sum + Number(r.value), 0);
    const avgRating = (total / ratings.length).toFixed(1);

    await updateDoc(blogRef, {
      ratings: ratings,
      avgRating: Number(avgRating),
    });

    showToast("Thanks for the rating 🎉");

    updateStarUI(selectedRating);
    ratingDisplay.textContent = avgRating;
  });
});

function updateStarUI(rating) {
  stars.forEach((star, index) => {
    star.style.color = index < rating ? "gold" : "gray";
  });
}

/********************* Sharing Blog Function *********************/

const shareButtons = {
  facebook: document.querySelector(".share-facebook"),
  twitter: document.querySelector(".share-twitter"),
  whatsapp: document.querySelector(".share-whatsapp"),
  linkedin: document.querySelector(".share-linkedin"),
};

const sharingDisplay = document.querySelector(".sharing-display");
const blogRef = doc(db, "blogs", blogId);

const shareBlog = async (platformUrl) => {
  if (!currentUserId) {
    showToast("You must be logged in to share.", "warning");
    return;
  }

  try {
    window.open(platformUrl, "_blank");

    const blogSnap = await getDoc(blogRef);
    const blogData = blogSnap.data();
    const currentShareCount = blogData.shareCount || 0;

    await updateDoc(blogRef, {
      shareCount: currentShareCount + 1,
    });

    sharingDisplay.textContent = currentShareCount + 1;
  } catch (error) {
    console.error("Error sharing the blog:", error);
  }
};

const blogUrl = `${window.location.origin}/full-blog.html?id=${blogId}`;

shareButtons.facebook.addEventListener("click", () =>
  shareBlog(
    `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
      blogUrl
    )}`
  )
);

shareButtons.twitter.addEventListener("click", () =>
  shareBlog(
    `https://twitter.com/intent/tweet?url=${encodeURIComponent(
      blogUrl
    )}&text=Check out this awesome blog!`
  )
);

shareButtons.whatsapp.addEventListener("click", () =>
  shareBlog(
    `https://wa.me/?text=${encodeURIComponent("Check this blog: " + blogUrl)}`
  )
);

shareButtons.linkedin.addEventListener("click", () =>
  shareBlog(
    `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
      blogUrl
    )}`
  )
);

window.addEventListener("DOMContentLoaded", fetchFullBlog);
