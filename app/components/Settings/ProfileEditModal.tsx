import React, { useState, useEffect } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { X, User } from 'lucide-react-native';
import { supabase } from '../../utils/supabase';
import { useAuth } from '../../hooks/useAuth';

interface ProfileEditModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function ProfileEditModal({ visible, onClose, onSuccess }: ProfileEditModalProps) {
  const { user, userProfile } = useAuth();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  // Load current profile data when modal opens
  useEffect(() => {
    if (visible && userProfile) {
      setFirstName(userProfile.firstName || '');
      setLastName(userProfile.lastName || '');
      setInitialLoading(false);
    }
  }, [visible, userProfile]);

  const validateName = (name: string) => {
    return name.trim().length >= 2 && name.trim().length <= 50;
  };

  const handleSaveProfile = async () => {
    const trimmedFirstName = firstName.trim();
    const trimmedLastName = lastName.trim();

    if (!validateName(trimmedFirstName)) {
      Alert.alert('Błąd', 'Imię musi mieć od 2 do 50 znaków');
      return;
    }

    if (!validateName(trimmedLastName)) {
      Alert.alert('Błąd', 'Nazwisko musi mieć od 2 do 50 znaków');
      return;
    }

    // Check if anything actually changed
    if (trimmedFirstName === (userProfile?.firstName || '') && 
        trimmedLastName === (userProfile?.lastName || '')) {
      Alert.alert('Informacja', 'Nie wprowadzono żadnych zmian');
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({
          first_name: trimmedFirstName,
          last_name: trimmedLastName,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user?.id || '');

      if (error) {
        console.error('Error updating profile:', error);
        Alert.alert('Błąd', 'Nie udało się zaktualizować profilu: ' + error.message);
        setLoading(false);
        return;
      }

      Alert.alert(
        'Profil zaktualizowany',
        'Twoje dane zostały pomyślnie zaktualizowane.',
        [
          {
            text: 'OK',
            onPress: () => {
              setLoading(false);
              onClose();
              onSuccess?.();
            }
          }
        ]
      );

    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Błąd', 'Wystąpił nieoczekiwany błąd');
      setLoading(false);
    }
  };

  const handleCancel = () => {
    // Reset to original values
    setFirstName(userProfile?.firstName || '');
    setLastName(userProfile?.lastName || '');
    setLoading(false);
    onClose();
  };

  const isFirstNameValid = firstName.length === 0 || validateName(firstName);
  const isLastNameValid = lastName.length === 0 || validateName(lastName);
  const canSave = isFirstNameValid && isLastNameValid && !loading;

  if (initialLoading) {
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
            padding: 40,
            alignItems: 'center',
          }}>
            <ActivityIndicator color="#6C63FF" size="large" />
            <Text style={{ color: '#FFFFFF', fontSize: 16, marginTop: 16 }}>
              Ładowanie profilu...
            </Text>
          </View>
        </LinearGradient>
      </Modal>
    );
  }

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
              Edytuj profil
            </Text>
            <TouchableOpacity onPress={handleCancel} style={{ padding: 4 }}>
              <X size={24} color="#B8BCC8" />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <View style={{ padding: 20 }}>
            <Text style={{ color: '#B8BCC8', fontSize: 14, marginBottom: 20, lineHeight: 20 }}>
              Zaktualizuj swoje dane osobowe. Zmiany będą widoczne w całej aplikacji.
            </Text>

            {/* First Name */}
            <View style={{ marginBottom: 16 }}>
              <Text style={{ color: '#FFFFFF', fontSize: 16, marginBottom: 8 }}>
                Imię *
              </Text>
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: '#2A2D4A',
                borderRadius: 8,
                paddingHorizontal: 12,
                borderWidth: 1,
                borderColor: isFirstNameValid ? '#2A2D4A' : '#EF4444',
              }}>
                <User size={20} color="#6B7280" />
                <TextInput
                  style={{
                    flex: 1,
                    color: 'white',
                    paddingVertical: 12,
                    paddingHorizontal: 12,
                    fontSize: 16,
                  }}
                  placeholder="Wprowadź imię"
                  placeholderTextColor="#6B7280"
                  value={firstName}
                  onChangeText={setFirstName}
                  autoCapitalize="words"
                  maxLength={50}
                />
              </View>
              {!isFirstNameValid && (
                <Text style={{ color: '#EF4444', fontSize: 12, marginTop: 4 }}>
                  Imię musi mieć od 2 do 50 znaków
                </Text>
              )}
            </View>

            {/* Last Name */}
            <View style={{ marginBottom: 24 }}>
              <Text style={{ color: '#FFFFFF', fontSize: 16, marginBottom: 8 }}>
                Nazwisko *
              </Text>
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: '#2A2D4A',
                borderRadius: 8,
                paddingHorizontal: 12,
                borderWidth: 1,
                borderColor: isLastNameValid ? '#2A2D4A' : '#EF4444',
              }}>
                <User size={20} color="#6B7280" />
                <TextInput
                  style={{
                    flex: 1,
                    color: 'white',
                    paddingVertical: 12,
                    paddingHorizontal: 12,
                    fontSize: 16,
                  }}
                  placeholder="Wprowadź nazwisko"
                  placeholderTextColor="#6B7280"
                  value={lastName}
                  onChangeText={setLastName}
                  autoCapitalize="words"
                  maxLength={50}
                />
              </View>
              {!isLastNameValid && (
                <Text style={{ color: '#EF4444', fontSize: 12, marginTop: 4 }}>
                  Nazwisko musi mieć od 2 do 50 znaków
                </Text>
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
                onPress={handleSaveProfile}
                style={{
                  flex: 1,
                  borderRadius: 8,
                  overflow: 'hidden',
                  opacity: canSave ? 1 : 0.5,
                }}
                disabled={!canSave}
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
                      Zapisz
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