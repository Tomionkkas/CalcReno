import React from 'react';
import { Pressable, Text, Alert } from 'react-native';
import { useAuth } from '../hooks/useAuth';
import { CalcRenoNotificationHandler } from '../utils/notificationHandler';

export function TestNotificationButton() {
  const { user } = useAuth();

  const createTestNotification = async () => {
    if (!user) {
      Alert.alert('Błąd', 'Musisz być zalogowany aby utworzyć testowe powiadomienie');
      return;
    }

    try {
      await CalcRenoNotificationHandler.createTestNotification(user.id);
      Alert.alert('Sukces', 'Testowe powiadomienie zostało utworzone!');
    } catch (error) {
      console.error('Error creating test notification:', error);
      Alert.alert('Błąd', 'Nie udało się utworzyć testowego powiadomienia');
    }
  };

  if (!user) return null;

  return (
    <Pressable
      onPress={createTestNotification}
      className="bg-blue-500 px-4 py-2 rounded-lg m-2"
    >
      <Text className="text-white text-center font-medium">
        Utwórz testowe powiadomienie
      </Text>
    </Pressable>
  );
} 