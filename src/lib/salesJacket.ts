import jsPDF from "jspdf";
import type { Deal } from "@/pages/admin/Pipeline";
import { supabase } from "@/integrations/supabase/client";
import middlemanLogo from "@/assets/middleman-logo-mark.png";

// Cache the brand logo as a data URL so jsPDF can embed it synchronously after first load.
let logoDataUrl: string | null = null;
async function loadLogo(): Promise<string> {
  if (logoDataUrl) return logoDataUrl;
  const res = await fetch(middlemanLogo);
  const blob = await res.blob();
  logoDataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
  return logoDataUrl;
}


const DEALER = {
  name: "MIDDLEMAN MOTORS LLC",
  address: "1970 Main St East, Suite B12, Snellville, GA 30078",
  phone: "(770) 676-0367",
  email: "jscg@middlemanmotors.store",
  license: "GA Dealer License #________",
};

type Doc = jsPDF;

const P = { x: 0.5, y: 0.5, w: 7.5, lh: 0.22 };
const today = () => new Date().toLocaleDateString("en-US");

function header(doc: Doc, title: string, subtitle?: string) {
  doc.setFont("helvetica", "bold").setFontSize(9);
  doc.text("STATE OF GEORGIA", P.x, 0.4);
  doc.text(DEALER.name, 8.0 - 0.5, 0.4, { align: "right" });
  doc.setLineWidth(0.02).line(P.x, 0.5, 8.0, 0.5);

  doc.setFontSize(14).text(title, 4.25, 0.85, { align: "center" });
  if (subtitle) {
    doc.setFont("helvetica", "normal").setFontSize(9);
    doc.text(subtitle, 4.25, 1.05, { align: "center" });
  }
  doc.setFont("helvetica", "normal");
}

function footer(doc: Doc, formCode: string) {
  doc.setFont("helvetica", "italic").setFontSize(7);
  doc.text(`Form ${formCode}  |  ${DEALER.name}  |  Generated ${today()}`, 4.25, 10.7, { align: "center" });
}

function field(doc: Doc, label: string, value: string | undefined | null, x: number, y: number, w: number) {
  doc.setFont("helvetica", "normal").setFontSize(7).setTextColor(90);
  doc.text(label.toUpperCase(), x, y - 0.04);
  doc.setTextColor(0).setFontSize(10);
  doc.line(x, y + 0.22, x + w, y + 0.22);
  doc.text(value ? String(value) : "", x + 0.05, y + 0.18);
}

function box(doc: Doc, title: string, x: number, y: number, w: number, h: number) {
  doc.setLineWidth(0.01).rect(x, y, w, h);
  doc.setFillColor(240, 240, 240).rect(x, y, w, 0.22, "F");
  doc.setFont("helvetica", "bold").setFontSize(8).setTextColor(40);
  doc.text(title.toUpperCase(), x + 0.07, y + 0.155);
  doc.setTextColor(0).setFont("helvetica", "normal");
}

function sigBlock(doc: Doc, y: number) {
  doc.setFontSize(8).setFont("helvetica", "normal");
  doc.line(0.5, y, 4.0, y);
  doc.line(4.5, y, 7.5, y);
  doc.text("Buyer Signature", 0.5, y + 0.15);
  doc.text("Date", 4.5, y + 0.15);
  doc.line(0.5, y + 0.7, 4.0, y + 0.7);
  doc.line(4.5, y + 0.7, 7.5, y + 0.7);
  doc.text("Dealer / Authorized Representative", 0.5, y + 0.85);
  doc.text("Date", 4.5, y + 0.85);
}

// ============= FORM PAGES =============

