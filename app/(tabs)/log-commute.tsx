
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function LogCommuteScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Log Your Commute</Text>
      <Text>Track your daily sustainable travel here</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#e0f7e9',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2d5a41',
    marginBottom: 10,
  },
});
