import { useState, useEffect, useCallback, useMemo } from "react";

/* ─────────── DATA MODELS ─────────── */
const INDUSTRIES = [
  { id: "real_estate", label: "Real Estate", baseRisk: 45, icon: "🏢", subTypes: ["Commercial Property", "Residential Multifamily", "Industrial/Warehouse", "Mixed-Use Development", "REIT"] },
  { id: "private_equity", label: "Private Equity", baseRisk: 55, icon: "💼", subTypes: ["Buyout Fund", "Venture Capital", "Growth Equity", "Fund of Funds", "Family Office"] },
  { id: "manufacturing", label: "Manufacturing & Distribution", baseRisk: 60, icon: "🏭", subTypes: ["Food & Beverage", "Chemical Processing", "Metal Fabrication", "Plastics/Rubber", "Electronics Assembly"] },
  { id: "nonprofit", label: "Nonprofit & Religious", baseRisk: 35, icon: "🤝", subTypes: ["501(c)(3) Charity", "Religious Institution", "Educational", "Healthcare Nonprofit", "Social Services"] },
  { id: "trucking", label: "Trucking & Transportation", baseRisk: 72, icon: "🚛", subTypes: ["Long-Haul OTR", "Last-Mile Delivery", "Hazmat Transport", "Refrigerated Freight", "Intermodal/Drayage"] },
  { id: "cannabis", label: "Cannabis", baseRisk: 80, icon: "🌿", subTypes: ["Cultivation/Grow", "Processing/Manufacturing", "Dispensary/Retail", "Distribution", "Testing Lab"] },
  { id: "franchise", label: "Franchises", baseRisk: 50, icon: "🏪", subTypes: ["QSR/Fast Food", "Hotel/Hospitality", "Fitness/Gym", "Automotive Services", "Home Services"] },
  { id: "coin_laundry", label: "Coin Laundry", baseRisk: 38, icon: "🧺", subTypes: ["Self-Service Laundromat", "Wash-and-Fold", "Commercial Laundry", "Multi-Location", "Laundry Pickup Service"] },
  { id: "technology", label: "Technology", baseRisk: 48, icon: "💻", subTypes: ["SaaS/Cloud", "Fintech", "Healthcare IT", "Cybersecurity", "AI/ML"] },
  { id: "healthcare", label: "Healthcare", baseRisk: 65, icon: "🏥", subTypes: ["Physician Practice", "Dental/Optometry", "Home Health", "Behavioral Health", "Urgent Care/Clinic"] },
  { id: "construction", label: "Construction", baseRisk: 70, icon: "🔨", subTypes: ["General Contractor", "Electrical", "Plumbing/HVAC", "Roofing", "Heavy Civil"] },
  { id: "hospitality", label: "Hospitality & Food Service", baseRisk: 52, icon: "🍽️", subTypes: ["Full-Service Restaurant", "Hotel/Resort", "Catering", "Bar/Nightclub", "Event Venue"] },
];

const CARRIERS = [
  { name: "Cincinnati Insurance", strengths: ["Property", "Liability", "Workers Comp", "Inland Marine"], rating: "A+", tier: 1, minPremium: 15000, specialties: ["Manufacturing", "Real Estate", "Franchise", "Construction"], claimsResponseHrs: 4 },
  { name: "Travelers", strengths: ["Umbrella", "D&O", "Cyber Liability", "EPLI"], rating: "A++", tier: 1, minPremium: 25000, specialties: ["Technology", "Private Equity", "Real Estate", "Healthcare"], claimsResponseHrs: 2 },
  { name: "Hartford", strengths: ["Workers Comp", "Property", "Commercial Auto", "BOP"], rating: "A+", tier: 1, minPremium: 10000, specialties: ["Manufacturing", "Trucking", "Franchise", "Construction"], claimsResponseHrs: 6 },
  { name: "Liberty Mutual", strengths: ["Property", "Liability", "International", "Surety"], rating: "A", tier: 1, minPremium: 20000, specialties: ["Manufacturing", "Technology", "Real Estate", "Construction"], claimsResponseHrs: 4 },
  { name: "CNA", strengths: ["Professional Liability", "D&O", "Fiduciary", "Cyber Liability"], rating: "A", tier: 2, minPremium: 18000, specialties: ["Private Equity", "Nonprofit", "Healthcare", "Technology"], claimsResponseHrs: 8 },
  { name: "Zurich", strengths: ["International", "Umbrella", "Cyber Liability", "Environmental"], rating: "A+", tier: 1, minPremium: 30000, specialties: ["Manufacturing", "Technology", "Private Equity", "Construction"], claimsResponseHrs: 3 },
  { name: "Markel", strengths: ["Professional Liability", "Specialty Lines", "E&S"], rating: "A", tier: 2, minPremium: 8000, specialties: ["Cannabis", "Hospitality", "Technology"], claimsResponseHrs: 12 },
  { name: "West Bend", strengths: ["Property", "Liability", "Workers Comp", "BOP"], rating: "A+", tier: 2, minPremium: 5000, specialties: ["Manufacturing", "Coin Laundry", "Franchise", "Hospitality"], claimsResponseHrs: 6 },
  { name: "Selective", strengths: ["Workers Comp", "Property", "Flood", "Inland Marine"], rating: "A+", tier: 2, minPremium: 8000, specialties: ["Nonprofit", "Real Estate", "Manufacturing", "Construction"], claimsResponseHrs: 8 },
  { name: "Tokio Marine", strengths: ["International", "Property", "Marine Cargo", "Multinational"], rating: "A++", tier: 1, minPremium: 35000, specialties: ["Manufacturing", "Technology", "Trucking"], claimsResponseHrs: 6 },
  { name: "Sompo International", strengths: ["Property", "Casualty", "Professional Lines"], rating: "A+", tier: 2, minPremium: 20000, specialties: ["Manufacturing", "Real Estate", "Healthcare"], claimsResponseHrs: 8 },
  { name: "Philadelphia Insurance", strengths: ["Professional Liability", "Management Liability", "Specialty"], rating: "A++", tier: 2, minPremium: 10000, specialties: ["Nonprofit", "Healthcare", "Hospitality", "Technology"], claimsResponseHrs: 6 },
];

const COVERAGE_LINES = [
  { id: "property", label: "Property", desc: "Building, contents, business income" },
  { id: "gl", label: "General Liability", desc: "Bodily injury, property damage, advertising injury" },
  { id: "wc", label: "Workers Compensation", desc: "Employee injury, occupational disease" },
  { id: "auto", label: "Commercial Auto", desc: "Owned, hired, non-owned vehicles" },
  { id: "umbrella", label: "Umbrella/Excess", desc: "Additional liability limits above primary" },
  { id: "cyber", label: "Cyber Liability", desc: "Data breach, ransomware, business interruption" },
  { id: "epli", label: "Employment Practices", desc: "Harassment, discrimination, wrongful termination" },
  { id: "do", label: "Directors & Officers", desc: "Management decisions, shareholder actions" },
  { id: "professional", label: "Professional Liability", desc: "Errors & omissions, malpractice" },
  { id: "fiduciary", label: "Fiduciary Liability", desc: "ERISA, benefit plan administration" },
  { id: "crime", label: "Crime/Fidelity", desc: "Employee theft, forgery, fraud" },
  { id: "inland_marine", label: "Inland Marine", desc: "Equipment, tools, goods in transit" },
  { id: "environmental", label: "Environmental", desc: "Pollution, remediation, contamination" },
  { id: "international", label: "International", desc: "Foreign operations, DIC coverage" },
];

