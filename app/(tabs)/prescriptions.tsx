import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import {
  Pill,
  Clock,
  Calendar,
  User,
  AlertCircle,
  ChevronRight,
} from 'lucide-react-native';
import { mockPrescriptions } from '@/constants/mockData';
import { useState } from 'react';

export default function PrescriptionsScreen() {
  const [selectedPrescription, setSelectedPrescription] = useState(
    mockPrescriptions[0]
  );

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Prescriptions</Text>
        <Text style={styles.headerSubtitle}>
          AI-translated medication details
        </Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <View style={styles.prescriptionSelector}>
          {mockPrescriptions.map((prescription) => (
            <TouchableOpacity
              key={prescription.id}
              style={[
                styles.selectorButton,
                selectedPrescription.id === prescription.id &&
                  styles.selectorButtonActive,
              ]}
              onPress={() => setSelectedPrescription(prescription)}>
              <Text
                style={[
                  styles.selectorText,
                  selectedPrescription.id === prescription.id &&
                    styles.selectorTextActive,
                ]}>
                {prescription.medicineName}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.translationBadge}>
          <View style={styles.aiDot} />
          <Text style={styles.translationText}>AI Translation Complete</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.iconCircle}>
              <Pill size={24} color="#2563EB" />
            </View>
            <View style={styles.cardHeaderText}>
              <Text style={styles.medicineName}>
                {selectedPrescription.medicineName}
              </Text>
              <Text style={styles.purpose}>{selectedPrescription.purpose}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.detailSection}>
            <Text style={styles.detailLabel}>Dosage</Text>
            <Text style={styles.detailValue}>
              {selectedPrescription.dosage}
            </Text>
          </View>

          <View style={styles.detailSection}>
            <Text style={styles.detailLabel}>Frequency</Text>
            <Text style={styles.detailValue}>
              {selectedPrescription.frequency}
            </Text>
          </View>

          <View style={styles.detailSection}>
            <View style={styles.detailRow}>
              <Clock size={18} color="#64748B" />
              <Text style={styles.detailLabel}>When to take</Text>
            </View>
            <Text style={styles.detailValue}>
              {selectedPrescription.timing}
            </Text>
            <Text style={styles.detailSubtext}>
              {selectedPrescription.mealTiming}
            </Text>
          </View>

          <View style={styles.detailSection}>
            <View style={styles.detailRow}>
              <Calendar size={18} color="#64748B" />
              <Text style={styles.detailLabel}>Duration</Text>
            </View>
            <Text style={styles.detailValue}>
              {selectedPrescription.duration}
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.detailSection}>
            <View style={styles.detailRow}>
              <User size={18} color="#64748B" />
              <Text style={styles.detailLabel}>Prescribed by</Text>
            </View>
            <Text style={styles.detailValue}>
              {selectedPrescription.prescribedBy}
            </Text>
            <Text style={styles.detailSubtext}>
              {new Date(selectedPrescription.prescribedDate).toLocaleDateString(
                'en-US',
                { year: 'numeric', month: 'long', day: 'numeric' }
              )}
            </Text>
          </View>
        </View>

        <View style={styles.warningsCard}>
          <View style={styles.warningsHeader}>
            <AlertCircle size={20} color="#DC2626" />
            <Text style={styles.warningsTitle}>Important Warnings</Text>
          </View>
          {selectedPrescription.warnings.map((warning, index) => (
            <View key={index} style={styles.warningItem}>
              <View style={styles.warningBullet} />
              <Text style={styles.warningText}>{warning}</Text>
            </View>
          ))}
        </View>

        <TouchableOpacity style={styles.viewOriginalButton}>
          <Text style={styles.viewOriginalText}>View Original Prescription</Text>
          <ChevronRight size={20} color="#2563EB" />
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#64748B',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  prescriptionSelector: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  selectorButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#E2E8F0',
  },
  selectorButtonActive: {
    backgroundColor: '#EFF6FF',
    borderColor: '#2563EB',
  },
  selectorText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
    textAlign: 'center',
  },
  selectorTextActive: {
    color: '#2563EB',
  },
  translationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginBottom: 20,
  },
  aiDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
    marginRight: 8,
  },
  translationText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#059669',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  cardHeaderText: {
    flex: 1,
  },
  medicineName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 4,
  },
  purpose: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
  },
  divider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 20,
  },
  detailSection: {
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 6,
  },
  detailValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
  },
  detailSubtext: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 4,
  },
  warningsCard: {
    backgroundColor: '#FEF2F2',
    borderRadius: 16,
    padding: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#DC2626',
    marginBottom: 16,
  },
  warningsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  warningsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#991B1B',
  },
  warningItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  warningBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#DC2626',
    marginTop: 7,
    marginRight: 12,
  },
  warningText: {
    flex: 1,
    fontSize: 15,
    color: '#7F1D1D',
    lineHeight: 22,
  },
  viewOriginalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#2563EB',
    gap: 8,
  },
  viewOriginalText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2563EB',
  },
});
