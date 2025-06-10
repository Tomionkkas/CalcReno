import React, { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  Alert,
  ScrollView,
  ActivityIndicator,
  Dimensions,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import {
  Cloud,
  Shield,
  Smartphone,
  Calendar,
  Bell,
  Database,
  CheckCircle,
  AlertTriangle,
  ArrowUp,
  Download,
} from 'lucide-react-native';
import { DataMigrationService } from '../utils/migration';
import { useAuth } from '../hooks/useAuth';

const { width, height } = Dimensions.get('window');

interface MigrationScreenProps {
  onComplete: () => void;
  onSkip: () => void;
}

export function MigrationScreen({ onComplete, onSkip }: MigrationScreenProps) {
  const { user } = useAuth();
  const [migrating, setMigrating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [step, setStep] = useState('');
  const [completed, setCompleted] = useState(false);

  const handleMigration = async () => {
    if (!user) {
      Alert.alert('Błąd', 'Musisz być zalogowany aby wykonać migrację');
      return;
    }

    setMigrating(true);
    setProgress(0);
    setStep('Rozpoczynanie migracji...');

    // Create backup first
    const backup = await DataMigrationService.createBackup();
    if (!backup.success) {
      Alert.alert(
        'Błąd',
        'Nie udało się utworzyć kopii zapasowej. Migracja została przerwana.'
      );
      setMigrating(false);
      return;
    }

    const result = await DataMigrationService.migrateToSupabase(
      user.id,
      (step, progress) => {
        setStep(step);
        setProgress(progress);
      }
    );

    setMigrating(false);

    if (result.success) {
      setCompleted(true);
      setStep(`Migracja zakończona! Przeniesiono ${result.migrated} projektów.`);
      setProgress(100);
      
      setTimeout(() => {
        onComplete();
      }, 2000);
    } else {
      Alert.alert(
        'Błąd migracji',
        'Nie udało się ukończyć migracji. Twoje dane lokalnie pozostają bezpieczne. Możesz spróbować ponownie lub kontynuować bez migracji.',
        [
          { text: 'Spróbuj ponownie', onPress: handleMigration },
          { text: 'Kontynuuj bez migracji', onPress: onSkip },
        ]
      );
    }
  };

  const handleSkip = () => {
    Alert.alert(
      'Pomiń migrację',
      'Czy na pewno chcesz pominąć migrację? Twoje projekty pozostaną tylko lokalnie i nie będzie możliwa integracja z RenoTimeline.',
      [
        { text: 'Anuluj', style: 'cancel' },
        { text: 'Pomiń', onPress: onSkip },
      ]
    );
  };

  const benefits = [
    {
      icon: Shield,
      title: 'Bezpieczne przechowywanie',
      description: 'Twoje projekty są szyfrowane i bezpieczne w chmurze'
    },
    {
      icon: Smartphone,
      title: 'Synchronizacja urządzeń',
      description: 'Dostęp do projektów z każdego urządzenia'
    },
    {
      icon: Calendar,
      title: 'Integracja z RenoTimeline',
      description: 'Planowanie projektów i harmonogramów'
    },
    {
      icon: Bell,
      title: 'Inteligentne powiadomienia',
      description: 'Otrzymuj przypomnienia i aktualizacje'
    }
  ];

  return (
    <LinearGradient
      colors={['#0A0B1E', '#151829', '#1E2139']}
      style={{ flex: 1 }}
    >
      <StatusBar style="light" />
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={{ flex: 1, paddingHorizontal: 24 }}>
          {/* Header Section */}
          <View style={{ alignItems: 'center', marginTop: height * 0.08, marginBottom: 40 }}>
            <LinearGradient
              colors={['#6C63FF', '#4DABF7']}
              style={{
                width: 80,
                height: 80,
                borderRadius: 40,
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 20,
                shadowColor: '#6C63FF',
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.3,
                shadowRadius: 16,
                elevation: 8,
              }}
            >
              <Cloud size={36} color="#FFFFFF" />
            </LinearGradient>
            
            <Text style={{ 
              fontSize: 28, 
              fontWeight: 'bold', 
              color: '#FFFFFF',
              marginBottom: 8,
              textAlign: 'center'
            }}>
              Migracja do Chmury
            </Text>
            
            <Text style={{ 
              fontSize: 16, 
              color: '#B8BCC8',
              textAlign: 'center',
              lineHeight: 24
            }}>
              Przenieś swoje projekty do chmury aby uzyskać dostęp do
              {'\n'}nowych funkcji
              {'\n'}
              <Text style={{ fontSize: 14, opacity: 0.7 }}>
                Ta opcja będzie dostępna za każdym razem gdy się zalogujesz
              </Text>
            </Text>
          </View>

          {/* Progress Section */}
          {migrating && (
            <View style={{ marginBottom: 32 }}>
              <Text style={{ 
                color: '#FFFFFF', 
                fontSize: 16,
                textAlign: 'center',
                marginBottom: 16,
                fontWeight: '500'
              }}>
                {step}
              </Text>
              
              <View style={{
                backgroundColor: '#1E2139',
                borderRadius: 12,
                padding: 20,
                borderWidth: 1,
                borderColor: '#2A2D4A',
              }}>
                {/* Progress Bar */}
                <View style={{
                  backgroundColor: '#2A2D4A',
                  height: 8,
                  borderRadius: 4,
                  marginBottom: 12,
                  overflow: 'hidden',
                }}>
                  <LinearGradient
                    colors={['#6C63FF', '#4DABF7']}
                    style={{
                      height: '100%',
                      width: `${progress}%`,
                      borderRadius: 4,
                    }}
                  />
                </View>
                
                <View style={{ 
                  flexDirection: 'row', 
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <Text style={{ color: '#B8BCC8', fontSize: 14 }}>
                    Postęp migracji
                  </Text>
                  <Text style={{ 
                    color: '#6C63FF', 
                    fontSize: 16, 
                    fontWeight: '600' 
                  }}>
                    {Math.round(progress)}%
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* Success Message */}
          {completed && (
            <View style={{
              backgroundColor: '#10B981',
              borderRadius: 12,
              padding: 20,
              marginBottom: 32,
              flexDirection: 'row',
              alignItems: 'center',
            }}>
              <CheckCircle size={24} color="#FFFFFF" style={{ marginRight: 12 }} />
              <Text style={{ 
                color: '#FFFFFF', 
                fontSize: 16,
                fontWeight: '500',
                flex: 1
              }}>
                {step}
              </Text>
            </View>
          )}

          {/* Migration Benefits */}
          {!migrating && !completed && (
            <View style={{ marginBottom: 32 }}>
              <Text style={{ 
                color: '#FFFFFF', 
                fontSize: 18, 
                fontWeight: '600',
                marginBottom: 20,
                textAlign: 'center'
              }}>
                Co zyskasz po migracji?
              </Text>
              
              <View style={{ gap: 16 }}>
                {benefits.map((benefit, index) => {
                  const IconComponent = benefit.icon;
                  return (
                    <View key={index} style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      backgroundColor: '#1E2139',
                      padding: 16,
                      borderRadius: 12,
                      borderWidth: 1,
                      borderColor: '#2A2D4A',
                    }}>
                      <View style={{
                        width: 40,
                        height: 40,
                        borderRadius: 20,
                        backgroundColor: '#6C63FF20',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginRight: 12,
                      }}>
                        <IconComponent size={20} color="#6C63FF" />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={{ 
                          color: '#FFFFFF', 
                          fontSize: 14, 
                          fontWeight: '500',
                          marginBottom: 2
                        }}>
                          {benefit.title}
                        </Text>
                        <Text style={{ 
                          color: '#B8BCC8', 
                          fontSize: 12,
                          lineHeight: 16
                        }}>
                          {benefit.description}
                        </Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>
          )}

          {/* Action Buttons */}
          {!completed && (
            <View style={{ marginBottom: 24, gap: 16 }}>
              {/* Main Migration Button */}
              <Pressable
                onPress={handleMigration}
                disabled={migrating}
                style={({ pressed }) => [
                  {
                    opacity: pressed ? 0.8 : 1,
                  }
                ]}
              >
                <LinearGradient
                  colors={migrating ? ['#6B7280', '#6B7280'] : ['#6C63FF', '#4DABF7']}
                  style={{
                    height: 56,
                    borderRadius: 12,
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexDirection: 'row',
                    shadowColor: '#6C63FF',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: migrating ? 0 : 0.3,
                    shadowRadius: 8,
                    elevation: migrating ? 0 : 4,
                  }}
                >
                  {migrating ? (
                    <>
                      <ActivityIndicator 
                        color="#FFFFFF" 
                        size="small" 
                        style={{ marginRight: 8 }} 
                      />
                      <Text style={{ 
                        color: '#FFFFFF', 
                        fontSize: 16, 
                        fontWeight: '600' 
                      }}>
                        Migracja w toku...
                      </Text>
                    </>
                  ) : (
                    <>
                      <ArrowUp size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
                      <Text style={{ 
                        color: '#FFFFFF', 
                        fontSize: 16, 
                        fontWeight: '600' 
                      }}>
                        Rozpocznij Migrację
                      </Text>
                    </>
                  )}
                </LinearGradient>
              </Pressable>

              {/* Skip Button */}
              {!migrating && (
                <Pressable
                  onPress={handleSkip}
                  style={({ pressed }) => [
                    {
                      backgroundColor: 'transparent',
                      borderWidth: 2,
                      borderColor: '#2A2D4A',
                      borderRadius: 12,
                      height: 56,
                      alignItems: 'center',
                      justifyContent: 'center',
                      opacity: pressed ? 0.7 : 1,
                    }
                  ]}
                >
                  <Text style={{ 
                    color: '#B8BCC8', 
                    fontSize: 16, 
                    fontWeight: '500' 
                  }}>
                    Pomiń teraz (możesz zrobić to później)
                  </Text>
                </Pressable>
              )}
            </View>
          )}

          {/* Safety Note */}
          {!completed && (
            <View style={{
              backgroundColor: '#F59E0B20',
              borderWidth: 1,
              borderColor: '#F59E0B40',
              borderRadius: 12,
              padding: 16,
              flexDirection: 'row',
              alignItems: 'center',
              marginBottom: 32,
            }}>
              <View style={{
                width: 32,
                height: 32,
                borderRadius: 16,
                backgroundColor: '#F59E0B20',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 12,
              }}>
                <AlertTriangle size={16} color="#F59E0B" />
              </View>
              <Text style={{ 
                color: '#F59E0B', 
                fontSize: 12,
                flex: 1,
                lineHeight: 16
              }}>
                Twoje dane lokalnie pozostają bezpieczne. Migracja tworzy{'\n'}
                automatyczną kopię zapasową przed rozpoczęciem.
              </Text>
            </View>
          )}

          {/* Footer */}
          <View style={{ 
            alignItems: 'center', 
            paddingBottom: 32,
            marginTop: 'auto'
          }}>
            <Text style={{ 
              color: '#6B7280', 
              fontSize: 12,
              textAlign: 'center',
              lineHeight: 16
            }}>
              Migracja jest bezpieczna i odwracalna.{'\n'}
              Twoje lokalne dane pozostają nietknięte.
            </Text>
            
            {/* Debug: Reset Migration Status - Remove in production */}
            {__DEV__ && (
              <Pressable
                onPress={async () => {
                  await DataMigrationService.resetMigrationStatus();
                  Alert.alert('Debug', 'Status migracji został zresetowany');
                }}
                style={{
                  marginTop: 16,
                  padding: 8,
                  backgroundColor: '#FF6B6B20',
                  borderRadius: 8,
                }}
              >
                <Text style={{ color: '#FF6B6B', fontSize: 10 }}>
                  [DEV] Reset Migration Status
                </Text>
              </Pressable>
            )}
          </View>
        </View>
      </ScrollView>
    </LinearGradient>
  );
} 