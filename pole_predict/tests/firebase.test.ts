// firebase.test.ts
import { auth, db } from "../src/firebaseConfig";
import {
  collection,
  addDoc,
  getDoc,
  doc,
  deleteDoc,
} from "firebase/firestore";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, deleteUser } from "firebase/auth";

let createdUserFirestoreId: string | null = null; // Stocker l'ID de l'utilisateur créé dans Firestore
let createdUserAuth: any = null; // Stocker l'utilisateur créé dans Firebase Auth

describe('Firebase Database Test', () => {
  
  // Ajouter un nouvel utilisateur dans Firestore
  test('Ajouter un nouvel utilisateur dans Firestore', async () => {
    const userRef = await addDoc(collection(db, "users"), {
      username: "testuser",
      email: "testuser@example.com"
    });

    // Stocker l'ID de l'utilisateur pour usage ultérieur
    createdUserFirestoreId = userRef.id;

    // Vérifie que l'utilisateur a été ajouté avec succès
    expect(userRef.id).toBeDefined();
  });

  // Récupérer un utilisateur existant depuis Firestore
  test('Récupérer un utilisateur existant depuis Firestore', async () => {
    if (createdUserFirestoreId) {
      const userDoc = await getDoc(doc(db, "users", createdUserFirestoreId));

      if (userDoc.exists()) {
        const userData = userDoc.data();
        // Vérifie que l'utilisateur a bien un champ "username"
        expect(userData).toHaveProperty("username");
        expect(userData?.username).toBe("testuser");
      } else {
        throw new Error("Utilisateur non trouvé");
      }
    } else {
      throw new Error("L'ID de l'utilisateur créé est null");
    }
  });

  // Créer un nouvel utilisateur avec Firebase Auth
  test('Créer un nouvel utilisateur avec Firebase Auth', async () => {
    const email = "newuser@example.com";
    const password = "securepassword";
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);

    // Stocker l'utilisateur pour suppression ultérieure
    createdUserAuth = userCredential.user;

    // Vérifie que l'utilisateur a été créé avec succès
    expect(userCredential.user).toBeDefined();
  });

  // Connexion d'un utilisateur existant avec Firebase Auth
  test('Connexion d\'un utilisateur existant avec Firebase Auth', async () => {
    const email = "newuser@example.com";
    const password = "securepassword";

    const userCredential = await signInWithEmailAndPassword(auth, email, password);

    // Vérifie que la connexion a réussi
    expect(userCredential.user).toBeDefined();
  });

  // Nettoyage après les tests : supprimer les utilisateurs créés
  afterAll(async () => {
    // Supprimer l'utilisateur créé dans Firestore
    if (createdUserFirestoreId) {
      await deleteDoc(doc(db, "users", createdUserFirestoreId));
      console.log(`Utilisateur Firestore avec l'ID ${createdUserFirestoreId} supprimé.`);
    }

    // Supprimer l'utilisateur créé dans Firebase Auth
    if (createdUserAuth) {
      await deleteUser(createdUserAuth);
      console.log(`Utilisateur Firebase Auth avec l'ID ${createdUserAuth.uid} supprimé.`);
    }
  });
});