function coverPage(doc: Doc, d: Deal) {
  header(doc, "GEORGIA DEALER SALES JACKET", "Deal File Cover Sheet");
  let y = 1.5;
  box(doc, "Deal Information", 0.5, y, 7.5, 0.22); y += 0.35;
  field(doc, "Deal ID", d.id.slice(0, 8).toUpperCase(), 0.5, y, 3.5);
  field(doc, "Stage", d.stage.replace("_", " ").toUpperCase(), 4.2, y, 3.3); y += 0.55;
  field(doc, "Date Opened", new Date(d.created_at).toLocaleDateString(), 0.5, y, 3.5);
  field(doc, "Sale Price", d.sale_price ? `$${Number(d.sale_price).toLocaleString()}` : "", 4.2, y, 3.3); y += 0.7;

  box(doc, "Customer", 0.5, y, 7.5, 0.22); y += 0.35;
  field(doc, "Full Name", d.customer_name, 0.5, y, 7.5); y += 0.55;
  field(doc, "Address", d.customer_address, 0.5, y, 7.5); y += 0.55;
  field(doc, "City", d.customer_city, 0.5, y, 3.5);
  field(doc, "State", d.customer_state, 4.2, y, 1.3);
  field(doc, "ZIP", d.customer_zip, 5.7, y, 1.8); y += 0.55;
  field(doc, "Phone", d.customer_phone, 0.5, y, 3.5);
  field(doc, "Email", d.customer_email, 4.2, y, 3.3); y += 0.55;
  field(doc, "Driver's License #", d.customer_dl_number, 0.5, y, 7.5); y += 0.7;

  box(doc, "Vehicle", 0.5, y, 7.5, 0.22); y += 0.35;
  field(doc, "Year", d.vehicle_year, 0.5, y, 1.3);
  field(doc, "Make", d.vehicle_make, 2.0, y, 2.5);
  field(doc, "Model", d.vehicle_model, 4.7, y, 2.8); y += 0.55;
  field(doc, "VIN", d.vehicle_vin, 0.5, y, 5.0);
  field(doc, "Stock #", d.vehicle_stock_number, 5.7, y, 1.8); y += 0.7;

  box(doc, "Sales Jacket Contents", 0.5, y, 7.5, 0.22); y += 0.35;
  const docs = [
    "Bill of Sale (T-7)",
    "Title Application (MV-1)",
    "Odometer Disclosure (T-8)",
    "Buyer's Guide (FTC)",
    "Power of Attorney (T-8 POA)",
    "Reassignment (T-11)",
    "TAVT Worksheet",
    "Finance Contract",
    "Driver's License Copy",
    "Proof of Insurance",
    "Vehicle History Report",
    "Emissions Certificate",
    "Lien Release (if applicable)",
    "Tag Receipt (MV-18G)",
    "Delivery Receipt",
  ];
  docs.forEach((label, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const cx = 0.6 + col * 3.7;
    const cy = y + row * 0.28;
    doc.rect(cx, cy, 0.18, 0.18);
    doc.setFontSize(9).text(label, cx + 0.3, cy + 0.14);
  });

  footer(doc, "SJ-COVER");
}

function billOfSalePage(doc: Doc, d: Deal) {
  doc.addPage();
  header(doc, "BILL OF SALE", "Georgia Form T-7  |  Motor Vehicle");
  let y = 1.4;

  box(doc, "Seller (Dealer)", 0.5, y, 7.5, 0.22); y += 0.32;
  field(doc, "Dealer Name", DEALER.name, 0.5, y, 7.5); y += 0.5;
  field(doc, "Address", DEALER.address, 0.5, y, 5.0);
  field(doc, "Phone", DEALER.phone, 5.7, y, 1.8); y += 0.6;

  box(doc, "Buyer", 0.5, y, 7.5, 0.22); y += 0.32;
  field(doc, "Buyer Name", d.customer_name, 0.5, y, 5.0);
  field(doc, "DL #", d.customer_dl_number, 5.7, y, 1.8); y += 0.5;
  field(doc, "Address", [d.customer_address, d.customer_city, d.customer_state, d.customer_zip].filter(Boolean).join(", "), 0.5, y, 7.5); y += 0.5;
  field(doc, "Phone", d.customer_phone, 0.5, y, 3.5);
  field(doc, "Email", d.customer_email, 4.2, y, 3.3); y += 0.6;

  if (d.co_buyer_name) {
    box(doc, "Co-Buyer", 0.5, y, 7.5, 0.22); y += 0.32;
    field(doc, "Co-Buyer Name", d.co_buyer_name, 0.5, y, 5.0);
    field(doc, "DL #", d.co_buyer_dl_number, 5.7, y, 1.8); y += 0.6;
  }

  box(doc, "Vehicle Sold", 0.5, y, 7.5, 0.22); y += 0.32;
  field(doc, "Year", d.vehicle_year, 0.5, y, 1.0);
  field(doc, "Make", d.vehicle_make, 1.7, y, 2.0);
  field(doc, "Model", d.vehicle_model, 3.9, y, 2.0);
  field(doc, "Body", "", 6.1, y, 1.4); y += 0.5;
  field(doc, "VIN", d.vehicle_vin, 0.5, y, 5.0);
  field(doc, "Stock #", d.vehicle_stock_number, 5.7, y, 1.8); y += 0.6;

  box(doc, "Sale Terms", 0.5, y, 7.5, 0.22); y += 0.32;
  const price = d.sale_price ? Number(d.sale_price) : 0;
  const tradeVal = d.trade_in_value ? Number(d.trade_in_value) : 0;
  field(doc, "Sale Price", `$${price.toLocaleString()}`, 0.5, y, 2.3);
  field(doc, "Trade Allowance", tradeVal ? `$${tradeVal.toLocaleString()}` : "", 3.0, y, 2.3);
  field(doc, "Balance", price && tradeVal ? `$${(price - tradeVal).toLocaleString()}` : "", 5.5, y, 2.0); y += 0.6;

  doc.setFont("helvetica", "normal").setFontSize(8.5);
  const terms = doc.splitTextToSize(
    "The seller named above hereby sells, transfers, and delivers the motor vehicle described above to the buyer for the consideration stated. Seller warrants clear title free of liens except as noted. Vehicle is sold AS-IS unless a written warranty is provided per the attached FTC Buyer's Guide.",
    7.0
  );
  doc.text(terms, 0.5, y); y += terms.length * 0.16 + 0.3;

  sigBlock(doc, y + 0.2);
  footer(doc, "T-7");
}

