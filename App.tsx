import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './theme/ThemeProvider';
import Onboarding from './screens/Onboarding';
import Discover from './screens/Discover';
import ChatList from './screens/ChatList';
import Chat from './screens/Chat';
import Paywall from './screens/Paywall';
import CancelSubscription from './screens/CancelSubscription';
import Profile from './screens/Profile';
import DataPanel from './screens/DataPanel';
import Settings from './screens/Settings';
import ProfileEdit from './screens/ProfileEdit';
import PhotoUpload from './screens/PhotoUpload';
import Verification from './screens/Verification';
import ReportBlock from './screens/ReportBlock';
import PauseBySuccess from './screens/PauseBySuccess';
import BoostImpact from './screens/BoostImpact';
import Legal from './screens/Legal';

const Stack = createNativeStackNavigator();

function Root() {
  const { session, loading } = useAuth();
  if (loading) return null;
  return (
    <Stack.Navigator>
      {!session ? (
        <Stack.Screen name="Onboarding" component={Onboarding} options={{ headerShown: false }} />
      ) : (
        <>
          <Stack.Screen name="Discover" component={Discover} options={{ title: 'Descubrir' }} />
          <Stack.Screen name="ChatList" component={ChatList} options={{ title: 'Matches' }} />
          <Stack.Screen name="Chat" component={Chat} />
          <Stack.Screen name="Profile" component={Profile} />
          <Stack.Screen name="DataPanel" component={DataPanel} options={{ title: 'Mis datos' }} />
          <Stack.Screen name="Paywall" component={Paywall} options={{ title: 'CitaClara+' }} />
          <Stack.Screen name="CancelSubscription" component={CancelSubscription} options={{ title: 'Cancelar' }} />
          <Stack.Screen name="Settings" component={Settings} />
          <Stack.Screen name="ProfileEdit" component={ProfileEdit} />
          <Stack.Screen name="PhotoUpload" component={PhotoUpload} />
          <Stack.Screen name="Verification" component={Verification} />
          <Stack.Screen name="ReportBlock" component={ReportBlock} />
          <Stack.Screen name="PauseBySuccess" component={PauseBySuccess} />
          <Stack.Screen name="BoostImpact" component={BoostImpact} />
          <Stack.Screen name="Legal" component={Legal} />
        </>
      )}
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <NavigationContainer>
          <Root />
        </NavigationContainer>
      </AuthProvider>
    </ThemeProvider>
  );
}
