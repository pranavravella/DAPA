import { useActionSheet } from '@expo/react-native-action-sheet';
import { useHeaderHeight } from '@react-navigation/elements';
import { FlashList } from '@shopify/flash-list';
import * as StoreReview from 'expo-store-review';
import { cssInterop } from 'nativewind';

import React, { useState, createContext, useContext, useEffect, useCallback, useMemo } from 'react';
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
import { Picker } from '@react-native-picker/picker';


import { initializeApp } from 'firebase/app';
import { v4 as uuidv4 } from 'uuid';

// Google
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth"

const firebaseConfig = {
  apiKey: 'AIzaSyD1bee7SxskYp7V_sZO1V6j2JJEdVgHhtI',
  authDomain: 'dawgin-68516.firebaseapp.com',
  databaseURL: 'https://dawgin-68516-default-rtdb.firebaseio.com',
  projectId: 'dawgin-68516',
  storageBucket: 'dawgin-68516.appspot.com',
  messagingSenderId: '480370370595',
  appId: '1:480370370595:web:27172d7b9a075157a46996',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app)
const provider = new GoogleAuthProvider();

import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  Timestamp,
  collection,
  getDocs,
} from 'firebase/firestore';
import { NativeSegmentedControlIOSChangeEvent } from '@react-native-segmented-control/segmented-control';
const db = getFirestore(app);

import { Modal } from 'react-native';
import { getRootURL } from 'expo-router/build/link/linking';

// Interop setup for NativeWindUI
cssInterop(FlashList, {
  className: 'style',
  contentContainerClassName: 'contentContainerStyle',
});

// Contexts
const ActiveTabContext = createContext({
  activeTab: 'DAWGIN',
  setActiveTab: () => {},
});

const GroupsJoinedContext = createContext<{
  groupsJoined: Event[];
  addGroup: (group: Event) => void;
  removeGroup: (group: Event) => void;
  updateGroup: (updatedGroup: Event[]) => void;
}>({
  groupsJoined: [],
  addGroup: () => {},
  removeGroup: () => {},
  updateGroup: () => {},
});

const EventDataContext = createContext({
  events: [] as Event[],
  updateEvent: (updatedEvent: Event) => {},
  addEvent: (newEvent: Event) => {},
  setBatchEvents: (newEvents: Event[]) => {},
});

const AuthContext = createContext({
  signIn: (sunetID: string, password: string) => Promise.resolve(false),
  signOut: () => {},
  isSignedIn: false,
});

type UserData = {
  Bio: string;
  Name: string;
  advancedInterests: string[];
  beginnerInterests: string[];
  intermediateInterests: string[];
  pronouns: string;
  joinedEvents: string[];
  hasAcceptedRules?: boolean;
};

const UserDataContext = createContext<{
  userData: UserData | null;
  sunetID: string;
  updateUserData: (newUserData: UserData) => void;
  updateSunetID: (newSunetID: string) => void;
}>({
  userData: null,
  sunetID: '',
  updateUserData: () => {},
  updateSunetID: () => {},
});

type commentObject = {
  username: string;
  time: string;
  text: string;
};

type Event = {
  id: string;
  comments: number;
  details: string;
  additionalInfo: string;
  joined: number;
  location: string;
  skillLevel: string;
  time: string;
  title: string;
  username: string;
  commentArray: commentObject[];
};

type chatMessage = {
  sender: string;
  time: string;
  text: string;
};

const chatMessagesMapContext = createContext<{
  chatMessagesMap: { [key: string]: chatMessage[] };
  addChatMessage: (chatMessage: chatMessage, eventId: string) => void;
  setBatchChatMessages: (batchChatMessages: { [eventId: string]: chatMessage[] }) => void;
}>({
  chatMessagesMap: {},
  addChatMessage: () => {},
  setBatchChatMessages: () => {},
});
const Stack = createStackNavigator();

