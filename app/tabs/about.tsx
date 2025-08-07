
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function AboutScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>About EcoPulse</Text>
      <Text>Learn more about sustainable commuting</Text>
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
