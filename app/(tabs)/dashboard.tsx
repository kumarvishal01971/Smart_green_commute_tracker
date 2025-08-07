import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
} from "react-native";
import {
  Leaf,
  Users,
  TrendingUp,
  Calendar,
  Award,
  Settings,
  X,
} from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useApp } from "@/contexts/AppContext";
import { COMMUTE_MODES } from "@/constants/commute";
import Colors from "@/constants/colors";

export default function DashboardScreen() {
  const { user, userSettings, communityStats, commuteLogs, updateSettings } =
    useApp();
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [goalInput, setGoalInput] = useState(
    userSettings.monthlyGoal.toString(),
  );

  const userLogs = commuteLogs.filter((log) => log.userId === user?.id);
  const userTotalCO2 = userLogs.reduce((sum, log) => sum + log.co2Saved, 0);

  const thisWeekLogs = userLogs.filter((log) => {
    const logDate = new Date(log.createdAt);
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    return logDate > weekAgo;
  });
  const thisWeekCO2 = thisWeekLogs.reduce((sum, log) => sum + log.co2Saved, 0);

  const thisMonthLogs = userLogs.filter((log) => {
    const logDate = new Date(log.createdAt);
    const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    return logDate > monthAgo;
  });
  const thisMonthCO2 = thisMonthLogs.reduce(
    (sum, log) => sum + log.co2Saved,
    0,
  );

  // Calculate most used mode
  const modeUsage = userLogs.reduce(
    (acc, log) => {
      log.modes.forEach((mode) => {
        acc[mode] = (acc[mode] || 0) + 1;
      });
      return acc;
    },
    {} as Record<string, number>,
  );

  const mostUsedModeId = Object.entries(modeUsage).sort(
    ([, a], [, b]) => b - a,
  )[0]?.[0];
  const mostUsedMode = COMMUTE_MODES.find((mode) => mode.id === mostUsedModeId);

  // Calculate streak
  const sortedLogs = userLogs.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );

  let currentStreak = 0;
  let currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);

  for (const log of sortedLogs) {
    const logDate = new Date(log.date);
    logDate.setHours(0, 0, 0, 0);

    const daysDiff = Math.floor(
      (currentDate.getTime() - logDate.getTime()) / (1000 * 60 * 60 * 24),
    );

    if (daysDiff === currentStreak) {
      currentStreak++;
    } else if (daysDiff === currentStreak + 1) {
      currentStreak++;
    } else {
      break;
    }
  }

  return (
    <ScrollView style={styles.container}>
      <LinearGradient
        colors={[Colors.light.primary, Colors.light.secondary]}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Your Green Impact</Text>
        <Text style={styles.headerSubtitle}>
          Making a difference, one trip at a time
        </Text>
      </LinearGradient>

      <View style={styles.statsSection}>
        <Text style={styles.sectionTitle}>Personal Stats</Text>

        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Leaf size={32} color={Colors.light.primary} />
            <Text style={styles.statValue}>{userTotalCO2.toFixed(1)} kg</Text>
            <Text style={styles.statLabel}>Total CO₂ Saved</Text>
          </View>

          <View style={styles.statCard}>
            <Calendar size={32} color={Colors.light.primary} />
            <Text style={styles.statValue}>{userLogs.length}</Text>
            <Text style={styles.statLabel}>Total Trips</Text>
          </View>
        </View>

        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <TrendingUp size={32} color={Colors.light.primary} />
            <Text style={styles.statValue}>{thisWeekCO2.toFixed(1)} kg</Text>
            <Text style={styles.statLabel}>This Week</Text>
          </View>

          <View style={styles.statCard}>
            <Award size={32} color={Colors.light.primary} />
            <Text style={styles.statValue}>{currentStreak}</Text>
            <Text style={styles.statLabel}>Day Streak</Text>
          </View>
        </View>
      </View>

      <View style={styles.insightsSection}>
        <Text style={styles.sectionTitle}>Your Insights</Text>

        <View style={styles.insightCard}>
          <Text style={styles.insightTitle}>Favorite Green Mode</Text>
          <View style={styles.insightContent}>
            <Text style={styles.insightIcon}>{mostUsedMode?.icon || "🚶"}</Text>
            <Text style={styles.insightText}>
              {mostUsedMode?.label ||
                "Start logging to see your favorite mode!"}
            </Text>
          </View>
        </View>

        <View style={styles.insightCard}>
          <View style={styles.insightHeader}>
            <Text style={styles.insightTitle}>Monthly Progress</Text>
            <TouchableOpacity
              style={styles.settingsButton}
              onPress={() => {
                setGoalInput(userSettings.monthlyGoal.toString());
                setShowGoalModal(true);
              }}
            >
              <Settings size={16} color={Colors.light.primary} />
            </TouchableOpacity>
          </View>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${Math.min((thisMonthCO2 / userSettings.monthlyGoal) * 100, 100)}%`,
                },
              ]}
            />
          </View>
          <Text style={styles.progressText}>
            {thisMonthCO2.toFixed(1)} / {userSettings.monthlyGoal} kg CO₂ saved
            this month
          </Text>
        </View>

        <View style={styles.insightCard}>
          <Text style={styles.insightTitle}>Environmental Impact</Text>
          <Text style={styles.impactText}>
            🌱 You&apos;ve saved the equivalent of{" "}
            {Math.floor(userTotalCO2 * 2.5)} trees worth of CO₂!
          </Text>
          <Text style={styles.impactText}>
            ⚡ That&apos;s like taking a car off the road for{" "}
            {Math.floor(userTotalCO2 / 0.171)} km!
          </Text>
        </View>
      </View>

      <View style={styles.communitySection}>
        <Text style={styles.sectionTitle}>Community Impact</Text>

        <View style={styles.communityCard}>
          <LinearGradient
            colors={[Colors.light.accent, Colors.light.primary]}
            style={styles.communityGradient}
          >
            <View style={styles.communityStats}>
              <View style={styles.communityStat}>
                <Users size={24} color={Colors.light.card} />
                <Text style={styles.communityValue}>
                  {communityStats?.totalUsers || 0}
                </Text>
                <Text style={styles.communityLabel}>Green Heroes</Text>
              </View>

              <View style={styles.communityStat}>
                <Leaf size={24} color={Colors.light.card} />
                <Text style={styles.communityValue}>
                  {(communityStats?.totalCO2Saved || 0).toFixed(1)} kg
                </Text>
                <Text style={styles.communityLabel}>CO₂ Saved Together</Text>
              </View>
            </View>
          </LinearGradient>
        </View>

        <View style={styles.achievementCard}>
          <Text style={styles.achievementTitle}>🏆 Community Achievement</Text>
          <Text style={styles.achievementText}>
            Together we&apos;ve saved{" "}
            {(communityStats?.totalCO2Saved || 0).toFixed(1)} kg of CO₂!
          </Text>
          <Text style={styles.achievementSubtext}>
            That&apos;s equivalent to planting{" "}
            {Math.floor((communityStats?.totalCO2Saved || 0) * 2.5)} trees! 🌳
          </Text>
        </View>
      </View>

      {/* Goal Setting Modal */}
      <Modal
        visible={showGoalModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowGoalModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Set Monthly Goal</Text>
              <TouchableOpacity
                onPress={() => setShowGoalModal(false)}
                style={styles.closeButton}
              >
                <X size={24} color={Colors.light.text} />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalDescription}>
              Set your monthly CO₂ saving goal to track your progress
            </Text>

            <View style={styles.inputContainer}>
              <TextInput
                style={styles.goalInput}
                value={goalInput}
                onChangeText={setGoalInput}
                keyboardType="numeric"
                placeholder="Enter goal in kg"
                placeholderTextColor={Colors.light.muted}
              />
              <Text style={styles.inputSuffix}>kg CO₂</Text>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowGoalModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.saveButton}
                onPress={() => {
                  const goal = parseFloat(goalInput);
                  if (isNaN(goal) || goal <= 0) {
                    Alert.alert(
                      "Invalid Goal",
                      "Please enter a valid positive number",
                    );
                    return;
                  }
                  updateSettings({ monthlyGoal: goal });
                  setShowGoalModal(false);
                }}
              >
                <Text style={styles.saveButtonText}>Save Goal</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  header: {
    paddingVertical: 40,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold" as const,
    color: Colors.light.card,
  },
  headerSubtitle: {
    fontSize: 16,
    color: Colors.light.card,
    opacity: 0.9,
    marginTop: 4,
  },
  statsSection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold" as const,
    color: Colors.light.text,
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.light.card,
    padding: 20,
    borderRadius: 12,
    alignItems: "center",
    marginHorizontal: 8,
    shadowColor: Colors.light.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold" as const,
    color: Colors.light.text,
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.light.muted,
    textAlign: "center",
    marginTop: 4,
  },
  insightsSection: {
    padding: 20,
  },
  insightCard: {
    backgroundColor: Colors.light.card,
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: Colors.light.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  insightTitle: {
    fontSize: 16,
    fontWeight: "bold" as const,
    color: Colors.light.text,
    marginBottom: 12,
  },
  insightContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  insightIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  insightText: {
    flex: 1,
    fontSize: 16,
    color: Colors.light.text,
  },
  progressBar: {
    height: 8,
    backgroundColor: Colors.light.border,
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 8,
  },
  progressFill: {
    height: "100%",
    backgroundColor: Colors.light.primary,
  },
  progressText: {
    fontSize: 14,
    color: Colors.light.muted,
  },
  impactText: {
    fontSize: 16,
    color: Colors.light.text,
    marginBottom: 8,
    lineHeight: 24,
  },
  communitySection: {
    padding: 20,
  },
  communityCard: {
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 16,
    shadowColor: Colors.light.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  communityGradient: {
    padding: 20,
  },
  communityStats: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  communityStat: {
    alignItems: "center",
  },
  communityValue: {
    fontSize: 20,
    fontWeight: "bold" as const,
    color: Colors.light.card,
    marginTop: 8,
  },
  communityLabel: {
    fontSize: 12,
    color: Colors.light.card,
    textAlign: "center",
    marginTop: 4,
    opacity: 0.9,
  },
  achievementCard: {
    backgroundColor: Colors.light.card,
    padding: 20,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.light.warning,
    shadowColor: Colors.light.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  achievementTitle: {
    fontSize: 18,
    fontWeight: "bold" as const,
    color: Colors.light.text,
    marginBottom: 8,
  },
  achievementText: {
    fontSize: 16,
    color: Colors.light.text,
    marginBottom: 8,
    lineHeight: 24,
  },
  achievementSubtext: {
    fontSize: 14,
    color: Colors.light.muted,
    lineHeight: 20,
  },
  insightHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  settingsButton: {
    padding: 4,
    borderRadius: 6,
    backgroundColor: Colors.light.background,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: Colors.light.card,
    borderRadius: 16,
    padding: 24,
    width: "100%",
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold" as const,
    color: Colors.light.text,
  },
  closeButton: {
    padding: 4,
  },
  modalDescription: {
    fontSize: 16,
    color: Colors.light.muted,
    marginBottom: 20,
    lineHeight: 22,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 24,
  },
  goalInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.light.text,
    paddingVertical: 12,
  },
  inputSuffix: {
    fontSize: 16,
    color: Colors.light.muted,
    marginLeft: 8,
  },
  modalButtons: {
    flexDirection: "row",
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.light.border,
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.light.text,
  },
  saveButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: Colors.light.primary,
    alignItems: "center",
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.light.card,
  },
});