export const ActiveTabProvider = ({ children }) => {
  const [activeTab, setActiveTab] = useState('DAWGIN');
  const [groupsJoined, setGroupsJoined] = useState<Event[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [sunetID, setSunetID] = useState('');
  const [chatMessagesMap, setChatMessagesMap] = useState<{ [eventId: string]: chatMessage[] }>({});

  const addGroup = (group: Event) => {
    setGroupsJoined((prevGroups) => [group, ...prevGroups]);
  };

  const removeGroup = (group: Event) => {
    setGroupsJoined((prevGroups) => prevGroups.filter((g) => g.id !== group.id));
  };

  const updateEvent = (updatedEvent: Event) => {
    setEvents((prevEvents) =>
      prevEvents.map((event) => (event.id === updatedEvent.id ? updatedEvent : event))
    );
    setGroupsJoined((prevGroups) =>
      prevGroups.map((group) => (group.id === updatedEvent.id ? updatedEvent : group))
    );
  };

  const addEvent = (newEvent: Event) => {
    setEvents((prevEvents) => [newEvent, ...prevEvents]);
  };

  const setBatchEvents = (newEvents: Event[]) => {
    setEvents(newEvents);
  };

  const updateUserData = (newUserData: UserData) => {
    setUserData(newUserData);
  };

  const updateSunetID = (newSunetID: string) => {
    setSunetID(newSunetID);
  };
  const updateGroup = (updatedGroup: Event[]) => {
    setGroupsJoined(updatedGroup);
  };
  const setBatchChatMessages = (batchChatMessages: { [eventId: string]: chatMessage[] }) => {
    setChatMessagesMap(batchChatMessages);
  };
  const addChatMessage = (chatMessage: chatMessage, eventId: string) => {
    setChatMessagesMap((prevChatMessagesMap) => {
      const updatedChatMessages = prevChatMessagesMap[eventId]
        ? [...prevChatMessagesMap[eventId], chatMessage]
        : [chatMessage];
      return {
        ...prevChatMessagesMap,
        [eventId]: updatedChatMessages,
      };
    });
  };
  return (
    <ActiveTabContext.Provider value={{ activeTab, setActiveTab }}>
      <UserDataContext.Provider value={{ userData, sunetID, updateUserData, updateSunetID }}>
        <GroupsJoinedContext.Provider value={{ groupsJoined, addGroup, removeGroup, updateGroup }}>
          <EventDataContext.Provider value={{ events, updateEvent, addEvent, setBatchEvents }}>
            <chatMessagesMapContext.Provider
              value={{ chatMessagesMap, addChatMessage, setBatchChatMessages }}>
              {children}
            </chatMessagesMapContext.Provider>
          </EventDataContext.Provider>
        </GroupsJoinedContext.Provider>
      </UserDataContext.Provider>
    </ActiveTabContext.Provider>
  );
};

const AuthProvider = ({ children }) => {
  const [isSignedIn, setIsSignedIn] = useState(false);

  const signIn = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      setIsSignedIn(true);
      return true;
    } catch (error) {
      console.error('Google sign-in error:', error);
      Alert.alert('Error', 'Failed to sign in with Google.');
      return false;
    }
  };
  
  const signOut = () => {
    setIsSignedIn(false);
  };

  return (
    <AuthContext.Provider value={{ isSignedIn, signIn, signOut }}>{children}</AuthContext.Provider>
  );
};

// Hooks
const useActiveTab = () => useContext(ActiveTabContext);
const useGroupsJoined = () => useContext(GroupsJoinedContext);
const useEventData = () => useContext(EventDataContext);
const useAuth = () => useContext(AuthContext);
const useUserData = () => useContext(UserDataContext);
const useChatMessages = () => useContext(chatMessagesMapContext);

const ReportModal = ({ isReportModalVisible, setIsReportModalVisible, handleReportSubmit }) => {
  const { setBatchEvents } = useEventData(); // Add this line
  const [reportReason, setReportReason] = useState('');
  const [additionalInfo, setAdditionalInfo] = useState('');

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isReportModalVisible}
      onRequestClose={() => setIsReportModalVisible(false)}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <Text style={styles.modalText}>Report Post</Text>
          <Text style={styles.labelText}>Reason for report:</Text>
          <Picker
            selectedValue={reportReason}
            onValueChange={(itemValue) => setReportReason(itemValue)}
            style={styles.picker}
          >
            <Picker.Item label="Spam" value="Spam" />
            <Picker.Item label="Inappropriate Content" value="Inappropriate Content" />
            <Picker.Item label="Harassment" value="Harassment" />
            <Picker.Item label="False Information" value="False Information" />
            <Picker.Item label="Other" value="Other" />
          </Picker>
          <Text style={styles.labelText}>Additional information (optional):</Text>
          <TextInput
            style={styles.additionalInfoInput}
            placeholder="Provide more details"
            value={additionalInfo}
            onChangeText={setAdditionalInfo}
            multiline={true}
          />
          <TouchableOpacity style={[styles.button, styles.buttonClose]} onPress={handleReportSubmit}>
            <Text style={styles.textStyle}>Submit Report</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export { AuthProvider, useAuth };
