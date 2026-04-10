// import { useState, useEffect } from "react";
// import { supabase } from "@/integrations/supabase/client";
// import { useNavigate } from "react-router-dom";
// import { User, LogOut, Sun, Moon, Share2, FileText, Pill, Calendar, Cake, Heart, Copy, Check, Loader as Loader2 } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { toast } from "sonner";
// import { useTheme } from "next-themes";

// interface PatientProfile {
//   id: string;
//   full_name: string;
//   date_of_birth: string;
//   gender: string;
//   primary_problem: string;
//   breakfast_time: string;
//   lunch_time: string;
//   dinner_time: string;
//   avatar_url: string;
// }

// interface Medicine {
//   id: string;
//   medicine_name: string;
//   dosage: string;
//   frequency: string;
//   purpose: string;
// }

// interface Lab {
//   id: string;
//   test_name: string;
//   result: string;
//   status: string;
//   report_date: string;
// }

// interface Share {
//   id: string;
//   share_code: string;
//   created_at: string;
// }

// export default function ProfilePage() {
//   const navigate = useNavigate();
//   const { theme, setTheme } = useTheme();
//   const [profile, setProfile] = useState<PatientProfile | null>(null);
//   const [medicines, setMedicines] = useState<Medicine[]>([]);
//   const [labs, setLabs] = useState<Lab[]>([]);
//   const [share, setShare] = useState<Share | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [saving, setSaving] = useState(false);
//   const [copied, setCopied] = useState(false);
//   const [editMode, setEditMode] = useState(false);
//   const [formData, setFormData] = useState<Partial<PatientProfile>>({});

//   useEffect(() => {
//     loadProfileData();
//   }, []);

//   const loadProfileData = async () => {
//     try {
//       const { data: sessionData } = await supabase.auth.getSession();
//       if (!sessionData.session) {
//         navigate("/login");
//         return;
//       }

//       const userId = sessionData.session.user.id;

//       const { data: profileData } = await supabase
//         .from("patient_profiles")
//         .select("*")
//         .eq("user_id", userId)
//         .maybeSingle();

//       if (profileData) {
//         setProfile(profileData);
//         setFormData(profileData);
//       }

//       const { data: medsData } = await supabase
//         .from("patient_medicines")
//         .select("*")
//         .eq("user_id", userId);

//       if (medsData) setMedicines(medsData);

//       const { data: labsData } = await supabase
//         .from("patient_labs")
//         .select("*")
//         .eq("user_id", userId);

//       if (labsData) setLabs(labsData);

//       const { data: shareData } = await supabase
//         .from("portfolio_shares")
//         .select("*")
//         .eq("user_id", userId)
//         .order("created_at", { ascending: false })
//         .limit(1)
//         .maybeSingle();

//       if (shareData) setShare(shareData);
//     } catch (error: any) {
//       toast.error("Failed to load profile");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleSaveProfile = async () => {
//     if (!profile) return;

//     setSaving(true);
//     try {
//       const { error } = await supabase
//         .from("patient_profiles")
//         .update(formData)
//         .eq("id", profile.id);

//       if (error) throw error;
//       setProfile({ ...profile, ...formData });
//       setEditMode(false);
//       toast.success("Profile updated!");
//     } catch (error: any) {
//       toast.error(error.message);
//     } finally {
//       setSaving(false);
//     }
//   };

//   const generateShare = async () => {
//     try {
//       const { data: sessionData } = await supabase.auth.getSession();
//       const userId = sessionData.session?.user.id;

//       if (!userId) return;

//       const shareToken = Math.random().toString(36).substring(2, 15);
//       const shareCode = Math.random().toString(36).substring(2, 8).toUpperCase();

//       const { data, error } = await supabase
//         .from("portfolio_shares")
//         .insert({
//           user_id: userId,
//           share_token: shareToken,
//           share_code: shareCode,
//         })
//         .select()
//         .single();

//       if (error) throw error;
//       setShare(data);
//       toast.success("Portfolio share link generated!");
//     } catch (error: any) {
//       toast.error(error.message);
//     }
//   };

//   const copyShareCode = () => {
//     if (share) {
//       navigator.clipboard.writeText(share.share_code);
//       setCopied(true);
//       toast.success("Share code copied!");
//       setTimeout(() => setCopied(false), 2000);
//     }
//   };

//   const handleLogout = async () => {
//     await supabase.auth.signOut();
//     navigate("/login");
//   };

//   const calculateAge = () => {
//     if (!profile?.date_of_birth) return "N/A";
//     const birth = new Date(profile.date_of_birth);
//     const today = new Date();
//     let age = today.getFullYear() - birth.getFullYear();
//     const monthDiff = today.getMonth() - birth.getMonth();
//     if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
//       age--;
//     }
//     return age > 0 ? age.toString() : "N/A";
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <Loader2 size={40} className="animate-spin text-primary" />
//       </div>
//     );
//   }

