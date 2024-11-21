// Importações das bibliotecas
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, StyleSheet, ImageBackground, Alert } from 'react-native';
import * as Location from 'expo-location';
import { collection, addDoc } from './firebaseConfig'; // Corrigido para addDoc

const API_KEY = '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'; // Mantenha sua chave aqui
const API_URL = 'https://api.groq.com/openai/v1/chat/completions'; // URL da API para a IA

const ChatLlama = ({ onLogout, db }) => {
  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [locationError, setLocationError] = useState(false);

  // Função de inferência simples
  const inferirResposta = (resposta) => {
    const palavrasAprovadas = ["correto", "sim", "completo"];
    const palavrasReprovadas = ["erro", "incorreto", "falho"];

    if (palavrasAprovadas.some(word => resposta.includes(word))) {
      return true;
    }

    if (palavrasReprovadas.some(word => resposta.includes(word))) {
      return false;
    }

    return null;
  };

  // Função para obter a localização
  const getLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      setLocationError(true);
      console.log('Permissão de localização negada');
      Alert.alert('Permissão de Localização', 'A permissão de localização foi negada. Para obter respostas mais precisas, por favor, permita o acesso à localização nas configurações do seu dispositivo.');
      return null; // Retorna null para indicar erro na localização
    }

    let location = await Location.getCurrentPositionAsync({});
    setLocationError(false);  // Resetar erro de localização
    return location.coords;
  };

  // Função para salvar a consulta no Firestore
  const salvarConsulta = async (localizacao, consulta, resposta) => {
    const inferencia = inferirResposta(resposta);
    try {
      // Salvando no Firestore
      await addDoc(collection(db, 'consultas'), {
        localizacao: localizacao,
        consulta: consulta,
        resposta: resposta,
        inferencia: inferencia,
        conferencia: false,
      });
      console.log("Consulta salva com sucesso!");
    } catch (e) {
      console.error("Erro ao salvar consulta: ", e);
    }
  };

  // Função para enviar o prompt
  const sendPrompt = async () => {
    if (!prompt) return;  // Não envia se o prompt estiver vazio

    setLoading(true);
    setMessages(prevMessages => [...prevMessages, { role: 'user', content: prompt }]);

    try {
      const response = await fetch(API_URL, {  // Defina sua API_URL e API_KEY em variáveis seguras
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`,
        },
        body: JSON.stringify({
          messages: [{ role: 'user', content: prompt }],
          model: "llama-3.2-1b-preview",
          temperature: 1,
          max_tokens: 1024,
          top_p: 1,
          stream: false,
          stop: null
        }),
      });

      const data = await response.json();
      const botReply = data.choices[0]?.message?.content || 'Desculpe, não consegui responder.';
      setMessages(prevMessages => [...prevMessages, { role: 'assistant', content: botReply }]);

      // Tenta obter a localização antes de salvar a consulta
      const localizacao = await getLocation();  
      if (localizacao) {
        await salvarConsulta(localizacao, prompt, botReply);  // Salva a consulta no Firestore
      }
    } catch (error) {
      console.error('Erro ao buscar dados da IA:', error);
      setMessages(prevMessages => [...prevMessages, { role: 'assistant', content: 'Erro ao obter resposta da IA.' }]);
    } finally {
      setLoading(false);
      setPrompt('');
    }
  };

  return (
    <ImageBackground 
      source={require('../assets/llamaa.png')} 
      style={styles.background} 
      imageStyle={styles.image}
    >
      <View style={styles.container}>
        <Text style={styles.welcomeText}>Bem-vindo à Aplicação!</Text>
        <TouchableOpacity style={styles.logoutButton} onPress={onLogout}>
          <Text style={styles.buttonText}>Sair</Text>
        </TouchableOpacity>

        {locationError && <Text style={styles.locationError}>Localização não permitida. Ative as permissões.</Text>}
        
        <ScrollView style={styles.scrollView}>
          {messages.map((msg, index) => (
            <Text key={index} style={msg.role === 'user' ? styles.userMessage : styles.botMessage}>
              {msg.role === 'user' ? `Você: ${msg.content}` : `Bot: ${msg.content}`}
            </Text>
          ))}
          {loading && <ActivityIndicator size="small" color="#0000ff" />}
        </ScrollView>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Digite sua pergunta aqui..."
            value={prompt}
            onChangeText={setPrompt}
          />
          <TouchableOpacity style={styles.button} onPress={sendPrompt} disabled={loading}>
            <Text style={styles.buttonText}>Enviar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  image: {
    resizeMode: 'cover',
    opacity: 0.8,
  },
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'flex-end',
  },
  welcomeText: {
    fontSize: 24,
    textAlign: 'center',
    marginBottom: 20,
  },
  logoutButton: {
    backgroundColor: 'red',
    padding: 10,
    borderRadius: 5,
    alignSelf: 'flex-end',
    marginBottom: 10,
  },
  buttonText: {
    color: 'white',
  },
  scrollView: {
    marginBottom: 10,
  },
  locationError: {
    color: 'red',
    textAlign: 'center',
    marginBottom: 10,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderTopWidth: 1,
    borderTopColor: 'gray',
  },
  input: {
    flex: 1,
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginRight: 10,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  userMessage: {
    color: 'black',
    marginVertical: 5,
    fontSize: 16,
  },
  botMessage: {
    color: 'blue',
    marginVertical: 5,
    fontSize: 16,
  },
  button: {
    backgroundColor: 'blue',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
});

export default ChatLlama;
