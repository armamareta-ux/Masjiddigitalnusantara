import React, { createContext, useContext, useEffect, useState } from "react";
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "../utils/firebase";

export interface UserProfileData {
  uid: string;
  email: string;
  displayName: string;
  role: "Ketua DKM" | "Sekretaris" | "Bendahara" | "Takmir" | "Khatib / Da'i" | "Admin";
  mosqueName: string;
  createdAt: string;
  updatedAt: string;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfileData | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  register: (
    email: string,
    pass: string,
    displayName: string,
    role: UserProfileData["role"],
    mosqueName: string
  ) => Promise<void>;
  logout: () => Promise<void>;
  updateUserRoleAndMosque: (role: UserProfileData["role"], mosqueName: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          const userDocRef = doc(db, "users", currentUser.uid);
          const docSnap = await getDoc(userDocRef);
          if (docSnap.exists()) {
            setProfile(docSnap.data() as UserProfileData);
          } else {
            // Initial fallback profile if document does not exist yet
            const defaultProfile: UserProfileData = {
              uid: currentUser.uid,
              email: currentUser.email || "",
              displayName: currentUser.displayName || currentUser.email?.split("@")[0] || "Pengurus DKM",
              role: "Takmir",
              mosqueName: "Masjid Digital",
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };
            await setDoc(userDocRef, defaultProfile, { merge: true });
            setProfile(defaultProfile);
          }
        } catch (err) {
          console.error("Error fetching user profile:", err);
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, pass: string) => {
    await signInWithEmailAndPassword(auth, email, pass);
  };

  const register = async (
    email: string,
    pass: string,
    displayName: string,
    role: UserProfileData["role"],
    mosqueName: string
  ) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
    const newUser = userCredential.user;

    if (displayName) {
      await updateProfile(newUser, { displayName });
    }

    const newProfile: UserProfileData = {
      uid: newUser.uid,
      email: newUser.email || email,
      displayName: displayName || email.split("@")[0],
      role: role || "Takmir",
      mosqueName: mosqueName || "Masjid Digital",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const userDocRef = doc(db, "users", newUser.uid);
    await setDoc(userDocRef, newProfile);
    setProfile(newProfile);
  };

  const logout = async () => {
    await signOut(auth);
  };

  const updateUserRoleAndMosque = async (role: UserProfileData["role"], mosqueName: string) => {
    if (!user) return;
    const userDocRef = doc(db, "users", user.uid);
    const updated = {
      role,
      mosqueName,
      updatedAt: new Date().toISOString(),
    };
    await setDoc(userDocRef, updated, { merge: true });
    setProfile((prev) => (prev ? { ...prev, ...updated } : null));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        login,
        register,
        logout,
        updateUserRoleAndMosque,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
