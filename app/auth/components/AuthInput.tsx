import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, TextInputProps } from 'react-native';
import { Eye, EyeOff, Mail, Lock, User } from 'lucide-react-native';

interface AuthInputProps extends Omit<TextInputProps, 'style'> {
  label: string;
  type: 'email' | 'password' | 'firstName' | 'lastName';
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
  showPasswordToggle?: boolean;
}

export function AuthInput({ 
  label, 
  type, 
  value, 
  onChangeText, 
  error, 
  showPasswordToggle = false,
  ...props 
}: AuthInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  const getIcon = () => {
    switch (type) {
      case 'email':
        return <Mail size={20} color="#6B7280" style={{ marginRight: 12 }} />;
      case 'password':
        return <Lock size={20} color="#6B7280" style={{ marginRight: 12 }} />;
      case 'firstName':
      case 'lastName':
        return <User size={20} color="#6B7280" style={{ marginRight: 12 }} />;
      default:
        return null;
    }
  };

  const getPlaceholder = () => {
    switch (type) {
      case 'email':
        return 'twoj@email.com';
      case 'password':
        return 'Wprowadź hasło';
      case 'firstName':
        return 'Twoje imię';
      case 'lastName':
        return 'Twoje nazwisko';
      default:
        return '';
    }
  };

  const getAutoComplete = () => {
    switch (type) {
      case 'email':
        return 'email';
      case 'password':
        return 'password';
      case 'firstName':
        return 'given-name';
      case 'lastName':
        return 'family-name';
      default:
        return undefined;
    }
  };

  const getKeyboardType = () => {
    switch (type) {
      case 'email':
        return 'email-address';
      default:
        return 'default';
    }
  };

  const getAutoCapitalize = () => {
    switch (type) {
      case 'email':
        return 'none';
      case 'firstName':
      case 'lastName':
        return 'words';
      default:
        return 'none';
    }
  };

  return (
    <View style={{ marginBottom: 20 }}>
      {/* Label */}
      <Text style={{ 
        color: '#B8BCC8', 
        fontSize: 14, 
        fontWeight: '500',
        marginBottom: 8 
      }}>
        {label}
      </Text>
      
      {/* Input Container */}
      <View style={{
        backgroundColor: '#1E2139',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: error ? '#EF4444' : '#2A2D4A',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        height: 56,
      }}>
        {/* Icon */}
        {getIcon()}
        
        {/* Text Input */}
        <TextInput
          style={{
            flex: 1,
            color: '#FFFFFF',
            fontSize: 16,
            height: '100%',
          }}
          placeholder={getPlaceholder()}
          placeholderTextColor="#6B7280"
          value={value}
          onChangeText={onChangeText}
          keyboardType={getKeyboardType()}
          autoCapitalize={getAutoCapitalize()}
          autoComplete={getAutoComplete()}
          secureTextEntry={type === 'password' && !showPassword}
          {...props}
        />
        
        {/* Password Toggle */}
        {type === 'password' && showPasswordToggle && (
          <Pressable
            onPress={() => setShowPassword(!showPassword)}
            style={{ padding: 4 }}
          >
            {showPassword ? (
              <EyeOff size={20} color="#6B7280" />
            ) : (
              <Eye size={20} color="#6B7280" />
            )}
          </Pressable>
        )}
      </View>
      
      {/* Error Message */}
      {error && (
        <Text style={{ 
          color: '#EF4444', 
          fontSize: 12, 
          marginTop: 4 
        }}>
          {error}
        </Text>
      )}
      
      {/* Password Hint */}
      {type === 'password' && !error && (
        <Text style={{ 
          color: '#6B7280', 
          fontSize: 12, 
          marginTop: 4 
        }}>
          Minimum 6 znaków
        </Text>
      )}
    </View>
  );
}