//   return (
//     <div className="px-5 pt-12 pb-6 space-y-6">
//       {/* Header with Theme Toggle */}
//       <div className="flex items-center justify-between animate-fade-in">
//         <div>
//           <h1 className="text-3xl font-bold text-foreground">Patient Portfolio</h1>
//           <p className="text-muted-foreground text-sm mt-1">Your health profile & summary</p>
//         </div>
//         <div className="flex items-center gap-2">
//           <button
//             onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
//             className="w-11 h-11 rounded-xl bg-muted hover:bg-muted/80 flex items-center justify-center transition-colors"
//           >
//             {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
//           </button>
//           <button
//             onClick={handleLogout}
//             className="w-11 h-11 rounded-xl bg-destructive/10 hover:bg-destructive/20 flex items-center justify-center transition-colors text-destructive"
//           >
//             <LogOut size={20} />
//           </button>
//         </div>
//       </div>

//       {/* Profile Section */}
//       {profile && (
//         <div className="glass-card rounded-2xl p-6 space-y-4 animate-slide-up">
//           <div className="flex items-start justify-between">
//             <div className="flex items-center gap-4">
//               <div className="w-20 h-20 rounded-xl gradient-primary flex items-center justify-center shadow-lg">
//                 <User size={40} className="text-primary-foreground" />
//               </div>
//               <div>
//                 <h2 className="text-2xl font-bold text-foreground">{profile.full_name}</h2>
//                 <div className="flex items-center gap-3 mt-2">
//                   <div className="flex items-center gap-1 text-muted-foreground">
//                     <Cake size={16} />
//                     <span className="text-sm">{calculateAge()} years</span>
//                   </div>
//                   <div className="flex items-center gap-1 text-muted-foreground">
//                     <Heart size={16} />
//                     <span className="text-sm capitalize">{profile.gender || "N/A"}</span>
//                   </div>
//                 </div>
//               </div>
//             </div>
//             <Button
//               variant={editMode ? "outline" : "default"}
//               onClick={() => {
//                 if (editMode) {
//                   handleSaveProfile();
//                 } else {
//                   setEditMode(true);
//                 }
//               }}
//               disabled={saving}
//             >
//               {editMode ? (saving ? "Saving..." : "Save") : "Edit"}
//             </Button>
//           </div>

//           {/* Editable Fields */}
//           <div className="space-y-3 border-t border-border pt-4">
//             {editMode ? (
//               <>
//                 <div className="space-y-2">
//                   <label className="text-xs font-semibold text-muted-foreground uppercase">
//                     Date of Birth
//                   </label>
//                   <Input
//                     type="date"
//                     value={formData.date_of_birth || ""}
//                     onChange={(e) =>
//                       setFormData({ ...formData, date_of_birth: e.target.value })
//                     }
//                   />
//                 </div>
//                 <div className="space-y-2">
//                   <label className="text-xs font-semibold text-muted-foreground uppercase">
//                     Primary Health Problem
//                   </label>
//                   <Input
//                     placeholder="e.g., Diabetes, Hypertension"
//                     value={formData.primary_problem || ""}
//                     onChange={(e) =>
//                       setFormData({ ...formData, primary_problem: e.target.value })
//                     }
//                   />
//                 </div>
//                 <div className="grid grid-cols-3 gap-2">
//                   <div className="space-y-2">
//                     <label className="text-xs font-semibold text-muted-foreground uppercase">
//                       Breakfast
//                     </label>
//                     <Input
//                       type="time"
//                       value={formData.breakfast_time || ""}
//                       onChange={(e) =>
//                         setFormData({ ...formData, breakfast_time: e.target.value })
//                       }
//                     />
//                   </div>
//                   <div className="space-y-2">
//                     <label className="text-xs font-semibold text-muted-foreground uppercase">
//                       Lunch
//                     </label>
//                     <Input
//                       type="time"
//                       value={formData.lunch_time || ""}
//                       onChange={(e) =>
//                         setFormData({ ...formData, lunch_time: e.target.value })
//                       }
//                     />
//                   </div>
//                   <div className="space-y-2">
//                     <label className="text-xs font-semibold text-muted-foreground uppercase">
//                       Dinner
//                     </label>
//                     <Input
//                       type="time"
//                       value={formData.dinner_time || ""}
//                       onChange={(e) =>
//                         setFormData({ ...formData, dinner_time: e.target.value })
//                       }
//                     />
//                   </div>
//                 </div>
//               </>
//             ) : (
//               <>
//                 <div className="flex items-center justify-between">
//                   <span className="text-sm text-muted-foreground">Date of Birth</span>
//                   <span className="text-sm font-semibold text-foreground">
//                     {profile.date_of_birth || "Not set"}
//                   </span>
//                 </div>
//                 <div className="flex items-center justify-between">
//                   <span className="text-sm text-muted-foreground">Primary Problem</span>
//                   <span className="text-sm font-semibold text-foreground">
//                     {profile.primary_problem || "Not set"}
//                   </span>
//                 </div>
//                 <div className="flex items-center justify-between">
//                   <span className="text-sm text-muted-foreground">Meal Times</span>
//                   <span className="text-sm font-semibold text-foreground">
//                     {profile.breakfast_time} • {profile.lunch_time} • {profile.dinner_time}
//                   </span>
//                 </div>
//               </>
//             )}
//           </div>
//         </div>
//       )}