const STATES_DATA = {
  AL:{tier:"low",wcMod:0.92,regComplexity:1},AK:{tier:"mid",wcMod:1.15,regComplexity:2},AZ:{tier:"mid",wcMod:0.95,regComplexity:2},
  AR:{tier:"low",wcMod:0.90,regComplexity:1},CA:{tier:"high",wcMod:1.35,regComplexity:5},CO:{tier:"mid",wcMod:1.05,regComplexity:3},
  CT:{tier:"high",wcMod:1.25,regComplexity:4},DE:{tier:"mid",wcMod:1.10,regComplexity:2},FL:{tier:"high",wcMod:1.20,regComplexity:4},
  GA:{tier:"mid",wcMod:0.98,regComplexity:2},HI:{tier:"mid",wcMod:1.18,regComplexity:3},ID:{tier:"low",wcMod:0.88,regComplexity:1},
  IL:{tier:"high",wcMod:1.22,regComplexity:4},IN:{tier:"low",wcMod:0.94,regComplexity:1},IA:{tier:"low",wcMod:0.91,regComplexity:1},
  KS:{tier:"low",wcMod:0.89,regComplexity:1},KY:{tier:"low",wcMod:0.96,regComplexity:2},LA:{tier:"mid",wcMod:1.12,regComplexity:3},
  ME:{tier:"mid",wcMod:1.08,regComplexity:2},MD:{tier:"mid",wcMod:1.10,regComplexity:3},MA:{tier:"high",wcMod:1.28,regComplexity:4},
  MI:{tier:"mid",wcMod:1.05,regComplexity:3},MN:{tier:"mid",wcMod:1.02,regComplexity:2},MS:{tier:"low",wcMod:0.88,regComplexity:1},
  MO:{tier:"low",wcMod:0.93,regComplexity:2},MT:{tier:"low",wcMod:0.95,regComplexity:1},NE:{tier:"low",wcMod:0.90,regComplexity:1},
  NV:{tier:"mid",wcMod:1.02,regComplexity:2},NH:{tier:"mid",wcMod:1.05,regComplexity:2},NJ:{tier:"high",wcMod:1.30,regComplexity:5},
  NM:{tier:"low",wcMod:0.92,regComplexity:1},NY:{tier:"high",wcMod:1.38,regComplexity:5},NC:{tier:"mid",wcMod:0.95,regComplexity:2},
  ND:{tier:"low",wcMod:0.85,regComplexity:1},OH:{tier:"mid",wcMod:1.00,regComplexity:2},OK:{tier:"low",wcMod:0.91,regComplexity:1},
  OR:{tier:"mid",wcMod:1.08,regComplexity:3},PA:{tier:"mid",wcMod:1.12,regComplexity:3},RI:{tier:"mid",wcMod:1.15,regComplexity:3},
  SC:{tier:"low",wcMod:0.93,regComplexity:1},SD:{tier:"low",wcMod:0.86,regComplexity:1},TN:{tier:"low",wcMod:0.94,regComplexity:1},
  TX:{tier:"high",wcMod:1.08,regComplexity:3},UT:{tier:"low",wcMod:0.90,regComplexity:1},VT:{tier:"mid",wcMod:1.06,regComplexity:2},
  VA:{tier:"mid",wcMod:0.97,regComplexity:2},WA:{tier:"mid",wcMod:1.15,regComplexity:3},WV:{tier:"mid",wcMod:1.05,regComplexity:2},
  WI:{tier:"mid",wcMod:1.00,regComplexity:2},WY:{tier:"low",wcMod:0.84,regComplexity:1},DC:{tier:"high",wcMod:1.20,regComplexity:4}
};