function mv1Page(doc: Doc, d: Deal) {
  doc.addPage();
  header(doc, "TITLE / TAG APPLICATION", "Georgia Form MV-1  |  Department of Revenue");
  let y = 1.4;

  box(doc, "Owner Information", 0.5, y, 7.5, 0.22); y += 0.32;
  field(doc, "Owner Name (Last, First, MI)", d.customer_name, 0.5, y, 5.0);
  field(doc, "DL # / ID", d.customer_dl_number, 5.7, y, 1.8); y += 0.5;
  if (d.co_buyer_name) {
    field(doc, "Co-Owner Name", d.co_buyer_name, 0.5, y, 5.0);
    field(doc, "Co-Owner DL #", d.co_buyer_dl_number, 5.7, y, 1.8); y += 0.5;
  }
  field(doc, "Mailing Address", d.customer_address, 0.5, y, 7.5); y += 0.5;
  field(doc, "City", d.customer_city, 0.5, y, 3.5);
  field(doc, "State", d.customer_state, 4.2, y, 1.3);
  field(doc, "ZIP", d.customer_zip, 5.7, y, 1.8); y += 0.5;
  field(doc, "County of Residence", "", 0.5, y, 3.5);
  field(doc, "Phone", d.customer_phone, 4.2, y, 3.3); y += 0.6;

  box(doc, "Vehicle Description", 0.5, y, 7.5, 0.22); y += 0.32;
  field(doc, "VIN", d.vehicle_vin, 0.5, y, 5.0);
  field(doc, "Year", d.vehicle_year, 5.7, y, 1.8); y += 0.5;
  field(doc, "Make", d.vehicle_make, 0.5, y, 2.3);
  field(doc, "Model", d.vehicle_model, 3.0, y, 2.5);
  field(doc, "Body Style", "", 5.7, y, 1.8); y += 0.5;
  field(doc, "Color", "", 0.5, y, 2.3);
  field(doc, "Fuel Type", "Gasoline", 3.0, y, 2.5);
  field(doc, "Odometer", "", 5.7, y, 1.8); y += 0.6;

  box(doc, "Lienholder (if any)", 0.5, y, 7.5, 0.22); y += 0.32;
  field(doc, "Lienholder Name", "", 0.5, y, 5.0);
  field(doc, "Date of Lien", "", 5.7, y, 1.8); y += 0.5;
  field(doc, "Lienholder Address", "", 0.5, y, 7.5); y += 0.7;

  box(doc, "TAVT / Tax", 0.5, y, 7.5, 0.22); y += 0.32;
  const price = d.sale_price ? Number(d.sale_price) : 0;
  const tavt = price * 0.07;
  field(doc, "Fair Market Value", `$${price.toLocaleString()}`, 0.5, y, 2.3);
  field(doc, "TAVT Rate", "7.00%", 3.0, y, 1.5);
  field(doc, "TAVT Due", tavt ? `$${tavt.toFixed(2)}` : "", 4.7, y, 2.8); y += 0.7;

  sigBlock(doc, y + 0.2);
  footer(doc, "MV-1");
}

