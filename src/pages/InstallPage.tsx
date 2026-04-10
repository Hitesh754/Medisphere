import { useEffect, useState } from "react";
import { Download, Share, MoreVertical, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const InstallPage = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(isIOSDevice);

    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") setIsInstalled(true);
    setDeferredPrompt(null);
  };

  if (isInstalled) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 p-6 text-center">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
          <Smartphone className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-2xl font-bold text-foreground">Already Installed!</h1>
        <p className="text-muted-foreground">ClearScript Buddy is installed on your device.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-6 p-6 max-w-md mx-auto">
      <img src="/pwa-icon-192.png" alt="ClearScript Buddy" className="w-24 h-24 rounded-2xl shadow-lg" />
      <h1 className="text-2xl font-bold text-foreground text-center">Install ClearScript Buddy</h1>
      <p className="text-muted-foreground text-center">
        Install this app on your phone for quick access — works offline and feels like a native app!
      </p>

      {deferredPrompt ? (
        <Button onClick={handleInstall} size="lg" className="w-full gap-2">
          <Download className="w-5 h-5" />
          Install App
        </Button>
      ) : isIOS ? (
        <Card className="w-full">
          <CardContent className="pt-6 space-y-4">
            <h2 className="font-semibold text-foreground">How to install on iPhone/iPad:</h2>
            <div className="space-y-3 text-sm text-muted-foreground">
              <div className="flex items-start gap-3">
                <span className="bg-primary/10 text-primary rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shrink-0">1</span>
                <p>Tap the <Share className="inline w-4 h-4" /> <strong>Share</strong> button in Safari</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="bg-primary/10 text-primary rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shrink-0">2</span>
                <p>Scroll down and tap <strong>"Add to Home Screen"</strong></p>
              </div>
              <div className="flex items-start gap-3">
                <span className="bg-primary/10 text-primary rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shrink-0">3</span>
                <p>Tap <strong>"Add"</strong> to confirm</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="w-full">
          <CardContent className="pt-6 space-y-4">
            <h2 className="font-semibold text-foreground">How to install on Android:</h2>
            <div className="space-y-3 text-sm text-muted-foreground">
              <div className="flex items-start gap-3">
                <span className="bg-primary/10 text-primary rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shrink-0">1</span>
                <p>Tap the <MoreVertical className="inline w-4 h-4" /> <strong>menu</strong> (three dots) in Chrome</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="bg-primary/10 text-primary rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shrink-0">2</span>
                <p>Tap <strong>"Add to Home screen"</strong> or <strong>"Install app"</strong></p>
              </div>
              <div className="flex items-start gap-3">
                <span className="bg-primary/10 text-primary rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shrink-0">3</span>
                <p>Tap <strong>"Install"</strong> to confirm</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default InstallPage;