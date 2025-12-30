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
import { X, AlertTriangle, Info } from 'lucide-react-native';
import { colors } from '../../utils/theme';

interface TermsOfServiceModalProps {
  visible: boolean;
  onClose: () => void;
}

export function TermsOfServiceModal({ visible, onClose }: TermsOfServiceModalProps) {
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
            <Text style={styles.title}>Warunki Użytkowania</Text>
            <Pressable
              onPress={onClose}
              style={styles.closeButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              accessible
              accessibilityLabel="Zamknij warunki użytkowania"
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
            {/* Beta Warning */}
            <View style={[styles.warningBox, styles.betaWarning]}>
              <AlertTriangle size={20} color="#F59E0B" />
              <View style={styles.warningContent}>
                <Text style={styles.warningTitle}>Wersja Beta</Text>
                <Text style={styles.warningText}>
                  CalcReno jest obecnie w fazie beta. Aplikacja może zawierać błędy i nieoczekiwane zachowania, które mogą wpłynąć na wyniki obliczeń. Używasz jej na własne ryzyko.
                </Text>
              </View>
            </View>

            {/* Calculation Disclaimer */}
            <View style={[styles.warningBox, styles.calculationWarning]}>
              <AlertTriangle size={20} color="#EF4444" />
              <View style={styles.warningContent}>
                <Text style={styles.warningTitle}>Dokładność Obliczeń</Text>
                <Text style={styles.warningText}>
                  Wszystkie kalkulacje materiałów i kosztów renowacji są szacunkowe i służą wyłącznie celom informacyjnym. CalcReno nie gwarantuje 100% dokładności wyników. Użytkownik ponosi odpowiedzialność za weryfikację wszystkich obliczeń przed zakupem materiałów lub rozpoczęciem prac.
                </Text>
                <Text style={[styles.warningText, { marginTop: 8, fontWeight: '600' }]}>
                  Zawsze konsultuj się z profesjonalistami przed podjęciem decyzji budowlanych.
                </Text>
              </View>
            </View>

            {/* Section 1 */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>1. Akceptacja Warunków</Text>
              <Text style={styles.sectionText}>
                Korzystając z aplikacji CalcReno, akceptujesz niniejsze warunki użytkowania. Jeśli nie zgadzasz się z tymi warunkami, nie korzystaj z aplikacji.
              </Text>
            </View>

            {/* Section 2 */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>2. Zakres Aplikacji</Text>
              <Text style={styles.sectionText}>
                CalcReno to narzędzie do planowania i szacowania kosztów projektów remontowych. Aplikacja umożliwia:
              </Text>
              <View style={styles.bulletList}>
                <Text style={styles.bulletPoint}>• Tworzenie projektów remontowych</Text>
                <Text style={styles.bulletPoint}>• Projektowanie układów pomieszczeń</Text>
                <Text style={styles.bulletPoint}>• Kalkulację materiałów budowlanych</Text>
                <Text style={styles.bulletPoint}>• Synchronizację danych między urządzeniami</Text>
                <Text style={styles.bulletPoint}>• Integrację z aplikacją RenoTimeline</Text>
              </View>
            </View>

            {/* Section 3 */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>3. Odpowiedzialność</Text>
              <Text style={styles.sectionText}>
                CalcReno i jego twórcy nie ponoszą odpowiedzialności za:
              </Text>
              <View style={styles.bulletList}>
                <Text style={styles.bulletPoint}>• Błędne kalkulacje materiałów lub kosztów</Text>
                <Text style={styles.bulletPoint}>• Straty finansowe wynikające z nieprawidłowych szacunków</Text>
                <Text style={styles.bulletPoint}>• Szkody materialne powstałe podczas remontu</Text>
                <Text style={styles.bulletPoint}>• Utratę danych spowodowaną błędami technicznymi</Text>
                <Text style={styles.bulletPoint}>• Problemy wynikające z niekompatybilności urządzeń</Text>
              </View>
              <Text style={[styles.sectionText, { marginTop: 12 }]}>
                Użytkownik ponosi pełną odpowiedzialność za decyzje podjęte na podstawie danych z aplikacji.
              </Text>
            </View>

            {/* Section 4 */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>4. Przechowywanie Danych</Text>
              <Text style={styles.sectionText}>
                Twoje dane projektów są przechowywane:
              </Text>
              <View style={styles.bulletList}>
                <Text style={styles.bulletPoint}>• Lokalnie na urządzeniu (tryb offline)</Text>
                <Text style={styles.bulletPoint}>• W chmurze Supabase (dla zalogowanych użytkowników)</Text>
                <Text style={styles.bulletPoint}>• Z wykorzystaniem szyfrowania TLS/SSL</Text>
              </View>
              <Text style={[styles.sectionText, { marginTop: 12 }]}>
                Dbamy o bezpieczeństwo Twoich danych, ale nie możemy zagwarantować całkowitej ochrony przed nieautoryzowanym dostępem.
              </Text>
            </View>

            {/* Section 5 */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>5. Konto Użytkownika</Text>
              <Text style={styles.sectionText}>
                Rejestrując konto, zobowiązujesz się do:
              </Text>
              <View style={styles.bulletList}>
                <Text style={styles.bulletPoint}>• Podania prawdziwych danych osobowych</Text>
                <Text style={styles.bulletPoint}>• Zachowania poufności hasła</Text>
                <Text style={styles.bulletPoint}>• Niezwłocznego zgłaszania nieautoryzowanego dostępu</Text>
              </View>
              <Text style={[styles.sectionText, { marginTop: 12 }]}>
                Ponosisz odpowiedzialność za wszystkie działania wykonane na Twoim koncie.
              </Text>
            </View>

            {/* Section 6 */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>6. Aktualizacje i Zmiany</Text>
              <Text style={styles.sectionText}>
                Zastrzegamy sobie prawo do:
              </Text>
              <View style={styles.bulletList}>
                <Text style={styles.bulletPoint}>• Aktualizacji aplikacji bez wcześniejszego powiadomienia</Text>
                <Text style={styles.bulletPoint}>• Modyfikacji warunków użytkowania</Text>
                <Text style={styles.bulletPoint}>• Dodawania lub usuwania funkcji</Text>
                <Text style={styles.bulletPoint}>• Zawieszenia lub zakończenia świadczenia usług</Text>
              </View>
              <Text style={[styles.sectionText, { marginTop: 12 }]}>
                Kontynuując korzystanie z aplikacji po aktualizacji warunków, akceptujesz wprowadzone zmiany.
              </Text>
            </View>

            {/* Section 7 */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>7. Własność Intelektualna</Text>
              <Text style={styles.sectionText}>
                Wszystkie prawa autorskie, znaki towarowe i inna własność intelektualna związana z CalcReno należą do jego twórców. Nie wolno kopiować, modyfikować, dystrybuować ani dekompilować aplikacji bez pisemnej zgody.
              </Text>
            </View>

            {/* Section 8 */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>8. Kontakt</Text>
              <Text style={styles.sectionText}>
                W razie pytań dotyczących warunków użytkowania, skontaktuj się z nami:
              </Text>
              <Text style={[styles.sectionText, { marginTop: 8, color: colors.renoTimeline.cyan }]}>
                support@calcreno.app
              </Text>
            </View>

            {/* Info Box */}
            <View style={styles.infoBox}>
              <Info size={18} color={colors.renoTimeline.cyan} />
              <Text style={styles.infoText}>
                Niniejsze warunki użytkowania mogą ulec zmianie. Zalecamy regularne sprawdzanie tej sekcji.
              </Text>
            </View>

            {/* Footer */}
            <Text style={styles.footer}>
              Ostatnia aktualizacja: 29 grudnia 2025
            </Text>
          </ScrollView>

          {/* Close Button */}
          <Pressable
            style={styles.acceptButton}
            onPress={onClose}
            accessible
            accessibilityLabel="Rozumiem warunki użytkowania"
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
  warningBox: {
    flexDirection: 'row',
    backgroundColor: 'rgba(30, 33, 57, 0.6)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderLeftWidth: 4,
  },
  betaWarning: {
    borderLeftColor: '#F59E0B',
  },
  calculationWarning: {
    borderLeftColor: '#EF4444',
  },
  warningContent: {
    flex: 1,
    marginLeft: 12,
  },
  warningTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  warningText: {
    fontSize: 14,
    color: '#E5E7EB',
    lineHeight: 20,
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
    color: colors.text.secondary,
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