function odometerPage(doc: Doc, d: Deal) {
  doc.addPage();
  header(doc, "ODOMETER DISCLOSURE STATEMENT", "Georgia Form T-8  |  Federal Truth-in-Mileage Act");
  let y = 1.4;

  doc.setFontSize(8.5);
  const intro = doc.splitTextToSize(
    "Federal and state law require that you state the mileage upon transfer of ownership. Failure to complete or providing a false statement may result in fines and/or imprisonment.",
    7.0
  );
  doc.text(intro, 0.5, y); y += intro.length * 0.16 + 0.2;

  box(doc, "Vehicle", 0.5, y, 7.5, 0.22); y += 0.32;
  field(doc, "VIN", d.vehicle_vin, 0.5, y, 5.0);
  field(doc, "Year", d.vehicle_year, 5.7, y, 1.8); y += 0.5;
  field(doc, "Make", d.vehicle_make, 0.5, y, 3.5);
  field(doc, "Model", d.vehicle_model, 4.2, y, 3.3); y += 0.7;

  box(doc, "Mileage Disclosure", 0.5, y, 7.5, 0.22); y += 0.32;
  field(doc, "Odometer Reading (no tenths)", "", 0.5, y, 4.5);
  field(doc, "Date Read", today(), 5.2, y, 2.3); y += 0.6;

  doc.setFontSize(9).setFont("helvetica", "bold").text("I certify to the best of my knowledge the odometer reading reflects:", 0.5, y); y += 0.25;
  doc.setFont("helvetica", "normal").setFontSize(9);
  const checks = [
    "1. The ACTUAL MILEAGE of the vehicle.",
    "2. The mileage in EXCESS of its mechanical limits.",
    "3. The odometer reading is NOT THE ACTUAL MILEAGE — WARNING: ODOMETER DISCREPANCY.",
  ];
  checks.forEach(c => { doc.rect(0.6, y - 0.13, 0.18, 0.18); doc.text(c, 0.9, y); y += 0.25; });

  y += 0.4;
  box(doc, "Transferor (Seller)", 0.5, y, 3.6, 0.22);
  box(doc, "Transferee (Buyer)", 4.2, y, 3.3, 0.22); y += 0.32;
  field(doc, "Name", DEALER.name, 0.5, y, 3.6);
  field(doc, "Name", d.customer_name, 4.2, y, 3.3); y += 0.5;
  field(doc, "Address", DEALER.address, 0.5, y, 3.6);
  field(doc, "Address", [d.customer_address, d.customer_city].filter(Boolean).join(", "), 4.2, y, 3.3); y += 0.6;

  sigBlock(doc, y + 0.2);
  footer(doc, "T-8");
}

