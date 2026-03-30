import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Sunrise, Sun, Moon, Info, Heart } from 'lucide-react-native';
import { mockMeals } from '@/constants/mockData';

export default function MealsScreen() {
  const getMealIcon = (mealType: string) => {
    switch (mealType) {
      case 'breakfast':
        return <Sunrise size={20} color="#F59E0B" />;
      case 'lunch':
        return <Sun size={20} color="#EF4444" />;
      case 'dinner':
        return <Moon size={20} color="#6366F1" />;
      default:
        return null;
    }
  };

  const getMealTime = (mealType: string) => {
    switch (mealType) {
      case 'breakfast':
        return '7:00 - 9:00 AM';
      case 'lunch':
        return '12:00 - 2:00 PM';
      case 'dinner':
        return '6:00 - 8:00 PM';
      default:
        return '';
    }
  };

  const renderMealCard = (mealType: string, meal: any) => {
    const mealTypeCapitalized =
      mealType.charAt(0).toUpperCase() + mealType.slice(1);

    return (
      <View key={mealType} style={styles.mealCard}>
        <Image source={{ uri: meal.imageUrl }} style={styles.mealImage} />
        <View style={styles.mealContent}>
          <View style={styles.mealHeader}>
            <View style={styles.mealTypeContainer}>
              {getMealIcon(mealType)}
              <Text style={styles.mealType}>{mealTypeCapitalized}</Text>
            </View>
            <Text style={styles.mealTime}>{getMealTime(mealType)}</Text>
          </View>

          <Text style={styles.mealTitle}>{meal.title}</Text>

          <View style={styles.caloriesContainer}>
            <Text style={styles.caloriesText}>{meal.calories} cal</Text>
          </View>

          <View style={styles.reasonContainer}>
            <View style={styles.reasonIcon}>
              <Heart size={16} color="#10B981" />
            </View>
            <Text style={styles.reasonText}>{meal.reason}</Text>
          </View>

          <View style={styles.ingredientsContainer}>
            <Text style={styles.ingredientsTitle}>Key Ingredients:</Text>
            <View style={styles.ingredientsList}>
              {meal.ingredients.map((ingredient: string, index: number) => (
                <View key={index} style={styles.ingredientTag}>
                  <Text style={styles.ingredientText}>{ingredient}</Text>
                </View>
              ))}
            </View>
          </View>

          <TouchableOpacity style={styles.viewRecipeButton}>
            <Text style={styles.viewRecipeText}>View Full Recipe</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Meal Planner</Text>
          <Text style={styles.headerSubtitle}>
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
            })}
          </Text>
        </View>
      </View>

      <View style={styles.infoBar}>
        <Info size={16} color="#2563EB" />
        <Text style={styles.infoText}>
          Personalized meals based on your health profile
        </Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {Object.entries(mockMeals).map(([mealType, meal]) =>
          renderMealCard(mealType, meal)
        )}

        <View style={styles.dailySummary}>
          <Text style={styles.summaryTitle}>Daily Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Calories</Text>
            <Text style={styles.summaryValue}>
              {mockMeals.breakfast.calories +
                mockMeals.lunch.calories +
                mockMeals.dinner.calories}{' '}
              cal
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Nutritional Balance</Text>
            <View style={styles.balanceBadge}>
              <Text style={styles.balanceText}>Excellent</Text>
            </View>
          </View>
        </View>
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
    paddingBottom: 16,
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
  infoBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#EFF6FF',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#DBEAFE',
  },
  infoText: {
    fontSize: 14,
    color: '#1E40AF',
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  mealCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    marginBottom: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  mealImage: {
    width: '100%',
    height: 200,
    backgroundColor: '#E2E8F0',
  },
  mealContent: {
    padding: 20,
  },
  mealHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  mealTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  mealType: {
    fontSize: 14,
    fontWeight: '700',
    color: '#475569',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  mealTime: {
    fontSize: 13,
    color: '#94A3B8',
    fontWeight: '500',
  },
  mealTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 12,
  },
  caloriesContainer: {
    backgroundColor: '#F1F5F9',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  caloriesText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
  },
  reasonContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#ECFDF5',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    gap: 10,
  },
  reasonIcon: {
    marginTop: 2,
  },
  reasonText: {
    flex: 1,
    fontSize: 14,
    color: '#065F46',
    lineHeight: 20,
    fontWeight: '500',
  },
  ingredientsContainer: {
    marginBottom: 16,
  },
  ingredientsTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#475569',
    marginBottom: 8,
  },
  ingredientsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  ingredientTag: {
    backgroundColor: '#F1F5F9',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  ingredientText: {
    fontSize: 13,
    color: '#475569',
    fontWeight: '500',
  },
  viewRecipeButton: {
    backgroundColor: '#2563EB',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  viewRecipeText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  dailySummary: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginTop: 8,
    borderWidth: 2,
    borderColor: '#E2E8F0',
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 15,
    color: '#64748B',
  },
  summaryValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E293B',
  },
  balanceBadge: {
    backgroundColor: '#ECFDF5',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  balanceText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#059669',
  },
});
