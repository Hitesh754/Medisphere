import { getSavedMedicines, getTodayAdherenceStats } from "@/lib/medicineStore";
import { supabase } from "@/integrations/supabase/client";
import jsPDF from "jspdf";

const mockUser = { name: "John" };

interface LabReportDetail {
  summary: string;
  doctor?: string;
  tests?: string[];
  date?: string;
}

function getLabReportDetails(): LabReportDetail[] {
  try {
    const raw = localStorage.getItem("clearscript_lab_reports_detail");
    if (raw) return JSON.parse(raw);
    
    const oldRaw = localStorage.getItem("clearscript_lab_reports");
    if (oldRaw) {
      const summaries: string[] = JSON.parse(oldRaw);
      return summaries.map((s) => ({ summary: s }));
    }
    return [];
  } catch {
    return [];
  }
}

async function getHealthSummary(medicines: ReturnType<typeof getSavedMedicines>, labReports: LabReportDetail[]): Promise<string> {
  try {
    const medList = medicines.map((m) => `${m.name} ${m.dosage} - ${m.description || m.frequency}`).join("; ");
    const labList = labReports.map((l) => l.summary).join("; ");

    const prompt = `Based on this patient data, give a 2-3 line health status summary in simple language.
Medicines: ${medList || "None"}
Lab Reports: ${labList || "None"}
Be concise and professional. Don't use markdown.`;

    const { data, error } = await supabase.functions.invoke("generate-health-summary", {
      body: { prompt },
    });

    if (error || !data?.summary) {
      return generateFallbackSummary(medicines, labReports);
    }
    return data.summary;
  } catch {
    return generateFallbackSummary(medicines, labReports);
  }
}

function generateFallbackSummary(medicines: ReturnType<typeof getSavedMedicines>, labReports: LabReportDetail[]): string {
  const parts: string[] = [];
  if (medicines.length > 0) {
    parts.push(`Patient is currently on ${medicines.length} medication(s): ${medicines.map((m) => m.name).join(", ")}.`);
  }
  if (labReports.length > 0) {
    parts.push(`${labReports.length} lab report(s) have been analyzed.`);
  }
  if (parts.length === 0) {
    parts.push("No medical records available at this time.");
  }
  return parts.join(" ");
}

export async function generatePortfolioPDF() {
  const medicines = getSavedMedicines();
  const labReports = getLabReportDetails();
  const adherence = getTodayAdherenceStats();
  const healthSummary = await getHealthSummary(medicines, labReports);

  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;
  let y = 20;

  
  const addLine = (text: string, fontSize: number, bold: boolean, color: [number, number, number] = [30, 30, 30]) => {
    doc.setFontSize(fontSize);
    doc.setFont("helvetica", bold ? "bold" : "normal");
    doc.setTextColor(...color);
    const lines = doc.splitTextToSize(text, contentWidth);
    doc.text(lines, margin, y);
    y += lines.length * (fontSize * 0.45) + 4;
  };

  const addDivider = () => {
    doc.setDrawColor(200, 200, 200);
    doc.line(margin, y, pageWidth - margin, y);
    y += 8;
  };

  
  doc.setFillColor(59, 130, 246);
  doc.rect(0, 0, pageWidth, 40, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text("Patient Health Portfolio", margin, 26);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Generated on ${new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}`, margin, 35);
  y = 52;

  
  addLine("PATIENT INFORMATION", 14, true, [59, 130, 246]);
  y += 2;
  addLine(`Name: ${mockUser.name}`, 12, false);
  addLine(`Date: ${new Date().toLocaleDateString("en-IN")}`, 11, false, [100, 100, 100]);
  y += 4;

  
  const doctors = labReports.filter((l) => l.doctor).map((l) => l.doctor!);
  if (doctors.length > 0) {
    addLine(`Consulting Doctor: ${[...new Set(doctors)].join(", ")}`, 12, false);
    y += 2;
  }

  addDivider();

  
  addLine("CURRENT MEDICATIONS", 14, true, [59, 130, 246]);
  y += 2;
  if (medicines.length === 0) {
    addLine("No medications currently recorded.", 11, false, [100, 100, 100]);
  } else {
    medicines.forEach((med, i) => {
      addLine(`${i + 1}. ${med.name} — ${med.dosage}`, 11, true);
      addLine(`   Frequency: ${med.frequency} | Duration: ${med.duration}`, 10, false, [80, 80, 80]);
      if (med.description) {
        addLine(`   Purpose: ${med.description}`, 10, false, [80, 80, 80]);
      }
      if (med.advisory) {
        addLine(`   Advisory: ${med.advisory}`, 10, false, [150, 80, 30]);
      }
      y += 2;
    });
  }

  addDivider();

  
  addLine("TODAY'S ADHERENCE", 14, true, [59, 130, 246]);
  y += 2;
  addLine(`${adherence.taken} of ${adherence.total} doses taken (${adherence.percentage}%)`, 11, false);
  y += 4;

  addDivider();

  
  addLine("LAB REPORTS & TESTS", 14, true, [59, 130, 246]);
  y += 2;
  if (labReports.length === 0) {
    addLine("No lab reports analyzed yet.", 11, false, [100, 100, 100]);
  } else {
    labReports.forEach((report, i) => {
      addLine(`${i + 1}. ${report.summary}`, 11, false);
      if (report.tests && report.tests.length > 0) {
        addLine(`   Tests: ${report.tests.join(", ")}`, 10, false, [80, 80, 80]);
      }
      if (report.date) {
        addLine(`   Date: ${report.date}`, 10, false, [100, 100, 100]);
      }
      y += 2;
    });
  }

  
  if (y > 240) {
    doc.addPage();
    y = 20;
  }

  addDivider();

  
  addLine("HEALTH STATUS SUMMARY", 14, true, [59, 130, 246]);
  y += 2;
  doc.setFillColor(240, 247, 255);
  const summaryLines = doc.splitTextToSize(healthSummary, contentWidth - 16);
  const boxHeight = summaryLines.length * 6 + 16;
  doc.roundedRect(margin, y - 4, contentWidth, boxHeight, 3, 3, "F");
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(30, 30, 30);
  doc.text(summaryLines, margin + 8, y + 6);
  y += boxHeight + 8;

  
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text("This report is auto-generated by MediSphere Team for informational purposes only.", margin, 285);
  doc.text("Please consult your healthcare provider for medical advice.", margin, 290);

  
  const pdfBlob = doc.output("blob");
  const url = URL.createObjectURL(pdfBlob);
  window.open(url, "_blank");
}
