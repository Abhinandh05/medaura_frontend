const fontFamily = 'PlusJakartaSans';

export const fonts = {
  regular: `${fontFamily}_400Regular`,
  medium: `${fontFamily}_500Medium`,
  semiBold: `${fontFamily}_600SemiBold`,
  bold: `${fontFamily}_700Bold`,
  extraBold: `${fontFamily}_800ExtraBold`,
};

export const typography = {
  h1: { fontSize: 24, fontFamily: fonts.extraBold, letterSpacing: -0.8 },
  h2: { fontSize: 18, fontFamily: fonts.extraBold, letterSpacing: -0.3 },
  h3: { fontSize: 15, fontFamily: fonts.extraBold, letterSpacing: -0.2 },
  body: { fontSize: 14, fontFamily: fonts.medium },
  bodySmall: { fontSize: 13, fontFamily: fonts.bold },
  caption: { fontSize: 12, fontFamily: fonts.bold },
  captionSmall: { fontSize: 11, fontFamily: fonts.medium },
  tiny: { fontSize: 10, fontFamily: fonts.medium },
  label: { fontSize: 9, fontFamily: fonts.bold },
};
