import React, { useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  ScrollView,
  Pressable,
  StyleSheet,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  Easing,
} from 'react-native-reanimated';
import { X, Shield, CheckCircle, Info } from 'lucide-react-native';
import { colors } from '../../utils/theme';

interface PrivacyPolicyModalProps {
  visible: boolean;
  onClose: () => void;
}

export function PrivacyPolicyModal({ visible, onClose }: PrivacyPolicyModalProps) {
  const modalOpacity = useSharedValue(0);
  const contentScale = useSharedValue(0.9);
  const contentOpacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      modalOpacity.value = withTiming(1, { duration: 250 });
      contentScale.value = withSpring(1, { damping: 15, stiffness: 150 });
      contentOpacity.value = withTiming(1, { duration: 300 });
    } else {
      modalOpacity.value = withTiming(0, { duration: 200 });
      contentScale.value = withTiming(0.9, { duration: 200 });
      contentOpacity.value = withTiming(0, { duration: 200 });
    }
  }, [visible]);

  const modalAnimatedStyle = useAnimatedStyle(() => ({
    opacity: modalOpacity.value,
  }));

  const contentAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: contentScale.value }],
    opacity: contentOpacity.value,
  }));

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <Animated.View style={[styles.modalBackdrop, modalAnimatedStyle]}>
        <Pressable style={StyleSheet.absoluteFillObject} onPress={onClose} />

        <Animated.View style={[styles.modalContent, contentAnimatedStyle]}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.titleContainer}>
              <Shield size={24} color={colors.renoTimeline.cyan} />
              <Text style={styles.title}>Polityka Prywatności</Text>
            </View>
            <Pressable
              onPress={onClose}
              style={styles.closeButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              accessible
              accessibilityLabel="Zamknij politykę prywatności"
              accessibilityRole="button"
            >
              <X size={24} color="#FFFFFF" />
            </Pressable>
          </View>

          {/* Content */}
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={true}
          >
            {/* Intro */}
            <Text style={styles.intro}>
              CalcReno szanuje Twoją prywatność. Niniejsza polityka wyjaśnia, jakie dane zbieramy, jak je wykorzystujemy i jak je chronimy.
            </Text>

            {/* Section 1 */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>1. Zbierane Dane</Text>
              <Text style={styles.sectionText}>
                Zbieramy następujące kategorie danych:
              </Text>
              <View style={styles.bulletList}>
                <Text style={styles.bulletPoint}>• Adres email (do autoryzacji i komunikacji)</Text>
                <Text style={styles.bulletPoint}>• Imię i nazwisko (opcjonalne, dla personalizacji)</Text>
                <Text style={styles.bulletPoint}>• Dane projektów renowacyjnych (pomieszczenia, materiały, koszty)</Text>
                <Text style={styles.bulletPoint}>• Dane techniczne urządzenia (model, system operacyjny, wersja aplikacji)</Text>
                <Text style={styles.bulletPoint}>• Informacje o użytkowaniu (logi aktywności, błędy aplikacji)</Text>
              </View>
            </View>

            {/* Section 2 */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>2. Cel Zbierania Danych</Text>
              <Text style={styles.sectionText}>
                Wykorzystujemy zebrane dane w następujących celach:
              </Text>
              <View style={styles.bulletList}>
                <Text style={styles.bulletPoint}>• Umożliwienie rejestracji i logowania do aplikacji</Text>
                <Text style={styles.bulletPoint}>• Synchronizacja projektów między urządzeniami</Text>
                <Text style={styles.bulletPoint}>• Integracja z aplikacją RenoTimeline</Text>
                <Text style={styles.bulletPoint}>• Wysyłanie powiadomień o postępach projektów</Text>
                <Text style={styles.bulletPoint}>• Poprawa jakości i funkcjonalności aplikacji</Text>
                <Text style={styles.bulletPoint}>• Identyfikacja i naprawa błędów</Text>
                <Text style={styles.bulletPoint}>• Analiza sposobu użytkowania aplikacji</Text>
              </View>
            </View>

            {/* Section 3 - Security */}
            <View style={[styles.highlightBox, { borderLeftColor: colors.status.success.start }]}>
              <Shield size={20} color={colors.status.success.start} />
              <View style={styles.highlightContent}>
                <Text style={styles.highlightTitle}>3. Bezpieczeństwo Danych</Text>
                <Text style={styles.highlightText}>
                  Stosujemy zaawansowane środki bezpieczeństwa:
                </Text>
                <View style={styles.bulletList}>
                  <Text style={styles.bulletPointSmall}>• Szyfrowanie transmisji danych (TLS/SSL)</Text>
                  <Text style={styles.bulletPointSmall}>• Hasła zabezpieczone algorytmem bcrypt</Text>
                  <Text style={styles.bulletPointSmall}>• Dostęp do danych tylko przez autoryzowane urządzenia</Text>
                  <Text style={styles.bulletPointSmall}>• Regularne kopie zapasowe (backup)</Text>
                  <Text style={styles.bulletPointSmall}>• Monitoring nieautoryzowanego dostępu</Text>
                </View>
              </View>
            </View>

            {/* Section 4 */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>4. Udostępnianie Danych</Text>
              <Text style={[styles.sectionText, { fontWeight: '600', marginBottom: 12 }]}>
                Nie sprzedajemy i nie udostępniamy Twoich danych osobowych stronom trzecim do celów marketingowych.
              </Text>
              <Text style={styles.sectionText}>
                Wyjątki:
              </Text>
              <View style={styles.bulletList}>
                <Text style={styles.bulletPoint}>
                  • <Text style={{ fontWeight: '600' }}>Supabase</Text> - dostawca bazy danych (przechowywanie zaszyfrowanych danych)
                </Text>
                <Text style={styles.bulletPoint}>
                  • <Text style={{ fontWeight: '600' }}>Expo</Text> - platforma do notyfikacji push
                </Text>
                <Text style={styles.bulletPoint}>
                  • Wymagania prawne (na żądanie sądu lub organów ścigania)
                </Text>
              </View>
              <Text style={[styles.sectionText, { marginTop: 12, fontSize: 13, fontStyle: 'italic' }]}>
                Wszyscy partnerzy są zobowiązani do przestrzegania standardów bezpieczeństwa i ochrony danych.
              </Text>
            </View>

            {/* Section 5 */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>5. Twoje Prawa (RODO)</Text>
              <Text style={styles.sectionText}>
                Zgodnie z Rozporządzeniem o Ochronie Danych Osobowych (RODO), przysługują Ci następujące prawa:
              </Text>
              <View style={styles.checkList}>
                <View style={styles.checkItem}>
                  <CheckCircle size={16} color={colors.renoTimeline.cyan} />
                  <Text style={styles.checkText}>Prawo dostępu do swoich danych</Text>
                </View>
                <View style={styles.checkItem}>
                  <CheckCircle size={16} color={colors.renoTimeline.cyan} />
                  <Text style={styles.checkText}>Prawo do poprawiania nieprawidłowych danych</Text>
                </View>
                <View style={styles.checkItem}>
                  <CheckCircle size={16} color={colors.renoTimeline.cyan} />
                  <Text style={styles.checkText}>Prawo do usunięcia konta i wszystkich danych</Text>
                </View>
                <View style={styles.checkItem}>
                  <CheckCircle size={16} color={colors.renoTimeline.cyan} />
                  <Text style={styles.checkText}>Prawo do eksportu danych projektów</Text>
                </View>
                <View style={styles.checkItem}>
                  <CheckCircle size={16} color={colors.renoTimeline.cyan} />
                  <Text style={styles.checkText}>Prawo do ograniczenia przetwarzania</Text>
                </View>
                <View style={styles.checkItem}>
                  <CheckCircle size={16} color={colors.renoTimeline.cyan} />
                  <Text style={styles.checkText}>Prawo do przenoszenia danych</Text>
                </View>
              </View>
              <Text style={[styles.sectionText, { marginTop: 12 }]}>
                Aby skorzystać z tych praw, skontaktuj się z nami pod adresem:{' '}
                <Text style={{ color: colors.renoTimeline.cyan, fontWeight: '600' }}>privacy@calcreno.app</Text>
              </Text>
            </View>

            {/* Section 6 */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>6. Pliki Cookie i Lokalne Przechowywanie</Text>
              <Text style={styles.sectionText}>
                CalcReno wykorzystuje lokalne przechowywanie danych (AsyncStorage) do:
              </Text>
              <View style={styles.bulletList}>
                <Text style={styles.bulletPoint}>• Zapamiętywania sesji logowania</Text>
                <Text style={styles.bulletPoint}>• Zapisywania preferencji użytkownika (tryb jasny/ciemny, język)</Text>
                <Text style={styles.bulletPoint}>• Cache'owania danych offline (dostęp bez internetu)</Text>
                <Text style={styles.bulletPoint}>• Przechowywania projektów w trybie gościa</Text>
              </View>
              <Text style={[styles.sectionText, { marginTop: 12 }]}>
                Możesz wyczyścić dane lokalne, usuwając aplikację z urządzenia.
              </Text>
            </View>

            {/* Section 7 */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>7. Dane Dzieci</Text>
              <Text style={styles.sectionText}>
                CalcReno nie jest przeznaczony dla osób poniżej 16. roku życia. Nie zbieramy świadomie danych osobowych dzieci. Jeśli dowiesz się, że dziecko podało nam swoje dane, skontaktuj się z nami, a usuniemy te informacje.
              </Text>
            </View>

            {/* Section 8 */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>8. Zmiany w Polityce Prywatności</Text>
              <Text style={styles.sectionText}>
                Zastrzegamy sobie prawo do aktualizacji niniejszej polityki prywatności. O istotnych zmianach poinformujemy Cię przez:
              </Text>
              <View style={styles.bulletList}>
                <Text style={styles.bulletPoint}>• Powiadomienie push w aplikacji</Text>
                <Text style={styles.bulletPoint}>• Email na zarejestrowany adres</Text>
                <Text style={styles.bulletPoint}>• Komunikat przy następnym logowaniu</Text>
              </View>
            </View>

            {/* Section 9 */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>9. Retencja Danych</Text>
              <Text style={styles.sectionText}>
                Przechowujemy Twoje dane tak długo, jak długo Twoje konto jest aktywne lub według potrzeb wynikających z przepisów prawa. Po usunięciu konta:
              </Text>
              <View style={styles.bulletList}>
                <Text style={styles.bulletPoint}>• Dane osobowe zostaną usunięte w ciągu 30 dni</Text>
                <Text style={styles.bulletPoint}>• Dane projektów zostaną nieodwracalnie usunięte</Text>
                <Text style={styles.bulletPoint}>• Logi systemowe będą przechowywane maksymalnie 90 dni</Text>
              </View>
            </View>

            {/* Section 10 */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>10. Kontakt</Text>
              <Text style={styles.sectionText}>
                Pytania dotyczące prywatności i ochrony danych:
              </Text>
              <Text style={[styles.sectionText, { marginTop: 8, color: colors.renoTimeline.cyan, fontWeight: '600' }]}>
                privacy@calcreno.app
              </Text>
              <Text style={[styles.sectionText, { marginTop: 12 }]}>
                Ogólne pytania i wsparcie techniczne:
              </Text>
              <Text style={[styles.sectionText, { marginTop: 8, color: colors.renoTimeline.cyan, fontWeight: '600' }]}>
                support@calcreno.app
              </Text>
            </View>

            {/* GDPR Compliance */}
            <View style={[styles.highlightBox, { borderLeftColor: colors.renoTimeline.purple }]}>
              <Shield size={20} color={colors.renoTimeline.purple} />
              <View style={styles.highlightContent}>
                <Text style={styles.highlightTitle}>Zgodność z RODO</Text>
                <Text style={styles.highlightText}>
                  CalcReno jest w pełni zgodny z Rozporządzeniem o Ochronie Danych Osobowych (RODO). Twoje dane są przetwarzane zgodnie z przepisami UE dotyczącymi ochrony danych osobowych.
                </Text>
              </View>
            </View>

            {/* Info Box */}
            <View style={styles.infoBox}>
              <Info size={18} color={colors.renoTimeline.cyan} />
              <Text style={styles.infoText}>
                Niniejsza polityka prywatności może ulec zmianie. Zalecamy regularne sprawdzanie tej sekcji, aby być na bieżąco z praktykami ochrony danych.
              </Text>
            </View>

            {/* Footer */}
            <Text style={styles.footer}>
              Ostatnia aktualizacja: 29 grudnia 2025
            </Text>
            <Text style={[styles.footer, { marginTop: 4 }]}>
              Wersja: 1.0
            </Text>
          </ScrollView>

          {/* Close Button */}
          <Pressable
            style={styles.acceptButton}
            onPress={onClose}
            accessible
            accessibilityLabel="Rozumiem politykę prywatności"
            accessibilityRole="button"
          >
            <LinearGradient
              colors={['#3B82F6', '#A855F7', '#EC4899']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.buttonGradient}
            >
              <Text style={styles.acceptButtonText}>Rozumiem</Text>
            </LinearGradient>
          </Pressable>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(10, 11, 30, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 600,
    height: '85%',
    backgroundColor: '#1E2139',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(93, 213, 213, 0.2)',
    shadowColor: '#5DD5D5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 20,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(93, 213, 213, 0.1)',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  closeButton: {
    padding: 4,
    zIndex: 10,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
  },
  intro: {
    fontSize: 15,
    color: '#E5E7EB',
    lineHeight: 24,
    marginBottom: 24,
    fontStyle: 'italic',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  sectionText: {
    fontSize: 14,
    color: '#E5E7EB',
    lineHeight: 22,
  },
  bulletList: {
    marginTop: 8,
    marginLeft: 12,
  },
  bulletPoint: {
    fontSize: 14,
    color: '#E5E7EB',
    lineHeight: 24,
  },
  bulletPointSmall: {
    fontSize: 13,
    color: '#E5E7EB',
    lineHeight: 22,
  },
  checkList: {
    marginTop: 12,
  },
  checkItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
    paddingLeft: 8,
  },
  checkText: {
    flex: 1,
    fontSize: 14,
    color: '#E5E7EB',
    lineHeight: 20,
    marginLeft: 10,
  },
  highlightBox: {
    flexDirection: 'row',
    backgroundColor: 'rgba(30, 33, 57, 0.6)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderLeftWidth: 4,
  },
  highlightContent: {
    flex: 1,
    marginLeft: 12,
  },
  highlightTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  highlightText: {
    fontSize: 14,
    color: '#E5E7EB',
    lineHeight: 20,
    marginBottom: 8,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: 'rgba(93, 213, 213, 0.1)',
    borderRadius: 12,
    padding: 14,
    marginTop: 8,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(93, 213, 213, 0.2)',
  },
  infoText: {
    flex: 1,
    marginLeft: 10,
    fontSize: 13,
    color: '#E5E7EB',
    lineHeight: 19,
  },
  footer: {
    fontSize: 12,
    color: colors.text.muted,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  acceptButton: {
    margin: 20,
    marginTop: 0,
    borderRadius: 28,
    overflow: 'hidden',
    shadowColor: '#5DD5D5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  buttonGradient: {
    paddingVertical: 16,
    paddingHorizontal: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  acceptButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
