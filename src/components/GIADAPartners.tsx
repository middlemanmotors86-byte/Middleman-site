import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, ChevronDown, ChevronUp, Award, FileDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import GIADABanner from "@/components/GIADABanner";

type Partner = {
  name: string;
  phone?: string;
  website?: string;
  description?: string;
  discount?: string;
  applicationPdf?: string;
};

type Category = {
  label: string;
  partners: Partner[];
};

const partnerCategories: Category[] = [
  {
    label: "Accounting & Tax",
    partners: [
      { name: "HHM CPAs", phone: "423-756-7771", website: "hhmcpas.com", description: "Accounting, tax and consulting for automotive dealerships." },
      { name: "Wilson Lewis", phone: "770-476-1004", website: "wilsonlewis.com", description: "Certified public accounting firm." },
      { name: "Tax Max", phone: "866-642-4107", website: "taxmax.com", description: "Convert paystubs/W2s into down payments.", discount: "10% OFF with code GIADA" },
      { name: "Stifel", phone: "912-234-5400", website: "stifel.com", description: "Diversified global wealth management company." },
    ],
  },
  {
    label: "Floor Planning",
    partners: [
      { name: "NextGear Capital", phone: "888-969-3721", website: "nextgearcapital.com", description: "Industry-leading provider of flexible lines of credit for dealers." },
      { name: "Autobank Floorplan", phone: "864-269-3322", website: "autobankfp.com", description: "Capital and buying power for used car dealers." },
      { name: "Automotive Finance Corp.", phone: "770-805-4155", website: "afcdealer.com", description: "Floor planning solutions." },
      { name: "Floorplan Xpress", phone: "855-605-6991", website: "floorplanxpress.com", description: "Fast, customizable and reliable financing solutions." },
      { name: "Kinetic Advantage", phone: "317-428-7037", website: "kineticadvantage.com", description: "Dynamic independent floorplan company." },
      { name: "PrimaLend Capital", phone: "312-933-5338", website: "primalend.com", description: "Capital to finance auction purchases and trades." },
      { name: "Dealer Financial", phone: "864-385-7302", website: "dealerfinancial.com", description: "Floor plans designed to support your business." },
      { name: "Axle Funding", phone: "770-336-7880", website: "axlefunding.net", description: "Flexible credit lines to increase inventory." },
      { name: "Carbucks", phone: "864-234-9696", website: "cbfloorplan.com" },
      { name: "Vehicle Acceptance Corp.", phone: "804-253-9239", website: "vacorp.com", description: "Floorplan financing for independent used car dealers." },
    ],
  },
  {
    label: "Consumer Finance",
    partners: [
      { name: "OneMain Financial", phone: "770-841-5822", website: "onemainfinancial.com" },
      { name: "Lendmark Financial Services", phone: "678-358-8706", website: "lendmarkfinancial.com", description: "50 locations in Georgia with fast and friendly service.", applicationPdf: "/lendmark-credit-application.pdf" },
      { name: "Professional Financial Services", phone: "(470) 345-6715", website: "pfs-corp.net", description: "Common Sense Loans At Uncommon Speed." },
      { name: "Ottomoto", phone: "770-406-8598", website: "ottomoto.net", description: "Vehicle financing platform connecting dealers with lenders." },
      { name: "International Credit", phone: "678-325-5154", website: "internationalcreditinc.com" },
      { name: "TRG Auto Finance", phone: "904-476-1374", website: "trgautofinance.com", description: "Receivable purchase programs and floor plan options." },
      { name: "Peoples Financial", phone: "229-242-6620", website: "peoplesfinancial.net" },
      { name: "American Finance", phone: "302-786-4119", website: "americanfinancellc.com" },
    ],
  },
  {
    label: "BHPH Capital",
    partners: [
      { name: "Agora Data", phone: "877-592-4672", website: "agoradata.com" },
      { name: "Car Financial Services", phone: "678-317-4350", website: "carfinancial.com", description: "Bulk purchase, payment streams, floor planning for BHPH dealers." },
      { name: "SDA", phone: "800-467-5172", website: "sdainc.net", description: "Nationwide capital provider to the BHPH industry for 25+ years." },
      { name: "Spartan Financial Partners", phone: "855-233-3605", website: "spartan-partners.com", description: "BHPH line of credit with free portfolio analysis." },
      { name: "Sterling Credit", phone: "706-830-3045", website: "sterlingcreditcorporation.com" },
      { name: "Strategic Dealer Services", phone: "212-838-1212", website: "sdealers.com" },
      { name: "Style Financial Acceptance", phone: "770-949-8598", website: "stylefin.co" },
    ],
  },
  {
    label: "Warranty & F&I",
    partners: [
      { name: "GWC Warranty", phone: "800-482-7357", website: "gwcwarranty.com", description: "Best-in-class used vehicle service contracts since 1995." },
      { name: "ASC Warranty", phone: "800-442-7116", website: "ascwarranty.com", description: "Helping dealers sell more cars for over 30 years." },
      { name: "Freedom Warranty", phone: "877-249-4186", website: "freedomwarranty.com" },
      { name: "ProGuard Automotive", phone: "877-474-9462", website: "proguardautomotive.com", description: "Leading provider of vehicle service contracts." },
      { name: "NVP Warranty", phone: "888-270-5835", website: "nvpwarranty.com" },
      { name: "Integrity Warranty", phone: "423-910-9490", website: "integritywarranty.com" },
      { name: "PermaPlate", phone: "800-453-8470", website: "permaplate.com" },
      { name: "HDR Services", phone: "678-520-0807", description: "Finance products and training for automotive dealers." },
      { name: "Cover All Consultants", phone: "561-817-9612", website: "coverallconsultants.com", description: "F&I solutions and consulting for dealerships." },
      { name: "American Auto Protection", phone: "972-908-9908", website: "aaprotect.com", description: "Vehicle service contracts, GAP coverage, and protection plans." },
    ],
  },
  {
    label: "DMS & Software",
    partners: [
      { name: "Wayne Reaves Software", phone: "800-701-8082", website: "waynereaves.com", description: "Leading dealer management software since 1987." },
      { name: "DealerCenter", phone: "888-669-2669", website: "dealercenter.net", description: "Web-based dealer management software." },
      { name: "Deal Pack (ABCoA)", phone: "800-526-5832", website: "dealpack.com", description: "Turn-key DMS software.", discount: "20% off one-time fee for GIADA members" },
      { name: "Comsoft", phone: "800-849-3838", website: "comsoft.com", description: "Dealership management & marketing software." },
      { name: "vAuto", phone: "877-828-8614", website: "vauto.com", description: "Live market view for better dealer decisions." },
      { name: "Podium", phone: "801-758-0580", website: "podium.com" },
      { name: "Neo Verify", phone: "949-326-4928", website: "neo360.ai" },
    ],
  },
  {
    label: "Insurance & Bonds",
    partners: [
      { name: "All American Bonds & Insurance", phone: "844-321-2663", website: "quickerbonds.com", discount: "10% off bond price for GIADA members" },
      { name: "Cornerstone Insurance Group", phone: "800-257-9999", website: "dealergarageinsurance.com" },
      { name: "Reeves Insurance Associates", phone: "770-949-0025", website: "reeves-ins.com", description: "GIADA member since 2000, multi-carrier coverage." },
      { name: "RLI Insurance Company", phone: "800-645-2402", website: "rlicorp.com", description: "A+ rated specialty insurer." },
      { name: "American Risk Services", phone: "678-366-7279", website: "americanriskservices.com", description: "Leading provider of Collateral Protection Insurance." },
      { name: "Georgia Insurance Associates", phone: "678-985-0944", website: "georgiains.com" },
      { name: "Surety Bond Girls", phone: "678-694-1967", website: "suretybondgirls.com", description: "Full service surety bonding and compliance." },
      { name: "Ron E. Widener & Associates", phone: "770-941-0293", website: "ronwidener.com" },
      { name: "Griffin Agency", phone: "912-384-1003", website: "griffinagency.com" },
      { name: "Galaxy Tax & Insurance", phone: "706-850-2761", website: "gtiathens.com" },
    ],
  },
  {
    label: "GPS & Tracking",
    partners: [
      { name: "Advantage GPS (Procon Analytics)", phone: "949-422-7103", website: "advantagegps.com", description: "AI-driven GPS analytics for auto lenders." },
      { name: "InAuto", phone: "727-440-3913", website: "inautosolutions.com", description: "Advanced GPS tracking solutions for dealerships." },
      { name: "Ituran USA", phone: "866-543-5433", website: "ituranusa.com", description: "Global leader in vehicle GPS tracking since 1995." },
      { name: "Passtime", phone: "877-727-7846", website: "passtimegps.com" },
      { name: "Goldstar GPS (Solera)", phone: "678-362-2161", website: "spireon.com", description: "North America's largest telematics company." },
      { name: "Stars GPS", phone: "336-476-7828", website: "stars-gps.com" },
      { name: "Sarekon GPS", phone: "888-726-3511", website: "sarekon.com" },
    ],
  },
  {
    label: "Compliance & Credit Reports",
    partners: [
      { name: "700Credit", phone: "866-273-3848", website: "700credit.com", description: "Bureau-inclusive credit and compliance solutions." },
      { name: "Microbilt Corp", phone: "866-538-9815", website: "microbilt.com", description: "Registered consumer credit reporting agency." },
      { name: "Carfax", phone: "888-788-7715", website: "carfax.com" },
      { name: "Auto Data Direct", phone: "850-877-8804", website: "add123.com", description: "Vehicle database searches." },
    ],
  },
  {
    label: "Legal Services",
    partners: [
      { name: "Dunlap Gardiner, LLP", phone: "770-489-5122", website: "dunlapgardiner.com", description: "Auto dealer representation, collections, and compliance." },
      { name: "Lefkoff Law, LLC", phone: "404-482-2228", website: "lefkofflaw.com", description: "Specializes in GIADA dealer representation." },
      { name: "LRGRW", phone: "404-869-6900", website: "lrglaw.com", description: "Premier creditors' rights law firm." },
      { name: "Rountree & Leitman", phone: "404-584-1229", website: "randllaw.com", description: "Commercial law, bankruptcy, and collections." },
    ],
  },
  {
    label: "Marketing & Online",
    partners: [
      { name: "Autotrader", website: "autotrader.com", description: "Ultimate online solution for buying and selling cars." },
      { name: "Big Time Advertising", phone: "636-614-4151", website: "gowithbigtime.com" },
      { name: "eBay Motors", phone: "208-206-6238", website: "ebay.com" },
      { name: "FRIKINtech", phone: "833-374-5468", website: "frikintech.com", description: "Sales pipeline nurturing from past and current prospects." },
      { name: "Professional Mojo", phone: "866-611-2715", website: "professionalmojo.com" },
      { name: "Cardoozy", phone: "800-346-0371", website: "cardoozy.com" },
    ],
  },
  {
    label: "Payment Processing",
    partners: [
      { name: "Aurora Payments", phone: "833-287-6722", website: "risewithaurora.com", description: "Modern, modular payment infrastructure." },
      { name: "BlytzPay", phone: "801-658-2212", website: "blytzpay.com", description: "Instant mobile bill payment solutions." },
      { name: "Carpay", phone: "877-388-4265", website: "carpay.com" },
      { name: "Repay", phone: "470-582-9696" },
    ],
  },
  {
    label: "ETR & Title Services",
    partners: [
      { name: "CVR", phone: "800-333-6995", website: "cvrconnect.com" },
      { name: "TitleTec", phone: "877-684-4958", website: "titletec.com", description: "Business, title & registration software." },
      { name: "Title Me Crazy", phone: "770-940-9642", description: "15+ years of titling excellence.", discount: "5% GIADA member discount" },
    ],
  },
  {
    label: "Reinsurance",
    partners: [
      { name: "Buckeye Risk Services", phone: "330-726-9030", website: "buckeyerisk.com", description: "Custom reinsurance programs for BHPH and retail dealers." },
      { name: "National Lenders General Agency", phone: "817-767-9200", website: "nationallenders.com" },
      { name: "North American Automotive Group", phone: "770-751-1124", website: "northamericanautomotive.com" },
    ],
  },
  {
    label: "Vehicle Services & Transport",
    partners: [
      { name: "AutoNation Mobile Service", phone: "888-906-3370", website: "autonationmobileservice.com" },
      { name: "Vehicle Transport Hub", phone: "404-999-4104", website: "vehicletransporthub.com" },
      { name: "Rockbrook Logistics", phone: "813-921-3103", website: "rockbrooklogistics.com" },
      { name: "R&R Global Logistics", phone: "678-926-4390", website: "rrgls.com" },
      { name: "SA Recycling", phone: "706-681-1118", website: "sarecycling.com" },
      { name: "Georgia's Clean Air Force", phone: "800-449-2471", website: "cleanairforce.com", description: "Georgia's vehicle emissions program." },
    ],
  },
  {
    label: "Other Services",
    partners: [
      { name: "NAAA", phone: "301-696-0400", website: "naaa.com", description: "National Auto Auction Association." },
      { name: "Alltek Holdings", phone: "770-949-8468", website: "alltekholdings.com", description: "Technology solutions and networking support." },
      { name: "Peachtree Planning", phone: "404-384-4140", website: "peachtreeplanning.com", description: "Asset protection for dealers.", discount: "Exclusive GIADA discounts" },
      { name: "SiriusXM Radio", phone: "866-635-5027", website: "siriusxm.com" },
      { name: "Avery Automats", phone: "706-278-5161", website: "averyautomats.com", description: "Custom branded dealership mats for 35+ years.", discount: "$150 off first pallet" },
      { name: "Gale Force AI", phone: "904-705-2393", website: "galeforce.ai/automotive" },
    ],
  },
];