function buyersGuidePage(doc: Doc, d: Deal, logo: string | null) {
  doc.addPage();

  // === Middleman Motors brand header bar (gold accent over dark band) ===
  doc.setFillColor(13, 13, 13).rect(0, 0, 8.5, 1.25, "F"); // dark band
  doc.setFillColor(201, 168, 76).rect(0, 1.25, 8.5, 0.06, "F"); // gold accent line

  if (logo) {
    try {
      // Logo on the left of the dark band
      doc.addImage(logo, "PNG", 0.4, 0.18, 1.4, 0.9, undefined, "FAST");
    } catch {
      // fallback: skip image if format unsupported
    }
  }

  // Brand wordmark text (right side of band)
  doc.setTextColor(201, 168, 76).setFont("helvetica", "bold").setFontSize(11);
  doc.text("MIDDLEMAN MOTORS", 8.1, 0.55, { align: "right" });
  doc.setTextColor(220).setFont("helvetica", "normal").setFontSize(8);
  doc.text("1970 Main St East, Suite B12, Snellville, GA 30078", 8.1, 0.78, { align: "right" });
  doc.text("(770) 676-0367  |  middlemanmotors.com", 8.1, 0.95, { align: "right" });
  doc.setTextColor(0);

  // === FTC Buyers Guide title (below brand band) ===
  doc.setFont("helvetica", "bold").setFontSize(20).text("BUYERS GUIDE", 4.25, 1.7, { align: "center" });
  doc.setFont("helvetica", "normal").setFontSize(9);
  doc.text(
    "IMPORTANT: Spoken promises are difficult to enforce. Ask the dealer to put all promises in writing. Keep this form.",
    4.25, 1.95, { align: "center" }
  );

  let y = 2.2;
  doc.setFont("helvetica", "bold").setFontSize(11);
  doc.text(`VEHICLE MAKE: ${d.vehicle_make || "____________"}`, 0.5, y);
  doc.text(`MODEL: ${d.vehicle_model || "____________"}`, 3.5, y);
  doc.text(`YEAR: ${d.vehicle_year || "______"}`, 6.0, y); y += 0.3;
  doc.text(`VIN: ${d.vehicle_vin || "_______________________"}`, 0.5, y);
  doc.text(`STOCK #: ${d.vehicle_stock_number || "________"}`, 5.5, y); y += 0.4;

  // AS-IS box with brand gold border
  doc.setDrawColor(201, 168, 76).setLineWidth(0.05).rect(0.5, y, 7.5, 1.4);
  doc.setDrawColor(0).setLineWidth(0.01);
  doc.setFontSize(22).setFont("helvetica", "bold").text("AS IS — NO DEALER WARRANTY", 4.25, y + 0.5, { align: "center" });
  doc.setFontSize(9).setFont("helvetica", "normal");
  const asIs = doc.splitTextToSize(
    "THE DEALER DOES NOT PROVIDE A WARRANTY FOR ANY REPAIRS AFTER SALE. The vehicle is sold AS-IS. The dealer assumes no responsibility for any repairs regardless of any oral statements about the vehicle.",
    7.0
  );
  doc.text(asIs, 0.75, y + 0.8); y += 1.6;

  doc.setFont("helvetica", "bold").setFontSize(11).text("WARRANTY (if checked)", 0.5, y); y += 0.3;
  doc.setFont("helvetica", "normal").setFontSize(9);
  doc.rect(0.6, y - 0.13, 0.18, 0.18); doc.text("FULL    [ ]  LIMITED  WARRANTY. Percent of labor & parts covered: _____%", 0.9, y); y += 0.3;
  doc.text("Systems covered: _________________________________   Duration: ____________", 0.5, y); y += 0.4;

  doc.setFont("helvetica", "bold").text("SYSTEMS COVERED / DURATION", 0.5, y); y += 0.25;
  doc.setFont("helvetica", "normal");
  ["Frame & Body","Engine","Transmission","Drive Axle","Brakes","Steering","Suspension","Electrical","Air Conditioning"].forEach((s, i) => {
    const col = i % 3; const row = Math.floor(i/3);
    doc.text(`[ ] ${s}`, 0.5 + col * 2.5, y + row * 0.22);
  });
  y += 1.0;

  doc.setFont("helvetica", "bold").setFontSize(10).text("ASK THE DEALER:", 0.5, y); y += 0.2;
  doc.setFont("helvetica", "normal").setFontSize(8.5);
  const ask = doc.splitTextToSize(
    "1. If service contract is available.  2. If you may have the vehicle inspected by your own mechanic on or off the lot.  3. To see a copy of any warranty documents for a complete explanation of warranty coverage, exclusions, and the dealer's repair obligations. Implied warranties under your state's laws may give you additional rights.",
    7.0
  );
  doc.text(ask, 0.5, y); y += ask.length * 0.15 + 0.3;

  sigBlock(doc, y + 0.2);
  footer(doc, "FTC Buyers Guide");
}


