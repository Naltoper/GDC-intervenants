import { useFocusEffect } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams } from 'expo-router';
import { ImagePlus, Send, ShieldCheck, X } from 'lucide-react-native';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Platform,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { LyceeBackground } from '../../components/backgrounds/LyceeBackground';
import { ChatBubble } from '../../components/cards/ChatBubble';
import { ChatHeader } from '../../components/headers/ChatHeader';
import { KeyboardAwareBody } from '../../components/layout/KeyboardAwareBody';
import { ScreenErrorBoundary } from '../../components/layout/ScreenErrorBoundary';
import { ImageLightboxModal } from '../../components/modals/ImageLightboxModal';
import { ReportDetailModal } from '../../components/modals/ReportDetailModal';
import type { AppColorPalette } from '../../constants/theme';
import { useAppTheme } from '../../contexts/ThemeContext';
import { useChatListScroll } from '../../hooks/useChatListScroll';
import { useChatMessages } from '../../hooks/useChatMessages';
import { useKeyboardVisible } from '../../hooks/useKeyboardVisible';
import { usePullToRefresh } from '../../hooks/usePullToRefresh';
import { supabase } from '../../lib/supabase';
import { Report } from '../../types/report';
import { markChatRead } from '../../utils/chatReadState';
import { notify } from '../../utils/notify';
import { parseRouteParam } from '../../utils/routeParam';

type ThemedStyles = ReturnType<typeof createStyles>;

const COMPOSER_INPUT_MIN = 40;
const COMPOSER_INPUT_MAX = 120;

export default function ChatScreen() {
  const { colors, surface, isDark } = useAppTheme();
  const styles = useMemo(() => createStyles(colors, surface), [colors, surface]);
  const params = useLocalSearchParams<{
    id?: string | string[];
    role?: string | string[];
    from?: string | string[];
    filter?: string | string[];
  }>();
  const reportId = parseRouteParam(params.id);
  // App Intervenants : rôle par défaut = admin
  const role = parseRouteParam(params.role) === 'user' ? 'user' : 'admin';
  const from = parseRouteParam(params.from);
  const fromFilter = parseRouteParam(params.filter);
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <View style={styles.mainContainer}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <View style={styles.headerWrap} pointerEvents="box-none">
        <ChatHeader
          reportId={reportId}
          role={role}
          from={from || undefined}
          fromFilter={fromFilter || undefined}
          onShowDetails={reportId ? () => setModalVisible(true) : undefined}
        />
      </View>

      {!reportId ? (
        <ChatUnavailable
          styles={styles}
          title="Discussion introuvable"
          subtitle="L'identifiant du signalement est manquant. Revenez au tableau de bord pour ouvrir le chat depuis une carte."
        />
      ) : (
        <ScreenErrorBoundary
          fallback={(retry) => (
            <ChatUnavailable
              styles={styles}
              title="Impossible d'ouvrir le chat"
              subtitle="Le chargement a échoué. Vous pouvez réessayer ou revenir en arrière."
              onRetry={retry}
            />
          )}
        >
          <ChatConversation
            reportId={reportId}
            role={role}
            modalVisible={modalVisible}
            onCloseModal={() => setModalVisible(false)}
          />
        </ScreenErrorBoundary>
      )}
    </View>
  );
}