const GIADAPartners = () => {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const navigate = useNavigate();

  // Show a subset of categories on homepage
  const featuredCategories = partnerCategories.slice(0, 6);

  return (
    <section id="partners" className="py-20 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center mb-12">
          <GIADABanner variant="full" className="mb-6" />
          <h2 className="text-3xl md:text-5xl font-heading font-bold text-foreground mt-2 mb-6">
            Our Industry <span className="text-gradient-gold">Network</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            As a member of the Georgia Independent Automobile Dealers Association, 
            we have access to a network of <strong className="text-foreground">{partnerCategories.reduce((acc, c) => acc + c.partners.length, 0)}+ trusted industry partners</strong> to 
            better serve our customers.
          </p>
        </div>

        {/* Featured Categories Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          {featuredCategories.map((category) => {
            const isExpanded = expandedCategory === category.label;
            const displayPartners = isExpanded ? category.partners : category.partners.slice(0, 3);

            return (
              <div
                key={category.label}
                className="bg-card border border-border rounded-xl p-6 hover:border-primary/30 transition-all duration-300"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-heading font-semibold text-lg text-foreground">
                    {category.label}
                  </h3>
                  <Badge variant="secondary" className="text-xs">
                    {category.partners.length}
                  </Badge>
                </div>

                {category.label === "Consumer Finance" && (
                  <button
                    onClick={() => navigate("/lendmark")}
                    className="w-full mb-4 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-primary/10 border border-primary/30 hover:bg-primary/20 hover:border-primary/50 transition-colors text-primary text-sm font-semibold"
                  >
                    <FileDown className="w-4 h-4" />
                    Lendmark Credit Application
                  </button>
                )}

                <ul className="space-y-3">
                  {displayPartners.map((partner) => (
                    <li key={partner.name} className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {partner.name}
                        </p>
                        {partner.discount && (
                          <span className="text-xs text-primary font-medium">
                            {partner.discount}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {partner.applicationPdf && (
                          <button
                            onClick={() => navigate("/lendmark")}
                            className="text-primary hover:text-primary/80 transition-colors"
                            title="Open Lendmark credit application"
                          >
                            <FileDown className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {partner.website && (
                          <a
                            href={`https://${partner.website}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-muted-foreground hover:text-primary transition-colors"
                            title={partner.website}
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>

                {category.partners.length > 3 && (
                  <button
                    onClick={() =>
                      setExpandedCategory(isExpanded ? null : category.label)
                    }
                    className="flex items-center gap-1 text-xs text-primary mt-3 hover:underline"
                  >
                    {isExpanded ? (
                      <>
                        Show less <ChevronUp className="w-3 h-3" />
                      </>
                    ) : (
                      <>
                        +{category.partners.length - 3} more <ChevronDown className="w-3 h-3" />
                      </>
                    )}
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* CTA to full partners page */}
        <div className="text-center">
          <Button
            variant="outline"
            size="lg"
            onClick={() => navigate("/partners")}
          >
            <Award className="w-5 h-5 mr-2" />
            View All {partnerCategories.length} Partner Categories
          </Button>
        </div>
      </div>
    </section>
  );
};

export { partnerCategories };
export default GIADAPartners;
