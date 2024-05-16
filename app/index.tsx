import { useActionSheet } from '@expo/react-native-action-sheet';
import { useHeaderHeight } from '@react-navigation/elements';
import { FlashList } from '@shopify/flash-list';
import * as StoreReview from 'expo-store-review';
import { cssInterop } from 'nativewind';
import React, { useState, createContext, useContext, useCallback, useMemo } from 'react';
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
  TouchableOpacity,
  FlatList,
  ScrollView,
  Text,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { NavigationContainer } from '@react-navigation/native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';

// Interop setup for NativeWindUI
cssInterop(FlashList, {
  className: 'style',
  contentContainerClassName: 'contentContainerStyle',
});

// Contexts
const ActiveTabContext = createContext({
  activeTab: 'DAWGIN',
  setActiveTab: () => {}
});

const GroupsJoinedContext = createContext({
  groupsJoined: [],
  addGroup: (group) => {},
  removeGroup: (group) => {}
});

const EventDataContext = createContext({
  events: [],
  updateEvent: (updatedEvent) => {},
  addEvent: (newEvent) => {}
});

const AuthContext = createContext({
  signIn: () => {},
  signOut: () => {},
  isSignedIn: false,
});

const Stack = createStackNavigator();

export const ActiveTabProvider = ({ children }) => {
  const [activeTab, setActiveTab] = useState('DAWGIN');
  const [groupsJoined, setGroupsJoined] = useState([]);
  const [events, setEvents] = useState([
    {
      id: '1',
      avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
      username: 'User in Basketball',
      time: '2 hrs ago',
      title: 'Pickup Basketball 7PM at Farillaga',
      details: 'Beginner skill level',
      joined: 4,
      comments: 3,
      skillLevel: 'Beginner',
      location: 'Farillaga',
    },
    {
      id: '2',
      avatar: 'https://randomuser.me/api/portraits/men/31.jpg',
      username: 'User in Soccer',
      time: '3 hrs ago',
      title: 'Soccer Game at 6PM on Wilbur Field',
      details: 'Intermediate skill level',
      joined: 6,
      comments: 2,
      skillLevel: 'Intermediate',
      location: 'Wilbur Field',
    },
    // More events...
  ]);

  const addGroup = (group) => {
    setGroupsJoined((prevGroups) => [...prevGroups, group]);
  };

  const removeGroup = (group) => {
    setGroupsJoined((prevGroups) =>
      prevGroups.filter((g) => g.id !== group.id)
    );
  };

  const updateEvent = (updatedEvent) => {
    setEvents((prevEvents) =>
      prevEvents.map((event) =>
        event.id === updatedEvent.id ? updatedEvent : event
      )
    );
    setGroupsJoined((prevGroups) =>
      prevGroups.map((group) =>
        group.id === updatedEvent.id ? updatedEvent : group
      )
    );
  };

  const addEvent = (newEvent) => {
    setEvents((prevEvents) => [newEvent, ...prevEvents]);
  };

  return (
    <ActiveTabContext.Provider value={{ activeTab, setActiveTab }}>
      <GroupsJoinedContext.Provider value={{ groupsJoined, addGroup, removeGroup }}>
        <EventDataContext.Provider value={{ events, updateEvent, addEvent }}>
          {children}
        </EventDataContext.Provider>
      </GroupsJoinedContext.Provider>
    </ActiveTabContext.Provider>
  );
};