function poaPage(doc: Doc, d: Deal) {
  doc.addPage();
  header(doc, "LIMITED POWER OF ATTORNEY", "Georgia Form T-8 POA  |  Motor Vehicle Transactions");
  let y = 1.5;

  doc.setFontSize(9.5);
  const text = doc.splitTextToSize(
    `I/We, ${d.customer_name || "____________________"}, owner of the vehicle described below, do hereby appoint ${DEALER.name} as my true and lawful attorney-in-fact, to sign all papers and documents required to apply for title, register, transfer, and complete any odometer disclosure for the following vehicle:`,
    7.0
  );
  doc.text(text, 0.5, y); y += text.length * 0.18 + 0.2;

  box(doc, "Vehicle", 0.5, y, 7.5, 0.22); y += 0.32;
  field(doc, "VIN", d.vehicle_vin, 0.5, y, 5.0);
  field(doc, "Year", d.vehicle_year, 5.7, y, 1.8); y += 0.5;
  field(doc, "Make", d.vehicle_make, 0.5, y, 3.5);
  field(doc, "Model", d.vehicle_model, 4.2, y, 3.3); y += 0.7;

  const text2 = doc.splitTextToSize(
    "This Limited Power of Attorney shall expire upon completion of title and registration for the above vehicle. The undersigned certifies under penalty of perjury that the information given is true and correct.",
    7.0
  );
  doc.text(text2, 0.5, y); y += text2.length * 0.18 + 0.4;

  sigBlock(doc, y + 0.2);
  footer(doc, "T-8 POA");
}

function reassignmentPage(doc: Doc, d: Deal) {
  doc.addPage();
  header(doc, "DEALER REASSIGNMENT OF TITLE", "Georgia Form T-11");
  let y = 1.5;

  box(doc, "Dealer Transferring Title", 0.5, y, 7.5, 0.22); y += 0.32;
  field(doc, "Dealer Name", DEALER.name, 0.5, y, 5.0);
  field(doc, "License #", "________", 5.7, y, 1.8); y += 0.5;
  field(doc, "Address", DEALER.address, 0.5, y, 7.5); y += 0.7;

  box(doc, "Transferred To", 0.5, y, 7.5, 0.22); y += 0.32;
  field(doc, "Buyer / Dealer Name", d.customer_name, 0.5, y, 5.0);
  field(doc, "DL / License #", d.customer_dl_number, 5.7, y, 1.8); y += 0.5;
  field(doc, "Address", [d.customer_address, d.customer_city, d.customer_state, d.customer_zip].filter(Boolean).join(", "), 0.5, y, 7.5); y += 0.7;

  box(doc, "Vehicle", 0.5, y, 7.5, 0.22); y += 0.32;
  field(doc, "VIN", d.vehicle_vin, 0.5, y, 5.0);
  field(doc, "Sale Date", today(), 5.7, y, 1.8); y += 0.5;
  field(doc, "Year / Make / Model", [d.vehicle_year, d.vehicle_make, d.vehicle_model].filter(Boolean).join(" "), 0.5, y, 5.0);
  field(doc, "Sale Price", d.sale_price ? `$${Number(d.sale_price).toLocaleString()}` : "", 5.7, y, 1.8); y += 0.7;

  sigBlock(doc, y + 0.2);
  footer(doc, "T-11");
}

function tavtWorksheet(doc: Doc, d: Deal) {
  doc.addPage();
  header(doc, "TAVT WORKSHEET", "Title Ad Valorem Tax Calculation");
  let y = 1.5;

  const price = d.sale_price ? Number(d.sale_price) : 0;
  const trade = d.trade_in_value ? Number(d.trade_in_value) : 0;
  const fmv = price;
  const taxable = Math.max(0, fmv - trade);
  const tavt = taxable * 0.07;

  const rows: [string, string][] = [
    ["Fair Market Value (sale price)", `$${fmv.toFixed(2)}`],
    ["Less: Trade-In Allowance", `- $${trade.toFixed(2)}`],
    ["Taxable Amount", `$${taxable.toFixed(2)}`],
    ["TAVT Rate (Georgia)", "7.00%"],
    ["TAVT DUE", `$${tavt.toFixed(2)}`],
  ];
  doc.setFontSize(10);
  rows.forEach(([k, v], i) => {
    if (i === rows.length - 1) doc.setFont("helvetica", "bold");
    doc.text(k, 0.5, y);
    doc.text(v, 7.5, y, { align: "right" });
    doc.setLineWidth(0.005).line(0.5, y + 0.08, 7.5, y + 0.08);
    y += 0.32;
  });
  doc.setFont("helvetica", "normal");

  y += 0.5;
  box(doc, "Trade-In Details (if applicable)", 0.5, y, 7.5, 0.22); y += 0.32;
  field(doc, "Year", d.trade_in_year, 0.5, y, 1.3);
  field(doc, "Make", d.trade_in_make, 2.0, y, 2.5);
  field(doc, "Model", d.trade_in_model, 4.7, y, 2.8); y += 0.5;
  field(doc, "VIN", d.trade_in_vin, 0.5, y, 7.5); y += 0.7;

  sigBlock(doc, y + 0.2);
  footer(doc, "TAVT-WS");
}

