import { Helmet } from "react-helmet-async";
import SevenHundredCreditQR from "@/components/SevenHundredCreditQR";
import { usePageView } from "@/hooks/usePageView";

const QRCodePage = () => {
  usePageView();
  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Scan to Pre-Qualify | Middleman Motors 700Credit</title>
        <meta
          name="description"
          content="Scan this QR code to start your 700Credit soft-pull pre-qualification with Middleman Motors. No SSN, no DOB, no credit score impact."
        />
        <link rel="canonical" href="https://www.middlemanmotors.com/scan-to-prequalify" />
      </Helmet>

      <main className="flex min-h-screen items-center justify-center px-4 py-12">
        <div className="w-full max-w-4xl">
          <SevenHundredCreditQR />
        </div>
      </main>
    </div>
  );
};

export default QRCodePage;
