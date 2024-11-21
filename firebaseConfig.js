// firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAlg6VVh_KvSzofl6ZFOO0RVe92N2ZKoyE",
  authDomain: "llama-f392d.firebaseapp.com",
  projectId: "llama-f392d",
  storageBucket: "llama-f392d.firebasestorage.app",
  messagingSenderId: "579693134929",
  appId: "1:579693134929:web:3f3374aeb21c7344346470",
  measurementId: "G-LYGQLRJWEE"
};

// Inicializando o Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Exportando o Firestore e Auth para uso nos componentes
export const auth = firebase.auth(); // Note que você deve garantir que o firebase está importado corretamente

// Função assíncrona para buscar documentos
export const fetchConsultas = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, "consultas"));
    querySnapshot.forEach((doc) => {
      console.log(`${doc.id} => ${doc.data()}`);
    });
  } catch (e) {
    console.error("Error fetching documents: ", e);
  }
};

// Se você precisar adicionar um documento, faça isso em uma função separada
export const addConsulta = async (data) => {
  try {
    const docRef = await addDoc(collection(db, "consultas"), data);
    console.log("Document written with ID: ", docRef.id);
  } catch (e) {
    console.error("Error adding document: ", e);
  }
};

export default firebaseConfig;