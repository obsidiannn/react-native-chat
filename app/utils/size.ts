import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');
const [shortDimension, longDimension] = width < height ? [width, height] : [height, width];

//Default guideline sizes are based on standard ~5" screen mobile device
const guidelineBaseWidth = process.env.EXPO_PUBLIC_SIZE_BASE_WIDTH || 350;
const guidelineBaseHeight = process.env.EXPO_PUBLIC_SIZE_BASE_HEIGHT || 680;

export const scale = (size: number) => shortDimension / guidelineBaseWidth * size;
export const verticalScale = (size: number) => longDimension / guidelineBaseHeight * size;
export const moderateScale = (size: number, factor = 0.5) => size + (scale(size) - size) * factor;
export const moderateVerticalScale = (size: number, factor = 0.5) => size + (verticalScale(size) - size) * factor;

export const s = scale;
export const vs = verticalScale;
export const ms = moderateScale;
export const mvs = moderateVerticalScale;