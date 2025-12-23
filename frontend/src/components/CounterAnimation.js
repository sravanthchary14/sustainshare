import React, { useEffect, useState } from 'react';

const CounterAnimation = ({ end, isVisible, duration, suffix = '' }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isVisible) return;

    let start = 0;
    const increment = end / (duration / 50);
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 50);

    return () => clearInterval(timer);
  }, [end, isVisible, duration]);

  return (
    <span>
      {count}
      {suffix}
    </span>
  );
};

export default CounterAnimation;
