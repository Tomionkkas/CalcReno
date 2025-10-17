import React, { useState } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { X, Trash2, AlertTriangle, Download } from 'lucide-react-native';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../utils/supabase';
import { ConfirmationModal } from './ConfirmationModal';

interface DeleteAccountModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function DeleteAccountModal({ visible, onClose, onSuccess }: DeleteAccountModalProps) {
  const { user, userProfile, signOut, session } = useAuth();
  const [confirmationText, setConfirmationText] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [showFinalConfirmation, setShowFinalConfirmation] = useState(false);

  const requiredText = 'USUŃ KONTO';

  const handleExportData = async () => {
    setExporting(true);
    
    try {
      // Get user's projects
      const { data: projects, error: projectsError } = await supabase
        .from('calcreno_projects')
        .select('*')
        .eq('user_id', user?.id || '');

      if (projectsError) {
        Alert.alert('Błąd', 'Nie udało się wyeksportować danych: ' + projectsError.message);
        setExporting(false);
        return;
      }

      // Get user's rooms
      const { data: rooms, error: roomsError } = await supabase
        .from('calcreno_rooms')
        .select('*')
        .in('project_id', projects?.map(p => p.id) || []);

      if (roomsError) {
        Alert.alert('Błąd', 'Nie udało się wyeksportować danych: ' + roomsError.message);
        setExporting(false);
        return;
      }

      // Create export data
      const exportData = {
                 user: {
           email: user?.email,
           firstName: userProfile?.firstName,
           lastName: userProfile?.lastName,
         },
        projects: projects || [],
        rooms: rooms || [],
        exportDate: new Date().toISOString(),
        totalProjects: projects?.length || 0,
        totalRooms: rooms?.length || 0,
      };

      // Convert to JSON string
      const jsonData = JSON.stringify(exportData, null, 2);
      
      // In a real app, you would use expo-sharing to save the file
      // For now, we'll just show the data in an alert
      Alert.alert(
        'Dane wyeksportowane',
        `Wyeksportowano ${exportData.totalProjects} projektów i ${exportData.totalRooms} pomieszczeń.\n\nW prawdziwej aplikacji dane zostałyby zapisane do pliku.`,
        [{ text: 'OK' }]
      );

    } catch (error) {
      console.error('Error exporting data:', error);
      Alert.alert('Błąd', 'Wystąpił błąd podczas eksportowania danych');
    } finally {
      setExporting(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (confirmationText !== requiredText) {
      Alert.alert('Błąd', `Wprowadź dokładnie: ${requiredText}`);
      return;
    }
    if (!password) {
      Alert.alert('Błąd', 'Wprowadź swoje hasło, aby potwierdzić usunięcie konta.');
      return;
    }

    try {
      setLoading(true);
      
      // Refresh the session to get a fresh token
      const { data: { session: freshSession }, error: refreshError } = await supabase.auth.getSession();
      
      if (refreshError || !freshSession?.access_token) {
        Alert.alert('Błąd', 'Sesja wygasła. Zaloguj się ponownie.');
        setLoading(false);
        return;
      }

      // Use RenoTimeline project reference (where user is authenticated)
      const projectRef = 'kralcmyhjvoiywcpntkg';
      
      const response = await fetch(`https://${projectRef}.supabase.co/functions/v1/delete-account`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${freshSession.access_token}`,
        },
        body: JSON.stringify({
          password: password,
          confirmation: confirmationText,
        }),
      });

      const result = await response.json();
      
      if (response.ok && result.success) {
        Alert.alert('Konto usunięte', 'Twoje konto zostało pomyślnie usunięte.', [
          {
            text: 'OK',
            onPress: async () => {
              setLoading(false);
              onClose();
              await signOut();
              onSuccess?.();
            },
          },
        ]);
      } else {
        console.error('Delete account error:', result);
        Alert.alert('Błąd', result.message || 'Nie udało się usunąć konta.');
        setLoading(false);
      }

    } catch (error) {
      console.error('Error deleting account:', error);
      Alert.alert('Błąd', 'Wystąpił nieoczekiwany błąd podczas usuwania konta.');
      setLoading(false);
    }
  };



  const handleCancel = () => {
    setConfirmationText('');
    setPassword('');
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
            <Text style={{ color: '#EF4444', fontSize: 20, fontWeight: '600' }}>
              Usuń konto
            </Text>
            <TouchableOpacity onPress={handleCancel} style={{ padding: 4 }}>
              <X size={24} color="#B8BCC8" />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <ScrollView style={{ padding: 20 }}>
            {/* Warning Icon */}
            <View style={{ alignItems: 'center', marginBottom: 20 }}>
              <View style={{
                backgroundColor: '#EF4444',
                borderRadius: 50,
                padding: 16,
                marginBottom: 12,
              }}>
                <AlertTriangle size={32} color="#FFFFFF" />
              </View>
              <Text style={{ color: '#EF4444', fontSize: 18, fontWeight: '600', textAlign: 'center' }}>
                Uwaga: Operacja nieodwracalna
              </Text>
            </View>

            {/* Warning Text */}
            <View style={{ 
              backgroundColor: '#2A2D4A', 
              borderRadius: 8, 
              padding: 16, 
              marginBottom: 20,
              borderLeftWidth: 4,
              borderLeftColor: '#EF4444',
            }}>
              <Text style={{ color: '#FFFFFF', fontSize: 14, lineHeight: 20, marginBottom: 8 }}>
                Usunięcie konta spowoduje:
              </Text>
              <Text style={{ color: '#B8BCC8', fontSize: 14, lineHeight: 20 }}>
                • Trwałe usunięcie wszystkich projektów{"\n"}
                • Usunięcie wszystkich pomieszczeń{"\n"}
                • Usunięcie wszystkich danych użytkownika{"\n"}
                • Niemożność odzyskania konta
              </Text>
            </View>

            {/* Export Data Option */}
            <View style={{ marginBottom: 20 }}>
              <Text style={{ color: '#FFFFFF', fontSize: 16, marginBottom: 12 }}>
                Eksportuj dane przed usunięciem
              </Text>
              <TouchableOpacity
                onPress={handleExportData}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: '#374151',
                  padding: 12,
                  borderRadius: 8,
                }}
                disabled={exporting}
              >
                <Download size={20} color="#6C63FF" />
                <Text style={{ color: '#FFFFFF', fontSize: 14, marginLeft: 8, flex: 1 }}>
                  {exporting ? 'Eksportowanie...' : 'Eksportuj wszystkie dane'}
                </Text>
                {exporting && <ActivityIndicator color="#6C63FF" size="small" />}
              </TouchableOpacity>
            </View>

            {/* Password Input */}
            <View style={{ marginBottom: 16 }}>
              <Text style={{ color: '#FFFFFF', fontSize: 16, marginBottom: 8 }}>
                Hasło *
              </Text>
              <TextInput
                style={{
                  backgroundColor: '#2A2D4A',
                  color: 'white',
                  padding: 12,
                  borderRadius: 8,
                  fontSize: 16,
                  borderWidth: 1,
                  borderColor: '#2A2D4A',
                }}
                placeholder="Wprowadź swoje hasło"
                placeholderTextColor="#6B7280"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
              />
            </View>

            {/* Confirmation */}
            <View style={{ marginBottom: 24 }}>
              <Text style={{ color: '#FFFFFF', fontSize: 16, marginBottom: 8 }}>
                Potwierdź usunięcie
              </Text>
              <Text style={{ color: '#B8BCC8', fontSize: 14, marginBottom: 12, lineHeight: 20 }}>
                Wprowadź <Text style={{ color: '#EF4444', fontWeight: '600' }}>{requiredText}</Text> aby potwierdzić usunięcie konta:
              </Text>
              <TextInput
                style={{
                  backgroundColor: '#2A2D4A',
                  color: 'white',
                  padding: 12,
                  borderRadius: 8,
                  fontSize: 16,
                  borderWidth: 1,
                  borderColor: confirmationText === requiredText ? '#10B981' : '#EF4444',
                }}
                placeholder={requiredText}
                placeholderTextColor="#6B7280"
                value={confirmationText}
                onChangeText={setConfirmationText}
                autoCapitalize="characters"
              />
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
                onPress={handleDeleteAccount}
                style={{
                  flex: 1,
                  backgroundColor: '#EF4444',
                  paddingVertical: 14,
                  borderRadius: 8,
                  alignItems: 'center',
                  opacity: confirmationText === requiredText && !loading ? 1 : 0.5,
                }}
                disabled={confirmationText !== requiredText || loading}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Trash2 size={20} color="#FFFFFF" />
                    <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '500', marginLeft: 8 }}>
                      Usuń konto
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </LinearGradient>


    </Modal>
  );
} 