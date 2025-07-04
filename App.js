// App.js
import React from 'react';
import { SafeAreaView } from 'react-native';
import Navigation from './components/Navigation';

export default function App() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Navigation />
    </SafeAreaView>
  );
}