function deliveryReceipt(doc: Doc, d: Deal) {
  doc.addPage();
  header(doc, "DELIVERY RECEIPT", "Vehicle Acknowledgment of Delivery");
  let y = 1.5;

  doc.setFontSize(9.5);
  const text = doc.splitTextToSize(
    `I, ${d.customer_name || "____________________"}, hereby acknowledge that I have taken physical delivery of the vehicle described below from ${DEALER.name}. I have inspected the vehicle and accept it in its present condition. I confirm that all documents required for the sale have been executed.`,
    7.0
  );
  doc.text(text, 0.5, y); y += text.length * 0.18 + 0.3;

  box(doc, "Vehicle Delivered", 0.5, y, 7.5, 0.22); y += 0.32;
  field(doc, "Year / Make / Model", [d.vehicle_year, d.vehicle_make, d.vehicle_model].filter(Boolean).join(" "), 0.5, y, 5.0);
  field(doc, "Stock #", d.vehicle_stock_number, 5.7, y, 1.8); y += 0.5;
  field(doc, "VIN", d.vehicle_vin, 0.5, y, 5.0);
  field(doc, "Delivery Date", today(), 5.7, y, 1.8); y += 0.7;

  box(doc, "Items Delivered with Vehicle", 0.5, y, 7.5, 0.22); y += 0.32;
  ["Owner's Manual","2 Keys / Remotes","Spare Tire & Jack","Floor Mats","Temporary Tag","Title Documents"].forEach((s, i) => {
    const col = i % 2; const row = Math.floor(i/2);
    doc.rect(0.6 + col * 3.7, y + row * 0.25 - 0.13, 0.18, 0.18);
    doc.setFontSize(9.5).text(s, 0.9 + col * 3.7, y + row * 0.25);
  });
  y += 1.0;

  sigBlock(doc, y + 0.2);
  footer(doc, "DR-01");
}

// ============= MAIN =============

/**
 * Pulls the customer's most recent credit application (matched by email) and
 * fills in any blanks on the Deal object so the sales jacket auto-populates
 * from data the buyer already gave us earlier in the funnel.
 */
async function hydrateDealFromCustomerProfile(deal: Deal): Promise<Deal> {
  if (!deal.customer_email) return deal;
  const { data: app } = await supabase
    .from("credit_applications")
    .select("*")
    .eq("email", deal.customer_email)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (!app) return deal;

  const fullName = [app.first_name, app.last_name].filter(Boolean).join(" ") || null;
  return {
    ...deal,
    customer_name: deal.customer_name || fullName || deal.customer_name,
    customer_phone: deal.customer_phone || app.phone,
    customer_address: deal.customer_address || app.address,
    customer_city: deal.customer_city || app.city,
    customer_state: deal.customer_state || app.state,
    customer_zip: deal.customer_zip || app.zip,
    customer_dl_number: deal.customer_dl_number || app.dl_number,
    customer_employer: deal.customer_employer || app.employer_name,
    customer_income: deal.customer_income ?? (app.monthly_income ? Number(app.monthly_income) * 12 : null),
    customer_credit_score: deal.customer_credit_score ?? app.soft_pull_score,
    vehicle_stock_number: deal.vehicle_stock_number || app.vehicle_stock_number,
    vehicle_year: deal.vehicle_year || app.vehicle_year,
    vehicle_make: deal.vehicle_make || app.vehicle_make,
    vehicle_model: deal.vehicle_model || app.vehicle_model,
    vehicle_vin: deal.vehicle_vin || app.vehicle_vin,
  };
}

