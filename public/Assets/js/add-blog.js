import {
  auth,
  onAuthStateChanged,
  collection,
  doc,
  db,
  addDoc,
  getDoc,
  signOut,
  serverTimestamp,
  updateDoc,
  setDoc,
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

/********************* Utility: Loader *********************/
const showModernLoader = () =>
  document.getElementById("modernLoader").classList.remove("hidden");
const hideModernLoader = () =>
  document.getElementById("modernLoader").classList.add("hidden");

/********************* Handling User Authentication & Profile *********************/
/********************* Handling User Authentication & Profile *********************/
/********************* Handling User Authentication & Profile *********************/

const profilePic = document.querySelector(".profile");
const profilePopup = document.querySelector(".profile_popup");

onAuthStateChanged(auth, async (user) => {
  if (user) {
      const isVerified = user.emailVerified;
      console.log("User Logged In:", user.uid, "Verified:", isVerified);
  
      localStorage.setItem("isAuthenticated", "true");
      localStorage.setItem("isEmailVerified", isVerified);
      localStorage.setItem("currentUserId", user.uid);
  
      if (profilePic) profilePic.style.display = "flex";
  
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);
  
      if (userSnap.exists()) {
        const userData = userSnap.data();
        profilePic.src =
          userData.profileImage || "../images/logos&illustration/blogger1.png";
      };
    } else {
      localStorage.clear();
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
  window.location.replace("../html/profile.html");
});

document.addEventListener("click", (e) => {
  if (!profilePopup.contains(e.target) && !profilePic.contains(e.target)) {
    profilePopup.style.display = "none";
  }
});

/********************* Sign Out Section *********************/

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
};

/********************* Upload image to cloudinary *********************/
/********************* Upload image to cloudinary *********************/
/********************* Upload image to cloudinary *********************/

const uploadBogCover = document.querySelector("#blogImageInput");
const additionalImages = document.querySelector("#additionalImagesInput");

const uploadToCloudinary = async (file) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", "blog-images");
  formData.append("folder", "blog_images");

  try {
    const response = await fetch(
      "https://api.cloudinary.com/v1_1/dizomf7uh/image/upload",
      { method: "POST", body: formData }
    );

    const data = await response.json();

    if (!data.secure_url) {
      throw new Error("Failed to upload image.");
    }

    return data.secure_url;
  } catch (error) {
    console.error("Error uploading image:", error);
    showToast("Error uploading image: " + error.message);
    return null;
  }
};

uploadBogCover.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (file) {
    uploadToCloudinary(file);
  }
});

const uploadMultipleImages = async (files) => {
  const imageUrls = [];

  for (const file of files) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "blog-images");
    formData.append("folder", "blog_images");

    try {
      const response = await fetch(
        "https://api.cloudinary.com/v1_1/dizomf7uh/image/upload",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      if (data.secure_url) {
        imageUrls.push(data.secure_url);
      } else {
        showToast("Failed to upload an image.");
      }
    } catch (error) {
      console.error("Error uploading image:", error);
    }
  }

  return imageUrls;
};

additionalImages.addEventListener("change", (e) => {
  const files = e.target.files;
  if (files.length > 0) {
    uploadMultipleImages(files);
  }
});

/********************* Blog Form Data *********************/
/********************* Blog Form Data *********************/
/********************* Blog Form Data *********************/

const blogForm = document.querySelector(".blog_form");
const blogEditor = document.getElementById("richTextEditor");
const blogButton = document.querySelector(".primary_btn");
const blogTitleInput = document.querySelector(".blog_title input");
const seoTitleInput = document.querySelector(".blog_seo_title input");
const categorySelect = document.querySelector("#categorySelect");
const blogTagsInput = document.querySelector(".blog_tags input");
const blogSummaryInput = document.querySelector(".blog_summary input");
const readingTimeInput = document.querySelector(
  ".status_controls input:nth-of-type(1)"
);
const readingURLInput = blogForm.querySelector(
  ".status_controls input:nth-of-type(2)"
);
const keywordsInput = blogForm.querySelector(
  ".status_controls input:nth-of-type(3)"
);

