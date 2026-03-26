import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as ImagePicker from 'expo-image-picker';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import type { ImagePickerAsset } from 'expo-image-picker';
import { isSupabaseConfigured, supabase } from '@/components/integrations/supabase/client';

type AnalyzerResponse = {
  Medicine?: string[];
  Dosage?: string[];
  Frequency?: string[];
  Duration?: string[];
  Advice?: string[];
  Name?: string[];
  error?: string;
};

type SupabaseScanMedicine = {
  name?: string;
  dosage?: string;
  frequency?: string;
  duration?: string;
  advisory?: string;
};

type SupabaseScanResponse = {
  medicines?: SupabaseScanMedicine[];
  generalAdvice?: string;
  error?: string;
};

function resolveApiBaseUrl() {
  const fromEnv = process.env.EXPO_PUBLIC_ANALYZER_API_URL || process.env.EXPO_PUBLIC_API_URL;
  if (fromEnv) {
    return fromEnv.replace(/\/$/, '');
  }

  // In Expo Go on a physical device, derive your laptop IP from hostUri.
  const hostUri = Constants.expoConfig?.hostUri;
  if (hostUri) {
    const host = hostUri.split(':')[0];
    if (host) {
      return `http://${host}:5000`;
    }
  }

  return Platform.OS === 'android' ? 'http://10.0.2.2:5000' : 'http://127.0.0.1:5000';
}

const API_BASE_URL = resolveApiBaseUrl();

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result;
      if (typeof result !== 'string') {
        reject(new Error('Failed to convert image to base64.'));
        return;
      }
      const base64 = result.split(',')[1] || '';
      resolve(base64);
    };
    reader.onerror = () => reject(new Error('Failed to read image data.'));
    reader.readAsDataURL(blob);
  });
}

function mapSupabaseResultToAnalyzerResponse(data: SupabaseScanResponse): AnalyzerResponse {
  const medicines = data.medicines || [];
  return {
    Medicine: medicines.map((m) => m.name || '').filter(Boolean),
    Dosage: medicines.map((m) => m.dosage || '').filter(Boolean),
    Frequency: medicines.map((m) => m.frequency || '').filter(Boolean),
    Duration: medicines.map((m) => m.duration || '').filter(Boolean),
    Advice: medicines.map((m) => m.advisory || '').filter(Boolean),
    Name: [],
  };
}