/* ─────────── RISK ENGINE ─────────── */
function runFullAnalysis(form) {
  const industry = INDUSTRIES.find(i => i.id === form.industry);
  if (!industry) return null;
  const stateData = STATES_DATA[form.primaryState] || { tier: "mid", wcMod: 1.0, regComplexity: 2 };
  const rev = parseFloat(form.revenue) || 1;
  const emp = parseInt(form.employees) || 1;
  const yrs = parseInt(form.yearsInBusiness) || 1;
  const claims3 = parseInt(form.claims3yr) || 0;
  const claims5 = parseInt(form.claims5yr) || 0;
  const totalClaims = claims3 + claims5;
  const multiState = form.multiState === "yes";

  // --- COMPOSITE RISK SCORE ---
  let base = industry.baseRisk;
  const revFactor = rev > 100 ? 18 : rev > 50 ? 13 : rev > 20 ? 8 : rev > 5 ? 4 : 0;
  const empFactor = emp > 1000 ? 15 : emp > 500 ? 11 : emp > 200 ? 8 : emp > 50 ? 4 : 0;
  const stateFactor = stateData.tier === "high" ? 10 : stateData.tier === "mid" ? 4 : 0;
  const claimsFactor = claims3 * 6 + claims5 * 3;
  const yrsFactor = yrs < 2 ? 12 : yrs < 5 ? 6 : yrs > 20 ? -6 : yrs > 10 ? -3 : 0;
  const safetyFactor = form.safetyProgram === "yes" ? -8 : 0;
  const contractFactor = form.contractualReqs === "yes" ? 5 : 0;
  const intlFactor = form.internationalOps === "yes" ? 10 : 0;
  const multiStateFactor = multiState ? 6 : 0;
  const subTypeFactor = ["Hazmat Transport", "Chemical Processing", "Bar/Nightclub", "Roofing", "Heavy Civil"].includes(form.subType) ? 12 :
    ["Long-Haul OTR", "Cultivation/Grow", "Food & Beverage"].includes(form.subType) ? 8 : 0;

  const compositeRisk = Math.min(99, Math.max(5, Math.round(
    base + revFactor + empFactor + stateFactor + claimsFactor + yrsFactor + safetyFactor + contractFactor + intlFactor + multiStateFactor + subTypeFactor
  )));

  // --- RISK DIMENSION BREAKDOWN ---
  const dimensions = {
    operational: Math.min(99, Math.max(5, Math.round(base * 0.6 + empFactor + subTypeFactor + safetyFactor + 30))),
    financial: Math.min(99, Math.max(5, Math.round(revFactor * 2 + claimsFactor + contractFactor + 25))),
    geographic: Math.min(99, Math.max(5, Math.round(stateFactor * 3 + multiStateFactor * 2 + intlFactor + 20))),
    regulatory: Math.min(99, Math.max(5, Math.round(stateData.regComplexity * 12 + (form.industry === "cannabis" ? 25 : 0) + (form.industry === "healthcare" ? 15 : 0) + 15))),
    claims: Math.min(99, Math.max(5, Math.round(claimsFactor * 2.5 + (totalClaims > 3 ? 20 : 0) + 10))),
    market: Math.min(99, Math.max(5, Math.round(yrsFactor * -2 + (rev > 50 ? 15 : 5) + (form.industry === "cannabis" ? 20 : 0) + 30))),
  };

  // --- COVERAGE NEEDS ASSESSMENT ---
  const coverageNeeds = COVERAGE_LINES.map(line => {
    let priority = 50;
    let required = false;
    let recommended = false;
    let estimated = 0;
    const basePrem = rev * 800;

    switch (line.id) {
      case "property":
        priority = 85; required = true; estimated = basePrem * 0.15 * (stateData.tier === "high" ? 1.3 : 1);
        break;
      case "gl":
        priority = 90; required = true; estimated = basePrem * 0.20;
        break;
      case "wc":
        priority = emp > 0 ? 95 : 20; required = emp > 0; estimated = emp * 420 * stateData.wcMod;
        break;
      case "auto":
        priority = ["trucking", "construction", "coin_laundry"].includes(form.industry) ? 92 : 45;
        required = form.industry === "trucking"; estimated = basePrem * (form.industry === "trucking" ? 0.30 : 0.08);
        break;
      case "umbrella":
        priority = compositeRisk > 55 ? 85 : 55; recommended = compositeRisk > 55; estimated = basePrem * 0.06;
        break;
      case "cyber":
        priority = ["technology", "healthcare", "private_equity"].includes(form.industry) ? 90 : 60;
        recommended = true; estimated = basePrem * (form.industry === "technology" ? 0.12 : 0.05);
        break;
      case "epli":
        priority = emp > 50 ? 80 : 40; recommended = emp > 50; estimated = Math.max(3000, emp * 35);
        break;
      case "do":
        priority = ["private_equity", "nonprofit", "technology"].includes(form.industry) ? 88 : 35;
        recommended = form.industry === "private_equity"; estimated = basePrem * 0.08;
        break;
      case "professional":
        priority = ["technology", "healthcare", "private_equity"].includes(form.industry) ? 90 : 30;
        required = form.industry === "healthcare"; estimated = basePrem * 0.10;
        break;
      case "fiduciary":
        priority = emp > 100 ? 65 : 20; recommended = emp > 100; estimated = Math.max(2000, emp * 15);
        break;
      case "crime":
        priority = ["private_equity", "nonprofit", "franchise"].includes(form.industry) ? 75 : 45;
        recommended = true; estimated = basePrem * 0.03;
        break;
      case "inland_marine":
        priority = ["construction", "manufacturing", "trucking"].includes(form.industry) ? 80 : 25;
        required = form.industry === "construction"; estimated = basePrem * 0.05;
        break;
      case "environmental":
        priority = ["manufacturing", "construction", "cannabis"].includes(form.industry) ? 78 : 15;
        recommended = form.industry === "manufacturing"; estimated = basePrem * 0.07;
        break;
      case "international":
        priority = form.internationalOps === "yes" ? 88 : 5;
        required = form.internationalOps === "yes"; estimated = basePrem * 0.09;
        break;
    }
    const riskAdjust = 1 + (compositeRisk - 50) / 100;
    estimated = Math.round(estimated * riskAdjust);
    return { ...line, priority, required, recommended, estimatedPremium: estimated };
  }).sort((a, b) => b.priority - a.priority);

  const totalEstimatedPremium = coverageNeeds.filter(c => c.priority > 40).reduce((s, c) => s + c.estimatedPremium, 0);

  // --- MONTE CARLO PREMIUM SIMULATION ---
  const simulations = [];
  for (let i = 0; i < 1000; i++) {
    let simPrem = totalEstimatedPremium;
    simPrem *= (0.8 + Math.random() * 0.5);
    if (Math.random() < 0.15) simPrem *= (1.1 + Math.random() * 0.3);
    if (form.safetyProgram === "yes" && Math.random() > 0.3) simPrem *= 0.92;
    if (totalClaims > 2 && Math.random() > 0.4) simPrem *= 1.15;
    simulations.push(Math.round(simPrem));
  }
  simulations.sort((a, b) => a - b);
  const premiumRange = {
    p10: simulations[99],
    p25: simulations[249],
    median: simulations[499],
    p75: simulations[749],
    p90: simulations[899],
    best: simulations[49],
    worst: simulations[949],
  };

  // --- LOSS RATIO PROJECTION ---
  const baseLossRatio = industry.baseRisk * 0.6 + totalClaims * 5;
  const lossProjection = Array.from({ length: 5 }, (_, yr) => {
    const trend = form.safetyProgram === "yes" ? -2 : 1;
    const ratio = Math.min(95, Math.max(25, baseLossRatio + trend * yr + (Math.random() - 0.5) * 10));
    return { year: 2026 + yr, ratio: Math.round(ratio), premium: Math.round(totalEstimatedPremium * (1 + yr * 0.04 + (Math.random() - 0.3) * 0.05)) };
  });

  // --- CARRIER MATCHING ---
  const carrierResults = CARRIERS.map(carrier => {
    let score = 0;
    const indMatch = carrier.specialties.some(s => industry.label.toLowerCase().includes(s.toLowerCase()) || s.toLowerCase().includes(industry.label.split(" ")[0].toLowerCase()));
    if (indMatch) score += 35;
    const covMatch = coverageNeeds.filter(c => c.priority > 60 && carrier.strengths.some(s => c.label.includes(s) || s.includes(c.label.split(" ")[0]))).length;
    score += covMatch * 8;
    if (carrier.rating === "A++") score += 18;
    else if (carrier.rating === "A+") score += 12;
    else score += 6;
    if (totalEstimatedPremium >= carrier.minPremium) score += 10;
    else score -= 15;
    if (form.industry === "cannabis" && carrier.name === "Markel") score += 30;
    if (form.industry === "trucking" && carrier.strengths.includes("Commercial Auto")) score += 20;
    if (form.internationalOps === "yes" && carrier.strengths.includes("International")) score += 18;
    if (compositeRisk > 65 && carrier.strengths.includes("Umbrella/Excess")) score += 10;
    if (carrier.tier === 1) score += 5;
    const premiumEstimate = Math.round(totalEstimatedPremium * (0.85 + Math.random() * 0.35) * (carrier.tier === 1 ? 1.05 : 0.95));
    return { ...carrier, matchScore: Math.max(0, score), premiumEstimate };
  }).sort((a, b) => b.matchScore - a.matchScore).slice(0, 6);

  // --- REGULATORY COMPLIANCE ---
  const complianceFlags = [];
  if (stateData.regComplexity >= 4) complianceFlags.push({ severity: "high", msg: `${form.primaryState} has stringent insurance regulations — additional filings & surplus lines compliance required` });
  if (form.industry === "cannabis") complianceFlags.push({ severity: "high", msg: "Federal scheduling conflict — standard market carriers limited; E&S/specialty markets required" });
  if (multiState) complianceFlags.push({ severity: "medium", msg: "Multi-state operations require individual state compliance filings and potentially separate WC policies" });
  if (form.internationalOps === "yes") complianceFlags.push({ severity: "medium", msg: "Foreign operations need Difference in Conditions (DIC) coverage and local admitted policies" });
  if (emp > 50) complianceFlags.push({ severity: "low", msg: "ACA compliance required (50+ FTEs) — ensure group benefit plans meet minimum essential coverage" });
  if (form.industry === "trucking") complianceFlags.push({ severity: "high", msg: "DOT/FMCSA minimum insurance requirements: $750K–$5M liability depending on cargo type" });
  if (form.industry === "healthcare") complianceFlags.push({ severity: "high", msg: "HIPAA compliance mandatory — cyber/privacy breach coverage essential" });
  if (form.industry === "construction") complianceFlags.push({ severity: "medium", msg: "Contractual insurance requirements common — review hold-harmless and additional insured clauses" });
  if (form.contractualReqs === "yes") complianceFlags.push({ severity: "medium", msg: "Contractual requirements detected — verify certificate of insurance specifications match" });
  if (stateData.tier === "high" && emp > 0) complianceFlags.push({ severity: "low", msg: `Workers Comp modification rate in ${form.primaryState}: ${stateData.wcMod.toFixed(2)}x base — factor into premium budget` });

  // --- RISK MITIGATION RECS ---
  const mitigations = [];
  if (form.safetyProgram !== "yes") mitigations.push({ action: "Implement formal safety/loss control program", impact: "8-12% premium reduction", roi: "3-6 months", priority: "high" });
  if (compositeRisk > 60) mitigations.push({ action: "Engage dedicated claims advocate for proactive management", impact: "Reduce claims severity 15-20%", roi: "Immediate", priority: "high" });
  if (!["technology", "healthcare"].includes(form.industry) && coverageNeeds.find(c => c.id === "cyber")?.priority > 50) mitigations.push({ action: "Add cyber liability coverage — cross-industry threat", impact: "Transfer $500K-$5M breach exposure", roi: "1st incident", priority: "high" });
  if (emp > 100 && coverageNeeds.find(c => c.id === "epli")?.priority > 50) mitigations.push({ action: "Implement HR compliance training program", impact: "5-8% EPLI premium credit", roi: "Annual", priority: "medium" });
  if (totalClaims > 2) mitigations.push({ action: "Conduct root-cause analysis on claims history", impact: "Improve loss ratio 10-15%", roi: "6-12 months", priority: "high" });
  if (rev > 20) mitigations.push({ action: "Explore alternative risk financing (captive, SIR, large deductible)", impact: "10-25% total cost of risk reduction", roi: "12-24 months", priority: "medium" });
  if (multiState) mitigations.push({ action: "Centralize insurance program under master policy structure", impact: "Simplify compliance, reduce admin cost 15%", roi: "At renewal", priority: "medium" });
  mitigations.push({ action: "Schedule mid-term stewardship review with carrier", impact: "Proactive relationship management", roi: "Ongoing", priority: "low" });

  return { compositeRisk, dimensions, coverageNeeds, totalEstimatedPremium, premiumRange, lossProjection, carrierResults, complianceFlags, mitigations, industry, stateData };
}