function ChatUnavailable({
  styles,
  title,
  subtitle,
  onRetry,
}: {
  styles: ThemedStyles;
  title: string;
  subtitle: string;
  onRetry?: () => void;
}) {
  return (
    <View style={styles.fallback}>
      <Text style={styles.fallbackTitle}>{title}</Text>
      <Text style={styles.fallbackSubtitle}>{subtitle}</Text>
      {onRetry ? (
        <TouchableOpacity
          onPress={onRetry}
          style={styles.retryBtn}
          accessibilityRole="button"
          accessibilityLabel="Réessayer"
        >
          <Text style={styles.retryText}>Réessayer</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

function ChatConversation({
  reportId,
  role,
  modalVisible,
  onCloseModal,
}: {
  reportId: string;
  role: 'user' | 'admin';
  modalVisible: boolean;
  onCloseModal: () => void;
}) {
  const { colors, surface } = useAppTheme();
  const styles = useMemo(() => createStyles(colors, surface), [colors, surface]);
  const [newMessage, setNewMessage] = useState('');
  const [pendingImage, setPendingImage] = useState<{
    uri: string;
    mimeType?: string;
    fileName?: string;
  } | null>(null);
  const [lightboxUri, setLightboxUri] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [reportData, setReportData] = useState<Report | null>(null);
  const [composerHeight, setComposerHeight] = useState(COMPOSER_INPUT_MIN);
  const flatListRef = useRef<FlatList>(null);
  const inputRef = useRef<TextInput>(null);

  const { messages, sendMessage, sendMessageWithImage, loading, sending, fetchMessages, error } =
    useChatMessages(reportId);
  const keyboardVisible = useKeyboardVisible();
  const { onScroll, onComposerFocus, onMessageSent } = useChatListScroll(flatListRef, {
    messageCount: messages.length,
    keyboardVisible,
    reportId,
  });

  const keepComposerFocused = useCallback(() => {
    requestAnimationFrame(() => {
      inputRef.current?.focus();
    });
  }, []);

  useFocusEffect(
    useCallback(() => {
      void markChatRead(reportId);
    }, [reportId]),
  );

  useEffect(() => {
    if (messages.length === 0) return;
    void markChatRead(reportId);
  }, [reportId, messages.length]);

  const pickChatImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      notify('Permission refusée', "Autorisez l'accès aux photos pour envoyer une image.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.8,
    });

    if (result.canceled) return;
    const asset = result.assets[0];
    setPendingImage({
      uri: asset.uri,
      mimeType: asset.mimeType ?? undefined,
      fileName: asset.fileName ?? undefined,
    });
  };

  const handleSend = async () => {
    if (!newMessage.trim() && !pendingImage) return;
    if (sending) return;

    const text = newMessage;
    const image = pendingImage;

    setNewMessage('');
    setPendingImage(null);
    setComposerHeight(COMPOSER_INPUT_MIN);
    onMessageSent();
    keepComposerFocused();

    if (image) {
      const success = await sendMessageWithImage(text, role, {
        uri: image.uri,
        mimeType: image.mimeType,
        fileName: image.fileName,
      });
      if (!success) {
        notify('Erreur', "Impossible d'envoyer l'image.");
      }
      keepComposerFocused();
      return;
    }

    const success = await sendMessage(text, role, null);
    if (!success) {
      setNewMessage(text);
      notify('Erreur', "Impossible d'envoyer le message.");
    }
    keepComposerFocused();
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchMessages();
    setRefreshing(false);
  };

  const pullRefresh = usePullToRefresh({
    refreshing,
    onRefresh,
    tintColor: colors.primaryLight,
  });

  useEffect(() => {
    let cancelled = false;

    const fetchReportDetails = async () => {
      try {
        const { data, error: queryError } = await supabase
          .from('reports')
          .select('*')
          .eq('id', reportId)
          .maybeSingle();

        if (cancelled) return;
        if (queryError) {
          console.warn('[chat] report', queryError.message);
          return;
        }
        if (data) setReportData(data as Report);
      } catch (caught) {
        console.warn('[chat] report', caught);
      }
    };

    void fetchReportDetails();
    return () => {
      cancelled = true;
    };
  }, [reportId]);

  const composerPlaceholder =
    role === 'admin' ? 'Votre message…' : 'Ton message…';

  return (
    <>
      <KeyboardAwareBody>
        <LyceeBackground variant="full">
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item, index) => String(item?.id ?? index)}
            contentContainerStyle={styles.listContent}
            keyboardShouldPersistTaps="always"
            keyboardDismissMode="none"
            {...pullRefresh}
            onScroll={(event) => {
              onScroll(event);
              pullRefresh.onScroll(event);
            }}
            renderItem={({ item, index }) => (
              <ChatBubble
                item={item}
                isMyMessage={item.sender_role === role}
                index={index}
                onImagePress={setLightboxUri}
              />
            )}
            ListEmptyComponent={
              loading ? (
                <View style={styles.emptyChatWrapper}>
                  <ActivityIndicator size="large" color={colors.primaryLight} />
                  <Text style={styles.loadingText}>Chargement de la discussion…</Text>
                </View>
              ) : (
                <View style={styles.emptyChatWrapper}>
                  <View style={styles.emptyChatContainer}>
                    <View style={styles.emptyIconWrapper}>
                      <ShieldCheck color="#76c893" size={36} strokeWidth={2} />
                    </View>
                    <Text style={styles.emptyChatText}>
                      {error ?? 'Aucun message pour le moment.'}
                    </Text>
                    <Text style={styles.emptyChatSubText}>
                      {error
                        ? 'Le bouton retour reste disponible en haut à gauche.'
                        : role === 'user'
                          ? 'Pose tes questions ou apporte des précisions. Ton échange avec la cellule est strictement confidentiel et sécurisé.'
                          : "Initiez la discussion avec l'élève de manière bienveillante. Cet espace d'échange est entièrement sécurisé."}
                    </Text>
                  </View>
                </View>
              )
            }
          />
        </LyceeBackground>

        <View style={styles.inputWrapper}>
          {pendingImage ? (
            <View style={styles.previewRow}>
              <Image source={{ uri: pendingImage.uri }} style={styles.previewImage} />
              <TouchableOpacity
                onPress={() => setPendingImage(null)}
                style={styles.previewRemove}
                accessibilityRole="button"
                accessibilityLabel="Retirer l'image"
              >
                <X size={14} color="#ffffff" />
              </TouchableOpacity>
            </View>
          ) : null}
          <View style={styles.inputContainer}>
            <TouchableOpacity
              onPress={pickChatImage}
              style={styles.attachBtn}
              accessibilityRole="button"
              accessibilityLabel="Ajouter une image"
            >
              <ImagePlus size={20} color={colors.accent} />
            </TouchableOpacity>
            <TextInput
              ref={inputRef}
              style={[
                styles.input,
                {
                  height: composerHeight,
                  ...(Platform.OS === 'web' ? ({ outlineStyle: 'none' } as object) : null),
                },
              ]}
              value={newMessage}
              onChangeText={setNewMessage}
              placeholder={composerPlaceholder}
              placeholderTextColor={colors.textMuted}
              multiline
              blurOnSubmit={false}
              textAlignVertical="center"
              scrollEnabled={composerHeight >= COMPOSER_INPUT_MAX}
              onContentSizeChange={(event) => {
                const next = Math.ceil(event.nativeEvent.contentSize.height);
                setComposerHeight(
                  Math.min(COMPOSER_INPUT_MAX, Math.max(COMPOSER_INPUT_MIN, next)),
                );
              }}
              onFocus={onComposerFocus}
            />

            <Pressable
              onPress={handleSend}
              disabled={(!newMessage.trim() && !pendingImage) || sending}
              accessibilityRole="button"
              accessibilityLabel="Envoyer le message"
              hitSlop={10}
              onPressIn={(event) => {
                if (Platform.OS === 'web') {
                  event.preventDefault?.();
                }
              }}
              {...(Platform.OS === 'web'
                ? {
                    onMouseDown: (event: { preventDefault: () => void }) => {
                      event.preventDefault();
                    },
                  }
                : null)}
              style={({ pressed }) => [
                styles.sendBtnHit,
                pressed && styles.sendBtnPressed,
              ]}
            >
              <LinearGradient
                colors={
                  newMessage.trim() || pendingImage
                    ? [colors.primary, colors.status.success]
                    : [colors.border, colors.borderSubtle]
                }
                style={styles.sendBtn}
              >
                <Send size={18} color="white" />
              </LinearGradient>
            </Pressable>
          </View>
        </View>
      </KeyboardAwareBody>
      <ReportDetailModal
        visible={modalVisible}
        onClose={onCloseModal}
        report={reportData}
      />
      <ImageLightboxModal
        visible={!!lightboxUri}
        uri={lightboxUri}
        onClose={() => setLightboxUri(null)}
      />
    </>
  );
}

