import { useActionSheet } from '@expo/react-native-action-sheet';
import { useHeaderHeight } from '@react-navigation/elements';
//import { Icon } from '@roninoss/icons';
import { FlashList } from '@shopify/flash-list';
import * as StoreReview from 'expo-store-review';
import { cssInterop } from 'nativewind';
import React, { useState, createContext, useContext } from 'react';
import {
 Alert,
 Button as RNButton,
 ButtonProps,
 Dimensions,
 Linking,
 Platform,
 Pressable,
 Share,
 useWindowDimensions,
 View,
 Image,
 TextInput,
 StyleSheet,
 TouchableOpacity
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ContextMenu from 'zeego/context-menu';
import * as DropdownMenu from 'zeego/dropdown-menu';
import { ActivityIndicator } from '~/components/nativewindui/ActivityIndicator';
import { Avatar, AvatarFallback, AvatarImage } from '~/components/nativewindui/Avatar';
import { DatePicker } from '~/components/nativewindui/DatePicker';
import { Picker, PickerItem } from '~/components/nativewindui/Picker';
import { ProgressIndicator } from '~/components/nativewindui/ProgressIndicator';
import { SegmentedControl } from '~/components/nativewindui/SegmentedControl';
import { Sheet, useSheetRef } from '~/components/nativewindui/Sheet';
import { Slider } from '~/components/nativewindui/Slider';
import { Text } from '~/components/nativewindui/Text';
import { Toggle } from '~/components/nativewindui/Toggle';
import { useColorScheme } from '~/lib/useColorScheme';
import { useHeaderSearchBar } from '~/lib/useHeaderSearchBar';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { TabView, SceneMap } from 'react-native-tab-view';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { NavigationContainer } from '@react-navigation/native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';;
import { Animated, FlatList } from 'react-native';


cssInterop(FlashList, {
 className: 'style',
 contentContainerClassName: 'contentContainerStyle',
});


function DefaultButton({ color, ...props }: ButtonProps) {
 const { colors } = useColorScheme();
 return <RNButton color={color ?? colors.primary} {...props} />;
}


type EventItem = {
 id: string;
 avatar: string;
 username: string;
 time: string;
 title: string;
 details: string;
 joined: number;
 comments: number;
};

const dawginEventData = [
 {
   id: '1',
   avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
   username: 'User in Basketball',
   time: '2 hrs ago',
   title: 'Pickup Basketball 7PM at Farillaga',
   details: 'Beginner skill level',
   joined: 4,
   comments: 3
 },
 {
   id: '2',
   avatar: 'https://randomuser.me/api/portraits/men/31.jpg',
   username: 'User in Soccer',
   time: '3 hrs ago',
   title: 'Soccer Game at 6PM on Wilbur Field',
   details: 'Intermediate skill level',
   joined: 6,
   comments: 2
 },
 // More events
];


const newEventData = [
 {
   id: '1',
   avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
   username: 'User in Frisbee',
   time: '2 hrs ago',
   title: 'Ultimate Frisbee at 7PM on Wilbur Field',
   details: 'Beginner skill level',
   joined: 5,
   comments: 2
 },
 {
   id: '2',
   avatar: 'https://randomuser.me/api/portraits/men/31.jpg',
   username: 'User in Poker',
   time: '3 hrs ago',
   title: 'Poker Game at 6PM at Roble Hall',
   details: 'Intermediate skill level',
   joined: 3,
   comments: 1
 },
 // More events
];

const styles = StyleSheet.create({
 searchBar: {
   padding: 10,
   margin: 10,
   borderRadius: 20,
   borderWidth: 1,
   borderColor: '#ccc',
 },
 itemContainer: {
   flexDirection: 'row',
   padding: 10,
   borderBottomWidth: 1,
   borderColor: '#eee',
   alignItems: 'center'
 },
 avatar: {
   width: 50,
   height: 50,
   borderRadius: 25,
   marginRight: 10
 },
 content: {
   flex: 1
 },
 username: {
   fontWeight: 'bold'
 },
 title: {
   fontSize: 16,
   marginTop: 2
 },
 details: {
   fontSize: 14,
   color: 'gray'
 },
 stats: {
   flexDirection: 'row',
   justifyContent: 'space-between',
   marginTop: 4
 },
 container: {
   flex: 1,
   position: 'relative',  // Important for positioning the FAB
   justifyContent: 'center',
   alignItems: 'center'
 },
 fab: {
   position: 'absolute',
   margin: 16,
   right: 0,
   bottom: 0,
   backgroundColor: 'orange',
   borderRadius: 20,
   width: 56,
   height: 56,
   alignItems: 'center',
   justifyContent: 'center',
   elevation: 8,
   zIndex: 1000,
   flexDirection: 'row',
   paddingHorizontal: 20
 },
 fabText: {
   color: '#FFA500',
   fontSize: 12,
 },
 tabContainer: {
   flexDirection: 'row',
   justifyContent: 'center',
   backgroundColor: '#ffffff',
   paddingVertical: 10,
   borderBottomWidth: 2,
   borderBottomColor: '#000000',
   paddingTop: 10,
   paddingBottom: 10
 },
 tab: {
   paddingHorizontal: 20,
   paddingVertical: 10,
},
activeTab: {
   borderBottomWidth: 3,
   borderBottomColor: 'orange'
},
tabText: {
   fontSize: 16,
   fontWeight: 'bold',
},
bottomNavigation: {
  position: 'absolute',
  bottom: 0,
  left: 0,
  right: 0,
},
})

const Tab = createMaterialTopTabNavigator();

const TabBar = () => {
 const { activeTab, setActiveTab } = useActiveTab(); // Use the custom hook

 return (
   <View style={styles.tabContainer}>
     <TouchableOpacity
       style={[styles.tab, activeTab === 'DAWGIN' ? styles.activeTab : null]}
       onPress={() => setActiveTab('DAWGIN')}
     >
       <Text style={styles.tabText}>DAWGIN'</Text>
     </TouchableOpacity>
     <TouchableOpacity
       style={[styles.tab, activeTab === 'NEW' ? styles.activeTab : null]}
       onPress={() => setActiveTab('NEW')}
     >
       <Text style={styles.tabText}>NEW</Text>
     </TouchableOpacity>
   </View>
 );
};

const ActiveTabContext = createContext({
 activeTab: 'DAWGIN',
 setActiveTab: () => {}
});

export const ActiveTabProvider = ({ children }) => {
 const [activeTab, setActiveTab] = useState('DAWGIN');

 return (
   <ActiveTabContext.Provider value={{ activeTab, setActiveTab }}>
     {children}
   </ActiveTabContext.Provider>
 );
};


// Hook to use the active tab context
export const useActiveTab = () => useContext(ActiveTabContext);

const FeedComponent = ({ type }) => {
 const { activeTab } = useActiveTab();
 const data = activeTab === 'DAWGIN' ? dawginEventData : newEventData;

 const renderItem = ({ item }) => (
   <View style={styles.itemContainer}>
     <Image source={{ uri: item.avatar }} style={styles.avatar} />
     <View style={styles.content}>
       <Text style={styles.username}>{item.username} - {item.time}</Text>
       <Text style={styles.title}>{item.title}</Text>
       <Text style={styles.details}>{item.details}</Text>
       <View style={styles.stats}>
         <Text>{item.joined} Players Joined</Text>
         <Text>{item.comments} Comments</Text>
       </View>
     </View>
   </View>
 );

 return (
   <FlatList
     data={data}
     renderItem={renderItem}
     keyExtractor={item => item.id}
     contentContainerStyle={styles.feedContainer} // Ensure the feed container takes up full height
   />
 );
};

function MyTabs() {
 return (
   <Tab.Navigator
     tabBar={props => <TabBar {...props} />}  // Custom TabBar component
     screenOptions={{
       tabBarActiveTintColor: 'orange',
       tabBarInactiveTintColor: 'gray',
       tabBarStyle: { backgroundColor: 'white' },
       tabBarIndicatorStyle: { backgroundColor: 'orange' },
     }}
   >
     <Tab.Screen name="DAWGIN'" component={FeedComponent} initialParams={{ type: "dawgin" }} />
     <Tab.Screen name="NEW" component={FeedComponent} initialParams={{ type: "new" }} />
   </Tab.Navigator>
 );
}

const GroupsJoined = () => {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Groups Joined</Text>
    </View>
  );
};

