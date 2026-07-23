import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { lovable } from "@/integrations/lovable/index";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const DISMISS_KEY = "mm_google_prompt_dismissed_at";
const DISMISS_TTL_MS = 1000 * 60 * 60 * 24 * 7; // re-prompt weekly

export default function GoogleLoginPrompt() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) return; // already signed in

      const dismissedAt = Number(localStorage.getItem(DISMISS_KEY) || 0);
      if (dismissedAt && Date.now() - dismissedAt < DISMISS_TTL_MS) return;

      // small delay so it doesn't fight with hero LCP
      setTimeout(() => {
        if (!cancelled) setOpen(true);
      }, 1500);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleGoogle = async () => {
    setLoading(true);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      toast.error("Google sign-in failed. Please try again.");
      setLoading(false);
      return;
    }
    if (result.redirected) return;
    setOpen(false);
    setLoading(false);
    toast.success("Signed in — welcome!");
  };

  const handleDismiss = () => {
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => (v ? setOpen(true) : handleDismiss())}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl">Welcome to Middleman Motors</DialogTitle>
          <DialogDescription>
            Sign in with Google to save favorites, track applications, and get pre-approval offers tailored to you.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2">
          <Button
            onClick={handleGoogle}
            disabled={loading}
            className="w-full h-12 bg-white text-black hover:bg-gray-100 border border-border"
          >
            <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            {loading ? "Connecting…" : "Continue with Google"}
          </Button>

          <Button
            variant="ghost"
            onClick={handleDismiss}
            className="w-full text-muted-foreground"
          >
            Maybe later
          </Button>

          <p className="text-xs text-muted-foreground text-center">
            By continuing you agree to our terms. We never post to your Google account.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
