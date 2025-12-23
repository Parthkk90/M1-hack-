import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Title, List, Switch, Button } from 'react-native-paper';
import BottomTabNavigator from '../navigation/BottomTabNavigator';

function SettingsScreen() {
  const [notif, setNotif] = React.useState(true);
  const [expert, setExpert] = React.useState(false);
  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16 }}>
      <Title style={styles.title}>Settings</Title>
      <List.Section>
        <List.Subheader>Account</List.Subheader>
        <List.Item title="Disconnect Wallet" right={() => <Button color="#ef4444">Disconnect</Button>} />
        <List.Subheader>Notifications</List.Subheader>
        <List.Item title="Position Updates" right={() => <Switch value={notif} onValueChange={setNotif} />} />
        <List.Item title="Expert Mode" right={() => <Switch value={expert} onValueChange={setExpert} />} />
        <List.Subheader>About</List.Subheader>
        <List.Item title="Version" description="1.0.0" />
      </List.Section>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0f' },
  title: { color: '#fff', marginBottom: 12 },
});

export default function SettingsScreenWithNav() {
  return (
    <View style={{ flex: 1 }}>
      <SettingsScreen />
      <BottomTabNavigator />
    </View>
  );
}
