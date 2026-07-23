import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { track } from "@/lib/tracking";
import { captureAttribution } from "@/lib/attribution";

export function usePageView() {
  const location = useLocation();

  useEffect(() => {
    captureAttribution();
    track.pageView(location.pathname + location.search);
  }, [location.pathname, location.search]);
}
