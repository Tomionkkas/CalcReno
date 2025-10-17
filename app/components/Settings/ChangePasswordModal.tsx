import React, { useState } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { X, Lock, Eye, EyeOff } from 'lucide-react-native';
import { supabase } from '../../utils/supabase';
import { useAuth } from '../../hooks/useAuth';
import { SuccessModal } from './SuccessModal';

interface ChangePasswordModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function ChangePasswordModal({ visible, onClose, onSuccess }: ChangePasswordModalProps) {
  const { user } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const validatePassword = (password: string) => {
    const minLength = 6;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    
    return {
      isValid: password.length >= minLength,
      minLength: password.length >= minLength,
      hasUpperCase,
      hasLowerCase,
      hasNumbers,
    };
  };

  const handleChangePassword = async () => {
    if (!currentPassword.trim()) {
      Alert.alert('Błąd', 'Wprowadź aktualne hasło');
      return;
    }

    if (!newPassword.trim()) {
      Alert.alert('Błąd', 'Wprowadź nowe hasło');
      return;
    }

    if (!confirmPassword.trim()) {
      Alert.alert('Błąd', 'Potwierdź nowe hasło');
      return;
    }

    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.isValid) {
      Alert.alert('Błąd', 'Hasło musi mieć co najmniej 6 znaków');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Błąd', 'Hasła nie są identyczne');
      return;
    }

    if (currentPassword === newPassword) {
      Alert.alert('Błąd', 'Nowe hasło musi być inne od aktualnego');
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

      // Update password
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) {
        Alert.alert('Błąd', 'Nie udało się zmienić hasło: ' + updateError.message);
        setLoading(false);
        return;
      }

      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setLoading(false);
      setShowSuccessModal(true);

    } catch (error) {
      console.error('Error changing password:', error);
      Alert.alert('Błąd', 'Wystąpił nieoczekiwany błąd');
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setLoading(false);
    onClose();
  };

  const passwordValidation = validatePassword(newPassword);

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
              Zmień hasło
            </Text>
            <TouchableOpacity onPress={handleCancel} style={{ padding: 4 }}>
              <X size={24} color="#B8BCC8" />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <View style={{ padding: 20 }}>
            <Text style={{ color: '#B8BCC8', fontSize: 14, marginBottom: 20, lineHeight: 20 }}>
              Aby zmienić hasło, musisz potwierdzić swoją tożsamość i wprowadzić nowe hasło.
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
                  secureTextEntry={!showCurrentPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity onPress={() => setShowCurrentPassword(!showCurrentPassword)}>
                  {showCurrentPassword ? <EyeOff size={20} color="#6B7280" /> : <Eye size={20} color="#6B7280" />}
                </TouchableOpacity>
              </View>
            </View>

            {/* New Password */}
            <View style={{ marginBottom: 16 }}>
              <Text style={{ color: '#FFFFFF', fontSize: 16, marginBottom: 8 }}>
                Nowe hasło *
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
                  placeholder="Wprowadź nowe hasło"
                  placeholderTextColor="#6B7280"
                  value={newPassword}
                  onChangeText={setNewPassword}
                  secureTextEntry={!showNewPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity onPress={() => setShowNewPassword(!showNewPassword)}>
                  {showNewPassword ? <EyeOff size={20} color="#6B7280" /> : <Eye size={20} color="#6B7280" />}
                </TouchableOpacity>
              </View>
              
              {/* Password strength indicator */}
              {newPassword.length > 0 && (
                <View style={{ marginTop: 8 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                    <View style={{
                      flex: 1,
                      height: 4,
                      backgroundColor: '#374151',
                      borderRadius: 2,
                      marginRight: 8,
                    }}>
                      <View style={{
                        width: `${Math.min(100, (newPassword.length / 6) * 100)}%`,
                        height: '100%',
                        backgroundColor: passwordValidation.isValid ? '#10B981' : '#F59E0B',
                        borderRadius: 2,
                      }} />
                    </View>
                    <Text style={{ color: passwordValidation.isValid ? '#10B981' : '#F59E0B', fontSize: 12 }}>
                      {passwordValidation.isValid ? 'Silne' : 'Słabe'}
                    </Text>
                  </View>
                  <Text style={{ color: '#6B7280', fontSize: 12 }}>
                    Minimum 6 znaków
                  </Text>
                </View>
              )}
            </View>

            {/* Confirm Password */}
            <View style={{ marginBottom: 24 }}>
              <Text style={{ color: '#FFFFFF', fontSize: 16, marginBottom: 8 }}>
                Potwierdź nowe hasło *
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
                  placeholder="Potwierdź nowe hasło"
                  placeholderTextColor="#6B7280"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirmPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                  {showConfirmPassword ? <EyeOff size={20} color="#6B7280" /> : <Eye size={20} color="#6B7280" />}
                </TouchableOpacity>
              </View>
              
              {/* Password match indicator */}
              {confirmPassword.length > 0 && (
                <View style={{ marginTop: 8 }}>
                  <Text style={{ 
                    color: newPassword === confirmPassword ? '#10B981' : '#EF4444', 
                    fontSize: 12 
                  }}>
                    {newPassword === confirmPassword ? 'Hasła są identyczne' : 'Hasła nie są identyczne'}
                  </Text>
                </View>
              )}
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
                onPress={handleChangePassword}
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
                      Zmień hasło
                    </Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </LinearGradient>

      {/* Success Modal */}
      <SuccessModal
        visible={showSuccessModal}
        title="Hasło zmienione"
        message="Twoje hasło zostało pomyślnie zmienione."
        onClose={() => {
          setShowSuccessModal(false);
          onClose();
          onSuccess?.();
        }}
      />
    </Modal>
  );
} 