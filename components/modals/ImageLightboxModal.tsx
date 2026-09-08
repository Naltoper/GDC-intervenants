import { X } from 'lucide-react-native';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Image,
  Modal,
  Platform,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Reanimated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

const FADE_MS = 180;
const MIN_SCALE = 1;
const MAX_SCALE = 4;

type ImageLightboxModalProps = {
  visible: boolean;
  uri: string | null;
  onClose: () => void;
};

const webLightboxProps =
  Platform.OS === 'web'
    ? ({
        // RN Web → data-lightbox-zoom="true" (exception CSS / gesturestart)
        dataSet: { lightboxZoom: 'true' },
      } as Record<string, unknown>)
    : {};

function ZoomableImage({
  uri,
  width,
  height,
}: {
  uri: string;
  width: number;
  height: number;
}) {
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const savedX = useSharedValue(0);
  const savedY = useSharedValue(0);

  useEffect(() => {
    scale.value = 1;
    savedScale.value = 1;
    translateX.value = 0;
    translateY.value = 0;
    savedX.value = 0;
    savedY.value = 0;
  }, [uri, scale, savedScale, translateX, translateY, savedX, savedY]);

  const pinch = useMemo(
    () =>
      Gesture.Pinch()
        .onUpdate((event) => {
          const next = savedScale.value * event.scale;
          scale.value = Math.min(MAX_SCALE, Math.max(MIN_SCALE, next));
        })
        .onEnd(() => {
          savedScale.value = scale.value;
          if (scale.value <= 1.02) {
            scale.value = withTiming(1);
            savedScale.value = 1;
            translateX.value = withTiming(0);
            translateY.value = withTiming(0);
            savedX.value = 0;
            savedY.value = 0;
          }
        }),
    [scale, savedScale, translateX, translateY, savedX, savedY],
  );

  const pan = useMemo(
    () =>
      Gesture.Pan()
        .onUpdate((event) => {
          if (savedScale.value <= 1.02) return;
          translateX.value = savedX.value + event.translationX;
          translateY.value = savedY.value + event.translationY;
        })
        .onEnd(() => {
          savedX.value = translateX.value;
          savedY.value = translateY.value;
        }),
    [savedScale, translateX, translateY, savedX, savedY],
  );

  const doubleTap = useMemo(
    () =>
      Gesture.Tap()
        .numberOfTaps(2)
        .onEnd(() => {
          if (scale.value > 1.2) {
            scale.value = withTiming(1);
            savedScale.value = 1;
            translateX.value = withTiming(0);
            translateY.value = withTiming(0);
            savedX.value = 0;
            savedY.value = 0;
          } else {
            scale.value = withTiming(2.2);
            savedScale.value = 2.2;
          }
        }),
    [scale, savedScale, translateX, translateY, savedX, savedY],
  );

  const composed = useMemo(
    () => Gesture.Simultaneous(pinch, pan, doubleTap),
    [pinch, pan, doubleTap],
  );

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  return (
    <GestureDetector gesture={composed}>
      <Reanimated.View
        style={[styles.zoomTarget, { width, height }, animatedStyle]}
        {...webLightboxProps}
      >
        <Image
          source={{ uri }}
          style={{ width, height }}
          resizeMode="contain"
          accessibilityLabel="Image en plein écran"
        />
      </Reanimated.View>
    </GestureDetector>
  );
}

export function ImageLightboxModal({ visible, uri, onClose }: ImageLightboxModalProps) {
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const imageOpacity = useRef(new Animated.Value(0)).current;
  const [mounted, setMounted] = useState(visible);

  const imageWidth = Math.max(1, windowWidth - 32);
  const imageHeight = Math.max(1, windowHeight * 0.8);

  useEffect(() => {
    if (visible) {
      setMounted(true);
      overlayOpacity.setValue(0);
      imageOpacity.setValue(0);
      Animated.sequence([
        Animated.timing(overlayOpacity, {
          toValue: 1,
          duration: FADE_MS,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(imageOpacity, {
          toValue: 1,
          duration: 140,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start();
      return;
    }

    if (!mounted) return;

    Animated.parallel([
      Animated.timing(overlayOpacity, {
        toValue: 0,
        duration: FADE_MS,
        useNativeDriver: true,
      }),
      Animated.timing(imageOpacity, {
        toValue: 0,
        duration: 120,
        useNativeDriver: true,
      }),
    ]).start(({ finished }) => {
      if (finished) setMounted(false);
    });
  }, [visible, mounted, overlayOpacity, imageOpacity]);

  if (!mounted || !uri) return null;

  return (
    <Modal
      visible={mounted}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <GestureHandlerRootView style={styles.root}>
        <View style={styles.root} {...webLightboxProps}>
          <Animated.View style={[styles.backdrop, { opacity: overlayOpacity }]}>
            <TouchableOpacity
              style={StyleSheet.absoluteFill}
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel="Fermer l'image"
            />
          </Animated.View>

          <Animated.View
            style={[styles.imageWrap, { opacity: imageOpacity }]}
            pointerEvents="box-none"
          >
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel="Fermer l'image"
            >
              <X size={22} color="#ffffff" />
            </TouchableOpacity>
            <ZoomableImage uri={uri} width={imageWidth} height={imageHeight} />
          </Animated.View>
        </View>
      </GestureHandlerRootView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.82)',
  },
  imageWrap: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  zoomTarget: {
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  closeButton: {
    position: 'absolute',
    top: 28,
    right: 20,
    zIndex: 2,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