const Profile = () => {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Profile</Text>
    </View>
  );
};

const BottomTabs = createBottomTabNavigator();

export default function Screen() {
 const [searchQuery, setSearchQuery] = useState('');
 const insets = useSafeAreaInsets();
 const { colors } = useColorScheme();
 const [activeTab, setActiveTab] = useState('DAWGIN');

 const renderItem = ({ item }: { item: EventItem }) => (
   <View style={styles.itemContainer}>
     <Image source={{ uri: item.avatar }} style={styles.avatar} />
     <View style={styles.content}>
       <Text style={styles.username}>{item.username} - {item.time}</Text>
       <Text style={styles.title}>{item.title}</Text>
       <Text style={styles.details}>{item.details}</Text>
       <View style={styles.stats}>
         <Text>{item.joined} Players Joined</Text>
         <Text>{item.comments} Comments</Text>
       </View>
     </View>
   </View>
 )

 return (
  <ActiveTabProvider>
  <NavigationContainer independent = {true}>
    <BottomTabs.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = 'home';
          } else if (route.name === 'Queues') {
            iconName = 'account-group';
          } else if (route.name === 'Profile') {
            iconName = 'account';
          }

          return <MaterialCommunityIcons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <BottomTabs.Screen name="Home" component={() => (
        <View style={{ paddingTop: insets.top, backgroundColor: '#fff', flex: 1 }}>
          <TextInput
            style={styles.searchBar}
            placeholder="Search"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />

          <NavigationContainer independent={true}>
            <MyTabs />
          </NavigationContainer>

          <View style={styles.container}>
            <TouchableOpacity style={styles.fab} onPress={() => alert('Add Post')}>
              <Icon name="plus" size={30} color="#FFF" />
            </TouchableOpacity>
          </View>
        </View>
      )} />
      <BottomTabs.Screen name="Groups Joined" component={GroupsJoined} />
      <BottomTabs.Screen name="Profile" component={Profile} />
    </BottomTabs.Navigator>
  </NavigationContainer>
</ActiveTabProvider>
);
}

