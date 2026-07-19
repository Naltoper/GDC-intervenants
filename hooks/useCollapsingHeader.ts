import {
  Extrapolation,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";

import {
  DASHBOARD_HEADER,
  DASHBOARD_SCROLL_DISTANCE,
} from "../constants/dashboard";

export const useCollapsingHeader = () => {
  const scrollY = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const headerAnimatedStyle = useAnimatedStyle(() => {
    const height = interpolate(
      scrollY.value,
      [0, DASHBOARD_SCROLL_DISTANCE],
      [DASHBOARD_HEADER.MAX_HEIGHT, DASHBOARD_HEADER.MIN_HEIGHT],
      Extrapolation.CLAMP,
    );
    return { height };
  });

  const largeTitleStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      [0, DASHBOARD_SCROLL_DISTANCE / 2],
      [1, 0],
      Extrapolation.CLAMP,
    );
    const translateY = interpolate(
      scrollY.value,
      [0, DASHBOARD_SCROLL_DISTANCE],
      [0, -15],
      Extrapolation.CLAMP,
    );
    return { opacity, transform: [{ translateY }] };
  });

  const smallTitleStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      [DASHBOARD_SCROLL_DISTANCE / 2, DASHBOARD_SCROLL_DISTANCE],
      [0, 1],
      Extrapolation.CLAMP,
    );
    return { opacity };
  });

  return {
    scrollHandler,
    headerAnimatedStyle,
    largeTitleStyle,
    smallTitleStyle,
  };
};

export type CollapsingHeaderAnimation = Pick<
  ReturnType<typeof useCollapsingHeader>,
  "headerAnimatedStyle" | "largeTitleStyle" | "smallTitleStyle"
>;
