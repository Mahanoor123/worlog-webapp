import {
  auth,
  updateProfile,
  db,
  doc,
  getDoc,
  setDoc,
  onAuthStateChanged,
} from "../js/firebase.config.js";

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


let popupBox = document.querySelector(".error_popup");

const showPopup = (message, type = "info") => {
  let popup = document.createElement("div");
  popup.className = `popup${type}`;
  popup.innerHTML = `
    <div class="popup-content">
      <p>${message}</p>
      <button class="close-popup">OK</button>
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


const loadUserProfile = async (userData) => {

  let userName = document.querySelector(".user_name");
  let userEmail = document.querySelector(".user_email")

  userName.textContent = userData.username || "";
  userEmail.textContent = userData.userEmail || "";

  // Profile image update
  const userPic = document.querySelector(".user_pic");
  if (userData.profileImage) {
    userPic.src = userData.profileImage;
  } else {
    userPic.src = "/public/Assets/images/logos&illustration/blogger1.png";
  }

}


onAuthStateChanged(auth, async (user) => {
  if (user) {   
    console.log("User is logged in:", user);

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


editProfileBtn.addEventListener("click", () => {
  profileForm.style.display = "flex"; 
});


saveProfileBtn.addEventListener("click", async (e) => {
  e.preventDefault();
  const user = auth.currentUser;
  if (!user) return alert("User not found!");

  // Prepare updated data
  const updatedData = {
    bio: bioField.value,
    country: countryField.value,
    gender: genderField.value,
  };

  // Update Firebase Auth Display Name
  await updateProfile(user, { displayName: usernameField.value });

  await setDoc(doc(db, "users", user.uid), updatedData, { merge: true });

  showPopup("Profile updated successfully! ✅");

  loadUserProfile(user);
  profileForm.style.display = "none"; 
});
