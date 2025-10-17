import React, { useState } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { X, Mail, Lock } from 'lucide-react-native';
import { supabase } from '../../utils/supabase';
import { useAuth } from '../../hooks/useAuth';

interface ChangeEmailModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function ChangeEmailModal({ visible, onClose, onSuccess }: ChangeEmailModalProps) {
  const { user } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChangeEmail = async () => {
    if (!currentPassword.trim()) {
      Alert.alert('Błąd', 'Wprowadź aktualne hasło');
      return;
    }

    if (!newEmail.trim()) {
      Alert.alert('Błąd', 'Wprowadź nowy adres email');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      Alert.alert('Błąd', 'Wprowadź poprawny adres email');
      return;
    }

    if (newEmail.toLowerCase() === user?.email?.toLowerCase()) {
      Alert.alert('Błąd', 'Nowy email musi być inny od aktualnego');
      return;
    }

    setLoading(true);

    try {
      // First, verify current password by attempting to sign in
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user?.email || '',
        password: currentPassword,
      });

      if (signInError) {
        Alert.alert('Błąd', 'Nieprawidłowe hasło');
        setLoading(false);
        return;
      }

      // Update email
      const { error: updateError } = await supabase.auth.updateUser({
        email: newEmail,
      });

      if (updateError) {
        if (updateError.message.includes('already registered')) {
          Alert.alert('Błąd', 'Ten adres email jest już używany');
        } else {
          Alert.alert('Błąd', 'Nie udało się zmienić email: ' + updateError.message);
        }
        setLoading(false);
        return;
      }

      Alert.alert(
        'Email zmieniony',
        'Sprawdź nowy adres email i potwierdź zmianę. Zostaniesz wylogowany po potwierdzeniu.',
        [
          {
            text: 'OK',
            onPress: () => {
              setCurrentPassword('');
              setNewEmail('');
              setLoading(false);
              onClose();
              onSuccess?.();
            }
          }
        ]
      );

    } catch (error) {
      console.error('Error changing email:', error);
      Alert.alert('Błąd', 'Wystąpił nieoczekiwany błąd');
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setCurrentPassword('');
    setNewEmail('');
    setLoading(false);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleCancel}
      statusBarTranslucent={true}
    >
      <LinearGradient
        colors={["#0A0B1E", "#151829"]}
        style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
      >
        <View style={{ 
          width: '92%', 
          maxWidth: 400, 
          backgroundColor: '#1E2139', 
          borderRadius: 16, 
          overflow: 'hidden',
          shadowColor: '#000',
          shadowOpacity: 0.3,
          shadowRadius: 20,
          elevation: 10,
        }}>
          {/* Header */}
          <View style={{ 
            flexDirection: 'row', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            padding: 20,
            borderBottomWidth: 1,
            borderBottomColor: '#2A2D4A'
          }}>
            <Text style={{ color: '#FFFFFF', fontSize: 20, fontWeight: '600' }}>
              Zmień email
            </Text>
            <TouchableOpacity onPress={handleCancel} style={{ padding: 4 }}>
              <X size={24} color="#B8BCC8" />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <View style={{ padding: 20 }}>
            <Text style={{ color: '#B8BCC8', fontSize: 14, marginBottom: 20, lineHeight: 20 }}>
              Aby zmienić email, musisz potwierdzić swoją tożsamość i wprowadzić nowy adres email.
            </Text>

            {/* Current Password */}
            <View style={{ marginBottom: 16 }}>
              <Text style={{ color: '#FFFFFF', fontSize: 16, marginBottom: 8 }}>
                Aktualne hasło *
              </Text>
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: '#2A2D4A',
                borderRadius: 8,
                paddingHorizontal: 12,
              }}>
                <Lock size={20} color="#6B7280" />
                <TextInput
                  style={{
                    flex: 1,
                    color: 'white',
                    paddingVertical: 12,
                    paddingHorizontal: 12,
                    fontSize: 16,
                  }}
                  placeholder="Wprowadź aktualne hasło"
                  placeholderTextColor="#6B7280"
                  value={currentPassword}
                  onChangeText={setCurrentPassword}
                  secureTextEntry
                  autoCapitalize="none"
                />
              </View>
            </View>

            {/* New Email */}
            <View style={{ marginBottom: 24 }}>
              <Text style={{ color: '#FFFFFF', fontSize: 16, marginBottom: 8 }}>
                Nowy email *
              </Text>
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: '#2A2D4A',
                borderRadius: 8,
                paddingHorizontal: 12,
              }}>
                <Mail size={20} color="#6B7280" />
                <TextInput
                  style={{
                    flex: 1,
                    color: 'white',
                    paddingVertical: 12,
                    paddingHorizontal: 12,
                    fontSize: 16,
                  }}
                  placeholder="Wprowadź nowy email"
                  placeholderTextColor="#6B7280"
                  value={newEmail}
                  onChangeText={setNewEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </View>
            </View>

            {/* Buttons */}
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <TouchableOpacity
                onPress={handleCancel}
                style={{
                  flex: 1,
                  backgroundColor: '#374151',
                  paddingVertical: 14,
                  borderRadius: 8,
                  alignItems: 'center',
                }}
                disabled={loading}
              >
                <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '500' }}>
                  Anuluj
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleChangeEmail}
                style={{
                  flex: 1,
                  borderRadius: 8,
                  overflow: 'hidden',
                }}
                disabled={loading}
              >
                <LinearGradient
                  colors={["#6C63FF", "#4DABF7"]}
                  style={{
                    paddingVertical: 14,
                    alignItems: 'center',
                    flexDirection: 'row',
                    justifyContent: 'center',
                  }}
                >
                  {loading ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                  ) : (
                    <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '500' }}>
                      Zmień email
                    </Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </LinearGradient>
    </Modal>
  );
} 