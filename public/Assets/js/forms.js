import {
  auth,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  sendPasswordResetEmail,
  fetchSignInMethodsForEmail,
  updatePassword,
  db,
  doc,
  setDoc,
  serverTimestamp,
  signInWithEmailAndPassword,
} from "../js/firebase.config.js";

// --------------------------------------- Function for custom popup

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

// --------------------------------------- Function for eye icon

document.querySelector("#eyeIcon")?.addEventListener("click", () => {
  let passwordField = document.querySelector("#userPassword");
  let eyeIcon = document.querySelector("#eyeIcon");

  if (passwordField.type === "password") {
    passwordField.type = "text";
    eyeIcon.classList.remove("fa-eye-slash");
    eyeIcon.classList.add("fa-eye");
  } else {
    passwordField.type = "password";
    eyeIcon.classList.remove("fa-eye");
    eyeIcon.classList.add("fa-eye-slash");
  }
});

/********************************* Signup Form  *************************************/
/********************************* Signup Form  *************************************/
/********************************* Signup Form  *************************************/
/********************************* Signup Form  *************************************/
/********************************* Signup Form  *************************************/

// --------------------------------------- Function for password strength

const checkPasswordRequirements = (password) => {
  document.querySelector("#uppercaseCheck").style.color = /[A-Z]/.test(password)
    ? "green"
    : "red";
  document.querySelector("#lowercaseCheck").style.color = /[a-z]/.test(password)
    ? "green"
    : "red";
  document.querySelector("#numberCheck").style.color = /\d/.test(password)
    ? "green"
    : "red";
  document.querySelector("#specialCharCheck").style.color =
    /[!@#$%^&*()_+]/.test(password) ? "green" : "red";
  document.querySelector("#lengthCheck").style.color =
    password.length >= 8 ? "green" : "red";
};

document.querySelector("#userPassword")?.addEventListener("focus", () => {
  let passwordReq = document.querySelector(".password-requirements");
  if (passwordReq) passwordReq.style.display = "block";
});

document.addEventListener("click", (event) => {
  if (!event.target.closest(".password-container")) {
    let passwordReq = document.querySelector(".password-requirements");
    if (passwordReq) passwordReq.style.display = "none";
  }
});

document.querySelector("#userPassword")?.addEventListener("input", (e) => {
  checkPasswordRequirements(e.target.value);
});

// --------------------------------------- Function for create user via firebase

const userSignup = async (e) => {
  e.preventDefault();

  let usernameField = document.querySelector("#userName");
  let emailField = document.querySelector("#userEmail");
  let passwordField = document.querySelector("#userPassword");
  let confirmPasswordField = document.querySelector("#confirmPassword");
  let confirmError = document.querySelector("#confirmError");

  let username = usernameField.value.trim();
  let userEmail = emailField.value.trim();
  let userPassword = passwordField.value.trim();
  let confirmPassword = confirmPasswordField.value.trim();

  confirmError.textContent = "";

  if (!username || !userEmail || !userPassword || !confirmPassword) {
    showPopup("Please fill in all fields.");
    return;
  }

  if (userPassword !== confirmPassword) {
    confirmError.textContent = "Passwords do not match!";
    return;
  }

  try {
    const currentUser = await createUserWithEmailAndPassword(
      auth,
      userEmail,
      userPassword
    );
    let user = currentUser?.user;

    if (!user) {
      showPopup("User registration failed!", "error");
      return;
    }

    await sendEmailVerification(user);
    showPopup(
      "Please verify your email before logging in. A verification link has been sent to your email."
    );

    // Store user data in Firebase
    await setDoc(doc(db, "users", user.uid), {
      username,
      userEmail,
      timestamp: serverTimestamp(),
    });

    // Store user data in LocalStorage
    localStorage.setItem(
      "currentUser",
      JSON.stringify({
        username,
        email: userEmail,
        uid: user.uid,
        emailVerified: user.emailVerified,
      })
    );

    usernameField.value = "";
    emailField.value = "";
    passwordField.value = "";
    confirmPasswordField.value = "";

    setTimeout(() => {
      window.location.pathname = "../public/Assets/html/login.html";
    }, 2000);
  } catch (error) {
    console.error("Signup Error:", error.message);
    showPopup(`Error: ${error.message}`, "error");
  }
};

document.querySelector(".signup_form")?.addEventListener("submit", userSignup);

/********************************* Login Form  *************************************/
/********************************* Login Form  *************************************/
/********************************* Login Form  *************************************/
/********************************* Login Form  *************************************/
/********************************* Login Form  *************************************/

// --------------------------------------- Function for User Login after Email verification

const userLogin = async (e) => {
  e.preventDefault();

  let userEmail = document.querySelector("#userEmail")?.value.trim();
  let userPassword = document.querySelector("#userPassword")?.value.trim();

  if (!userEmail || !userPassword) {
    showPopup("Please enter both email and password.");
    return;
  }

  try {
    let userCredential = await signInWithEmailAndPassword(
      auth,
      userEmail,
      userPassword
    );
    let user = userCredential?.user;

    if (user) {
      if (user.emailVerified) {
        showPopup("Login Successful");

        setTimeout(() => {
          window.location.pathname = "./index.html";
        }, 2000);
      } else {
        showPopup("Please verify your email before logging in.");
      }
    }
  } catch (error) {
    showPopup("Invalid email or password. Please try again.");
    console.error(error.message);
  }

  // Reset input fields
  document.querySelector("#userEmail").value = "";
  document.querySelector("#userPassword").value = "";
};

document.querySelector(".login_form")?.addEventListener("submit", userLogin);

// --------------------------------------- Function for Google Login

const provider = new GoogleAuthProvider();

provider.setCustomParameters({ prompt: "select_account" });

const _sigInWithGoogle = async () => {
  try {
    await signOut(auth);
    console.log("User signed out before sign-in attempt.");

    const result = await signInWithPopup(auth, provider);
    console.log("User signed in:", result.user);
  } catch (error) {
    console.error("Google Sign-In Error:", error.message);
  }
};

document
  .querySelector("#signinWithGoogle")
  ?.addEventListener("click", _sigInWithGoogle);

// ---------------------------------------------------- Forgot password link

const _fPassword = async () => {
  let userEmail = document.querySelector("#userEmail")?.value.trim();

  if (!userEmail || !userEmail.includes("@") || !userEmail.includes(".")) {
    showPopup("Please enter a valid email.");
    return;
  }

  try {
    await sendPasswordResetEmail(auth, userEmail);

    setTimeout(() => {
      showPopup("Go to your email to reset password.");
    }, 2000);
  } catch (error) {
    console.error("Error:", error.message);
    showPopup("Something went wrong. Please try again.");
  }
};

document
  .querySelector("#forgot_password")
  ?.addEventListener("click", _fPassword);