/* ─────────── STYLES ─────────── */
const C = {
  bg: "#f7f5f0", card: "#ffffff", cardAlt: "#faf9f6", border: "#e5e0d5",
  navy: "#1b2a4a", navyLight: "#2d4470", gold: "#b8952e", goldLight: "#d4b44a",
  goldBg: "#faf6eb", text: "#2c2c2c", textMid: "#5a5a5a", textLight: "#8a8a8a",
  green: "#2d8a4e", greenBg: "#edf7f0", orange: "#c77b1a", orangeBg: "#fdf4e7",
  red: "#c0392b", redBg: "#fbeaea", blue: "#2c6fb5", blueBg: "#ebf2fb",
};

/* ─────────── COMPONENTS ─────────── */
function GaugeChart({ value, size = 160, label }) {
  const radius = (size - 20) / 2;
  const circ = Math.PI * radius;
  const offset = circ - (value / 100) * circ;
  const color = value < 35 ? C.green : value < 55 ? C.gold : value < 75 ? C.orange : C.red;
  const lbl = value < 35 ? "LOW" : value < 55 ? "MODERATE" : value < 75 ? "ELEVATED" : "SEVERE";
  return (
    <div style={{ textAlign: "center" }}>
      {label && <div style={{ fontSize: 9, fontWeight: 700, color: C.textLight, letterSpacing: 1.5, marginBottom: 6, textTransform: "uppercase" }}>{label}</div>}
      <svg width={size} height={size / 2 + 10} viewBox={`0 0 ${size} ${size / 2 + 10}`}>
        <path d={`M 10 ${size / 2} A ${radius} ${radius} 0 0 1 ${size - 10} ${size / 2}`} fill="none" stroke="#e8e4dc" strokeWidth="10" strokeLinecap="round" />
        <path d={`M 10 ${size / 2} A ${radius} ${radius} 0 0 1 ${size - 10} ${size / 2}`} fill="none" stroke={color} strokeWidth="10" strokeLinecap="round"
          strokeDasharray={circ} strokeDashoffset={offset} style={{ transition: "stroke-dashoffset 1.5s cubic-bezier(0.4,0,0.2,1)" }} />
        <text x={size / 2} y={size / 2 - 8} textAnchor="middle" fill={C.navy} fontSize={size / 5} fontWeight="800" fontFamily="'Source Serif 4',serif">{value}</text>
        <text x={size / 2} y={size / 2 + 8} textAnchor="middle" fill={color} fontSize="9" fontWeight="700" letterSpacing="2">{lbl}</text>
      </svg>
    </div>
  );
}

