import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async"; 
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import ProductDetail from "./pages/ProductDetail";
import VehicleComparison from "./pages/VehicleComparison";
import Inventory from "./pages/Inventory";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import Apply from "./pages/Apply";
import QuickQualify from "./pages/QuickQualify";
import QRCodePage from "./pages/QRCodePage";
import LotView from "./pages/LotView";
import ScanRedirect from "./pages/ScanRedirect";
import AdminLeads from "./pages/admin/Leads";
import AdminPortfolioBuyers from "./pages/admin/PortfolioBuyers";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminContacts from "./pages/admin/Contacts";
import AdminDescriptions from "./pages/admin/Descriptions";
import AdminUsers from "./pages/admin/Users";
import AdminInventory from "./pages/admin/Inventory";
import AdminInventoryLookup from "./pages/admin/InventoryLookup";
import AdminDocuments from "./pages/admin/Documents";
import AdminPipeline from "./pages/admin/Pipeline";
import AdminPipelineNew from "./pages/admin/PipelineNew";
import AdminCreditApplications from "./pages/admin/CreditApplications";
import AdminAnalytics from "./pages/admin/Analytics";
import AdminTracking from "./pages/admin/Tracking";
import AdminCustomerProfiles from "./pages/admin/CustomerProfiles";
import AdminIntegrations from "./pages/admin/Integrations";
import Partners from "./pages/Partners";
import LendmarkApplication from "./pages/LendmarkApplication";
import GovernmentContracting from "./pages/GovernmentContracting";
import OAuthConsent from "./pages/OAuthConsent";
import { MiddlemanChat } from "./components/MiddlemanChat";
import AdminArchives from "./pages/admin/ArchiveViewer";
import AdminAllData from "./pages/admin/AllData";
import AdminSqlRunner from "./pages/admin/SqlRunner";
import AdminCRM from "./pages/admin/CRM";
import AdminQuickQualifySOP from "./pages/admin/QuickQualifySOP";
import { RequireAuth } from "./components/RequireAuth";
import { BackToTopButton } from "./components/BackToTopButton";

const queryClient = new QueryClient();

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>          
            <BackToTopButton />
            <Routes>
              {/* Public routes: only sign-in, OAuth consent, and the two lead-gen funnel entry points. */}
              <Route path="/auth" element={<Auth />} />
              <Route path="/.lovable/oauth/consent" element={<OAuthConsent />} />
              <Route path="/apply" element={<Apply />} />
              <Route path="/quick-qualify" element={<QuickQualify />} />

              {/* Public marketing and information pages */}
              <Route path="/" element={<Index />} />
              <Route path="/inventory" element={<Inventory />} />
              <Route path="/product/:handle" element={<ProductDetail />} />
              <Route path="/compare" element={<VehicleComparison />} />
              <Route path="/lot-view" element={<LotView />} />
              <Route path="/partners" element={<Partners />} />
              <Route path="/government" element={<GovernmentContracting />} />
              <Route path="/prequalify" element={<QuickQualify />} />
              <Route path="/scan-to-prequalify" element={<QRCodePage />} />
              <Route path="/scan" element={<ScanRedirect />} />
              <Route path="/r/qr" element={<ScanRedirect />} />
              <Route path="/lendmark" element={<LendmarkApplication />} />
              <Route path="/lendmark-application" element={<LendmarkApplication />} />

              {/* Admin routes: RequireAuth ensures a session; AdminLayout enforces role. */}
              <Route path="/admin" element={<RequireAuth><AdminDashboard /></RequireAuth>} />
              <Route path="/admin/crm" element={<RequireAuth><AdminCRM /></RequireAuth>} />
              <Route path="/admin/all-data" element={<RequireAuth><AdminAllData /></RequireAuth>} />
              <Route path="/admin/archives" element={<RequireAuth><AdminArchives /></RequireAuth>} />
              <Route path="/admin/sql" element={<RequireAuth><AdminSqlRunner /></RequireAuth>} />
              <Route path="/admin/analytics" element={<RequireAuth><AdminAnalytics /></RequireAuth>} />
              <Route path="/admin/tracking" element={<RequireAuth><AdminTracking /></RequireAuth>} />
              <Route path="/admin/customer-profiles" element={<RequireAuth><AdminCustomerProfiles /></RequireAuth>} />
              <Route path="/admin/integrations" element={<RequireAuth><AdminIntegrations /></RequireAuth>} />
              <Route path="/admin/inventory" element={<RequireAuth><AdminInventory /></RequireAuth>} />
              <Route path="/admin/inventory-lookup" element={<RequireAuth><AdminInventoryLookup /></RequireAuth>} />
              <Route path="/admin/credit-applications" element={<RequireAuth><AdminCreditApplications /></RequireAuth>} />
              <Route path="/admin/contacts" element={<RequireAuth><AdminContacts /></RequireAuth>} />
              <Route path="/admin/descriptions" element={<RequireAuth><AdminDescriptions /></RequireAuth>} />
              <Route path="/admin/users" element={<RequireAuth><AdminUsers /></RequireAuth>} />
              <Route path="/admin/documents" element={<RequireAuth><AdminDocuments /></RequireAuth>} />
              <Route path="/admin/pipeline" element={<RequireAuth><AdminPipeline /></RequireAuth>} />
              <Route path="/admin/pipeline/new" element={<RequireAuth><AdminPipelineNew /></RequireAuth>} />
              <Route path="/admin/leads" element={<RequireAuth><AdminLeads /></RequireAuth>} />
              <Route path="/admin/portfolio-buyers" element={<RequireAuth><AdminPortfolioBuyers /></RequireAuth>} />
              <Route path="/admin/quickqualify-sop" element={<RequireAuth><AdminQuickQualifySOP /></RequireAuth>} />

              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
          <MiddlemanChat />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