const AuthProvider = ({ children }) => {
  const [isSignedIn, setIsSignedIn] = useState(false);

  const signIn = () => {
    setIsSignedIn(true);
  };

  const signOut = () => {
    setIsSignedIn(false);
  };

  return (
    <AuthContext.Provider value={{ isSignedIn, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hooks
const useActiveTab = () => useContext(ActiveTabContext);
const useGroupsJoined = () => useContext(GroupsJoinedContext);
const useEventData = () => useContext(EventDataContext);
const useAuth = () => useContext(AuthContext);

// Tab Bar
const TabBar = () => {
  const { activeTab, setActiveTab } = useActiveTab();

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

// Feed Component
const FeedComponent = ({ navigation }) => {
  const { activeTab } = useActiveTab();
  const { events, updateEvent } = useEventData();
  const { addGroup, removeGroup } = useGroupsJoined();

  const data = useMemo(
    () => (activeTab === 'DAWGIN' ? events : events),
    [activeTab, events]
  );

  const handleJoinToggle = (item) => {
    const updatedEvent = {
      ...item,
      joined: item.hasJoined ? item.joined - 1 : item.joined + 1,
      hasJoined: !item.hasJoined,
    };
    updateEvent(updatedEvent);
    if (item.hasJoined) {
      removeGroup(updatedEvent);
    } else {
      addGroup(updatedEvent);
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.itemContainer}>
      <TouchableOpacity onPress={() => navigation.navigate('Post', { item })}>
        <View style={styles.content}>
          <Image source={{ uri: item.avatar }} style={styles.avatar} />
          <View>
            <Text style={styles.username}>
              {item.username} - {item.time}
            </Text>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.details}>{item.details}</Text>
            <View style={styles.stats}>
              <Text>{item.joined} Players Joined</Text>
              <Text>{item.comments} Comments</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
      <TouchableOpacity
        style={item.hasJoined ? styles.joinedButton : styles.joinButton}
        onPress={() => handleJoinToggle(item)}
      >
        <Text style={item.hasJoined ? styles.joinedButtonText : styles.joinedButtonText}>
          {item.hasJoined ? 'Joined' : 'Join'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <FlatList
      data={data}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
      contentContainerStyle={{ flexGrow: 1 }} // Ensure the FlatList container takes up full height
      style={{ flex: 1 }} // Make sure the FlatList itself expands to fill available space
    />
  );
};

const Tab = createMaterialTopTabNavigator();

const MyTabs = ({ navigation }) => {
  return (
    <Tab.Navigator
      tabBar={(props) => <TabBar {...props} />} // Custom TabBar component
      screenOptions={{
        tabBarActiveTintColor: 'orange',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: { backgroundColor: 'white' },
        tabBarIndicatorStyle: { backgroundColor: 'orange' },
        headerShown: false, // Hide the header in the top tab navigator
      }}
    >
      <Tab.Screen name="DAWGIN'" component={FeedComponent} />
      <Tab.Screen name="NEW" component={FeedComponent} />
    </Tab.Navigator>
  );
};

// PostScreen Component
const PostScreen = ({ route }) => {
  const { item } = route.params;
  const [comments, setComments] = useState([
    { id: '1', username: 'User 2', time: '2 hrs ago', text: 'Looking forward to it!' },
    { id: '2', username: 'User 3', time: '1 hr ago', text: 'Hope we have a great game!' },
  ]);
  const [newComment, setNewComment] = useState('');
  const { addGroup, removeGroup } = useGroupsJoined();
  const { updateEvent, events } = useEventData();

  const currentEvent = events.find((event) => event.id === item.id) || item;
  const [joined, setJoined] = useState(currentEvent.joined);
  const [hasJoined, setHasJoined] = useState(currentEvent.hasJoined || false);

  const handleAddComment = () => {
    if (newComment.trim()) {
      const newCommentData = {
        id: (comments.length + 1).toString(),
        username: 'Current User',
        time: 'Just now',
        text: newComment,
      };
      setComments([...comments, newCommentData]);
      setNewComment('');
    }
  };

  const handleJoinToggle = () => {
    const updatedEvent = { ...currentEvent, joined: hasJoined ? joined - 1 : joined + 1, hasJoined: !hasJoined };
    updateEvent(updatedEvent);
    setJoined(updatedEvent.joined);
    setHasJoined(updatedEvent.hasJoined);
    if (hasJoined) {
      removeGroup(updatedEvent);
    } else {
      addGroup(updatedEvent);
    }
  };

  const renderComment = ({ item }) => (
    <View style={styles.commentContainer}>
      <Text style={styles.commentText}>
        <Text style={{ fontWeight: 'bold' }}>{item.username}</Text> {item.time}
      </Text>
      <Text style={styles.commentText}>{item.text}</Text>
    </View>
  );

  return (
    <ScrollView contentContainerStyle={{ padding: 20 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
        <Image source={{ uri: item.avatar }} style={styles.avatar} />
        <View>
          <Text style={{ fontWeight: 'bold' }}>{item.username}</Text>
          <Text>{item.time}</Text>
        </View>
      </View>
      <Text style={styles.postHeader}>{item.title}</Text>
      <Text style={styles.postDetail}>{item.details}</Text>
      <View style={styles.stats}>
        <Text>{joined} Players Joined</Text>
        <Text>{comments.length} Comments</Text>
      </View>
      <TouchableOpacity
        style={hasJoined ? styles.joinedButton : styles.joinButton}
        onPress={handleJoinToggle}
      >
        <Text style={hasJoined ? styles.joinedButtonText : styles.joinedButtonText}>
          {hasJoined ? 'Joined' : 'Join'}
        </Text>
      </TouchableOpacity>
      <Text style={styles.commentsHeader}>Comments:</Text>
      <FlatList
        data={comments}
        renderItem={renderComment}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ flexGrow: 1 }}
      />
      <View style={styles.addCommentContainer}>
        <TextInput
          style={styles.commentInput}
          placeholder="Add a comment..."
          value={newComment}
          onChangeText={setNewComment}
        />
        <TouchableOpacity style={styles.addCommentButton} onPress={handleAddComment}>
          <Text style={styles.addCommentButtonText}>Post</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

// Groups Joined Component
const GroupsJoined = ({ navigation }) => {
  const { groupsJoined } = useGroupsJoined();

  const renderItem = ({ item }) => (
    <TouchableOpacity onPress={() => navigation.navigate('ChatRoom', { item })}>
      <View style={styles.itemContainer}>
        <Image source={{ uri: item.avatar }} style={styles.avatar} />
        <View style={styles.content}>
          <Text style={styles.username}>
            {item.username} - {item.time}
          </Text>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.details}>{item.details}</Text>
          <View style={styles.stats}>
            <Text>{item.joined} Players Joined</Text>
            <Text>{item.comments} Comments</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <FlatList
      data={groupsJoined}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
      contentContainerStyle={{ flexGrow: 1 }}
      style={{ flex: 1 }}
    />
  );
};

// ChatRoom Component
const ChatRoom = ({ route }) => {
  const { item } = route.params;
  const [messages, setMessages] = useState([
    { id: '1', text: 'Hello! Welcome to the chat.', sender: 'user', timestamp: 'Nov 30, 2023, 9:41 AM' },
    { id: '2', text: 'Hi there!', sender: 'admin', timestamp: 'Nov 30, 2023, 9:42 AM' },
  ]);
  const [newMessage, setNewMessage] = useState('');

  const handleSend = () => {
    if (newMessage.trim()) {
      const newMessageData = {
        id: Date.now().toString(),
        text: newMessage,
        sender: 'user',
        timestamp: new Date().toLocaleString(),
      };
      setMessages([...messages, newMessageData]);
      setNewMessage('');
    }
  };

  const renderMessage = ({ item }) => (
    <View
      style={[
        styles.chatBubble,
        item.sender === 'user' ? styles.chatBubbleRight : styles.chatBubbleLeft,
      ]}
    >
      <Text
        style={
          item.sender === 'user'
            ? styles.chatBubbleTextRight
            : styles.chatBubbleTextLeft
        }
      >
        {item.text}
      </Text>
      <Text style={{ fontSize: 10, color: 'gray', marginTop: 5 }}>
        {item.timestamp}
      </Text>
    </View>
  );

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 20 }}
      />
      <View style={styles.chatInputContainer}>
        <TextInput
          style={styles.chatInput}
          placeholder="Message..."
          value={newMessage}
          onChangeText={setNewMessage}
        />
        <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// NewPostScreen Component
const NewPostScreen = ({ navigation }) => {
  const [title, setTitle] = useState('');
  const [sport, setSport] = useState('');
  const [time, setTime] = useState('');
  const [location, setLocation] = useState('');
  const [skillLevel, setSkillLevel] = useState('');
  const [additionalInfo, setAdditionalInfo] = useState('');

  const { addEvent } = useEventData();

  const handleSubmit = () => {
    const newEvent = {
      id: Date.now().toString(),
      avatar: 'https://randomuser.me/api/portraits/men/31.jpg',
      username: `User in ${sport}`,
      time: 'Just now',
      title,
      details: `${sport} game at ${time} on ${location}\nSkill Level: ${skillLevel}\n${additionalInfo}`,
      joined: 0,
      comments: 0,
      skillLevel,
      location,
      additionalInfo,
      hasJoined: false,
    };
    addEvent(newEvent);
    navigation.navigate('Main');
  };

  return (
    <ScrollView contentContainerStyle={styles.modalContainer}>
      <Text style={styles.postHeader}>Create a New Post</Text>
      <View style={styles.infoContainer}>
        <Text style={styles.infoLabel}>Title:</Text>
        <TextInput
          style={styles.infoText}
          value={title}
          onChangeText={setTitle}
          placeholder="Enter the title"
        />
      </View>
      <View style={styles.infoContainer}>
        <Text style={styles.infoLabel}>Sport:</Text>
        <TextInput
          style={styles.infoText}
          value={sport}
          onChangeText={setSport}
          placeholder="Enter the sport"
        />
      </View>
      <View style={styles.infoContainer}>
        <Text style={styles.infoLabel}>Time:</Text>
        <TextInput
          style={styles.infoText}
          value={time}
          onChangeText={setTime}
          placeholder="Enter the time"
        />
      </View>
      <View style={styles.infoContainer}>
        <Text style={styles.infoLabel}>Location:</Text>
        <TextInput
          style={styles.infoText}
          value={location}
          onChangeText={setLocation}
          placeholder="Enter the location"
        />
      </View>
      <View style={styles.infoContainer}>
        <Text style={styles.infoLabel}>Skill Level:</Text>
        <TextInput
          style={styles.infoText}
          value={skillLevel}
          onChangeText={setSkillLevel}
          placeholder="Enter the skill level"
        />
      </View>
      <View style={styles.infoContainer}>
        <Text style={styles.infoLabel}>Additional Info:</Text>
        <TextInput
          style={styles.infoText}
          value={additionalInfo}
          onChangeText={setAdditionalInfo}
          placeholder="Enter additional info"
        />
      </View>
      <TouchableOpacity style={styles.modalButton} onPress={handleSubmit}>
        <Text style={styles.modalButtonText}>Submit</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

// LoginScreen Component
const LoginScreen = ({ navigation }) => {
  const { signIn } = useAuth();
  const [sunetID, setSunetID] = useState('');
  const [password, setPassword] = useState('');

  const handleSignIn = () => {
    if (sunetID.trim() && password.trim()) {
      signIn();
      navigation.replace('Main');
    } else {
      Alert.alert('Error', 'Please enter your SUNet ID and password.');
    }
  };

  return (
    <View style={[styles.flex1, styles.centeredContainer]}>
      <Text style={styles.loginTitle}>DAWG</Text>
      <TextInput
        style={styles.loginInput}
        placeholder="SUNet ID..."
        value={sunetID}
        onChangeText={setSunetID}
      />
      <TextInput
        style={styles.loginInput}
        placeholder="Password..."
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <TouchableOpacity style={styles.loginButton} onPress={handleSignIn}>
        <Text style={styles.loginButtonText}>Sign In</Text>
      </TouchableOpacity>
    </View>
  );
};

// HomeScreen Component
const HomeScreen = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const insets = useSafeAreaInsets();

  const handleSearchChange = (text) => {
    setSearchQuery(text);
  };

  return (
    <View style={[styles.flex1, { paddingTop: insets.top, backgroundColor: '#fff' }]}>
      <TextInput
        style={styles.searchBar}
        placeholder="Search"
        value={searchQuery}
        onChangeText={handleSearchChange}
      />
      <View style={styles.flex1}>
        <MyTabs navigation={navigation} />
      </View>
      <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('NewPost')}>
        <Icon name="plus" size={30} color="#FFF" />
      </TouchableOpacity>
    </View>
  );
};

// ProfileScreen Component
const ProfileScreen = ({ navigation }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('John Doe');
  const [pronouns, setPronouns] = useState('he/him');
  const [sunetID, setSunetID] = useState('johndoe@stanford.edu');
  const [bio, setBio] = useState('Current sophomore looking to make new friends!');
  const [beginnerInterests, setBeginnerInterests] = useState(['Soccer', 'Chess']);
  const [intermediateInterests, setIntermediateInterests] = useState(['Frisbee']);
  const [advancedInterests, setAdvancedInterests] = useState(['Basketball', 'Poker']);
  const { signOut } = useAuth();

  const handleSave = () => {
    setIsEditing(false);
    // Save the updated information
  };

  return (
    <ScrollView contentContainerStyle={{ padding: 20 }}>
      <TouchableOpacity>
        <Image
          source={{ uri: 'https://randomuser.me/api/portraits/women/32.jpg' }}
          style={styles.profileImage}
        />
      </TouchableOpacity>
      <TouchableOpacity>
        <Text style={styles.editProfileImageText}>Edit profile image</Text>
      </TouchableOpacity>
      <View style={styles.infoContainer}>
        <Text style={styles.infoLabel}>Name</Text>
        {isEditing ? (
          <TextInput
            style={styles.infoText}
            value={name}
            onChangeText={setName}
          />
        ) : (
          <Text style={styles.infoText}>{name}</Text>
        )}
      </View>
      <View style={styles.infoContainer}>
        <Text style={styles.infoLabel}>Pronouns</Text>
        {isEditing ? (
          <TextInput
            style={styles.infoText}
            value={pronouns}
            onChangeText={setPronouns}
          />
        ) : (
          <Text style={styles.infoText}>{pronouns}</Text>
        )}
      </View>
      <View style={styles.infoContainer}>
        <Text style={styles.infoLabel}>SUNet ID</Text>
        {isEditing ? (
          <TextInput
            style={styles.infoText}
            value={sunetID}
            onChangeText={setSunetID}
          />
        ) : (
          <Text style={styles.infoText}>{sunetID}</Text>
        )}
      </View>
      <View style={styles.infoContainer}>
        <Text style={styles.infoLabel}>Bio</Text>
        {isEditing ? (
          <TextInput
            style={styles.infoText}
            value={bio}
            onChangeText={setBio}
          />
        ) : (
          <Text style={styles.infoText}>{bio}</Text>
        )}
      </View>
      <View style={styles.interestsContainer}>
        <Text style={styles.interestsTitle}>Interests & Skill Levels</Text>
        <View style={styles.interestsRow}>
          <View style={styles.interestsColumn}>
            <Text style={styles.infoLabel}>Beginner</Text>
            {isEditing ? (
              <TextInput
                style={styles.infoText}
                value={beginnerInterests.join(', ')}
                onChangeText={(text) => setBeginnerInterests(text.split(', '))}
              />
            ) : (
              beginnerInterests.map((interest, index) => (
                <Text key={index} style={styles.interestsText}>{interest}</Text>
              ))
            )}
          </View>
          <View style={styles.interestsColumn}>
            <Text style={styles.infoLabel}>Intermediate</Text>
            {isEditing ? (
              <TextInput
                style={styles.infoText}
                value={intermediateInterests.join(', ')}
                onChangeText={(text) => setIntermediateInterests(text.split(', '))}
              />
            ) : (
              intermediateInterests.map((interest, index) => (
                <Text key={index} style={styles.interestsText}>{interest}</Text>
              ))
            )}
          </View>
          <View style={styles.interestsColumn}>
            <Text style={styles.infoLabel}>Advanced</Text>
            {isEditing ? (
              <TextInput
                style={styles.infoText}
                value={advancedInterests.join(', ')}
                onChangeText={(text) => setAdvancedInterests(text.split(', '))}
              />
            ) : (
              advancedInterests.map((interest, index) => (
                <Text key={index} style={styles.interestsText}>{interest}</Text>
              ))
            )}
          </View>
        </View>
      </View>
      <TouchableOpacity
        style={styles.editProfileButton}
        onPress={() => (isEditing ? handleSave() : setIsEditing(true))}
      >
        <Text style={styles.editProfileButtonText}>
          {isEditing ? 'Save' : 'Edit'}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.signOutButton}
        onPress={() => {
          signOut();
          navigation.replace('Login');
        }}
      >
        <Text style={styles.signOutButtonText}>Sign Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

// Profile Navigator
const ProfileNavigator = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Profile" component={ProfileScreen} />
    </Stack.Navigator>
  );
};

// Main Tabs
const BottomTabs = createBottomTabNavigator();

const MainTabs = () => {
  return (
    <BottomTabs.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = 'home';
          } else if (route.name === 'Groups Joined') {
            iconName = 'account-group';
          } else if (route.name === 'Profile') {
            iconName = 'account';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: 'orange', // Active tab color
        tabBarInactiveTintColor: 'gray', // Inactive tab color
        headerShown: false, // Hide the default header
      })}
    >
      <BottomTabs.Screen name="Home" component={HomeScreen} />
      <BottomTabs.Screen name="Groups Joined" component={GroupsJoined} />
      <BottomTabs.Screen name="Profile" component={ProfileNavigator} />
    </BottomTabs.Navigator>
  );
};

// Main App
export default function Screen() {
  return (
    <ActiveTabProvider>
      <AuthProvider>
        <NavigationContainer independent={true}>
          <Stack.Navigator>
            <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Main" component={MainTabs} options={{ headerShown: false }} />
            <Stack.Screen name="Post" component={PostScreen} options={{ title: 'Post' }} />
            <Stack.Screen name="NewPost" component={NewPostScreen} options={{ title: 'New Post' }} />
            <Stack.Screen name="ChatRoom" component={ChatRoom} options={({ route }) => ({ title: route.params.item.title })} />
          </Stack.Navigator>
        </NavigationContainer>
      </AuthProvider>
    </ActiveTabProvider>
  );
}

// Styles
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
    alignItems: 'center',
    justifyContent: 'space-between' // Add this line to move Join button to the right
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
    backgroundColor: '#fff'
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
  flex1: {
    flex: 1
  },
  centeredContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  loginInput: {
    width: '80%',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 20,
    padding: 10,
    marginBottom: 20,
  },
  loginButton: {
    backgroundColor: 'black',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  loginButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  commentContainer: {
    borderBottomWidth: 1,
    borderColor: '#ccc',
    paddingVertical: 10,
  },
  commentText: {
    fontSize: 14,
    color: '#333',
  },
  postHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  postDetail: {
    fontSize: 16,
    marginBottom: 10,
  },
  commentsHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 10,
  },
  addCommentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  commentInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 20,
    padding: 10,
  },
  addCommentButton: {
    marginLeft: 10,
    backgroundColor: 'orange',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  addCommentButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  joinedButton: {
    backgroundColor: 'lightgray',
    borderRadius: 20,
    paddingVertical: 5,
    paddingHorizontal: 15,
    alignSelf: 'flex-end',
  },
  joinButton: {
    backgroundColor: 'orange',
    borderRadius: 20,
    paddingVertical: 5,
    paddingHorizontal: 15,
    alignSelf: 'flex-end',
  },
  joinedButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  chatBubble: {
    maxWidth: '70%',
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
  },
  chatBubbleLeft: {
    alignSelf: 'flex-start',
    backgroundColor: 'lightgray',
  },
  chatBubbleRight: {
    alignSelf: 'flex-end',
    backgroundColor: 'orange',
  },
  chatBubbleTextLeft: {
    color: 'black',
  },
  chatBubbleTextRight: {
    color: 'white',
  },
  chatInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderTopWidth: 1,
    borderColor: '#ccc',
  },
  chatInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 20,
    padding: 10,
  },
  sendButton: {
    marginLeft: 10,
    backgroundColor: 'orange',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  sendButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  infoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  infoLabel: {
    fontWeight: 'bold',
    flex: 1,
  },
  infoText: {
    flex: 2,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    paddingVertical: 5,
  },
  editProfileImageText: {
    color: 'blue',
    textAlign: 'center',
    marginVertical: 10,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignSelf: 'center',
  },
  interestsContainer: {
    marginTop: 20,
  },
  interestsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  interestsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  interestsColumn: {
    flex: 1,
    alignItems: 'center',
  },
  interestsText: {
    fontSize: 14,
    color: 'gray',
  },
  editProfileButton: {
    backgroundColor: 'orange',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignSelf: 'center',
    marginTop: 20,
  },
  editProfileButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  modalButton: {
    backgroundColor: 'orange',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignSelf: 'center',
    marginTop: 20,
  },
  modalButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  signOutButton: {
    backgroundColor: 'black',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignSelf: 'center',
    marginTop: 20,
  },
  signOutButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});
