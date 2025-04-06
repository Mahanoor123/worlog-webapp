import {
  auth,
  updateProfile,
  db,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  onAuthStateChanged,
  signOut,
  updatePassword,
  updateEmail,
  deleteUser,
  collection,
  addDoc,
  reauthenticateWithCredential,
  EmailAuthProvider,
  sendEmailVerification,
  serverTimestamp,
  sendSignInLinkToEmail
} from "../js/firebase.config.js";

/****************************************************/
/*************** Tab active and inactive links ***************/
/****************************************************/

document.addEventListener("DOMContentLoaded", function () {
  const links = document.querySelectorAll(".tab-link");
  const contents = document.querySelectorAll(".tab-content");

  links.forEach((link) => {
    link.addEventListener("click", function () {
      const target = this.getAttribute("data-target");

      links.forEach((l) => l.classList.remove("active"));
      this.classList.add("active");

      contents.forEach((content) => content.classList.remove("active"));

      document.getElementById(target).classList.add("active");
    });
  });
});

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

  setTimeout(() => popup.remove(), 3000);
};

/****************************************************/
/*************** User Profile data ***************/
/****************************************************/

const profileForm = document.querySelector(".profile_form");
const editProfileBtn = document.querySelector(".edit_profile_btn");
const saveProfileBtn = document.querySelector("#saveProfileBtn");

const usernameField = document.getElementById("username");
const emailField = document.getElementById("userEmail");
const bioField = document.getElementById("userBio");
const countryField = document.getElementById("userCountry");
const genderField = document.getElementById("userGender");

/****************************************************/
/*************** Initial User profile display ***************/
/****************************************************/

const loadUserProfile = async (userData) => {
  let userName = document.querySelector(".user_name");
  let userEmail = document.querySelector(".user_email");

  userName.textContent = userData.username || "";
  userEmail.textContent = userData.userEmail || "";

  /** Save field for userupdate ****/
  usernameField.value = userData.username;
  emailField.value = userData.userEmail;

  // Profile image update
  const profileImage = document.getElementById("profileImage");

  if (userData.profileImage) {
    profileImage.src = userData.profileImage;
  } else {
    profileImage.src = "/public/Assets/images/logos&illustration/user.png";
  }
};

/****************************************************/
/********** Upload Image to Cloudinary & Firestore **********/
/****************************************************/

const uploadIcon = document.getElementById("uploadIcon");
const fileInput = document.getElementById("fileInput");
const profileImage = document.getElementById("profileImage");

const uploadImg = async () => {
  fileInput.click();

  fileInput.addEventListener(
    "change",
    async (event) => {
      const file = event.target.files[0];

      if (!file) {
        showPopup("Please select an image first.");
        return;
      }

      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", "user-profile");
      formData.append("cloud_name", "dizomf7uh");

      try {
        const response = await fetch(
          "https://api.cloudinary.com/v1_1/dizomf7uh/image/upload",
          {
            method: "POST",
            body: formData,
          }
        );

        const data = await response.json();
        console.log("Uploaded Image URL:", data.secure_url);

        if (!data.secure_url) {
          throw new Error("Failed to upload image.");
        }

        const user = auth.currentUser;
        if (user) {
          const userRef = doc(db, "users", user.uid);
          await updateDoc(userRef, {
            profileImage: data.secure_url,
          });

          profileImage.src = data.secure_url;
          showPopup("Profile picture updated successfully! ✅");
        } else {
          showPopup("User not found.");
        }
      } catch (error) {
        console.error("Error uploading image:", error);
        showPopup("Error uploading image: " + error.message);
      }
    },
    { once: true }
  );
};

uploadIcon.addEventListener("click", uploadImg);

/****************************************************/
/*************** Check user status for login or not ***************/
/****************************************************/

onAuthStateChanged(auth, async (user) => {
  if (user) {
    showPopup(`Hii ${user.username}! Welcome to your profile`)
    console.log("User is logged in:", user);
    displayUserProfile();

    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      loadUserProfile(userSnap.data());
    } else {
      console.log("User data not found in Firestore.");
    }
  } else {
    console.log("User is logged out.");
    window.location.href = "index.html";
  }
});

/****************************************************/
/*************** Profile update when click on edit button ***************/
/****************************************************/

editProfileBtn.addEventListener("click", async () => {
  const user = auth.currentUser;
  if (!user) return alert("User not found!");

  const userRef = doc(db, "users", user.uid);
  const userSnap = await getDoc(userRef);

  if (userSnap.exists()) {
    const userData = userSnap.data();

    // Fill form fields with existing user data
    usernameField.value = userData.username || "";
    emailField.value = user.email || "";
    bioField.value = userData.bio || "";
    countryField.value = userData.country || "";
    genderField.value = userData.gender || "";
  } else {
    usernameField.value = user.username || "";
    emailField.value = user.email || "";
  }

  profileForm.style.display = "flex";
});

/****************************************************/
/*************** Display data after profile update ***************/
/****************************************************/

const displayUserProfile = async () => {
  const user = auth.currentUser;

  if (!user) {
    console.log("No user is logged in");
    return;
  }

  const userName = document.querySelector(".user_name");
  const userEmail = document.querySelector(".user_email");
  const userCountry = document.querySelector(".user_country");
  const userBio = document.querySelector(".user_bio");
  const userGender = document.querySelector(".user_gender");
  const profileImage = document.getElementById("profileImage");

  try {
    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      const userData = userSnap.data();

      userName.textContent = userData.username || user.displayName || "No Name";
      userEmail.textContent = userData.userEmail || "No Email";

      userCountry.textContent = userData.country || "Your Country";
      userBio.textContent = userData.bio || "Your bio";
      userGender.textContent = userData.gender || "Your gender";

      profileImage.src =
        userData.profileImage ||
        "/public/Assets/images/logos&illustration/user.png";
    } else {
      console.log("No user data found in Firestore.");
    }
  } catch (error) {
    console.error("Error displaying user profile:", error);
  }
};

