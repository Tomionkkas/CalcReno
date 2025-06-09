import React, { createContext, useContext, useState, useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { View, StyleSheet } from "react-native";

// Define theme colors
export const theme = {
  colors: {
    primary: "#6C63FF",
    secondary: "#4DABF7",
    background: "#0A0B1E",
    surface: "#1E2139",
    surfaceVariant: "#151829",
    text: "#FFFFFF",
    textSecondary: "#B8BCC8",
    textMuted: "#6B7280",
    success: "#10B981",
    error: "#EF4444",
    warning: "#F59E0B",
    border: "#2A2D4A",
  },
  gradients: {
    primary: ["#667eea", "#764ba2"],
    card: ["#1E2139", "#2A2D4A"],
    button: ["#6C63FF", "#4DABF7"],
    header: ["#0A0B1E", "#151829"],
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  borderRadius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
  },
  typography: {
    h1: {
      fontSize: 28,
      fontWeight: "bold",
      color: "#FFFFFF",
    },
    h2: {
      fontSize: 24,
      fontWeight: "600",
      color: "#FFFFFF",
    },
    h3: {
      fontSize: 20,
      fontWeight: "500",
      color: "#FFFFFF",
    },
    body: {
      fontSize: 16,
      fontWeight: "normal",
      color: "#B8BCC8",
    },
    caption: {
      fontSize: 14,
      fontWeight: "normal",
      color: "#6B7280",
    },
  },
};

// Create theme context
type ThemeContextType = {
  theme: typeof theme;
  isDarkMode: boolean;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextType>({
  theme,
  isDarkMode: true,
  toggleTheme: () => {},
});

export const useTheme = () => useContext(ThemeContext);

type ThemeProviderProps = {
  children: React.ReactNode;
};

export default function ThemeProvider({ children }: ThemeProviderProps) {
  const [isDarkMode, setIsDarkMode] = useState(true);

  const toggleTheme = () => {
    setIsDarkMode((prev) => !prev);
  };

  // Apply theme to StatusBar
  useEffect(() => {
    try {
      // Always use light-content for dark theme
      if (StatusBar.setStyle) {
        StatusBar.setStyle("light");
      }
    } catch (error) {
      // Ignore StatusBar errors on unsupported platforms
      console.warn("StatusBar configuration not supported:", error);
    }
  }, [isDarkMode]);

  // If no children provided (like in storyboard), show theme preview
  const content = children || (
    <View style={styles.themePreview}>
      <View
        style={[styles.colorSwatch, { backgroundColor: theme.colors.primary }]}
      >
        <View style={styles.colorLabel}>
          <View
            style={[styles.colorDot, { backgroundColor: theme.colors.primary }]}
          />
          <View style={styles.colorInfo}>
            <View
              style={[styles.textLine, { backgroundColor: theme.colors.text }]}
            />
            <View
              style={[
                styles.textLine,
                { backgroundColor: theme.colors.textSecondary, width: "70%" },
              ]}
            />
          </View>
        </View>
      </View>

      <View
        style={[
          styles.colorSwatch,
          { backgroundColor: theme.colors.secondary },
        ]}
      >
        <View style={styles.colorLabel}>
          <View
            style={[
              styles.colorDot,
              { backgroundColor: theme.colors.secondary },
            ]}
          />
          <View style={styles.colorInfo}>
            <View
              style={[styles.textLine, { backgroundColor: theme.colors.text }]}
            />
            <View
              style={[
                styles.textLine,
                { backgroundColor: theme.colors.textSecondary, width: "60%" },
              ]}
            />
          </View>
        </View>
      </View>

      <View
        style={[styles.colorSwatch, { backgroundColor: theme.colors.surface }]}
      >
        <View style={styles.colorLabel}>
          <View
            style={[styles.colorDot, { backgroundColor: theme.colors.surface }]}
          />
          <View style={styles.colorInfo}>
            <View
              style={[styles.textLine, { backgroundColor: theme.colors.text }]}
            />
            <View
              style={[
                styles.textLine,
                { backgroundColor: theme.colors.textSecondary, width: "80%" },
              ]}
            />
          </View>
        </View>
      </View>

      <View style={styles.themeTitle}>
        <View
          style={[styles.titleLine, { backgroundColor: theme.colors.text }]}
        />
        <View
          style={[
            styles.subtitleLine,
            { backgroundColor: theme.colors.textSecondary },
          ]}
        />
      </View>
    </View>
  );

  return (
    <ThemeContext.Provider value={{ theme, isDarkMode, toggleTheme }}>
      <View
        style={[styles.container, { backgroundColor: theme.colors.background }]}
      >
        {content}
      </View>
    </ThemeContext.Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  themePreview: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
  },
  colorSwatch: {
    height: 80,
    borderRadius: 12,
    marginBottom: 16,
    padding: 16,
    justifyContent: "center",
  },
  colorLabel: {
    flexDirection: "row",
    alignItems: "center",
  },
  colorDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 12,
  },
  colorInfo: {
    flex: 1,
  },
  textLine: {
    height: 8,
    borderRadius: 4,
    marginBottom: 4,
  },
  themeTitle: {
    marginTop: 32,
    alignItems: "center",
  },
  titleLine: {
    height: 12,
    width: 200,
    borderRadius: 6,
    marginBottom: 8,
  },
  subtitleLine: {
    height: 8,
    width: 150,
    borderRadius: 4,
  },
});