// Tab Bar
const TabBar = () => {
  const { activeTab, setActiveTab } = useActiveTab();

  return (
    <View style={styles.tabContainer}>
      <TouchableOpacity
        style={[styles.tab, activeTab === 'DAWGIN' ? styles.activeTab : null]}
        onPress={() => setActiveTab('DAWGIN')}>
        <Text style={styles.tabText}>DAWGIN'</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.tab, activeTab === 'NEW' ? styles.activeTab : null]}
        onPress={() => setActiveTab('NEW')}>
        <Text style={styles.tabText}>NEW</Text>
      </TouchableOpacity>
    </View>
  );
};

const isEventJoined = (userData: UserData, eventId: string): boolean => {
  if (!userData || !userData.joinedEvents) return false;
  return userData.joinedEvents.includes(eventId);
};
const updateEventInDatabase = async (newEvent: Event) => {
  try {
    const db = getFirestore(app);
    const eventRef = doc(db, 'Events', newEvent.id);
    const { id, ...eventData } = newEvent;
    await setDoc(eventRef, eventData);
    console.log('Event updated successfully');
  } catch (error) {
    console.error('Error updating event: ', error);
  }
};

// Feed Component
const FeedComponent = ({ navigation }) => {
  const { activeTab } = useActiveTab();
  const { events, updateEvent } = useEventData();
  const { addGroup, removeGroup } = useGroupsJoined();
  const { userData, updateUserData, sunetID } = useUserData();
  const data = useMemo(() => (activeTab === 'DAWGIN' ? events : events), [activeTab, events]);
  const [isReportModalVisible, setIsReportModalVisible] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);

  const shuffleArray = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  };

  const sortedData = useMemo(() => {
    if (activeTab === 'DAWGIN') {
      return shuffleArray([...events]);
    } else {
      return [...events].sort((a, b) => parseInt(b.time) - parseInt(a.time));
    }
  }, [activeTab, events]);

  const handleJoinToggle = (item) => {
    if (!userData) return;
    const isJoined = isEventJoined(userData, item.id);
    const updatedEvent = {
      ...item,
      joined: isJoined ? item.joined - 1 : item.joined + 1,
    };
    updateEvent(updatedEvent);
    updateEventInDatabase(updatedEvent);
    const updatedUserData = {
      ...userData,
      joinedEvents: isJoined
        ? userData.joinedEvents.filter((eventId) => eventId !== item.id)
        : [...userData.joinedEvents, item.id],
    };
    updateUserData(updatedUserData);
    databaseUserUpdate(updatedUserData, sunetID);
    if (isJoined) {
      removeGroup(updatedEvent);
    } else {
      addGroup(updatedEvent);
    }
  };

  const handleReportSubmit = () => {
    console.log('Report submitted for:', selectedPost);
    setIsReportModalVisible(false);
  };

  const openReportModal = (post) => {
    setSelectedPost(post);
    setIsReportModalVisible(true);
  };

  const renderItem = ({ item }) => {
    const formattedTime = new Date(parseInt(item.time)).toLocaleString();
    return (
      <View style={styles.itemContainer}>
        <View style={styles.header}>
          <Text style={styles.username}>
            {item.username} - {formattedTime}
          </Text>
          <TouchableOpacity
            style={styles.feedReportButton}
            onPress={() => openReportModal(item)}
          > 
            <Text style={styles.feedReportButtonText}>Report Post</Text>
        </TouchableOpacity>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate('Post', { item })}>
          <View style={styles.content}>
            <View>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.details}>Skill Level: {item.skillLevel}</Text>
              <Text style={styles.details}>{item.details}</Text>
              <Text style={styles.details}>Location: {item.location}</Text>
              <Text style={styles.details}>Additional Info: {item.additionalInfo}</Text>
              <View style={styles.stats}>
                <Text>{item.comments} Comments</Text>
              </View>
              <View style={styles.stats}>
                <Text>{item.joined} Players Joined </Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>
        <View style={styles.footer}>
          <TouchableOpacity
            style={
              userData && isEventJoined(userData, item.id) ? styles.joinedButton : styles.joinButton
            }
            onPress={() => handleJoinToggle(item)}>
            <Text
              style={
                userData && isEventJoined(userData, item.id)
                  ? styles.joinedButtonText
                  : styles.joinedButtonText
              }>
              {userData && isEventJoined(userData, item.id) ? 'Joined' : 'Join'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <>
      <FlatList
        data={sortedData}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ flexGrow: 1 }} // Ensure the FlatList container takes up full height
        style={{ flex: 1 }} // Make sure the FlatList itself expands to fill available space
      />
      <ReportModal
        isReportModalVisible={isReportModalVisible}
        setIsReportModalVisible={setIsReportModalVisible}
        handleReportSubmit={handleReportSubmit}
      />
    </>
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
      }}>
      <Tab.Screen name="DAWGIN'" component={FeedComponent} />
      <Tab.Screen name="NEW" component={FeedComponent} />
    </Tab.Navigator>
  );
};

