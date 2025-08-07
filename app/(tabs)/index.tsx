
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>EcoPulse</Text>
      <Text style={styles.subtitle}>Smart Green Commute Tracker</Text>
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
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2d5a41',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#5a8a6b',
  },
});