//       {/* Portfolio Summary */}
//       <div className="grid grid-cols-3 gap-3 animate-slide-up">
//         <div className="glass-card rounded-xl p-4 text-center">
//           <div className="w-10 h-10 rounded-lg gradient-primary mx-auto mb-2 flex items-center justify-center">
//             <Pill size={18} className="text-primary-foreground" />
//           </div>
//           <p className="text-2xl font-bold text-foreground">{medicines.length}</p>
//           <p className="text-xs text-muted-foreground">Medicines</p>
//         </div>
//         <div className="glass-card rounded-xl p-4 text-center">
//           <div className="w-10 h-10 rounded-lg gradient-accent mx-auto mb-2 flex items-center justify-center">
//             <FileText size={18} className="text-accent-foreground" />
//           </div>
//           <p className="text-2xl font-bold text-foreground">{labs.length}</p>
//           <p className="text-xs text-muted-foreground">Lab Tests</p>
//         </div>
//         <div className="glass-card rounded-xl p-4 text-center">
//           <div className="w-10 h-10 rounded-lg gradient-warm mx-auto mb-2 flex items-center justify-center">
//             <Calendar size={18} className="text-warning-foreground" />
//           </div>
//           <p className="text-2xl font-bold text-foreground">
//             {profile?.primary_problem ? "1" : "0"}
//           </p>
//           <p className="text-xs text-muted-foreground">Problem</p>
//         </div>
//       </div>

//       {/* Medicines Summary */}
//       {medicines.length > 0 && (
//         <div className="glass-card rounded-xl p-4 space-y-3 animate-slide-up">
//           <div className="flex items-center gap-2">
//             <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
//               <Pill size={18} className="text-primary" />
//             </div>
//             <h3 className="font-bold text-foreground">Current Medicines</h3>
//           </div>
//           <div className="space-y-2 max-h-48 overflow-y-auto">
//             {medicines.map((med) => (
//               <div key={med.id} className="bg-muted/30 rounded-lg p-3 border border-border/50">
//                 <div className="flex items-center justify-between">
//                   <div>
//                     <p className="font-semibold text-foreground text-sm">{med.medicine_name}</p>
//                     <p className="text-xs text-muted-foreground">
//                       {med.dosage} • {med.frequency}
//                     </p>
//                   </div>
//                   <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
//                     {med.purpose || "Prescribed"}
//                   </span>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       )}

//       {/* Lab Results Summary */}
//       {labs.length > 0 && (
//         <div className="glass-card rounded-xl p-4 space-y-3 animate-slide-up">
//           <div className="flex items-center gap-2">
//             <div className="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center">
//               <FileText size={18} className="text-accent" />
//             </div>
//             <h3 className="font-bold text-foreground">Recent Lab Results</h3>
//           </div>
//           <div className="space-y-2 max-h-48 overflow-y-auto">
//             {labs.slice(0, 5).map((lab) => (
//               <div key={lab.id} className="bg-muted/30 rounded-lg p-3 border border-border/50">
//                 <div className="flex items-center justify-between">
//                   <div>
//                     <p className="font-semibold text-foreground text-sm">{lab.test_name}</p>
//                     <p className="text-xs text-muted-foreground">
//                       Result: {lab.result}
//                     </p>
//                   </div>
//                   <span
//                     className={`text-xs px-2 py-1 rounded-full font-semibold ${
//                       lab.status === "normal"
//                         ? "bg-success/10 text-success"
//                         : "bg-destructive/10 text-destructive"
//                     }`}
//                   >
//                     {lab.status}
//                   </span>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       )}

//       {/* Share Portfolio */}
//       <div className="glass-card rounded-xl p-4 space-y-3 animate-slide-up">
//         <div className="flex items-center gap-2">
//           <div className="w-9 h-9 rounded-lg bg-warning/10 flex items-center justify-center">
//             <Share2 size={18} className="text-warning" />
//           </div>
//           <h3 className="font-bold text-foreground">Share Portfolio</h3>
//         </div>
//         {share ? (
//           <div className="space-y-3">
//             <p className="text-xs text-muted-foreground">
//               Share your portfolio with doctors or family members using this code:
//             </p>
//             <div className="flex items-center gap-2">
//               <div className="flex-1 bg-muted rounded-lg px-4 py-2.5 border border-border">
//                 <p className="font-mono font-bold text-lg text-foreground text-center">
//                   {share.share_code}
//                 </p>
//               </div>
//               <button
//                 onClick={copyShareCode}
//                 className="w-11 h-11 rounded-lg bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-colors"
//               >
//                 {copied ? <Check size={18} /> : <Copy size={18} />}
//               </button>
//             </div>
//             <p className="text-xs text-muted-foreground">
//               Shared on: {new Date(share.created_at).toLocaleDateString()}
//             </p>
//           </div>
//         ) : (
//           <Button onClick={generateShare} variant="outline" className="w-full">
//             <Share2 size={18} />
//             Generate Share Link
//           </Button>
//         )}
//       </div>
//     </div>
//   );
// }
