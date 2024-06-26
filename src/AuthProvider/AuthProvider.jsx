import { useEffect, useState } from "react";
import { createContext } from "react";
import useAxiosPublic from "../Hooks/useAxiosPublic";
import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
} from "firebase/auth";
import { auth } from "../Configs/firebase.config";

export const AuthContext = createContext(null);

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const [loading, setLoading] = useState(true);

  const axiosPublic = useAxiosPublic();

  const googleProvider = new GoogleAuthProvider();

  const signUp = (email, password) => {
    setLoading(true);
    return createUserWithEmailAndPassword(auth, email, password);
  };

  const signIn = (email, password) => {
    setLoading(true);
    return signInWithEmailAndPassword(auth, email, password);
  };

  const googleSignIn = () => {
    setLoading(true);
    return signInWithPopup(auth, googleProvider);
  };

  const updateInfo = (name) => {
    setLoading(true);
    return updateProfile(auth.currentUser, {
      displayName: name,
    });
  };

  const logOut = () => {
    setLoading(true);
    return signOut(auth);
  };

  useEffect(() => {
    const unSubscribe = onAuthStateChanged(auth, async (loggedUser) => {
      setUser(loggedUser);
        if (loggedUser) {
          //  get token and store client
          const userInfo = { email: loggedUser.email };
          await axiosPublic.post("/jwt", userInfo).then(async (res) => {
            if (res.data.token) {
              await localStorage.setItem("access-token", res.data.token);
            }
          });
        } else {
          // remove token if stored
          localStorage.removeItem("access-token");
        }
      setLoading(false);
    });
    return () => unSubscribe();
  }, []);

  const values = {
    user,
    loading,
    signUp,
    signIn,
    googleSignIn,
    updateInfo,
    logOut,
  };

  return <AuthContext.Provider value={values}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
