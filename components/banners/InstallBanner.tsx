import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking, Platform } from 'react-native';

import { useAppTheme } from '../../contexts/ThemeContext';

interface InstallBannerProps {
  title: string;
  subtitle: string;
  url: string;
}

export const InstallBanner = ({ title, subtitle, url }: InstallBannerProps) => {
  const { colors } = useAppTheme();

  if (Platform.OS !== 'web') return null;

  const handleDownload = () => {
    Linking.openURL(url).catch((err) =>
      console.error("Impossible d'ouvrir le lien :", err),
    );
  };

  return (
    <View
      style={[
        styles.bannerContainer,
        {
          backgroundColor: colors.primary,
          borderColor: colors.primaryLight,
        },
      ]}
    >
      <View style={styles.textContainer}>
        <Text style={styles.bannerTitle}>{title}</Text>
        <Text style={styles.bannerSubtitle}>{subtitle}</Text>
      </View>
      <TouchableOpacity
        onPress={handleDownload}
        style={[styles.downloadBtn, { backgroundColor: colors.status.success }]}
        activeOpacity={0.8}
      >
        <Text style={[styles.downloadBtnText, { color: colors.primary }]}>
          Installer
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  bannerContainer: {
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 15,
    marginBottom: 20,
    borderWidth: 1,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  textContainer: {
    flex: 1,
  },
  bannerTitle: {
    color: 'white',
    fontWeight: '800',
    fontSize: 14,
  },
  bannerSubtitle: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 11,
    marginTop: 2,
  },
  downloadBtn: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 10,
    marginLeft: 10,
  },
  downloadBtnText: {
    fontWeight: '800',
    fontSize: 13,
  },
});
