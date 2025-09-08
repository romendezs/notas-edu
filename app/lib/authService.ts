import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  onAuthStateChanged,
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  fetchSignInMethodsForEmail,
  linkWithCredential,
  User,
} from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/app/firebase/firebase";

const googleProvider = new GoogleAuthProvider();

/**
 * Register user in Firestore if not exists
 */
async function registerUser(user: User) {
  const userRef = doc(db, "users", user.uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    await setDoc(userRef, {
      email: user.email,
      name: user.displayName || user.email?.split("@")[0],
      role: "student",
      createdAt: serverTimestamp(),
    });
  }
}

/**
 * Sign up with Email/Password
 */
export async function signUpWithEmail(email: string, password: string) {
  try {
    const methods = await fetchSignInMethodsForEmail(auth, email);

    if (methods.includes("google.com")) {
      alert(
        "This email is already registered with Google. Please sign in with Google."
      );
      throw new Error("Cannot sign up with email: Google account exists.");
    }

    const result = await createUserWithEmailAndPassword(auth, email, password);
    await registerUser(result.user);
    return result.user;
  } catch (error: any) {
    console.error("Error during email sign-up:", error.message, error.code);
    throw error;
  }
}

/**
 * Sign in with Email/Password
 */
export async function signInWithEmail(email: string, password: string) {
  try {
    const methods = await fetchSignInMethodsForEmail(auth, email);

    if (methods.includes("google.com") && !methods.includes("password")) {
      alert(
        "This email is already registered with Google. Please sign in with Google first."
      );
      throw new Error("Cannot sign in with email: Google account exists.");
    }

    const result = await signInWithEmailAndPassword(auth, email, password);

    // Link Google provider if it exists
    if (methods.includes("google.com")) {
      try {
        const googleResult = await signInWithPopup(auth, googleProvider);
        await linkWithCredential(result.user, GoogleAuthProvider.credentialFromResult(googleResult)!);
        console.log("Google account linked successfully!");
      } catch (linkError) {
        console.warn("Google linking skipped or failed:", linkError);
      }
    }

    await registerUser(result.user);
    return result.user;
  } catch (error: any) {
    console.error("Error during email sign-in:", error.message, error.code);
    throw error;
  }
}

/**
 * Sign in with Google (Popup)
 * Handles account linking if email already exists with another provider
 */
export async function signInWithGooglePopup() {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    await registerUser(result.user);
    console.log("Signed in successfully!", result.user);
    return result.user;
  } catch (error: any) {
    if (error.code === "auth/account-exists-with-different-credential") {
      const email = error.customData?.email;
      const pendingCred = GoogleAuthProvider.credentialFromError(error);

      if (email && pendingCred) {
        const methods = await fetchSignInMethodsForEmail(auth, email);

        if (methods.includes("password")) {
          const password = prompt(
            "An account with this email already exists. Enter your password to link Google to your account:"
          );
          if (!password) throw new Error("Password required to link account.");

          const emailUserCredential = await signInWithEmailAndPassword(auth, email, password);
          await linkWithCredential(emailUserCredential.user, pendingCred);
          await registerUser(emailUserCredential.user);
          console.log("Google provider linked successfully!");
          return emailUserCredential.user;
        } else if (methods.includes("google.com")) {
          alert("You already have a Google account linked. Try signing in with Google.");
        } else {
          alert(`Your account exists with another provider: ${methods.join(", ")}`);
        }
      }
    } else {
      console.error("Error during Google sign-in:", error.message, error.code);
      throw error;
    }
  }
}

/**
 * Sign in with Google (Redirect)
 */
export async function signInWithGoogleRedirect() {
  try {
    await signInWithRedirect(auth, googleProvider);
  } catch (error: any) {
    console.error("Error during Google redirect sign-in:", error.message, error.code);
    throw error;
  }
}

/**
 * Observe auth state and auto-register user in Firestore
 */
export function observeAuthState(callback: (user: any | null) => void) {
  return onAuthStateChanged(auth, async (user) => {
    if (user) {
      await registerUser(user);
    }
    callback(user);
  });
}

/**
 * Logout
 */
export async function logout() {
  await signOut(auth);
}
