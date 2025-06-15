import {
  AuthError,
  signOut as firebaseSignOut,
  User as FirebaseUser,
  onAuthStateChanged,
  signInWithPopup,
} from "firebase/auth";
import { auth, facebookProvider, googleProvider } from "../config/firebase";
import { authService } from "./auth";

export class FirebaseAuthService {
  private unsubscribe: (() => void) | null = null;

  /**
   * Sign in with Google using Firebase
   */
  async signInWithGoogle(): Promise<{ success: boolean; error?: string }> {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      // Get Firebase ID token
      const idToken = await user.getIdToken();

      // Send to backend for authentication
      const backendResult = await authService.firebaseLogin(idToken);

      if (backendResult.data) {
        return { success: true };
      } else {
        return {
          success: false,
          error: backendResult.error || "Backend authentication failed",
        };
      }
    } catch (error) {
      console.error("Firebase Google login failed:", error);

      // Handle specific Firebase Auth errors
      if (error && typeof error === "object" && "code" in error) {
        const authError = error as AuthError;
        switch (authError.code) {
          case "auth/popup-closed-by-user":
            return { success: false, error: "Sign-in was cancelled" };
          case "auth/popup-blocked":
            return {
              success: false,
              error: "Pop-up was blocked by the browser",
            };
          case "auth/cancelled-popup-request":
            return {
              success: false,
              error: "Another sign-in request is already in progress",
            };
          default:
            return {
              success: false,
              error: "Sign-in failed. Please try again.",
            };
        }
      }

      return { success: false, error: "An unexpected error occurred" };
    }
  }

  /**
   * Sign in with Facebook using Firebase
   */
  async signInWithFacebook(): Promise<{ success: boolean; error?: string }> {
    try {
      const result = await signInWithPopup(auth, facebookProvider);
      const user = result.user;

      // Get Firebase ID token
      const idToken = await user.getIdToken();

      // Send to backend for authentication
      const backendResult = await authService.firebaseLogin(idToken);

      if (backendResult.data) {
        return { success: true };
      } else {
        return {
          success: false,
          error: backendResult.error || "Backend authentication failed",
        };
      }
    } catch (error) {
      console.error("Firebase Facebook login failed:", error);

      // Handle specific Firebase Auth errors
      if (error && typeof error === "object" && "code" in error) {
        const authError = error as AuthError;
        switch (authError.code) {
          case "auth/popup-closed-by-user":
            return { success: false, error: "Sign-in was cancelled" };
          case "auth/popup-blocked":
            return {
              success: false,
              error: "Pop-up was blocked by the browser",
            };
          case "auth/account-exists-with-different-credential":
            return {
              success: false,
              error: "An account already exists with the same email address",
            };
          default:
            return {
              success: false,
              error: "Sign-in failed. Please try again.",
            };
        }
      }

      return { success: false, error: "An unexpected error occurred" };
    }
  }

  /**
   * Sign out from Firebase
   */
  async signOut(): Promise<void> {
    try {
      await firebaseSignOut(auth);
      // Also sign out from backend
      await authService.logout();
    } catch (error) {
      console.error("Firebase sign out failed:", error);
      // Still try to sign out from backend even if Firebase sign out fails
      await authService.logout();
    }
  }

  /**
   * Listen for authentication state changes
   */
  onAuthStateChanged(
    callback: (user: FirebaseUser | null) => void
  ): () => void {
    this.unsubscribe = onAuthStateChanged(auth, callback);
    return this.unsubscribe;
  }

  /**
   * Get current Firebase user
   */
  getCurrentUser(): FirebaseUser | null {
    return auth.currentUser;
  }

  /**
   * Check if user is signed in to Firebase
   */
  isSignedIn(): boolean {
    return !!auth.currentUser;
  }

  /**
   * Get Firebase ID token for current user
   */
  async getIdToken(): Promise<string | null> {
    const user = auth.currentUser;
    if (user) {
      try {
        return await user.getIdToken();
      } catch (error) {
        console.error("Failed to get ID token:", error);
        return null;
      }
    }
    return null;
  }

  /**
   * Refresh the current user's ID token
   */
  async refreshToken(): Promise<string | null> {
    const user = auth.currentUser;
    if (user) {
      try {
        return await user.getIdToken(true); // Force refresh
      } catch (error) {
        console.error("Failed to refresh ID token:", error);
        return null;
      }
    }
    return null;
  }

  /**
   * Clean up listeners
   */
  cleanup(): void {
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }
  }
}

// Export singleton instance
export const firebaseAuthService = new FirebaseAuthService();
