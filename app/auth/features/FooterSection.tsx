import React, { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { TermsOfServiceModal } from '../modals/TermsOfServiceModal';
import { PrivacyPolicyModal } from '../modals/PrivacyPolicyModal';

export function FooterSection() {
  const [termsVisible, setTermsVisible] = useState(false);
  const [privacyVisible, setPrivacyVisible] = useState(false);

  return (
    <>
      <View style={{
        alignItems: 'center',
        paddingBottom: 32,
        marginTop: 'auto',
        paddingHorizontal: 20,
      }}>
        <Text style={{
          color: '#6B7280',
          fontSize: 12,
          textAlign: 'center',
          lineHeight: 18
        }}>
          Tworząc konto akceptujesz nasze{' '}
          <Text
            onPress={() => setTermsVisible(true)}
            accessible
            accessibilityLabel="Otwórz warunki użytkowania"
            accessibilityRole="link"
            style={{
              color: '#5DD5D5',
              textDecorationLine: 'underline',
              fontSize: 12
            }}
          >
            warunki użytkowania
          </Text>
          {' '}i{' '}
          <Text
            onPress={() => setPrivacyVisible(true)}
            accessible
            accessibilityLabel="Otwórz politykę prywatności"
            accessibilityRole="link"
            style={{
              color: '#5DD5D5',
              textDecorationLine: 'underline',
              fontSize: 12
            }}
          >
            politykę prywatności
          </Text>
        </Text>
      </View>

      {/* Modals */}
      <TermsOfServiceModal
        visible={termsVisible}
        onClose={() => setTermsVisible(false)}
      />

      <PrivacyPolicyModal
        visible={privacyVisible}
        onClose={() => setPrivacyVisible(false)}
      />
    </>
  );
}
