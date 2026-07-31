import {
  Extrapolation,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";

import { DASHBOARD_HEADER } from "../constants/dashboard";

export const useCollapsingHeader = () => {
  const scrollY = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  /** White/blur sticky background fades in as the page title card scrolls away. */
  const stickyBarStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      [0, DASHBOARD_HEADER.SHOW_AFTER],
      [0, 1],
      Extrapolation.CLAMP,
    );
    return { opacity };
  });

  /** Compact sticky title fades in once the page title card scrolls away. */
  const stickyTitleStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      [DASHBOARD_HEADER.SHOW_AFTER * 0.35, DASHBOARD_HEADER.SHOW_AFTER],
      [0, 1],
      Extrapolation.CLAMP,
    );
    return { opacity };
  });

  return {
    scrollHandler,
    stickyBarStyle,
    stickyTitleStyle,
  };
};

export type CollapsingHeaderAnimation = Pick<
  ReturnType<typeof useCollapsingHeader>,
  "stickyBarStyle" | "stickyTitleStyle"
>;
