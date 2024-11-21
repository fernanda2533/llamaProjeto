import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { auth } from '../components/firebaseConfig'; 

const CreateAccountScreen = ({ onSave }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);  // Estado para controle do carregamento

  const handleSave = () => {
    if (name && email && password) {
      // Validar e-mail com expressão regular
      const emailRegex = /\S+@\S+\.\S+/;
      if (!emailRegex.test(email)) {
        Alert.alert('Erro', 'Por favor, insira um e-mail válido.');
        return;
      }

      // Validar senha mínima (exemplo: pelo menos 6 caracteres)
      if (password.length < 6) {
        Alert.alert('Erro', 'A senha deve ter pelo menos 6 caracteres.');
        return;
      }

      setLoading(true);  // Inicia o carregamento

      // Criando a conta no Firebase
      firebase.auth().createUserWithEmailAndPassword(email, password)
        .then(() => {
          // Exibe sucesso
          Alert.alert('Conta criada com sucesso!', `Nome: ${name}, E-mail: ${email}`);
          onSave(); // Chama a função para salvar e realizar o login
        })
        .catch((error) => {
          // Exibe erro
          Alert.alert('Erro ao criar conta', error.message);
        })
        .finally(() => {
          setLoading(false);  // Finaliza o carregamento
        });
    } else {
      Alert.alert('Erro', 'Por favor, preencha todos os campos.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Criar Conta</Text>
      <TextInput
        style={styles.input}
        placeholder="Nome"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={styles.input}
        placeholder="E-mail"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"  // Tipo de teclado para e-mail
      />
      <TextInput
        style={styles.input}
        placeholder="Senha"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <TouchableOpacity
        style={styles.button}
        onPress={handleSave}
        disabled={loading}  // Desabilita o botão enquanto está carregando
      >
        {loading ? (
          <ActivityIndicator size="small" color="white" />  // Indicador de carregamento
        ) : (
          <Text style={styles.buttonText}>Salvar</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  button: {
    backgroundColor: 'blue',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
  },
});

export default CreateAccountScreen;