/****************************************************/
/*************** Save data after profile update ***************/
/****************************************************/

saveProfileBtn.addEventListener("click", async (e) => {
  e.preventDefault();
  const user = auth.currentUser;
  if (!user) return alert("User not found!");

  // Prepare updated data
  const updatedData = {
    username: usernameField.value,
    bio: bioField.value,
    country: countryField.value,
    gender: genderField.value,
  };

  try {
    await updateProfile(user, { username: usernameField.value });

    await setDoc(doc(db, "users", user.uid), updatedData, { merge: true });

    showPopup("Profile updated successfully! ✅");

    profileForm.style.display = "none";
  } catch (error) {
    console.error("Error updating profile:", error);
    showPopup("Failed to update profile. ❌", "error");
  }
});

/****************************************************/
/*************** Logout User Function ***************/
/****************************************************/

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
document.getElementById("logoutUser").addEventListener("click", signOutUser);

/**************************************************************************************************************/
/*********************************** User Setting Functionality ***********************************************/
/**************************************************************************************************************/

const reauthenticateUser = async (currentPassword) => {
  try {
    const user = auth.currentUser;
    if (!user) {
      showPopup("No user is currently logged in.", "error");
      return false;
    }

    const credential = EmailAuthProvider.credential(
      user.email,
      currentPassword
    );
    await reauthenticateWithCredential(user, credential);
    return true;
  } catch (error) {
    console.error("Re-authentication failed:", error.message);
    showPopup("Re-authentication failed: " + error.message, "error");
    return false;
  }
};

/****************************************************/
/*************** Update Password Popup ***************/
/****************************************************/

const currentPasswordInput = document.getElementById("current-password");
const newPasswordInput = document.getElementById("new-password");
const confirmPasswordInput = document.getElementById("confirm-password");

// Updated Password Validation Function
const isValidPassword = (password) => {
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+=[\]{};':"\\|,.<>?/~`-])[A-Za-z\d!@#$%^&*()_+=[\]{};':"\\|,.<>?/~`-]{8,}$/;
  return passwordRegex.test(password);
};

const updateUserPassword = async () => {
  const user = auth.currentUser;
  if (!user) {
    showPopup("No user is currently logged in.", "error");
    return;
  }

  const currentPassword = currentPasswordInput.value.trim();
  const newPassword = newPasswordInput.value.trim();
  const confirmPassword = confirmPasswordInput.value.trim();

  if (!currentPassword || !newPassword || !confirmPassword) {
    showPopup("Please fill in all fields.", "error");
    return;
  }

  if (newPassword !== confirmPassword) {
    showPopup("New passwords do not match!", "error");
    return;
  }

  if (!isValidPassword(newPassword)) {
    showPopup(
      "Password must be at least 8 characters long and include uppercase, lowercase, number, and special character.",
      "error"
    );
    console.log("Invalid password:", newPassword);
    return;
  }

  const reauthenticated = await reauthenticateUser(currentPassword);
  if (!reauthenticated) return;

  try {
    await updatePassword(user, newPassword);
    showPopup("Password updated successfully! ✅", "success");

    currentPasswordInput.value = "";
    newPasswordInput.value = "";
    confirmPasswordInput.value = "";
  } catch (error) {
    console.error("Error updating password:", error.message);
    showPopup("Error updating password: " + error.message, "error");
  }
};

document
  .querySelector("#change_password_btn")
  .addEventListener("click", updateUserPassword);

/*****************************************************************/
/************** Change Email & Update in Firestore ***************/
/*****************************************************************/


const newEmailInput = document.querySelector("#new_email");
const updateEmailBtn = document.querySelector("#update_email_btn");

updateEmailBtn.addEventListener("click", async () => {
  const user = auth.currentUser;
  if (!user) {
    alert("No user is currently logged in.");
    return;
  }

  const newEmail = newEmailInput.value.trim();

  if (!newEmail || !newEmail.includes("@") || !newEmail.includes(".")) {
    alert("Please enter a valid email.");
    return;
  }

  try {
    // Update email in Firebase Authentication
    await updateEmail(user, newEmail);

    // Send email verification link
    await sendEmailVerification(user);

    // Update email in Firestore
    const userRef = doc(db, "users", user.uid);
    await updateDoc(userRef, { email: newEmail, emailVerified: false });

    alert("Email updated! Please verify it via the link sent to your email.");
  } catch (error) {
    console.error("Error updating email:", error.message);
    alert("Error updating email: " + error.message);
  }
});


/*****************************************************************/
/************** Delete User from Firestore ***************/
/*****************************************************************/

const deleteUserAccount = async () => {
  const user = auth.currentUser;

  if (!user) {
    alert("No user is currently logged in.");
    return;
  }

  const confirmDelete = confirm("Are you sure you want to delete your account? This action cannot be undone.");
  if (!confirmDelete) return;

  try {
    await deleteDoc(doc(db, "users", user.uid));
    await deleteUser(user);
    showPopup("Your account has been deleted successfully.");
  } catch (error) {
    console.error("Error deleting account:", error.message);
    showPopup("Error deleting account: " + error.message);
  }
};

document.querySelector(".deleteAccount").addEventListener("click", deleteUserAccount);