export async function generateSalesJacket(dealInput: Deal): Promise<jsPDF> {
  const deal = await hydrateDealFromCustomerProfile(dealInput);
  const doc = new jsPDF({ unit: "in", format: "letter" });
  let logo: string | null = null;
  try { logo = await loadLogo(); } catch { logo = null; }
  coverPage(doc, deal);
  billOfSalePage(doc, deal);
  mv1Page(doc, deal);
  odometerPage(doc, deal);
  buyersGuidePage(doc, deal, logo);
  poaPage(doc, deal);
  reassignmentPage(doc, deal);
  tavtWorksheet(doc, deal);
  deliveryReceipt(doc, deal);
  return doc;
}

function jacketFileName(deal: Deal) {
  const last = (deal.customer_name || "deal").split(" ").pop();
  const stock = deal.vehicle_stock_number || deal.id.slice(0, 6);
  return `SalesJacket_${last}_${stock}.pdf`;
}

export async function downloadSalesJacket(deal: Deal) {
  const doc = await generateSalesJacket(deal);
  doc.save(jacketFileName(deal));
}

/**
 * Downloads the sales jacket PDF, opens the user's email client with a
 * pre-filled draft to the customer, and logs the send to sales_jacket_sends.
 */
export async function emailSalesJacket(deal: Deal): Promise<{ ok: boolean; error?: string }> {
  if (!deal.customer_email) {
    return { ok: false, error: "Customer has no email on file." };
  }

  const doc = await generateSalesJacket(deal);
  const fileName = jacketFileName(deal);
  doc.save(fileName);

  const vehicle = [deal.vehicle_year, deal.vehicle_make, deal.vehicle_model]
    .filter(Boolean).join(" ") || "your vehicle";
  const subject = `Your Middleman Motors Sales Jacket — ${vehicle}`;
  const body =
    `Hi ${deal.customer_name?.split(" ")[0] || "there"},\n\n` +
    `Attached is your complete Georgia sales jacket for ${vehicle}` +
    (deal.vehicle_vin ? ` (VIN ${deal.vehicle_vin})` : "") + `.\n\n` +
    `This packet includes your Bill of Sale (T-7), Title Application (MV-1), ` +
    `Odometer Disclosure (T-8), FTC Buyer's Guide, Power of Attorney, ` +
    `TAVT Worksheet, and Delivery Receipt.\n\n` +
    `Please review, sign where indicated, and return at your earliest convenience.\n\n` +
    `Thank you for choosing Middleman Motors.\n\n` +
    `— Middleman Motors\n` +
    `1970 Main St East, Suite B12, Snellville, GA 30078\n` +
    `(770) 676-0367  |  middlemanmotors.com\n\n` +
    `NOTE: Please attach the file "${fileName}" (just downloaded to your computer) before sending.`;

  const href = `mailto:${encodeURIComponent(deal.customer_email)}` +
    `?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

  const { data: userData } = await supabase.auth.getUser();
  const { error: logErr } = await supabase.from("sales_jacket_sends").insert({
    deal_id: deal.id,
    sent_to_email: deal.customer_email,
    sent_to_name: deal.customer_name,
    sent_by: userData.user?.id ?? null,
    status: "drafted",
    file_name: fileName,
  });

  window.location.href = href;

  return logErr ? { ok: false, error: logErr.message } : { ok: true };
}

/**
 * Admin-only: upload a generated sales jacket to the private `sales-jackets` bucket
 * and return a short-lived signed URL. Data never leaves the private bucket without
 * an admin-authenticated request.
 */
export async function archiveJacketSecurely(deal: Deal): Promise<{ signedUrl: string | null; error?: string }> {
  try {
    const doc = await generateSalesJacket(deal);
    const pdfBase64 = doc.output("datauristring"); // "data:application/pdf;base64,..."
    const path = `deals/${deal.id ?? "unknown"}/${jacketFileName(deal)}`;
    const { data, error } = await supabase.functions.invoke("sales-jacket-signed-url", {
      body: { action: "upload", path, pdfBase64 },
    });
    if (error) return { signedUrl: null, error: error.message };
    return { signedUrl: (data as any)?.signedUrl ?? null };
  } catch (e) {
    return { signedUrl: null, error: String(e) };
  }
}

