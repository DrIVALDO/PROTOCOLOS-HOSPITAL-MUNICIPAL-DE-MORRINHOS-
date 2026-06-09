import React, { useLayoutEffect, useRef, useEffect } from 'react';

export const AutoResizeTextarea = (props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => {
  const ref = useRef<HTMLTextAreaElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    let isResizing = false;

    const resize = () => {
      if (isResizing) return;
      isResizing = true;
      el.style.height = 'auto';
      const newHeight = el.scrollHeight;
      el.style.height = newHeight + 'px';
      // Use requestAnimationFrame to reset the flag to prevent ResizeObserver loops
      requestAnimationFrame(() => {
        isResizing = false;
      });
    };

    resize();

    const observer = new ResizeObserver(() => {
      resize();
    });
    observer.observe(el);

    window.addEventListener('resize', resize);
    const timeout = setTimeout(resize, 150);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', resize);
      clearTimeout(timeout);
    };
  }, [props.value, props.className]);

  return (
    <textarea
      {...props}
      ref={ref}
      rows={props.rows || 1}
      style={{ ...props.style, overflow: 'hidden' }}
    />
  );
};
