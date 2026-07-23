import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * A component that scrolls the window to the top on every route change,
 * unless there is a hash in the URL.
 */
export const ScrollToTop = () => {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (!hash) {
      window.scrollTo(0, 0);
    }
  }, [pathname, hash]);

  return null;
};