// PostScreen Component
const PostScreen = ({ route }) => {
  const { item } = route.params;
  const [newComment, setNewComment] = useState('');
  const { addGroup, removeGroup } = useGroupsJoined();
  const { updateEvent, events } = useEventData();
  const { userData, updateUserData, sunetID } = useUserData();
  const currentEvent = events.find((event) => event.id === item.id) || item;
  const data = useMemo(() => currentEvent.commentArray, [currentEvent.commentArray]);

  const [isReportModalVisible, setIsReportModalVisible] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);

  const handleAddComment = () => {
    if (newComment.trim()) {
      const newCommentData = {
        username: sunetID,
        time: Date.now().toString(),
        text: newComment,
      };
      currentEvent.commentArray.push(newCommentData);
      currentEvent.comments += 1;
      updateEvent(currentEvent);
      updateEventInDatabase(currentEvent);
      setNewComment('');
    }
  };

  const handleJoinToggle = (item) => {
    if (!userData) return;
    const isJoined = isEventJoined(userData, item.id);
    const updatedEvent = {
      ...item,
      joined: isJoined ? item.joined - 1 : item.joined + 1,
    };
    updateEvent(updatedEvent);
    updateEventInDatabase(updatedEvent);
    const updatedUserData = {
      ...userData,
      joinedEvents: isJoined
        ? userData.joinedEvents.filter((eventId) => eventId !== item.id)
        : [...userData.joinedEvents, item.id],
    };
    updateUserData(updatedUserData);
    databaseUserUpdate(updatedUserData, sunetID);
    if (isJoined) {
      removeGroup(updatedEvent);
    } else {
      addGroup(updatedEvent);
    }
  };

  const handleReportSubmit = () => {
    console.log('Report submitted for:', selectedPost);
    setIsReportModalVisible(false);
  };

  const openReportModal = (post) => {
    setSelectedPost(post);
    setIsReportModalVisible(true);
  };

  const renderComment = ({ item }) => {
    const formattedTime = new Date(parseInt(item.time)).toLocaleString();
    return (
      <View style={styles.commentContainer}>
        <Text style={styles.commentText}>
          <Text style={{ fontWeight: 'bold' }}>{item.username}</Text> {formattedTime}
        </Text>
        <Text style={styles.commentText}>{item.text}</Text>
        <TouchableOpacity
          style={styles.reportButton}
          onPress={() => openReportModal(item)}
        >
          <Text style={styles.reportButtonText}>Report Comment</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <ScrollView contentContainerStyle={{ padding: 20 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
        <View>
          <Text style={{ fontWeight: 'bold' }}>{item.username}</Text>
        </View>
      </View>
      <Text style={styles.postHeader}>{item.title}</Text>
      <Text style={styles.postDetail}>{item.details}</Text>
      <Text style={styles.postDetail}>Skill Level: {item.skillLevel}</Text>
      <Text style={styles.postDetail}>{item.details}</Text>
      <Text style={styles.postDetail}>Location: {item.location}</Text>
      <Text style={styles.postDetail}>Additional Info: {item.additionalInfo}</Text>
      <View style={styles.stats}>
        <Text>{item.joined} Players Joined</Text>
        <Text>{item.comments} Comments</Text>
      </View>
      <TouchableOpacity
        style={
          userData && isEventJoined(userData, currentEvent.id)
            ? styles.joinedButton
            : styles.joinButton
        }
        onPress={() => handleJoinToggle(currentEvent)}>
        <Text
          style={
            userData && isEventJoined(userData, currentEvent.id)
              ? styles.joinedButtonText
              : styles.joinedButtonText
          }>
          {userData && isEventJoined(userData, currentEvent.id) ? 'Joined' : 'Join'}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
          style={styles.reportButton}
          onPress={() => openReportModal(item)}
      > 
        <Text style={styles.reportButtonText}>Report Post</Text>
      </TouchableOpacity>
      <Text style={styles.commentsHeader}>Comments:</Text>
      <FlatList
        data={data}
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
      <ReportModal
        isReportModalVisible={isReportModalVisible}
        setIsReportModalVisible={setIsReportModalVisible}
        handleReportSubmit={handleReportSubmit}
      />
    </ScrollView>
  );
};

// Groups Joined Component
const GroupsJoined = ({ navigation }) => {
  const { groupsJoined, removeGroup } = useGroupsJoined();
  const { userData, updateUserData, sunetID } = useUserData();

  const handleLeaveGroup = async (item) => {
    removeGroup(item);
    const updatedUserData = {
      ...userData,
      joinedEvents: userData.joinedEvents.filter(eventId => eventId !== item.id),
    };
    updateUserData(updatedUserData);
    await databaseUserUpdate(updatedUserData, sunetID);
  };

  const renderItem = ({ item }) => {
    const formattedTime = new Date(parseInt(item.time)).toLocaleString();
    return (
      <TouchableOpacity onPress={() => navigation.navigate('ChatRoom', { item })}>
        <View style={styles.itemContainer}>
          <View style={styles.content}>
            <Text style={styles.username}>
              {item.username} - {formattedTime}
            </Text>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.details}>{item.details}</Text>
            <View style={styles.stats}>
              <Text>{item.joined} Players Joined </Text>
              <Text>{item.comments} Comments</Text>
            </View>
            <TouchableOpacity
              style={styles.smallLeaveButton} 
              onPress={() => handleLeaveGroup(item)}
            >
            <Text style={styles.smallLeaveButtonText}>Leave Group</Text>
          </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

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

const updateChatMessagesInDatabase = async (newMessage: chatMessage, eventId: string) => {
  try {
    const db = getFirestore(app);
    const chatRef = doc(db, 'Chat', eventId);
    const chatDoc = await getDoc(chatRef);

    if (chatDoc.exists()) {
      const chatData = chatDoc.data() as { messages: chatMessage[] };
      const updatedMessages: chatMessage[] = chatData.messages
        ? [...chatData.messages, newMessage]
        : [newMessage];
      await setDoc(chatRef, { messages: updatedMessages }, { merge: true });
    } else {
      await setDoc(chatRef, { messages: [newMessage] });
    }

    console.log('Chat messages updated successfully');
  } catch (error) {
    console.error('Error updating chat messages: ', error);
  }
};

const ChatRoom = ({ route, navigation}) => {
  const { item } = route.params;
  const { chatMessagesMap, addChatMessage } = useContext(chatMessagesMapContext);
  const { sunetID, userData, updateUserData } = useUserData();
  const messages = chatMessagesMap[item.id] || [];
  const [newMessage, setNewMessage] = useState('');
  const [isReportModalVisible, setIsReportModalVisible] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const { removeGroup } = useGroupsJoined();

  const handleSend = () => {
    if (newMessage.trim()) {
      const newMessageData = {
        text: newMessage,
        sender: sunetID,
        time: Date.now().toString(),
      };
      addChatMessage(newMessageData, item.id);
      updateChatMessagesInDatabase(newMessageData, item.id);
      setNewMessage('');
    }
  };

  const handleReportSubmit = () => {
    console.log('Report submitted for:', selectedPost);
    setIsReportModalVisible(false);
  };

  const openReportModal = (post) => {
    setSelectedPost(post);
    setIsReportModalVisible(true);
  };

  const handleLeaveGroup = async () => {
    removeGroup(item);
    const updatedUserData = {
      ...userData,
      joinedEvents: userData.joinedEvents.filter(eventId => eventId !== item.id)
    };
    updateUserData(updatedUserData);
    await databaseUserUpdate(updatedUserData, sunetID);
    navigation.navigate('Groups Joined');
  };

  const renderMessage = ({ item }) => {
    const formattedTime = new Date(parseInt(item.time)).toLocaleString();
    return (
      <View
        style={[
          styles.chatBubble,
          item.sender === sunetID ? styles.chatBubbleRight : styles.chatBubbleLeft,
        ]}>
        <Text
          style={item.sender === sunetID ? styles.chatBubbleTextRight : styles.chatBubbleTextLeft}>
          {item.text}
        </Text>
        <Text style={{ fontSize: 10, color: 'gray', marginTop: 5 }}>{formattedTime}</Text>
        <Text style={{ fontSize: 10, color: 'gray', marginTop: 5 }}>{item.sender}</Text>
      </View>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.chatHeader}>
        <TouchableOpacity style={styles.leaveButton} onPress={handleLeaveGroup}>
          <Text style={styles.leaveButtonText}>Leave Group</Text>
        </TouchableOpacity>
        <TouchableOpacity
            style={styles.reportChatButton}
            onPress={() => openReportModal(item)}
        > 
          <Text style={styles.reportChatButtonText}>Report Chatroom</Text>
        </TouchableOpacity>
      </View>
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
      <ReportModal
        isReportModalVisible={isReportModalVisible}
        setIsReportModalVisible={setIsReportModalVisible}
        handleReportSubmit={handleReportSubmit}
      />
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
  const { sunetID } = useUserData();

  const { addEvent } = useEventData();

  const handleSubmit = () => {
    console.log(sunetID);
    const newEvent = {
      id: uuidv4(),
      username: sunetID,
      time: Date.now().toString(),
      title,
      details: `${sport} at ${time}`,
      joined: 0,
      comments: 0,
      skillLevel,
      location,
      additionalInfo,
      commentArray: [],
    };
    addEvent(newEvent);
    updateEventInDatabase(newEvent);
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
          placeholder="Enter the activity"
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

const fetchUserData = async (userId: string): Promise<UserData | null> => {
  const db = getFirestore(app);
  if (!userId) return null;
  const userRef = doc(db, 'Users', userId);
  try {
    const docSnap = await getDoc(userRef);
    if (docSnap.exists()) {
      const data = docSnap.data() as UserData;
      console.log('User data fetched:', data);
      return data;
    } else {
      const newUser: UserData = {
        Bio: '',
        Name: '',
        advancedInterests: [],
        beginnerInterests: [],
        intermediateInterests: [],
        pronouns: '',
        joinedEvents: [],
        hasAcceptedRules: false
      };
      await setDoc(userRef, newUser);
      console.log('New user created:', newUser);
      return newUser;
    }
  } catch (error) {
    console.log('Error getting document:', error);
    return null;
  }
};

const databaseUserUpdate = async (newUserData: UserData, sunetID: string) => {
  const db = getFirestore(app);
  if (!sunetID) return;
  const userRef = doc(db, 'Users', sunetID);
  try {
    await setDoc(userRef, newUserData, { merge: true });
  } catch (error) {
    console.log('Error updating document:', error);
  }
};

const fetchAllEvents = async (): Promise<Event[]> => {
  const db = getFirestore(app);
  const eventsCollection = collection(db, 'Events');
  try {
    const querySnapshot = await getDocs(eventsCollection);
    const eventsList: Event[] = [];
    querySnapshot.forEach((doc) => {
      const { id, ...eventData } = doc.data() as Event;
      eventsList.push({ id: doc.id, ...eventData });
    });
    return eventsList;
  } catch (error) {
    console.log('Error fetching events:', error);
    return [];
  }
};

const fetchAllChats = async (): Promise<{ [key: string]: chatMessage[] }> => {
  const db = getFirestore(app);
  const chatsCollection = collection(db, 'Chat');
  try {
    const querySnapshot = await getDocs(chatsCollection);
    const chatsMap: { [key: string]: chatMessage[] } = {};
    querySnapshot.forEach((doc) => {
      const chatData = doc.data();
      if (chatData.messages) {
        chatsMap[doc.id] = chatData.messages as chatMessage[];
      }
    });
    return chatsMap;
  } catch (error) {
    console.log('Error fetching chats:', error);
    return {};
  }
};

// LoginScreen Component
const LoginScreen = ({ navigation }) => {
  const { signIn } = useAuth();
  const [value, setValue] = useState('');
  const { updateUserData, updateSunetID } = useUserData();
  const { setBatchEvents } = useEventData();
  const { groupsJoined, updateGroup } = useGroupsJoined();
  const { chatMessagesMap, setBatchChatMessages } = useChatMessages();

  const handleSignInWithGoogle = async () => {
    const signInResult = await signIn();
    if (signInResult) {
      const user = auth.currentUser;
      if (user) {
        const email = user.email;
        if (email && email.endsWith('@stanford.edu')) {
          const sunetID = email.split('@')[0];

          const returnUser = await fetchUserData(user.uid);
          if (returnUser) {
            console.log(returnUser);
            updateUserData(returnUser);
            updateSunetID(sunetID);
            const allEvents = await fetchAllEvents();
            const joinedEventIds = returnUser.joinedEvents;
            const joinedEvents = allEvents.filter((event) => joinedEventIds.includes(event.id));
            const allChats = await fetchAllChats();
            updateGroup(joinedEvents);
            setBatchEvents(allEvents);
            setBatchChatMessages(allChats);
            navigation.navigate('Main');
          } else {
            console.log('Failed to fetch user data');
            Alert.alert('Error', 'Failed to fetch user data.');
          }
        } else {
          console.log('Non-Stanford email used');
          Alert.alert('Error', 'Please use a Stanford email to log in.');
          await auth.signOut();
        }
      }
    } else {
      Alert.alert('Error', 'Google sign-in failed.');
    }
  };

  useEffect(() => {
    const email = localStorage.getItem('email');
    if (email) {
      setValue(email);
    }
  }, []);

  return (
    <View style={[styles.flex1, styles.centeredContainer]}>

      <TouchableOpacity style={styles.loginButton} onPress={handleSignInWithGoogle}>
        <Text style={styles.loginButtonText}>Login</Text>
      </TouchableOpacity>
      <Text style={styles.disclaimerText}>
        Login to create a new account or login to existing account.
      </Text>
      <Text style={styles.disclaimerText}>
        You must use a Stanford email (@stanford.edu) to login.
      </Text>
    </View>
  );
};

// HomeScreen Component
const HomeScreen = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');

  // Rules
  const [isModalVisible, setIsModalVisible] = useState(false);
  const { userData, updateUserData, sunetID } = useUserData();

  console.log('Home');
  const insets = useSafeAreaInsets();

  // Rules
  useEffect(() => {
    if (userData && userData.hasAcceptedRules === false) {
      setIsModalVisible(true);
    }
  }, [userData]);


  const handleSearchChange = (text) => {
    setSearchQuery(text);
  };

  // Rules
  const handleAcceptRules = () => {
    if (userData) {
      const updatedUserData = {
        ...userData,
        hasAcceptedRules: true,
      };
      updateUserData(updatedUserData);
      databaseUserUpdate(updatedUserData, sunetID);
      setIsModalVisible(false);
    }
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
      <Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={() => {
          setIsModalVisible(!isModalVisible);
        }}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalText}>Rules and Guidelines</Text>
            <Text style={styles.rulesText}>
              1. Be respectful to other members at all times. {'\n'}
              2. No spamming, discrimination, or harassment.{'\n'}
              3. Follow the event guidelines and instructions.{'\n'}
              4. Engage positively and constructively.{'\n'}
              5. Report any inappropriate behavior to moderators. 
            </Text>
            <TouchableOpacity
              style={[styles.button, styles.buttonClose]}
              onPress={handleAcceptRules}
            >
              <Text style={styles.textStyle}>Accept</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

// ProfileScreen Component
const ProfileScreen = ({ navigation }) => {
  const { userData, sunetID, updateUserData } = useUserData();
  console.log('profile');
  console.log(userData);
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('');
  const [sunetIDState, setSunetIDState] = useState('');
  const [pronouns, setPronouns] = useState('');
  const [bio, setBio] = useState('');
  const [beginnerInterests, setBeginnerInterests] = useState<string[]>([]);
  const [intermediateInterests, setIntermediateInterests] = useState<string[]>([]);
  const [advancedInterests, setAdvancedInterests] = useState<string[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const { signOut } = useAuth();
  useEffect(() => {
    if (userData) {
      setName(userData.Name || '');
      setPronouns(userData.pronouns || '');
      setBio(userData.Bio || '');
      setBeginnerInterests(userData.beginnerInterests || []);
      setIntermediateInterests(userData.intermediateInterests || []);
      setAdvancedInterests(userData.advancedInterests || []);
      setSunetIDState(sunetID);
    } else {
      console.log('no user data');
    }
  }, [userData, sunetID]);

  const handleSave = () => {
    const newUserData = {
      Name: name,
      pronouns: pronouns,
      Bio: bio,
      beginnerInterests: beginnerInterests,
      intermediateInterests: intermediateInterests,
      advancedInterests: advancedInterests,
      joinedEvents: userData?.joinedEvents || [],
      hasAcceptedRules: true
    };
    updateUserData(newUserData);
    databaseUserUpdate(newUserData, sunetID);
    setIsEditing(false);
  };

  return (
    <ScrollView contentContainerStyle={{ padding: 20 }}>
      <TouchableOpacity></TouchableOpacity>
      <View style={styles.infoContainer}>
        <Text style={styles.infoLabel}>Name</Text>
        {isEditing ? (
          <TextInput style={styles.infoText} value={name} onChangeText={setName} />
        ) : (
          <Text style={styles.infoText}>{name}</Text>
        )}
      </View>
      <View style={styles.infoContainer}>
        <Text style={styles.infoLabel}>Pronouns</Text>
        {isEditing ? (
          <TextInput style={styles.infoText} value={pronouns} onChangeText={setPronouns} />
        ) : (
          <Text style={styles.infoText}>{pronouns}</Text>
        )}
      </View>
      <View style={styles.infoContainer}>
        <Text style={styles.infoLabel}>SUNet ID</Text>
        <Text style={styles.infoText}>{sunetIDState}</Text>
      </View>
      <View style={styles.infoContainer}>
        <Text style={styles.infoLabel}>Bio</Text>
        {isEditing ? (
          <TextInput style={styles.infoText} value={bio} onChangeText={setBio} />
        ) : (
          <Text style={styles.infoText}>{bio}</Text>
        )}
      </View>
      <View style={styles.interestsContainer}>
        <Text style={styles.interestsTitle}>Interests & Skill Levels (Comma seperated)</Text>
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
                <Text key={index} style={styles.interestsText}>
                  {interest}
                </Text>
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
                <Text key={index} style={styles.interestsText}>
                  {interest}
                </Text>
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
                <Text key={index} style={styles.interestsText}>
                  {interest}
                </Text>
              ))
            )}
          </View>
        </View>
      </View>
      <TouchableOpacity
        style={styles.editProfileButton}
        onPress={() => (isEditing ? handleSave() : setIsEditing(true))}>
        <Text style={styles.editProfileButtonText}>{isEditing ? 'Save' : 'Edit'}</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.rulesButton}
        onPress={() => setIsModalVisible(true)}
      >
        <Text style={styles.rulesButtonText}>Rules</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.signOutButton}
        onPress={() => {
          signOut();
          navigation.replace('Login');
        }}>
        <Text style={styles.signOutButtonText}>Sign Out</Text>
      </TouchableOpacity>
      <Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={() => {
          setIsModalVisible(!isModalVisible);
        }}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalText}>Rules and Guidelines</Text>
            <Text style={styles.rulesText}>
              1. Be respectful to other members at all times.{'\n'}
              2. No spamming, discrimination, or harassment.{'\n'}
              3. Follow the event guidelines and instructions.{'\n'}
              4. Engage positively and constructively.{'\n'}
              5. Report any inappropriate behavior to moderators.
            </Text>
            <TouchableOpacity
              style={[styles.button, styles.buttonClose]}
              onPress={() => setIsModalVisible(false)}
            >
              <Text style={styles.textStyle}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
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
      })}>
      <BottomTabs.Screen name="Home" component={HomeScreen} />
      <BottomTabs.Screen name="Groups Joined" component={GroupsJoined} />
      <BottomTabs.Screen name="Profile" component={ProfileScreen} />
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
            <Stack.Screen
              name="NewPost"
              component={NewPostScreen}
              options={{ title: 'New Post' }}
            />
            <Stack.Screen
              name="ChatRoom"
              component={ChatRoom}
              options={({ route }) => ({ title: route.params.item.title })}
            />
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
  disclaimerText: {
    marginTop: 20,
    color: 'grey',
    textAlign: 'center',
    fontSize: 14,
  },
  itemContainer: {
    padding: 10,
    marginBottom: 10,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
    justifyContent: 'space-between', // Ensure space between elements
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  username: {
    fontWeight: 'bold',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  content: {
    flex: 1,
    marginVertical: 10, 
  },
  username: {
    fontWeight: 'bold',
  },
  title: {
    fontSize: 16,
    marginTop: 2,
  },
  details: {
    fontSize: 14,
    color: 'gray',
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
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
    paddingHorizontal: 20,
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
    paddingBottom: 10,
  },
  tab: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  activeTab: {
    borderBottomWidth: 3,
    borderBottomColor: 'orange',
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
    flex: 1,
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
    textAlign: 'center',
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
  }, // Rules
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  button: {
    borderRadius: 20,
    padding: 10,
    elevation: 2,
  },
  buttonClose: {
    backgroundColor: 'orange',
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 18,
  },
  rulesText: {
    marginBottom: 20,
    textAlign: 'left',
  },
  rulesButton: {
    backgroundColor: 'orange',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignSelf: 'center',
    marginTop: 20,
  },
  rulesButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  reportButton: {
    backgroundColor: '#ff9999', // Softer red color
    borderRadius: 10,
    paddingVertical: 5,
    paddingHorizontal: 10,
    alignSelf: 'flex-end',
    marginVertical: 5,
  },
  reportButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  picker: {
    width: '100%',
    height: 35,
    marginBottom: 20,
  },
  labelText: {
    alignSelf: 'flex-start',
    fontWeight: 'bold',
    marginBottom: 5,
  },
  additionalInfoInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    width: '100%',
    marginBottom: 20,
    textAlignVertical: 'top',
  },
  feedReportButton: {
    backgroundColor: '#ff9999', // Softer red color
    borderRadius: 10,
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  feedReportButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 10,
  },
  reportChatButton: {
    backgroundColor: '#ff9999', // Softer red color
    borderRadius: 10,
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  reportChatButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  leaveButton: {
    backgroundColor: 'lightgray',
    borderRadius: 10,
    paddingVertical: 5,
    paddingHorizontal: 10,
    marginRight: 10,
  },
  leaveButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  smallLeaveButton: {
    backgroundColor: 'lightgray',
    borderRadius: 10,
    paddingVertical: 5,
    paddingHorizontal: 10,
    marginTop: 10,
    width: 120,
  },
  smallLeaveButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
    textAlign: 'center',
  },
});


