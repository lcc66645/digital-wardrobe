import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { colors, fontSize } from '../theme/tokens';
import HomeScreen from '../screens/home/HomeScreen';
import WardrobeScreen from '../screens/wardrobe/WardrobeScreen';
import RecommendScreen from '../screens/recommend/RecommendScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import type { MainTabParamList } from './types';

const Tab = createBottomTabNavigator<MainTabParamList>();

export default function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.brown,
        tabBarInactiveTintColor: colors.brownSub,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.line,
          borderTopWidth: 1,
          height: 58,
          paddingBottom: 6,
          paddingTop: 6,
        },
        tabBarLabelStyle: { fontSize: fontSize.xs },
      }}
    >
      <Tab.Screen name="HomeTab" component={HomeScreen} options={{ tabBarLabel: '首页' }} />
      <Tab.Screen name="WardrobeTab" component={WardrobeScreen} options={{ tabBarLabel: '衣橱' }} />
      <Tab.Screen name="RecommendTab" component={RecommendScreen} options={{ tabBarLabel: '推荐' }} />
      <Tab.Screen name="ProfileTab" component={ProfileScreen} options={{ tabBarLabel: '我的' }} />
    </Tab.Navigator>
  );
}
