import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppLayout } from "@/components/AppLayout";
import Dashboard from "./pages/Dashboard";
import Log from "./pages/Log";
import MealLog from "./pages/log/MealLog";
import { Ingredients } from "./pages/log/Ingredients";
import Suggestions from "./pages/Suggestions";
import NotFound from "./pages/NotFound";
import History from "./pages/History";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      /** Keep cached data (e.g. dish suggestions after navigating away) for a day. */
      gcTime: 1000 * 60 * 60 * 24,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppLayout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/log" element={<Log />} />
            <Route path="/log/meals" element={<MealLog />} />
            <Route path="/log/ingredients" element={<Ingredients />} />
            <Route path="/history" element={<History />} />
            <Route path="/suggestions" element={<Suggestions />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AppLayout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