function createStyles(colors: AppColorPalette, surface: string) {
  return StyleSheet.create({
    mainContainer: { flex: 1, backgroundColor: surface },
    headerWrap: {
      zIndex: 40,
      elevation: 40,
    },
    listContent: { padding: 20, flexGrow: 1 },
    inputWrapper: {
      paddingHorizontal: 15,
      paddingVertical: 15,
      backgroundColor: surface,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      zIndex: 10,
      elevation: 8,
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: -2 },
      shadowOpacity: 0.08,
      shadowRadius: 6,
    },
    attachBtn: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
    },
    previewRow: {
      position: 'relative',
      alignSelf: 'flex-start',
      marginBottom: 10,
    },
    previewImage: {
      width: 72,
      height: 72,
      borderRadius: 12,
      backgroundColor: colors.border,
    },
    previewRemove: {
      position: 'absolute',
      top: -6,
      right: -6,
      width: 22,
      height: 22,
      borderRadius: 11,
      backgroundColor: colors.text,
      alignItems: 'center',
      justifyContent: 'center',
    },
    inputContainer: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      backgroundColor: colors.borderSubtle,
      borderRadius: 25,
      paddingHorizontal: 5,
      paddingVertical: 4,
      minHeight: 50,
    },
    input: {
      flex: 1,
      paddingHorizontal: 12,
      paddingTop: Platform.OS === 'ios' ? 10 : 8,
      paddingBottom: Platform.OS === 'ios' ? 10 : 8,
      fontSize: 15,
      lineHeight: 20,
      color: colors.text,
      maxHeight: COMPOSER_INPUT_MAX,
      textAlignVertical: 'center',
    },
    sendBtnHit: {
      width: 42,
      height: 42,
      borderRadius: 21,
      overflow: 'hidden',
    },
    sendBtnPressed: {
      opacity: 0.88,
    },
    sendBtn: {
      width: 42,
      height: 42,
      borderRadius: 21,
      justifyContent: 'center',
      alignItems: 'center',
    },
    emptyChatContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 30,
      paddingVertical: 40,
    },
    emptyIconWrapper: {
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: colors.borderSubtle,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 16,
    },
    emptyChatText: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.text,
      textAlign: 'center',
      marginBottom: 8,
    },
    emptyChatSubText: {
      fontSize: 13,
      color: colors.textMuted,
      textAlign: 'center',
      lineHeight: 20,
    },
    emptyChatWrapper: {
      flex: 1,
      minHeight: 280,
      justifyContent: 'center',
      alignItems: 'center',
    },
    loadingText: {
      marginTop: 12,
      color: colors.textMuted,
      fontSize: 14,
      fontWeight: '600',
    },
    fallback: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 32,
    },
    fallbackTitle: {
      fontSize: 17,
      fontWeight: '800',
      color: colors.text,
      textAlign: 'center',
      marginBottom: 8,
    },
    fallbackSubtitle: {
      fontSize: 14,
      color: colors.textMuted,
      textAlign: 'center',
      lineHeight: 22,
    },
    retryBtn: {
      marginTop: 16,
      paddingHorizontal: 18,
      paddingVertical: 10,
      borderRadius: 12,
      backgroundColor: colors.primary,
    },
    retryText: {
      color: '#ffffff',
      fontWeight: '700',
      fontSize: 14,
    },
  });
}
