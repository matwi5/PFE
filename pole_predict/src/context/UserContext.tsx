"use client"

import { createContext, useState, useEffect, ReactNode } from "react";
import { auth, db } from "../firebaseConfig"; // Fichier de config Firebase
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

// Le type du contexte utilisateur
interface User {
  uid: string;
  email: string;
  username: string;
  phone: string;
}

interface UserContextProps {
  user: User | null;
  loading: boolean;
}

// Contexte initial
const UserContext = createContext<UserContextProps>({ user: null, loading: true });

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Écoute l'état de l'authentification
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Si l'utilisateur est connecté, récupérer ses données depuis Firestore
        const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data() as User;
          setUser({
            uid: firebaseUser.uid,
            email: userData.email,
            username: userData.username,
            phone: userData.phone,
          });
        }
      } else {
        setUser(null); // Pas d'utilisateur connecté
      }
      setLoading(false);
    });

    // Nettoyage de l'abonnement
    return () => unsubscribe();
  }, []);

  return (
    <UserContext.Provider value={{ user, loading }}>
      {children}
    </UserContext.Provider>
  );
};

export default UserContext;
