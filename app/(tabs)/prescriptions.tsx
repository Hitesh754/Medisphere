import { useState, useRef } from "react";
import { Camera, Image as ImageIcon, Loader2, Pill, Clock, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface MedicineResult {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  advisory: string;
}

interface ScanResponse {
  medicines: MedicineResult[];
  generalAdvice: string;
  error?: string;
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Remove the data:image/...;base64, prefix
      const base64 = result.split(",")[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function PrescriptionsPage() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<ScanResponse | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setLoading(true);
    setResults(null);

    try {
      const imageBase64 = await fileToBase64(file);

      const { data, error } = await supabase.functions.invoke("scan-prescription", {
        body: { imageBase64, mimeType: file.type },
      });

      if (error) {
        throw new Error(error.message || "Failed to scan prescription");
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      setResults(data as ScanResponse);
      toast.success(`Found ${data.medicines?.length || 0} medicine(s) in your prescription!`);
    } catch (e: any) {
      console.error("Scan error:", e);
      toast.error(e.message || "Failed to scan prescription. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  return (
    <div className="px-5 pt-12 pb-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Scan Prescription</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Upload or capture a prescription image to extract medicine details
        </p>
      </div>

      {/* Upload Area */}
      {!previewUrl && !loading && (
        <div className="glass-card rounded-2xl p-8 text-center space-y-4 border-2 border-dashed border-primary/20">
          <div className="w-16 h-16 rounded-2xl gradient-primary mx-auto flex items-center justify-center">
            <Pill size={28} className="text-primary-foreground" />
          </div>
          <div>
            <p className="font-semibold text-foreground">Upload Prescription</p>
            <p className="text-sm text-muted-foreground mt-1">Take a photo or choose from gallery</p>
          </div>
          <div className="flex gap-3 justify-center">
            <Button variant="hero" onClick={() => cameraInputRef.current?.click()}>
              <Camera size={18} />
              Camera
            </Button>
            <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
              <ImageIcon size={18} />
              Gallery
            </Button>
          </div>
        </div>
      )}

      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={onFileChange} />
      <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={onFileChange} />

      {/* Image Preview */}
      {previewUrl && (
        <div className="glass-card rounded-2xl overflow-hidden">
          <img src={previewUrl} alt="Prescription" className="w-full h-48 object-cover" />
          {loading && (
            <div className="p-4 flex items-center justify-center gap-2 text-primary">
              <Loader2 size={20} className="animate-spin" />
              <span className="text-sm font-semibold">Analyzing prescription with AI...</span>
            </div>
          )}
        </div>
      )}

      {/* Results */}
      {results && results.medicines && results.medicines.length > 0 && (
        <div className="space-y-4 animate-slide-up">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={20} className="text-success" />
            <h2 className="text-base font-bold text-foreground">
              {results.medicines.length} Medicine{results.medicines.length > 1 ? "s" : ""} Found
            </h2>
          </div>

          {results.medicines.map((med, i) => (
            <div key={i} className="glass-card rounded-xl p-4 space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shrink-0">
                  <Pill size={18} className="text-primary-foreground" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-foreground">{med.name}</h3>
                  <span className="text-sm text-primary font-semibold">{med.dosage}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="bg-muted rounded-lg p-2.5">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Clock size={12} className="text-muted-foreground" />
                    <span className="text-[10px] text-muted-foreground font-semibold uppercase">Frequency</span>
                  </div>
                  <p className="text-xs font-semibold text-foreground">{med.frequency}</p>
                </div>
                <div className="bg-muted rounded-lg p-2.5">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Clock size={12} className="text-muted-foreground" />
                    <span className="text-[10px] text-muted-foreground font-semibold uppercase">Duration</span>
                  </div>
                  <p className="text-xs font-semibold text-foreground">{med.duration}</p>
                </div>
              </div>

              <div className="bg-warning/5 border border-warning/20 rounded-lg p-3 flex gap-2">
                <AlertTriangle size={16} className="text-warning shrink-0 mt-0.5" />
                <p className="text-xs text-foreground/80 leading-relaxed">{med.advisory}</p>
              </div>
            </div>
          ))}

          {/* General Advisory */}
          {results.generalAdvice && (
            <div className="gradient-accent rounded-xl p-4 space-y-2">
              <p className="font-bold text-accent-foreground text-sm">⚕️ General Advisory</p>
              <p className="text-xs text-accent-foreground/90 leading-relaxed">{results.generalAdvice}</p>
            </div>
          )}

          <Button
            variant="outline"
            className="w-full"
            onClick={() => {
              setResults(null);
              setPreviewUrl(null);
            }}
          >
            Scan Another Prescription
          </Button>
        </div>
      )}

      {/* No medicines found */}
      {results && (!results.medicines || results.medicines.length === 0) && (
        <div className="glass-card rounded-xl p-6 text-center space-y-2 animate-fade-in">
          <AlertTriangle size={32} className="mx-auto text-warning" />
          <p className="font-semibold text-foreground">No medicines detected</p>
          <p className="text-sm text-muted-foreground">
            {results.generalAdvice || "Please try uploading a clearer image of the prescription."}
          </p>
          <Button
            variant="outline"
            className="mt-3"
            onClick={() => {
              setResults(null);
              setPreviewUrl(null);
            }}
          >
            Try Again
          </Button>
        </div>
      )}
    </div>
  );
}