export default function PrescriptionsScreen() {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [selectedAsset, setSelectedAsset] = useState<ImagePickerAsset | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalyzerResponse | null>(null);

  const medicines = result?.Medicine ?? [];
  const dosages = result?.Dosage ?? [];
  const frequencies = result?.Frequency ?? [];
  const durations = result?.Duration ?? [];
  const advices = result?.Advice ?? [];
  const patientNames = result?.Name ?? [];

  const hasResult = useMemo(() => {
    return (
      medicines.length > 0 ||
      dosages.length > 0 ||
      frequencies.length > 0 ||
      durations.length > 0 ||
      advices.length > 0 ||
      patientNames.length > 0
    );
  }, [advices.length, dosages.length, durations.length, frequencies.length, medicines.length, patientNames.length]);

  const pickImage = async () => {
    setError(null);
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setError('Media permission is required to upload prescription.');
      return;
    }

    const picked = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 1,
      allowsEditing: true,
    });

    if (picked.canceled || !picked.assets.length) {
      return;
    }

    const asset = picked.assets[0];
    setSelectedAsset(asset);
    setImageUri(asset.uri);
    setResult(null);
  };

  const analyze = async () => {
    if (!imageUri || !selectedAsset) {
      setError('Please select a prescription image first.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setResult(null);

      const filename = selectedAsset.fileName || imageUri.split('/').pop() || 'prescription.jpg';
      const mimeType = selectedAsset.mimeType || 'image/jpeg';

      // Preferred path: Supabase edge function (Lovable gateway), no AWS required.
      if (isSupabaseConfigured) {
        const fileResponse = await fetch(imageUri);
        const blob = await fileResponse.blob();
        const imageBase64 = await blobToBase64(blob);

        const { data, error: functionError } = await supabase.functions.invoke('scan-prescription', {
          body: { imageBase64, mimeType },
        });

        const supabaseData = data as SupabaseScanResponse | null;
        if (functionError) {
          throw new Error(functionError.message || 'Supabase scan failed.');
        }

        if (!supabaseData) {
          throw new Error('Empty response from prescription scanner.');
        }

        if (supabaseData.error) {
          throw new Error(supabaseData.error);
        }

        setResult(mapSupabaseResultToAnalyzerResponse(supabaseData));
        return;
      }

      // Fallback path: local Flask analyzer API.
      const formData = new FormData();
      if (Platform.OS === 'web') {
        const webFileResponse = await fetch(imageUri);
        const blob = await webFileResponse.blob();
        formData.append('file', blob, filename);
      } else {
        formData.append('file', {
          uri: imageUri,
          name: filename,
          type: mimeType,
        } as any);
      }

      const response = await fetch(`${API_BASE_URL}/analyze-prescription`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
        },
        body: formData,
      });

      const json = (await response.json()) as AnalyzerResponse;
      if (!response.ok || json.error) {
        throw new Error(json.error || 'Failed to analyze prescription.');
      }

      setResult(json);
    } catch (e) {
      if (e instanceof TypeError) {
        setError(
          `Unable to reach analyzer at ${API_BASE_URL}. Ensure backend is running and reachable from this device.`
        );
      } else {
        setError(e instanceof Error ? e.message : 'Something went wrong while scanning.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <StatusBar style="dark" />
      <View style={styles.card}>
        <Text style={styles.title}>Prescription Analyzer</Text>
        <Text style={styles.subtitle}>
          Upload your prescription and extract medicines using your trained backend model.
        </Text>

        {!imageUri ? (
          <View style={styles.emptyStateCard}>
            <Text style={styles.emptyStateTitle}>No image selected</Text>
            <Text style={styles.emptyStateText}>Pick a clear prescription photo to begin analysis.</Text>
          </View>
        ) : null}

        <TouchableOpacity
          style={[styles.secondaryButton, imageUri ? styles.secondaryButtonCompact : null]}
          onPress={pickImage}
          activeOpacity={0.85}>
          <Text style={styles.secondaryButtonText}>
            {imageUri ? 'Change Prescription Image' : 'Choose Prescription Image'}
          </Text>
        </TouchableOpacity>

        {imageUri ? <Image source={{ uri: imageUri }} style={styles.preview} /> : null}

        {imageUri ? (
          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={analyze}
            disabled={loading}
            activeOpacity={0.85}>
            {loading ? (
              <View style={styles.loadingRow}>
                <ActivityIndicator color="#FFFFFF" size="small" />
                <Text style={styles.buttonText}>Analyzing...</Text>
              </View>
            ) : (
              <Text style={styles.buttonText}>Analyze Prescription</Text>
            )}
          </TouchableOpacity>
        ) : null}

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        {hasResult ? (
          <View style={styles.resultCard}>
            <Text style={styles.resultTitle}>Detected Details</Text>

            {patientNames.length > 0 ? (
              <Text style={styles.resultLine}>Patient: {patientNames.join(', ')}</Text>
            ) : null}

            {medicines.map((medicine, index) => (
              <View key={`${medicine}-${index}`} style={styles.medicineRow}>
                <Text style={styles.medicineName}>{index + 1}. {medicine}</Text>
                {dosages[index] ? <Text style={styles.metaText}>Dosage: {dosages[index]}</Text> : null}
                {frequencies[index] ? <Text style={styles.metaText}>Frequency: {frequencies[index]}</Text> : null}
                {durations[index] ? <Text style={styles.metaText}>Duration: {durations[index]}</Text> : null}
                {advices[index] ? <Text style={styles.metaText}>Advice: {advices[index]}</Text> : null}
              </View>
            ))}
          </View>
        ) : null}

        <Text style={styles.helperText}>
          API URL: {API_BASE_URL}
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F8FAFC',
  },
  content: {
    padding: 20,
    paddingTop: 60,
    paddingBottom: 100,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 21,
    marginBottom: 16,
  },
  emptyStateCard: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderStyle: 'dashed',
    borderRadius: 12,
    paddingVertical: 18,
    paddingHorizontal: 14,
    marginBottom: 12,
  },
  emptyStateTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 4,
  },
  emptyStateText: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 18,
  },
  secondaryButton: {
    backgroundColor: '#EEF2FF',
    borderWidth: 1,
    borderColor: '#C7D2FE',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 12,
  },
  secondaryButtonCompact: {
    marginTop: 2,
  },
  secondaryButtonText: {
    color: '#3730A3',
    fontSize: 15,
    fontWeight: '700',
  },
  preview: {
    width: '100%',
    height: 220,
    borderRadius: 12,
    marginBottom: 12,
    backgroundColor: '#E2E8F0',
  },
  button: {
    backgroundColor: '#2563EB',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 2,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  errorText: {
    marginTop: 12,
    color: '#DC2626',
    fontSize: 13,
    fontWeight: '600',
  },
  resultCard: {
    marginTop: 16,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 12,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 8,
  },
  resultLine: {
    fontSize: 14,
    color: '#334155',
    marginBottom: 8,
  },
  medicineRow: {
    marginBottom: 12,
  },
  medicineName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 4,
  },
  metaText: {
    fontSize: 13,
    color: '#475569',
    marginBottom: 2,
  },
  helperText: {
    marginTop: 14,
    color: '#64748B',
    fontSize: 12,
  },
});
