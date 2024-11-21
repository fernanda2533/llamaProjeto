// App.js
import React, { useState } from 'react';
import { SafeAreaView, StyleSheet, Alert } from 'react-native';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase';
import LoginScreen from './components/LoginScreen';
import CreateAccountScreen from './components/CreateAccountScreen';
import ChatLlama from './components/ChatLlama';
import { db, auth } from './components/firebaseConfig';

const App = () => {
  const [isCreatingAccount, setIsCreatingAccount] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [userPassword, setUserPassword] = useState('');

  // Função de login
  const handleLogin = (email, password) => {
    signInWithEmailAndPassword(auth, email, password)
      .then(() => {
        // Usuário logado com sucesso
        setIsLoggedIn(true);
        setUserEmail(email); // Armazena o e-mail do usuário
      })
      .catch((error) => {
        // Tratar erros de login
        Alert.alert('Erro ao fazer login', error.message);
      });
  };

  // Função de criação de conta
  const handleCreateAccount = async (email, password) => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      setIsCreatingAccount(false);
      setIsLoggedIn(true);
      setUserEmail(email); // Armazena o e-mail do usuário
    } catch (error) {
      console.error('Error creating account: ', error.message);
      Alert.alert('Falha ao criar conta', error.message);
    }
  };

  // Função de logout
  const handleLogout = async () => {
    try {
      await signOut(auth); // Realiza o logout
      setIsLoggedIn(false);
      setUserEmail(''); // Limpa o e-mail armazenado
      setUserPassword(''); // Limpa a senha armazenada
    } catch (error) {
      console.error('Erro ao fazer logout: ', error.message);
      Alert.alert('Erro ao fazer logout', error.message);
    }
  };

  // Função para salvar a conta após a criação
  const handleSaveAccount = () => {
    setIsCreatingAccount(false);
    handleLogin(userEmail, userPassword); // Realiza login automaticamente após criar a conta
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {!isLoggedIn ? (
        isCreatingAccount ? (
          <CreateAccountScreen
            onSave={handleSaveAccount}
            onCreateAccount={handleCreateAccount}
            setUserEmail={setUserEmail}
            setUserPassword={setUserPassword}
          />
        ) : (
          <LoginScreen
            onLogin={handleLogin}
            onCreateAccount={() => setIsCreatingAccount(true)}
            setUserEmail={setUserEmail}
            setUserPassword={setUserPassword}
          />
        )
      ) : (
        <ChatLlama onLogout={handleLogout} db={db} email={userEmail} />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
});

export default App;
