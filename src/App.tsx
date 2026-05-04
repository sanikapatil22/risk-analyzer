import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Layout from "@/components/Layout";
import Analyze from "./pages/Analyze";
import Compare from "./pages/Compare";
import Phishing from "./pages/Phishing";
import Mirror from "./pages/Mirror";
import Stories from "./pages/Stories";
import Learn from "./pages/Learn";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Analyze />} />
            <Route path="/compare" element={<Compare />} />
            <Route path="/phishing" element={<Phishing />} />
            <Route path="/mirror" element={<Mirror />} />
            <Route path="/stories" element={<Stories />} />
            <Route path="/stories/:id" element={<Stories />} />
            <Route path="/learn" element={<Learn />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