function DimensionBar({ label, value, maxVal = 99 }) {
  const pct = (value / maxVal) * 100;
  const color = value < 35 ? C.green : value < 55 ? C.gold : value < 75 ? C.orange : C.red;
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
        <span style={{ fontSize: 11, color: C.textMid, fontWeight: 600 }}>{label}</span>
        <span style={{ fontSize: 11, color, fontWeight: 700 }}>{value}</span>
      </div>
      <div style={{ height: 6, background: "#ece8df", borderRadius: 3, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${pct}%`, background: color, borderRadius: 3, transition: "width 1.2s cubic-bezier(0.4,0,0.2,1)" }} />
      </div>
    </div>
  );
}

function Badge({ children, color = C.navy, bg = C.goldBg }) {
  return <span style={{ display: "inline-block", padding: "2px 8px", fontSize: 9, fontWeight: 700, color, background: bg, borderRadius: 4, letterSpacing: 0.5 }}>{children}</span>;
}

function Card({ title, children, style: s = {} }) {
  return (
    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 20, ...s }}>
      {title && <div style={{ fontSize: 10, fontWeight: 700, color: C.textLight, letterSpacing: 2, textTransform: "uppercase", marginBottom: 14, borderBottom: `1px solid ${C.border}`, paddingBottom: 8 }}>{title}</div>}
      {children}
    </div>
  );
}

/* ─────────── MAIN APP ─────────── */
export default function InsuranceRiskEngine() {
  const [activeTab, setActiveTab] = useState("intake");
  const [result, setResult] = useState(null);
  const [form, setForm] = useState({
    companyName: "", industry: "", subType: "", revenue: "", employees: "",
    primaryState: "OH", secondaryStates: [], multiState: "no", yearsInBusiness: "",
    claims3yr: "0", claims5yr: "0", safetyProgram: "no", contractualReqs: "no",
    internationalOps: "no", currentCarrier: "", revenueGrowth: "stable",
    priorPremium: ""
  });

  const update = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const ind = INDUSTRIES.find(i => i.id === form.industry);

  const canAnalyze = form.companyName && form.industry && form.revenue && form.employees && form.yearsInBusiness;

  const runAnalysis = () => {
    const res = runFullAnalysis(form);
    setResult(res);
    setActiveTab("risk");
  };

  const tabs = [
    { id: "intake", label: "Client Intake", num: "01" },
    { id: "risk", label: "Risk Analysis", num: "02" },
    { id: "coverage", label: "Coverage & Premium", num: "03" },
    { id: "carriers", label: "Carrier Match", num: "04" },
    { id: "compliance", label: "Compliance & Actions", num: "05" },
  ];

  const inputStyle = {
    width: "100%", padding: "10px 14px", background: C.cardAlt, border: `1px solid ${C.border}`,
    borderRadius: 8, color: C.text, fontSize: 13, fontFamily: "'Source Sans 3',sans-serif",
    outline: "none", boxSizing: "border-box", transition: "border-color 0.2s"
  };
  const labelStyle = { fontSize: 10, fontWeight: 700, color: C.textLight, marginBottom: 4, display: "block", letterSpacing: 1.5, textTransform: "uppercase" };

  const sevColor = (s) => s === "high" ? C.red : s === "medium" ? C.orange : C.green;
  const sevBg = (s) => s === "high" ? C.redBg : s === "medium" ? C.orangeBg : C.greenBg;

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "'Source Sans 3', sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Source+Sans+3:wght@400;500;600;700;800&family=Source+Serif+4:wght@600;700;800&family=JetBrains+Mono:wght@500;700&display=swap" rel="stylesheet" />

      {/* HEADER */}
      <div style={{ background: C.navy, padding: "20px 24px 16px" }}>
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 34, height: 34, borderRadius: 8, background: `linear-gradient(135deg, ${C.gold}, ${C.goldLight})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 800, color: C.navy }}>A</div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 800, color: "#fff", letterSpacing: 0.5 }}>Associated Risk Engine</div>
                <div style={{ fontSize: 10, color: "#8899bb", letterSpacing: 1 }}>Commercial Lines · Risk Assessment Platform</div>
              </div>
            </div>
            <div style={{ padding: "4px 12px", background: "rgba(184,149,46,0.15)", border: "1px solid rgba(184,149,46,0.3)", borderRadius: 6, fontSize: 9, color: C.goldLight, fontWeight: 700, letterSpacing: 1 }}>
              PROTOTYPE · PARTH SHAH · MS FINANCE, UT DALLAS
            </div>
          </div>

          {/* TAB NAV */}
          <div style={{ display: "flex", gap: 2, marginTop: 16, overflowX: "auto" }}>
            {tabs.map(tab => {
              const isActive = activeTab === tab.id;
              const isDisabled = tab.id !== "intake" && !result;
              return (
                <button key={tab.id} onClick={() => !isDisabled && setActiveTab(tab.id)} style={{
                  padding: "8px 14px", borderRadius: "8px 8px 0 0", border: "none",
                  background: isActive ? C.bg : "transparent",
                  color: isActive ? C.navy : isDisabled ? "#4a5568" : "#8899bb",
                  fontSize: 11, fontWeight: 700, cursor: isDisabled ? "default" : "pointer",
                  fontFamily: "'Source Sans 3',sans-serif", letterSpacing: 0.5,
                  display: "flex", alignItems: "center", gap: 6, whiteSpace: "nowrap",
                  opacity: isDisabled ? 0.4 : 1, transition: "all 0.2s"
                }}>
                  <span style={{ fontSize: 9, fontFamily: "'JetBrains Mono',monospace", color: isActive ? C.gold : "inherit" }}>{tab.num}</span>
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 800, margin: "0 auto", padding: "20px 16px 40px" }}>

        {/* ═══ INTAKE TAB ═══ */}
        {activeTab === "intake" && (
          <div>
            <h2 style={{ fontFamily: "'Source Serif 4',serif", fontSize: 22, fontWeight: 800, color: C.navy, margin: "0 0 4px" }}>New Business Submission</h2>
            <p style={{ fontSize: 13, color: C.textMid, margin: "0 0 20px" }}>Complete the client profile to generate a comprehensive risk assessment, coverage analysis, and carrier recommendations.</p>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              {/* Company Info */}
              <Card title="Company Information" style={{ gridColumn: "1 / -1" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  <div style={{ gridColumn: "1 / -1" }}>
                    <label style={labelStyle}>Legal Entity Name</label>
                    <input style={inputStyle} value={form.companyName} onChange={e => update("companyName", e.target.value)} placeholder="e.g. Midwest Manufacturing Group, LLC" />
                  </div>
                  <div>
                    <label style={labelStyle}>Annual Revenue ($M)</label>
                    <input style={inputStyle} type="number" value={form.revenue} onChange={e => update("revenue", e.target.value)} placeholder="e.g. 25" />
                  </div>
                  <div>
                    <label style={labelStyle}>Total Employees (FTE)</label>
                    <input style={inputStyle} type="number" value={form.employees} onChange={e => update("employees", e.target.value)} placeholder="e.g. 150" />
                  </div>
                  <div>
                    <label style={labelStyle}>Years in Business</label>
                    <input style={inputStyle} type="number" value={form.yearsInBusiness} onChange={e => update("yearsInBusiness", e.target.value)} placeholder="e.g. 12" />
                  </div>
                  <div>
                    <label style={labelStyle}>Revenue Trend</label>
                    <div style={{ display: "flex", gap: 6 }}>
                      {[["declining", "↓ Declining"], ["stable", "→ Stable"], ["growing", "↑ Growing"], ["rapid", "⇈ Rapid"]].map(([v, l]) => (
                        <button key={v} onClick={() => update("revenueGrowth", v)} style={{
                          flex: 1, padding: "8px 4px", borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: "pointer",
                          border: form.revenueGrowth === v ? `1.5px solid ${C.gold}` : `1px solid ${C.border}`,
                          background: form.revenueGrowth === v ? C.goldBg : C.cardAlt,
                          color: form.revenueGrowth === v ? C.navy : C.textMid,
                          fontFamily: "'Source Sans 3',sans-serif"
                        }}>{l}</button>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>

              {/* Industry */}
              <Card title="Industry Classification" style={{ gridColumn: "1 / -1" }}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6, marginBottom: 14 }}>
                  {INDUSTRIES.map(i => (
                    <button key={i.id} onClick={() => { update("industry", i.id); update("subType", ""); }} style={{
                      padding: "8px 10px", borderRadius: 8, fontSize: 11, fontWeight: 600, cursor: "pointer", textAlign: "left",
                      border: form.industry === i.id ? `1.5px solid ${C.gold}` : `1px solid ${C.border}`,
                      background: form.industry === i.id ? C.goldBg : C.card,
                      color: form.industry === i.id ? C.navy : C.textMid,
                      fontFamily: "'Source Sans 3',sans-serif", display: "flex", alignItems: "center", gap: 6, transition: "all 0.15s"
                    }}>
                      <span style={{ fontSize: 14 }}>{i.icon}</span>{i.label}
                      {form.industry === i.id && <span style={{ marginLeft: "auto", fontSize: 10, color: C.gold }}>✓</span>}
                    </button>
                  ))}
                </div>
                {ind && (
                  <div>
                    <label style={labelStyle}>Sub-Classification</label>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      {ind.subTypes.map(s => (
                        <button key={s} onClick={() => update("subType", s)} style={{
                          padding: "6px 12px", borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: "pointer",
                          border: form.subType === s ? `1.5px solid ${C.gold}` : `1px solid ${C.border}`,
                          background: form.subType === s ? C.goldBg : C.card,
                          color: form.subType === s ? C.navy : C.textMid,
                          fontFamily: "'Source Sans 3',sans-serif"
                        }}>{s}</button>
                      ))}
                    </div>
                  </div>
                )}
              </Card>

              {/* Geography */}
              <Card title="Geographic Profile">
                <div style={{ marginBottom: 12 }}>
                  <label style={labelStyle}>Primary State</label>
                  <select style={{ ...inputStyle, cursor: "pointer" }} value={form.primaryState} onChange={e => update("primaryState", e.target.value)}>
                    {Object.keys(STATES_DATA).map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div style={{ marginBottom: 12 }}>
                  <label style={labelStyle}>Multi-State Operations?</label>
                  <div style={{ display: "flex", gap: 6 }}>
                    {["yes", "no"].map(v => (
                      <button key={v} onClick={() => update("multiState", v)} style={{
                        flex: 1, padding: "8px", borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: "pointer",
                        border: form.multiState === v ? `1.5px solid ${C.gold}` : `1px solid ${C.border}`,
                        background: form.multiState === v ? C.goldBg : C.cardAlt,
                        color: form.multiState === v ? C.navy : C.textMid, fontFamily: "'Source Sans 3',sans-serif",
                        textTransform: "capitalize"
                      }}>{v}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>International Operations?</label>
                  <div style={{ display: "flex", gap: 6 }}>
                    {["yes", "no"].map(v => (
                      <button key={v} onClick={() => update("internationalOps", v)} style={{
                        flex: 1, padding: "8px", borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: "pointer",
                        border: form.internationalOps === v ? `1.5px solid ${C.gold}` : `1px solid ${C.border}`,
                        background: form.internationalOps === v ? C.goldBg : C.cardAlt,
                        color: form.internationalOps === v ? C.navy : C.textMid, fontFamily: "'Source Sans 3',sans-serif",
                        textTransform: "capitalize"
                      }}>{v}</button>
                    ))}
                  </div>
                </div>
              </Card>

              {/* Risk Factors */}
              <Card title="Loss History & Risk Controls">
                <div style={{ marginBottom: 12 }}>
                  <label style={labelStyle}>Claims (Past 3 Years)</label>
                  <div style={{ display: "flex", gap: 6 }}>
                    {["0", "1", "2", "3", "4", "5+"].map(n => (
                      <button key={n} onClick={() => update("claims3yr", n.replace("+", ""))} style={{
                        flex: 1, padding: "8px 0", borderRadius: 6, fontSize: 13, fontWeight: 700, cursor: "pointer",
                        border: form.claims3yr === n.replace("+", "") ? `1.5px solid ${C.gold}` : `1px solid ${C.border}`,
                        background: form.claims3yr === n.replace("+", "") ? C.goldBg : C.cardAlt,
                        color: form.claims3yr === n.replace("+", "") ? C.navy : C.textMid, fontFamily: "'JetBrains Mono',monospace"
                      }}>{n}</button>
                    ))}
                  </div>
                </div>
                <div style={{ marginBottom: 12 }}>
                  <label style={labelStyle}>Additional Claims (Years 4-5)</label>
                  <div style={{ display: "flex", gap: 6 }}>
                    {["0", "1", "2", "3", "4+"].map(n => (
                      <button key={n} onClick={() => update("claims5yr", n.replace("+", ""))} style={{
                        flex: 1, padding: "8px 0", borderRadius: 6, fontSize: 13, fontWeight: 700, cursor: "pointer",
                        border: form.claims5yr === n.replace("+", "") ? `1.5px solid ${C.gold}` : `1px solid ${C.border}`,
                        background: form.claims5yr === n.replace("+", "") ? C.goldBg : C.cardAlt,
                        color: form.claims5yr === n.replace("+", "") ? C.navy : C.textMid, fontFamily: "'JetBrains Mono',monospace"
                      }}>{n}</button>
                    ))}
                  </div>
                </div>
                <div style={{ marginBottom: 12 }}>
                  <label style={labelStyle}>Formal Safety/Loss Control Program?</label>
                  <div style={{ display: "flex", gap: 6 }}>
                    {["yes", "no"].map(v => (
                      <button key={v} onClick={() => update("safetyProgram", v)} style={{
                        flex: 1, padding: "8px", borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: "pointer",
                        border: form.safetyProgram === v ? `1.5px solid ${C.gold}` : `1px solid ${C.border}`,
                        background: form.safetyProgram === v ? C.goldBg : C.cardAlt,
                        color: form.safetyProgram === v ? C.navy : C.textMid, fontFamily: "'Source Sans 3',sans-serif",
                        textTransform: "capitalize"
                      }}>{v}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>Contractual Insurance Requirements?</label>
                  <div style={{ display: "flex", gap: 6 }}>
                    {["yes", "no"].map(v => (
                      <button key={v} onClick={() => update("contractualReqs", v)} style={{
                        flex: 1, padding: "8px", borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: "pointer",
                        border: form.contractualReqs === v ? `1.5px solid ${C.gold}` : `1px solid ${C.border}`,
                        background: form.contractualReqs === v ? C.goldBg : C.cardAlt,
                        color: form.contractualReqs === v ? C.navy : C.textMid, fontFamily: "'Source Sans 3',sans-serif",
                        textTransform: "capitalize"
                      }}>{v}</button>
                    ))}
                  </div>
                </div>
              </Card>

              {/* Prior Insurance */}
              <Card title="Current / Prior Insurance" style={{ gridColumn: "1 / -1" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  <div>
                    <label style={labelStyle}>Current Carrier (if any)</label>
                    <input style={inputStyle} value={form.currentCarrier} onChange={e => update("currentCarrier", e.target.value)} placeholder="e.g. Hartford, Travelers" />
                  </div>
                  <div>
                    <label style={labelStyle}>Current Annual Premium ($)</label>
                    <input style={inputStyle} type="number" value={form.priorPremium} onChange={e => update("priorPremium", e.target.value)} placeholder="e.g. 85000" />
                  </div>
                </div>
              </Card>
            </div>

            <button onClick={runAnalysis} disabled={!canAnalyze} style={{
              width: "100%", marginTop: 20, padding: "16px 0", borderRadius: 10, border: "none",
              background: canAnalyze ? `linear-gradient(135deg, ${C.navy}, ${C.navyLight})` : "#d0cdc5",
              color: canAnalyze ? "#fff" : "#999", fontSize: 14, fontWeight: 800, letterSpacing: 2,
              textTransform: "uppercase", cursor: canAnalyze ? "pointer" : "not-allowed",
              fontFamily: "'Source Sans 3',sans-serif", transition: "all 0.3s",
              boxShadow: canAnalyze ? "0 4px 16px rgba(27,42,74,0.3)" : "none"
            }}>
              ▶ Generate Comprehensive Risk Analysis
            </button>
          </div>
        )}

        {/* ═══ RISK ANALYSIS TAB ═══ */}
        {activeTab === "risk" && result && (
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, flexWrap: "wrap", gap: 8 }}>
              <div>
                <h2 style={{ fontFamily: "'Source Serif 4',serif", fontSize: 22, fontWeight: 800, color: C.navy, margin: 0 }}>{form.companyName}</h2>
                <p style={{ fontSize: 12, color: C.textMid, margin: "2px 0 0" }}>
                  {result.industry.icon} {result.industry.label}{form.subType ? ` — ${form.subType}` : ""} · ${form.revenue}M Rev · {form.employees} FTE · {form.primaryState}
                </p>
              </div>
              <Badge color={C.navy} bg={C.goldBg}>RISK REPORT</Badge>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <Card title="Composite Risk Score">
                <GaugeChart value={result.compositeRisk} size={180} />
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6, marginTop: 12 }}>
                  {[
                    ["Industry Base", result.industry.baseRisk],
                    ["State Factor", result.stateData.tier === "high" ? "+10" : result.stateData.tier === "mid" ? "+4" : "+0"],
                    ["Claims Impact", `+${(parseInt(form.claims3yr) || 0) * 6 + (parseInt(form.claims5yr) || 0) * 3}`]
                  ].map(([l, v]) => (
                    <div key={l} style={{ textAlign: "center", padding: "6px 4px", background: C.cardAlt, borderRadius: 6, border: `1px solid ${C.border}` }}>
                      <div style={{ fontSize: 9, color: C.textLight, fontWeight: 600 }}>{l}</div>
                      <div style={{ fontSize: 14, fontWeight: 800, color: C.navy, fontFamily: "'JetBrains Mono',monospace" }}>{v}</div>
                    </div>
                  ))}
                </div>
              </Card>

              <Card title="Risk Dimension Breakdown">
                <DimensionBar label="Operational Risk" value={result.dimensions.operational} />
                <DimensionBar label="Financial Exposure" value={result.dimensions.financial} />
                <DimensionBar label="Geographic Risk" value={result.dimensions.geographic} />
                <DimensionBar label="Regulatory Complexity" value={result.dimensions.regulatory} />
                <DimensionBar label="Claims Severity" value={result.dimensions.claims} />
                <DimensionBar label="Market Conditions" value={result.dimensions.market} />
              </Card>

              {/* Loss Ratio Projection */}
              <Card title="5-Year Loss Ratio Projection" style={{ gridColumn: "1 / -1" }}>
                <div style={{ display: "flex", alignItems: "flex-end", gap: 2, height: 120, padding: "0 8px" }}>
                  {result.lossProjection.map((lp, i) => {
                    const h = (lp.ratio / 100) * 100;
                    const color = lp.ratio < 45 ? C.green : lp.ratio < 60 ? C.gold : lp.ratio < 75 ? C.orange : C.red;
                    return (
                      <div key={lp.year} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                        <span style={{ fontSize: 10, fontWeight: 700, color, fontFamily: "'JetBrains Mono',monospace" }}>{lp.ratio}%</span>
                        <div style={{ width: "100%", maxWidth: 60, height: h, background: `linear-gradient(180deg, ${color}, ${color}88)`, borderRadius: "4px 4px 0 0", transition: "height 1s ease-out", transitionDelay: `${i * 0.15}s` }} />
                        <span style={{ fontSize: 10, color: C.textLight, fontWeight: 600 }}>{lp.year}</span>
                        <span style={{ fontSize: 9, color: C.textMid, fontFamily: "'JetBrains Mono',monospace" }}>${(lp.premium / 1000).toFixed(0)}K</span>
                      </div>
                    );
                  })}
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 12, padding: "8px 12px", background: C.cardAlt, borderRadius: 6, border: `1px solid ${C.border}` }}>
                  <span style={{ fontSize: 10, color: C.textLight }}>Target loss ratio: &lt;55% · Current trajectory: {form.safetyProgram === "yes" ? "Improving" : "Stable/At risk"}</span>
                  <span style={{ fontSize: 10, fontWeight: 700, color: C.navy }}>5-yr est. premium: ${((result.lossProjection.reduce((s, l) => s + l.premium, 0)) / 1000).toFixed(0)}K</span>
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* ═══ COVERAGE & PREMIUM TAB ═══ */}
        {activeTab === "coverage" && result && (
          <div>
            <h2 style={{ fontFamily: "'Source Serif 4',serif", fontSize: 22, fontWeight: 800, color: C.navy, margin: "0 0 4px" }}>Coverage Analysis & Premium Modeling</h2>
            <p style={{ fontSize: 12, color: C.textMid, margin: "0 0 16px" }}>Prioritized coverage lines with Monte Carlo premium simulation across 1,000 scenarios.</p>

            {/* Monte Carlo Box */}
            <Card title="Premium Range — Monte Carlo Simulation (n=1,000)" style={{ marginBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
                <div style={{ textAlign: "center", flex: 1, minWidth: 100 }}>
                  <div style={{ fontSize: 9, color: C.textLight, fontWeight: 700 }}>BEST CASE (P5)</div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: C.green, fontFamily: "'JetBrains Mono',monospace" }}>${(result.premiumRange.best / 1000).toFixed(0)}K</div>
                </div>
                <div style={{ textAlign: "center", flex: 1, minWidth: 100, padding: "8px 16px", background: C.goldBg, borderRadius: 8, border: `1px solid ${C.gold}33` }}>
                  <div style={{ fontSize: 9, color: C.gold, fontWeight: 700 }}>EXPECTED (MEDIAN)</div>
                  <div style={{ fontSize: 24, fontWeight: 800, color: C.navy, fontFamily: "'JetBrains Mono',monospace" }}>${(result.premiumRange.median / 1000).toFixed(0)}K</div>
                </div>
                <div style={{ textAlign: "center", flex: 1, minWidth: 100 }}>
                  <div style={{ fontSize: 9, color: C.textLight, fontWeight: 700 }}>WORST CASE (P95)</div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: C.red, fontFamily: "'JetBrains Mono',monospace" }}>${(result.premiumRange.worst / 1000).toFixed(0)}K</div>
                </div>
              </div>
              {/* Percentile bar */}
              <div style={{ position: "relative", height: 32, background: C.cardAlt, borderRadius: 6, border: `1px solid ${C.border}`, overflow: "hidden" }}>
                {(() => {
                  const min = result.premiumRange.best * 0.9;
                  const max = result.premiumRange.worst * 1.1;
                  const pct = (v) => ((v - min) / (max - min)) * 100;
                  return (
                    <>
                      <div style={{ position: "absolute", left: `${pct(result.premiumRange.p25)}%`, width: `${pct(result.premiumRange.p75) - pct(result.premiumRange.p25)}%`, height: "100%", background: `${C.gold}25`, borderLeft: `2px solid ${C.gold}`, borderRight: `2px solid ${C.gold}` }} />
                      <div style={{ position: "absolute", left: `${pct(result.premiumRange.median)}%`, top: 0, bottom: 0, width: 3, background: C.navy, borderRadius: 2 }} />
                      <div style={{ position: "absolute", left: `${pct(result.premiumRange.p10)}%`, top: 4, fontSize: 8, color: C.textLight, fontFamily: "'JetBrains Mono',monospace" }}>P10</div>
                      <div style={{ position: "absolute", left: `${pct(result.premiumRange.p75)}%`, top: 4, fontSize: 8, color: C.textLight, fontFamily: "'JetBrains Mono',monospace" }}>P75</div>
                    </>
                  );
                })()}
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
                <span style={{ fontSize: 9, color: C.textLight }}>Interquartile range: ${(result.premiumRange.p25 / 1000).toFixed(0)}K – ${(result.premiumRange.p75 / 1000).toFixed(0)}K</span>
                {form.priorPremium && <span style={{ fontSize: 9, fontWeight: 700, color: result.premiumRange.median > parseFloat(form.priorPremium) ? C.red : C.green }}>
                  vs. current: {result.premiumRange.median > parseFloat(form.priorPremium) ? "+" : ""}{((result.premiumRange.median - parseFloat(form.priorPremium)) / parseFloat(form.priorPremium) * 100).toFixed(0)}%
                </span>}
              </div>
            </Card>

            {/* Coverage Lines */}
            <Card title="Coverage Line Priority Matrix">
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {result.coverageNeeds.map((cov, idx) => (
                  <div key={cov.id} style={{
                    display: "grid", gridTemplateColumns: "32px 1fr auto auto", alignItems: "center", gap: 12,
                    padding: "10px 12px", background: cov.priority > 75 ? C.cardAlt : C.card,
                    borderRadius: 8, border: `1px solid ${cov.required ? C.navy + "40" : C.border}`
                  }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 11, fontWeight: 800, fontFamily: "'JetBrains Mono',monospace",
                      background: cov.priority > 75 ? C.goldBg : C.cardAlt,
                      color: cov.priority > 75 ? C.gold : C.textLight,
                      border: `1px solid ${cov.priority > 75 ? C.gold + "40" : C.border}`
                    }}>{cov.priority}</div>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <span style={{ fontSize: 12, fontWeight: 700, color: C.navy }}>{cov.label}</span>
                        {cov.required && <Badge color={C.red} bg={C.redBg}>REQUIRED</Badge>}
                        {cov.recommended && !cov.required && <Badge color={C.gold} bg={C.goldBg}>RECOMMENDED</Badge>}
                      </div>
                      <div style={{ fontSize: 10, color: C.textLight, marginTop: 1 }}>{cov.desc}</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 14, fontWeight: 800, color: C.navy, fontFamily: "'JetBrains Mono',monospace" }}>
                        ${cov.estimatedPremium > 999 ? (cov.estimatedPremium / 1000).toFixed(1) + "K" : cov.estimatedPremium}
                      </div>
                      <div style={{ fontSize: 9, color: C.textLight }}>est./yr</div>
                    </div>
                    {/* mini priority bar */}
                    <div style={{ width: 48, height: 4, background: "#ece8df", borderRadius: 2, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${cov.priority}%`, background: cov.priority > 75 ? C.gold : cov.priority > 50 ? C.orange : C.textLight, borderRadius: 2 }} />
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 12, padding: "10px 14px", background: C.goldBg, borderRadius: 8, border: `1px solid ${C.gold}33`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: C.navy }}>Total Estimated Annual Premium</span>
                <span style={{ fontSize: 18, fontWeight: 800, color: C.navy, fontFamily: "'JetBrains Mono',monospace" }}>${(result.totalEstimatedPremium / 1000).toFixed(0)}K</span>
              </div>
            </Card>
          </div>
        )}

        {/* ═══ CARRIER MATCH TAB ═══ */}
        {activeTab === "carriers" && result && (
          <div>
            <h2 style={{ fontFamily: "'Source Serif 4',serif", fontSize: 22, fontWeight: 800, color: C.navy, margin: "0 0 4px" }}>Carrier Recommendations</h2>
            <p style={{ fontSize: 12, color: C.textMid, margin: "0 0 16px" }}>Ranked by match score — industry fit, coverage alignment, financial strength, and premium capacity.</p>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {result.carrierResults.map((carrier, idx) => (
                <Card key={carrier.name} style={{ position: "relative", overflow: "hidden", border: idx === 0 ? `2px solid ${C.gold}` : `1px solid ${C.border}` }}>
                  {idx === 0 && <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, ${C.gold}, ${C.goldLight}, transparent)` }} />}
                  <div style={{ display: "grid", gridTemplateColumns: "auto 1fr auto", alignItems: "start", gap: 16 }}>
                    <div style={{
                      width: 44, height: 44, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 16, fontWeight: 800, fontFamily: "'Source Serif 4',serif",
                      background: idx === 0 ? `linear-gradient(135deg, ${C.gold}, ${C.goldLight})` : C.cardAlt,
                      color: idx === 0 ? "#fff" : C.textMid,
                      border: idx === 0 ? "none" : `1px solid ${C.border}`
                    }}>#{idx + 1}</div>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, flexWrap: "wrap" }}>
                        <span style={{ fontSize: 16, fontWeight: 800, color: C.navy }}>{carrier.name}</span>
                        <Badge color={C.green} bg={C.greenBg}>AM Best {carrier.rating}</Badge>
                        <Badge color={C.navy} bg={C.blueBg}>Tier {carrier.tier}</Badge>
                        {idx === 0 && <Badge color="#fff" bg={C.gold}>TOP MATCH</Badge>}
                      </div>
                      <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 8 }}>
                        {carrier.strengths.map(s => (
                          <span key={s} style={{ padding: "3px 8px", fontSize: 10, fontWeight: 600, background: C.cardAlt, color: C.textMid, borderRadius: 4, border: `1px solid ${C.border}` }}>{s}</span>
                        ))}
                      </div>
                      <div style={{ display: "flex", gap: 12, fontSize: 10, color: C.textLight }}>
                        <span>Min Premium: ${(carrier.minPremium / 1000).toFixed(0)}K</span>
                        <span>Claims Response: {carrier.claimsResponseHrs}hr</span>
                        <span>Match Score: <strong style={{ color: C.gold }}>{carrier.matchScore}</strong></span>
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 9, color: C.textLight, fontWeight: 700 }}>EST. PREMIUM</div>
                      <div style={{ fontSize: 22, fontWeight: 800, color: C.navy, fontFamily: "'JetBrains Mono',monospace" }}>${(carrier.premiumEstimate / 1000).toFixed(0)}K</div>
                      <div style={{ fontSize: 10, color: C.textLight }}>per year</div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* ═══ COMPLIANCE & ACTIONS TAB ═══ */}
        {activeTab === "compliance" && result && (
          <div>
            <h2 style={{ fontFamily: "'Source Serif 4',serif", fontSize: 22, fontWeight: 800, color: C.navy, margin: "0 0 4px" }}>Regulatory Compliance & Risk Mitigation</h2>
            <p style={{ fontSize: 12, color: C.textMid, margin: "0 0 16px" }}>Compliance flags, actionable risk reduction strategies, and projected ROI.</p>

            <Card title="Compliance & Regulatory Flags" style={{ marginBottom: 16 }}>
              {result.complianceFlags.length === 0 ? (
                <div style={{ padding: 16, textAlign: "center", color: C.green, fontSize: 13, fontWeight: 600 }}>✓ No significant compliance flags identified</div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {result.complianceFlags.map((flag, i) => (
                    <div key={i} style={{ display: "flex", gap: 10, padding: "10px 12px", background: sevBg(flag.severity), borderRadius: 8, border: `1px solid ${sevColor(flag.severity)}25` }}>
                      <div style={{ width: 8, height: 8, borderRadius: "50%", background: sevColor(flag.severity), marginTop: 4, flexShrink: 0 }} />
                      <div>
                        <span style={{ fontSize: 9, fontWeight: 700, color: sevColor(flag.severity), textTransform: "uppercase", letterSpacing: 1 }}>{flag.severity} </span>
                        <span style={{ fontSize: 12, color: C.text, lineHeight: 1.5 }}>{flag.msg}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            <Card title="Risk Mitigation Action Plan">
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {result.mitigations.map((m, i) => (
                  <div key={i} style={{
                    display: "grid", gridTemplateColumns: "auto 1fr auto auto", alignItems: "center", gap: 12,
                    padding: "12px 14px", background: C.cardAlt, borderRadius: 8, border: `1px solid ${C.border}`
                  }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 11, fontWeight: 800,
                      background: m.priority === "high" ? C.redBg : m.priority === "medium" ? C.orangeBg : C.greenBg,
                      color: m.priority === "high" ? C.red : m.priority === "medium" ? C.orange : C.green,
                      fontFamily: "'JetBrains Mono',monospace"
                    }}>{i + 1}</div>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: C.navy, marginBottom: 2 }}>{m.action}</div>
                      <span style={{ fontSize: 10, color: C.textLight }}>Expected impact: <strong style={{ color: C.text }}>{m.impact}</strong></span>
                    </div>
                    <div style={{ textAlign: "center", padding: "4px 10px", background: C.blueBg, borderRadius: 6 }}>
                      <div style={{ fontSize: 8, color: C.textLight, fontWeight: 600 }}>ROI</div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: C.blue }}>{m.roi}</div>
                    </div>
                    <Badge color={sevColor(m.priority)} bg={sevBg(m.priority)}>{m.priority.toUpperCase()}</Badge>
                  </div>
                ))}
              </div>
            </Card>

            {/* Footer */}
            <div style={{ marginTop: 20, padding: "14px 16px", background: C.card, borderRadius: 10, border: `1px solid ${C.border}`, textAlign: "center" }}>
              <div style={{ fontSize: 10, color: C.textLight, marginBottom: 4 }}>Associated Risk Engine — Commercial Lines Risk Assessment Platform</div>
              <div style={{ fontSize: 9, color: C.textLight }}>
                Prototype developed by Parth Shah · MS Finance, UT Dallas · Python · ML · Financial Modeling · Risk Analytics
              </div>
              <button onClick={() => { setActiveTab("intake"); setResult(null); }} style={{
                marginTop: 10, padding: "8px 20px", borderRadius: 6, border: `1px solid ${C.border}`,
                background: C.card, color: C.textMid, fontSize: 11, fontWeight: 600, cursor: "pointer",
                fontFamily: "'Source Sans 3',sans-serif"
              }}>← Start New Analysis</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
