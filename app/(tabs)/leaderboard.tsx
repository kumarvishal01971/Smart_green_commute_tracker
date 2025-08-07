import React, { useState, useMemo } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import {
  Trophy,
  Medal,
  Award,
  Calendar,
  Clock,
  TrendingUp,
} from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useApp } from "@/contexts/AppContext";
import { LeaderboardEntry, CommuteLog } from "@/types";
import Colors from "@/constants/colors";

type TimeFilter = "all-time" | "this-week" | "today";

export default function LeaderboardScreen() {
  const { user, commuteLogs } = useApp();
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("all-time");

  const leaderboardData = useMemo(() => {
    const now = new Date();
    const todayStart = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    );
    const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const filteredLogs = commuteLogs.filter((log: CommuteLog) => {
      const logDate = new Date(log.createdAt);
      switch (timeFilter) {
        case "today":
          return logDate >= todayStart;
        case "this-week":
          return logDate >= weekStart;
        default:
          return true;
      }
    });

    const userStats = filteredLogs.reduce(
      (
        acc: Record<
          string,
          { userId: string; totalCO2Saved: number; tripCount: number }
        >,
        log: CommuteLog,
      ) => {
        if (!acc[log.userId]) {
          acc[log.userId] = {
            userId: log.userId,
            totalCO2Saved: 0,
            tripCount: 0,
          };
        }
        acc[log.userId].totalCO2Saved += log.co2Saved;
        acc[log.userId].tripCount += 1;
        return acc;
      },
      {} as Record<
        string,
        { userId: string; totalCO2Saved: number; tripCount: number }
      >,
    );

    const userStatsArray: {
      userId: string;
      totalCO2Saved: number;
      tripCount: number;
    }[] = Object.values(userStats);

    const entries: LeaderboardEntry[] = userStatsArray
      .sort((a, b) => b.totalCO2Saved - a.totalCO2Saved)
      .slice(0, 50)
      .map((stat, index) => ({
        userId: stat.userId,
        userName:
          stat.userId === user?.id
            ? user?.name || "You"
            : `Green Champion ${stat.userId.slice(-4)}`,
        totalCO2Saved: stat.totalCO2Saved,
        rank: index + 1,
        isAnonymous: false, // Show all names now
      }));

    return entries;
  }, [commuteLogs, timeFilter, user]);

  const userRank = leaderboardData.find((entry) => entry.userId === user?.id);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy size={24} color="#FFD700" />;
      case 2:
        return <Medal size={24} color="#C0C0C0" />;
      case 3:
        return <Award size={24} color="#CD7F32" />;
      default:
        return <Text style={styles.rankNumber}>{rank}</Text>;
    }
  };

  const getRankStyle = (rank: number) => {
    switch (rank) {
      case 1:
        return styles.firstPlace;
      case 2:
        return styles.secondPlace;
      case 3:
        return styles.thirdPlace;
      default:
        return styles.regularPlace;
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <LinearGradient
        colors={[Colors.light.primary, Colors.light.secondary]}
        style={styles.header}
      >
        <Trophy size={48} color={Colors.light.card} />
        <Text style={styles.headerTitle}>Green Champions</Text>
        <Text style={styles.headerSubtitle}>
          Leading the way to a greener future
        </Text>
      </LinearGradient>

      {/* Filter Section */}
      <View style={styles.filterSection}>
        <Text style={styles.filterTitle}>Time Period</Text>
        <View style={styles.filterButtons}>
          {[
            { key: "today" as TimeFilter, label: "Today", icon: Clock },
            {
              key: "this-week" as TimeFilter,
              label: "This Week",
              icon: Calendar,
            },
            {
              key: "all-time" as TimeFilter,
              label: "All Time",
              icon: TrendingUp,
            },
          ].map(({ key, label, icon: Icon }) => (
            <TouchableOpacity
              key={key}
              style={[
                styles.filterButton,
                timeFilter === key && styles.filterButtonActive,
              ]}
              onPress={() => setTimeFilter(key)}
            >
              <Icon
                size={16}
                color={
                  timeFilter === key ? Colors.light.card : Colors.light.primary
                }
              />
              <Text
                style={[
                  styles.filterButtonText,
                  timeFilter === key && styles.filterButtonTextActive,
                ]}
              >
                {label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* User Rank Section */}
      {userRank && (
        <View style={styles.userRankSection}>
          <Text style={styles.userRankTitle}>Your Ranking</Text>
          <View style={[styles.userRankCard, getRankStyle(userRank.rank)]}>
            <View style={styles.userRankInfo}>
              {getRankIcon(userRank.rank)}
              <View style={styles.userRankDetails}>
                <Text style={styles.userRankPosition}>#{userRank.rank}</Text>
                <Text style={styles.userRankCO2}>
                  {userRank.totalCO2Saved.toFixed(1)} kg CO₂
                </Text>
              </View>
            </View>
          </View>
        </View>
      )}

      {/* Leaderboard Section */}
      <View style={styles.leaderboardSection}>
        <Text style={styles.leaderboardTitle}>Top Green Heroes</Text>
        {leaderboardData.map((item, index) => (
          <View
            key={item.userId}
            style={[styles.leaderboardItem, getRankStyle(item.rank)]}
          >
            <View style={styles.rankContainer}>{getRankIcon(item.rank)}</View>

            <View style={styles.userInfo}>
              <Text
                style={[
                  styles.userName,
                  item.userId === user?.id && styles.currentUser,
                ]}
              >
                {item.userName}
                {item.userId === user?.id && " (You)"}
              </Text>
              <Text style={styles.userStats}>
                {item.totalCO2Saved.toFixed(1)} kg CO₂ saved
              </Text>
            </View>

            {item.rank <= 3 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>🌟</Text>
              </View>
            )}
          </View>
        ))}
      </View>

      {leaderboardData.length === 0 && (
        <View style={styles.emptyState}>
          <Trophy size={64} color={Colors.light.muted} />
          <Text style={styles.emptyTitle}>No Data Yet</Text>
          <Text style={styles.emptySubtitle}>
            Start logging your commutes to see the leaderboard!
          </Text>
        </View>
      )}

      {/* Bottom padding for better scrolling */}
      <View style={styles.bottomPadding} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },

  bottomPadding: {
    height: 40,
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
    marginTop: 12,
  },
  headerSubtitle: {
    fontSize: 16,
    color: Colors.light.card,
    opacity: 0.9,
    marginTop: 4,
  },
  filterSection: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: "bold" as const,
    color: Colors.light.text,
    marginBottom: 12,
  },
  filterButtons: {
    flexDirection: "row",
    gap: 8,
  },
  filterButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: Colors.light.card,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  filterButtonActive: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.light.primary,
    marginLeft: 6,
  },
  filterButtonTextActive: {
    color: Colors.light.card,
  },
  userRankSection: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  userRankTitle: {
    fontSize: 16,
    fontWeight: "bold" as const,
    color: Colors.light.text,
    marginBottom: 12,
  },
  userRankCard: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: Colors.light.card,
  },
  userRankInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  userRankDetails: {
    marginLeft: 16,
  },
  userRankPosition: {
    fontSize: 20,
    fontWeight: "bold" as const,
    color: Colors.light.text,
  },
  userRankCO2: {
    fontSize: 14,
    color: Colors.light.muted,
    marginTop: 2,
  },
  leaderboardSection: {
    padding: 20,
  },
  leaderboardTitle: {
    fontSize: 18,
    fontWeight: "bold" as const,
    color: Colors.light.text,
    marginBottom: 16,
  },

  leaderboardItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    marginBottom: 8,
    borderRadius: 12,
    backgroundColor: Colors.light.card,
  },
  firstPlace: {
    backgroundColor: "#FFF9E6",
    borderWidth: 2,
    borderColor: "#FFD700",
  },
  secondPlace: {
    backgroundColor: "#F5F5F5",
    borderWidth: 2,
    borderColor: "#C0C0C0",
  },
  thirdPlace: {
    backgroundColor: "#FFF5E6",
    borderWidth: 2,
    borderColor: "#CD7F32",
  },
  regularPlace: {
    backgroundColor: Colors.light.card,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  rankContainer: {
    width: 40,
    alignItems: "center",
  },
  rankNumber: {
    fontSize: 18,
    fontWeight: "bold" as const,
    color: Colors.light.text,
  },
  userInfo: {
    flex: 1,
    marginLeft: 16,
  },
  userName: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.light.text,
  },
  currentUser: {
    color: Colors.light.primary,
    fontWeight: "bold" as const,
  },
  userStats: {
    fontSize: 14,
    color: Colors.light.muted,
    marginTop: 2,
  },
  badge: {
    marginLeft: 8,
  },
  badgeText: {
    fontSize: 20,
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "bold" as const,
    color: Colors.light.text,
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 16,
    color: Colors.light.muted,
    textAlign: "center",
    marginTop: 8,
    lineHeight: 24,
  },
});
