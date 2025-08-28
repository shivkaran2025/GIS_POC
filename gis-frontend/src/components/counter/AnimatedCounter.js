import React, { useEffect, useState } from "react";

const countUp = (finalValue, duration, setCount, decimals) => {
  let start = 0;
  const increment = finalValue / (duration / 16);

  const updateCounter = () => {
    start += increment;
    if (start >= finalValue) {
      setCount(finalValue);
    } else {
      setCount(start);
      requestAnimationFrame(updateCounter);
    }
  };

  requestAnimationFrame(updateCounter);
};

const AnimatedCounter = ({ target, duration = 400, decimals = 0 }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    countUp(target, duration, setCount, decimals);
  }, [target, duration, decimals]);

  const formattedCount = Number(count).toLocaleString("en-IN", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  return <>{formattedCount}</>;
};

export default AnimatedCounter;