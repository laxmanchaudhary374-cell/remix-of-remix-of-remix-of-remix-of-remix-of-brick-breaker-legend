
import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { I18nProvider } from "@/utils/i18n";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { showBannerAd, initAdMob } from "./utils/admob";
import Chartboost from "./utils/chartboost";

const queryClient = new QueryClient();

const App = () => {
  useEffect(() => {
    const startAds = async () => {
      await initAdMob();
      showBannerAd();
    };
    startAds();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <I18nProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </I18nProvider>
    </QueryClientProvider>
  );
};

export default App;