onAuthStateChanged(auth, async (user) => {
  showModernLoader();
  let userData = null;

  if (user) {
    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      userData = userSnap.data();

      profilePic.src =
        userData.profileImage || "../images/logos&illustration/blogger1.png";
    }
  }

  hideModernLoader();

  if (!user) {
    showToast("You need to be logged in to write a blog.");
    window.location.href = "../html/login.html";
    return;
  } else {
    showToast(
      `Hiii ${
        userData?.username || "User"
      }, Write with your Full Potential 🎉✨`
    );
  }

  // Get user data from Firestore
  const userRef = doc(db, "users", user.uid);
  const userSnap = await getDoc(userRef);
  userData = userSnap.exists() ? userSnap.data() : {};

  if (!blogForm) {
    console.error("Error: Blog form not found!");
    return;
  }

  blogForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const isEditMode = localStorage.getItem("editMode");
    const editBlogId = localStorage.getItem("editBlogId");

    if (
      !blogTitleInput ||
      !seoTitleInput ||
      !categorySelect ||
      !blogTagsInput ||
      !blogSummaryInput ||
      !readingTimeInput ||
      !readingURLInput ||
      !keywordsInput
    ) {
      console.error("One or more form elements are missing!");
      return;
    }

    const blogImageFile = uploadBogCover.files[0];
    const additionalImageFiles = additionalImages.files;

    let coverImageUrl = null;
    let additionalImagesUrls = [];

    if (blogImageFile) {
      coverImageUrl = await uploadToCloudinary(blogImageFile);
      showToast("Blog Cover Image Upload Successfully! ✅");
    }

    if (additionalImageFiles.length > 0) {
      additionalImagesUrls = await uploadMultipleImages(additionalImageFiles);
      showToast("Blog Cover Image Upload Successfully! ✅");
    }

    const blogData = {
      title: blogTitleInput.value.trim(),
      seoTitle: seoTitleInput.value.trim(),
      category: categorySelect.value,
      tags: blogTagsInput.value.split(",").map((tag) => tag.trim()),
      content: blogEditor.innerHTML.trim(),
      summary: blogSummaryInput.value.trim(),
      readingTime: readingTimeInput.value.trim(),
      readingURL: readingURLInput.value.trim(),
      keywords: keywordsInput.value.trim(),
      coverImage: coverImageUrl || "",
      additionalImages: additionalImagesUrls,
      author: {
        uid: user.uid,
        name: userData.username || "Unknown",
        profileImage:
          userData.profileImage || "../images/logos&illustration/blogger1.png",
      },
    };

    try {
      if (isEditMode && editBlogId) {
        const blogRef = doc(db, "blogs", editBlogId);
        blogData.updatedAt = serverTimestamp();
        await updateDoc(blogRef, blogData);
        showToast("Blog updated successfully!");
      } else {
        blogData.createdAt = serverTimestamp();
        const blogRef = await addDoc(collection(db, "blogs"), blogData);
        await setDoc(doc(db, "users", user.uid, "blogs", blogRef.id), {
          blogId: blogRef.id,
          title: blogData.title,
          coverImageUrl: blogData.coverImage,
          summary: blogData.summary,
          createdAt: serverTimestamp(),
        });
        showToast("Blog added successfully!");
      }

      localStorage.removeItem("editMode");
      localStorage.removeItem("editBlogId");
      window.location.href = "/public/Assets/html/blogs.html";
    } catch (error) {
      console.error("Error saving blog:", error);
      showToast("Failed to save blog.");
    }
  });
});

window.addEventListener("DOMContentLoaded", async () => {
  const isEditMode = localStorage.getItem("editMode");
  const editBlogId = localStorage.getItem("editBlogId");

  if (isEditMode && editBlogId) {
    const blogRef = doc(db, "blogs", editBlogId);
    const blogSnap = await getDoc(blogRef);

    if (blogSnap.exists()) {
      const blogData = blogSnap.data();
      console.log(blogData);

      blogTitleInput.value = blogData.title;
      seoTitleInput.value = blogData.seoTitle;
      categorySelect.value = blogData.category;
      keywordsInput.value = blogData.keywords;
      blogTagsInput.value = blogData.tags;
      blogSummaryInput.value = blogData.summary;
      blogEditor.innerHTML = blogData.content;
      readingTimeInput.value = blogData.readingTime;
      readingURLInput.value = blogData.readingURL;
      uploadBogCover.src = blogData.coverImage;
      additionalImages.innerHTML = blogData.additionalImages;
      blogButton.textContent = "Update Blog";
    }
  }
});
