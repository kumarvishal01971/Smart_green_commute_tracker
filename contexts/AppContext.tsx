import AsyncStorage from "@react-native-async-storage/async-storage";
import createContextHook from "@nkzw/create-context-hook";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { User, CommuteLog, CommunityStats } from "@/types";

const STORAGE_KEYS = {
  USER: "ecopulse_user",
  COMMUTE_LOGS: "ecopulse_commute_logs",
  COMMUNITY_STATS: "ecopulse_community_stats",
  USER_SETTINGS: "ecopulse_user_settings",
};

export const [AppProvider, useApp] = createContextHook(() => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userSettings, setUserSettings] = useState<{ monthlyGoal: number }>({
    monthlyGoal: 10,
  });
  const queryClient = useQueryClient();

  // Load user from storage
  const userQuery = useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEYS.USER);
        return stored ? JSON.parse(stored) : null;
      } catch (error) {
        console.error("Error loading user:", error);
        return null;
      }
    },
  });

  // Load commute logs
  const commuteLogsQuery = useQuery({
    queryKey: ["commuteLogs"],
    queryFn: async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEYS.COMMUTE_LOGS);
        return stored ? JSON.parse(stored) : [];
      } catch (error) {
        console.error("Error loading commute logs:", error);
        return [];
      }
    },
  });

  // Load user settings
  const userSettingsQuery = useQuery({
    queryKey: ["userSettings"],
    queryFn: async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEYS.USER_SETTINGS);
        return stored ? JSON.parse(stored) : { monthlyGoal: 10 };
      } catch (error) {
        console.error("Error loading user settings:", error);
        return { monthlyGoal: 10 };
      }
    },
  });

  // Load community stats
  const communityStatsQuery = useQuery({
    queryKey: ["communityStats"],
    queryFn: async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEYS.COMMUNITY_STATS);
        if (stored) {
          return JSON.parse(stored);
        }
        // Default stats
        return {
          totalUsers: 1,
          totalCO2Saved: 0,
          totalCO2SavedThisWeek: 0,
          mostPopularMode: "walking",
          totalCommutes: 0,
        };
      } catch (error) {
        console.error("Error loading community stats:", error);
        return {
          totalUsers: 1,
          totalCO2Saved: 0,
          totalCO2SavedThisWeek: 0,
          mostPopularMode: "walking",
          totalCommutes: 0,
        };
      }
    },
  });

  // Register user mutation
  const registerMutation = useMutation({
    mutationFn: async (userData: Omit<User, "id" | "createdAt">) => {
      const newUser: User = {
        ...userData,
        id: Date.now().toString(),
        createdAt: new Date(),
      };

      await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(newUser));

      // Update community stats
      const currentStats = communityStatsQuery.data || {
        totalUsers: 0,
        totalCO2Saved: 0,
        totalCO2SavedThisWeek: 0,
        mostPopularMode: "walking",
        totalCommutes: 0,
      };

      const updatedStats = {
        ...currentStats,
        totalUsers: currentStats.totalUsers + 1,
      };

      await AsyncStorage.setItem(
        STORAGE_KEYS.COMMUNITY_STATS,
        JSON.stringify(updatedStats),
      );

      return newUser;
    },
    onSuccess: (newUser) => {
      setUser(newUser);
      queryClient.invalidateQueries({ queryKey: ["user"] });
      queryClient.invalidateQueries({ queryKey: ["communityStats"] });
    },
  });

  // Add commute log mutation
  const addCommuteLogMutation = useMutation({
    mutationFn: async (
      logData: Omit<CommuteLog, "id" | "userId" | "createdAt">,
    ) => {
      if (!user) throw new Error("User not found");

      const newLog: CommuteLog = {
        ...logData,
        id: Date.now().toString(),
        userId: user.id,
        createdAt: new Date(),
      };

      const currentLogs = commuteLogsQuery.data || [];
      const updatedLogs = [...currentLogs, newLog];

      await AsyncStorage.setItem(
        STORAGE_KEYS.COMMUTE_LOGS,
        JSON.stringify(updatedLogs),
      );

      // Update community stats
      const currentStats = communityStatsQuery.data || {
        totalUsers: 1,
        totalCO2Saved: 0,
        totalCO2SavedThisWeek: 0,
        mostPopularMode: "walking",
        totalCommutes: 0,
      };

      const isThisWeek =
        new Date(newLog.createdAt).getTime() >
        Date.now() - 7 * 24 * 60 * 60 * 1000;

      const updatedStats: CommunityStats = {
        ...currentStats,
        totalCO2Saved: currentStats.totalCO2Saved + newLog.co2Saved,
        totalCO2SavedThisWeek:
          currentStats.totalCO2SavedThisWeek +
          (isThisWeek ? newLog.co2Saved : 0),
        totalCommutes: currentStats.totalCommutes + 1,
        mostPopularMode: newLog.modes[0] || currentStats.mostPopularMode,
      };

      await AsyncStorage.setItem(
        STORAGE_KEYS.COMMUNITY_STATS,
        JSON.stringify(updatedStats),
      );

      return newLog;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["commuteLogs"] });
      queryClient.invalidateQueries({ queryKey: ["communityStats"] });
    },
  });

  // Update user settings mutation
  const updateSettingsMutation = useMutation({
    mutationFn: async (settings: { monthlyGoal: number }) => {
      await AsyncStorage.setItem(
        STORAGE_KEYS.USER_SETTINGS,
        JSON.stringify(settings),
      );
      return settings;
    },
    onSuccess: (settings) => {
      setUserSettings(settings);
      queryClient.invalidateQueries({ queryKey: ["userSettings"] });
    },
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      await AsyncStorage.removeItem(STORAGE_KEYS.USER);
    },
    onSuccess: () => {
      setUser(null);
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
  });

  useEffect(() => {
    if (userQuery.data !== undefined) {
      setUser(userQuery.data);
      setIsLoading(false);
    }
  }, [userQuery.data]);

  useEffect(() => {
    if (userSettingsQuery.data) {
      setUserSettings(userSettingsQuery.data);
    }
  }, [userSettingsQuery.data]);

  return {
    user,
    userSettings,
    isLoading: isLoading || userQuery.isLoading,
    commuteLogs: commuteLogsQuery.data || [],
    communityStats: communityStatsQuery.data,
    register: registerMutation.mutate,
    addCommuteLog: addCommuteLogMutation.mutate,
    updateSettings: updateSettingsMutation.mutate,
    logout: logoutMutation.mutate,
    isRegistering: registerMutation.isPending,
    isAddingLog: addCommuteLogMutation.isPending,
  };
});
