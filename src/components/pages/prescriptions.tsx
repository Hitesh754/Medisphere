// import React, { useState } from "react";
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   StyleSheet,
//   ActivityIndicator,
//   ScrollView,
//   Alert,
// } from "react-native";
// import { useAppStore } from "@/store/useAppStore";
// import * as ImagePicker from "expo-image-picker";
// import { getToken } from "@/utils/auth";

// const BASE_URL = "http://192.168.X.X:5000";

// interface ScanResult {
//   Medicine?: string[];
//   Dosage?: string[];
//   [key: string]: string[] | undefined;
// }

// export default function PrescriptionsScreen() {
//   const setScanResult = useAppStore((s) => s.setScanResult);
//   const [loading, setLoading] = useState(false);
//   const [result, setResult] = useState<ScanResult | null>(null);

//   const handleScan = async () => {
//     console.log("🚀 Button Clicked");

//     try {
//       const token = await getToken();

//       if (!token) {
//         Alert.alert("Error", "User not logged in");
//         return;
//       }

//       // ✅ Permission
//       const { status } =
//         await ImagePicker.requestMediaLibraryPermissionsAsync();
//       console.log("Permission:", status);

//       if (status !== "granted") {
//         Alert.alert("Permission needed", "Allow photo access.");
//         return;
//       }

//       // ✅ Open picker
//       console.log("Opening picker...");
//       const picked = await ImagePicker.launchImageLibraryAsync({
//         mediaTypes: ImagePicker.MediaTypeOptions.Images,
//         allowsEditing: true,
//         quality: 1,
//       });

//       if (picked.canceled) {
//         console.log("User cancelled");
//         return;
//       }

//       const asset = picked.assets[0];
//       const filename = asset.uri.split("/").pop() || "file.jpg";

//       const formData = new FormData();
//       formData.append("email", "test@gmail.com");
//       formData.append("pic_name", filename);
//       formData.append("file", {
//         uri: asset.uri,
//         name: filename,
//         type: "image/jpeg",
//       } as any);

//       setLoading(true);

//       // ✅ API call
//       const res = await fetch(
//         `${BASE_URL}/dashboard/upload_prescription`,
//         {
//           method: "POST",
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//           body: formData,
//         }
//       );

//       console.log("STATUS:", res.status);

//       const text = await res.text();
//       console.log("RESPONSE:", text);

//       const data = JSON.parse(text);

//       setResult(data);
//       setScanResult(data);
//     } catch (e) {
//       console.log("ERROR:", e);
//       Alert.alert("Error", "Scan failed");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <ScrollView contentContainerStyle={styles.container}>
//       <Text style={styles.heading}>Scan Prescription</Text>
//       <Text style={styles.sub}>
//         Upload your doctor's handwritten prescription
//       </Text>

//       <TouchableOpacity
//         style={styles.btn}
//         onPress={() => {
//           console.log("Pressed UI");
//           handleScan();
//         }}
//         activeOpacity={0.8}
//       >
//         {loading ? (
//           <ActivityIndicator color="#fff" />
//         ) : (
//           <Text style={styles.btnText}>
//             📷 Pick & Scan Prescription
//           </Text>
//         )}
//       </TouchableOpacity>

//       {result && (
//         <View style={styles.card}>
//           <Text style={styles.cardTitle}>✅ Extracted Details</Text>

//           {Object.entries(result).map(([key, values]) => (
//             <View key={key} style={styles.section}>
//               <Text style={styles.sectionLabel}>
//                 {key === "Medicine" ? "💊" : "📋"} {key}
//               </Text>

//               {values && values.length > 0 ? (
//                 values.map((v, i) => (
//                   <Text key={i} style={styles.item}>
//                     • {v}
//                   </Text>
//                 ))
//               ) : (
//                 <Text style={styles.empty}>None detected</Text>
//               )}
//             </View>
//           ))}
//         </View>
//       )}
//     </ScrollView>
//   );
// }

// const styles = StyleSheet.create({
//   container: { padding: 24, backgroundColor: "#f8faff", flexGrow: 1 },
//   heading: {
//     fontSize: 26,
//     fontWeight: "700",
//     color: "#1e293b",
//     marginBottom: 6,
//   },
//   sub: { fontSize: 14, color: "#64748b", marginBottom: 32 },
//   btn: {
//     backgroundColor: "#2563EB",
//     paddingVertical: 15,
//     borderRadius: 14,
//     alignItems: "center",
//   },
//   btnText: { color: "#fff", fontSize: 16, fontWeight: "600" },
//   card: {
//     marginTop: 28,
//     backgroundColor: "#fff",
//     borderRadius: 16,
//     padding: 20,
//     borderWidth: 1,
//     borderColor: "#dbeafe",
//   },
//   cardTitle: {
//     fontSize: 16,
//     fontWeight: "700",
//     color: "#1e293b",
//     marginBottom: 16,
//   },
//   section: { marginBottom: 16 },
//   sectionLabel: {
//     fontSize: 14,
//     fontWeight: "600",
//     color: "#2563EB",
//     marginBottom: 6,
//   },
//   item: { fontSize: 14, color: "#334155", paddingVertical: 2 },
//   empty: { fontSize: 13, color: "#94a3b8", fontStyle: "italic" },
// });