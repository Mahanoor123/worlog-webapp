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
} from "../js/firebase.config.js";

/****************************************************/
/*************** Popup Mesage ***************/
/****************************************************/

let popupBox = document.querySelector(".error_popup");

const showPopup = (message, type = "info") => {
  let popup = document.createElement("div");
  popup.className = `popup${type}`;
  popup.innerHTML = `
    <div class="popup-content">
      <p>${message}</p>
    </div>
    `;

  popupBox.appendChild(popup);

  popup.querySelector(".close-popup")?.addEventListener("click", () => {
    popup.remove();
  });

  setTimeout(() => popup.remove(), 5000);
};

/********************* Handling User Authentication & Profile *********************/
/********************* Handling User Authentication & Profile *********************/
/********************* Handling User Authentication & Profile *********************/

const profilePic = document.querySelector(".profile");
const profilePopup = document.querySelector(".profile_popup");
const logOutBtn = document.querySelector(".logOut");

const openProfilePopup = () => {
  profilePopup.style.display = "flex";
};
profilePic.addEventListener("click", openProfilePopup);

document.querySelector(".view_profile").addEventListener("click", () => {
  window.location.replace("/public/Assets/html/profile.html");
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

logOutBtn.addEventListener("click", signOutUser);

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

    showPopup("Blog Cover Image Upload Successfully! ✅");
    console.log("cover Image", data.secure_url);
    return data.secure_url;
  } catch (error) {
    console.error("Error uploading image:", error);
    showPopup("Error uploading image: " + error.message);
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
        showPopup("Blog Images Upload Successfully! ✅");
        console.log("Additional Image", data.secure_url);
      } else {
        showPopup("Failed to upload an image.");
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

onAuthStateChanged(auth, async (user) => {
  let userData = null;

  if (user) {
    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      userData = userSnap.data();

      profilePic.src =
        userData.profileImage || "../images/logos&illustration/user.png";
    }
  }

  if (!user) {
    showPopup("You need to be logged in to write a blog.");
    window.location.href = "/public/Assets/html/login.html";
    return;
  } else {
    showPopup(
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

  const uploadFormData = async (e) => {
    e.preventDefault();
    console.log("button Clicked");

    const blogImageFile = uploadBogCover.files[0];
    const additionalImageFiles = additionalImages.files;

    let coverImageUrl = null;
    let additionalImagesUrls = [];

    if (blogImageFile) {
      coverImageUrl = await uploadToCloudinary(blogImageFile);
    }

    if (additionalImageFiles.length > 0) {
      additionalImagesUrls = await uploadMultipleImages(additionalImageFiles);
    }

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
      alert(
        "Error: Some form elements are missing. Please check your HTML structure."
      );
      return;
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
      createdAt: serverTimestamp(),
      coverImage: coverImageUrl || "",
      additionalImages: additionalImagesUrls,
      author: {
        uid: user.uid,
        name: userData.username || "Unknown",
        profileImage:
          userData.profileImage || "../images/logos&illustration/user.png",
      },
    };

    console.log(blogData);

    try {
      const docRef = await addDoc(collection(db, "blogs"), blogData);
      showPopup("Blog added successfully!");
      window.location.href = "/public/Assets/html/blogs.html";
    } catch (error) {
      console.error("Error adding blog:", error);
      showPopup("Failed to add blog.");
    }
  };

  async function addBlog(blogTitleInput, blogEditor, blogTagsInput) {
    try {
        await addDoc(collection(db, "users", user.uid, "blogs"), {
            title: blogTitleInput.value.trim(),
            content: blogEditor.innerHTML.trim(),
            tags: blogTagsInput.value.split(",").map((tag) => tag.trim()),
            createdAt: serverTimestamp(),
        });
        showPopup("Blog added successfully in profile page!");
    } catch (error) {
        console.error("Error adding blog:", error);
    }
}

  blogForm.addEventListener("submit", uploadFormData);
  blogForm.addEventListener("submit", addBlog);

});



// blogForm.addEventListener("submit", async function (event) {
//   event.preventDefault();

//   const title = document.getElementById("blogTitle").value;
//   const content = document.getElementById("blogContent").value;
//   const tags = document
//     .getElementById("blogTags")
//     .value.split(",")
//     .map((tag) => tag.trim());

//   if (title && content) {
//     try {
//       await addBlog(title, content, tags);
//       document.getElementById("blogMessage").innerText =
//         "Blog posted successfully!";
//       document.getElementById("blogForm").reset(); // Clear form
//       displayBlogs(); // Refresh blogs in "My Blogs" tab
//     } catch (error) {
//       document.getElementById("blogMessage").innerText = "Error posting blog!";
//     }
//   } else {
//     document.getElementById("blogMessage").innerText =
//       "Title and Content are required!";
//   }
// });
