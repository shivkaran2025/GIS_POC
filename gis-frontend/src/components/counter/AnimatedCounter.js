import React, { useEffect, useState } from "react";

const countUp = (finalValue, duration, setCount, decimals) => {
  let start = 0;
  const increment = finalValue / (duration / 16);

  const updateCounter = () => {
    start += increment;
    if (start >= finalValue) {
      setCount(finalValue.toFixed(decimals));
    } else {
      setCount(start.toFixed(decimals));
      requestAnimationFrame(updateCounter);
    }
  };

  requestAnimationFrame(updateCounter);
};

const AnimatedCounter = ({ target, duration = 400, decimals = 0 }) => {
  const [count, setCount] = useState("0");

  useEffect(() => {
    countUp(target, duration, setCount, decimals);
  }, [target, duration, decimals]);

  return <>{count}</>; // 👈 sirf number return karega
};

export default AnimatedCounter;
