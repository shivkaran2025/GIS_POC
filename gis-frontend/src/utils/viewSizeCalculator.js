export const viewSizeCalculator = (value, isPixel = false) => {
  const windowSize =
    typeof window !== "undefined"
      ? window.innerWidth / window.innerHeight < 2.5
      : true;

  let calculatedValue;

  if (windowSize) {
    calculatedValue = isPixel
      ? (value / 1660) * 100
      : ((value * 16) / 1660) * 100;
  } else {
    calculatedValue = isPixel
      ? (value / 1660) * 100 * 0.78
      : ((value * 16) / 1660) * 100 * 0.78;
  }

  return Number.isFinite(calculatedValue)
    ? `${calculatedValue.toFixed(2)}vw`
    : "0vw";
};