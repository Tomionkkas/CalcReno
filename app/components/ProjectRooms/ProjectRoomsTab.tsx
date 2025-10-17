import React, { useState, useEffect } from "react";
import { View, ScrollView, Alert, Platform } from "react-native";
import { Project, Room } from "../../utils/storage";
import { useRoomAnimations, getAnimationInterpolations, createStaggeredRoomAnimations } from "./utils/roomAnimations";
import { 
  getRoomDisplayData, 
  getProjectProgress, 
  getProjectStatus,
  sortRoomsByStatus 
} from "./utils/roomCalculations";
import RoomsHeader from "./components/RoomsHeader";
import AddRoomButton from "./components/AddRoomButton";
import EmptyState from "./components/EmptyState";
import RoomCard from "./RoomCard/RoomCard";

interface ProjectRoomsTabProps {
  project: Project;
  onAddRoom: () => void;
  onEditRoom: (roomId: string) => void;
  onDeleteRoom: (roomId: string) => void;
  onRoomPress: (roomId: string) => void;
  onCalculateRoom: (roomId: string) => void;
}

export default function ProjectRoomsTab({ 
  project, 
  onAddRoom, 
  onEditRoom, 
  onDeleteRoom, 
  onRoomPress,
  onCalculateRoom
}: ProjectRoomsTabProps) {
  const [roomDisplayData, setRoomDisplayData] = useState<ReturnType<typeof getRoomDisplayData>[]>([]);
  
  // Android-specific force re-render state
  const [androidForceUpdate, setAndroidForceUpdate] = useState(0);
  
  // Android-specific: Disable animations that might cause rendering issues
  const animations = useRoomAnimations();
  const interpolations = getAnimationInterpolations(animations);
  
  const { startStaggeredAnimations, getRoomAnimationInterpolations } = createStaggeredRoomAnimations(project.rooms.length);

  // Initialize room display data with Android-specific handling
  useEffect(() => {
    console.log("ProjectRoomsTab: Updating room display data", {
      platform: Platform.OS,
      roomsCount: project.rooms.length,
      roomIds: project.rooms.map(r => r.id)
    });

    const sortedRooms = sortRoomsByStatus(project.rooms);
    const displayData = sortedRooms.map(room => getRoomDisplayData(room));
    
    setRoomDisplayData(displayData);
    
    // Android-specific: Force re-render after state update
    if (Platform.OS === 'android') {
      setTimeout(() => {
        setAndroidForceUpdate(prev => prev + 1);
        console.log("ProjectRoomsTab: Android force update triggered");
      }, 50);
    }
  }, [project.rooms]);

  // Start staggered animations when rooms change (disabled for Android)
  useEffect(() => {
    if (roomDisplayData.length > 0 && Platform.OS !== 'android') {
      startStaggeredAnimations();
    }
  }, [roomDisplayData.length, androidForceUpdate]);

  const projectProgress = getProjectProgress(project.rooms);
  const projectStatus = getProjectStatus(project.rooms);

  const handleDeleteRoom = (roomId: string) => {
    const room = project.rooms.find(r => r.id === roomId);
    if (!room) return;

    Alert.alert(
      "Usuń pomieszczenie",
      `Czy na pewno chcesz usunąć pomieszczenie "${room.name}"?`,
      [
        { text: "Anuluj", style: "cancel" },
        { text: "Usuń", style: "destructive", onPress: () => onDeleteRoom(roomId) },
      ]
    );
  };

  // Enhanced key generation for Android
  const getRoomKey = (room: ReturnType<typeof getRoomDisplayData>, index: number) => {
    if (Platform.OS === 'android') {
      return `${room.id}-${androidForceUpdate}-${index}`;
    }
    return room.id;
  };

  // Android-specific: Get animation interpolations (disabled for Android)
  const getRoomAnimations = (index: number) => {
    if (Platform.OS === 'android') {
      return undefined; // Disable animations on Android
    }
    return getRoomAnimationInterpolations(index);
  };

  return (
    <ScrollView 
      style={{ flex: 1 }} 
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ padding: 20 }}
      // Android-specific: Force re-render on scroll
      key={Platform.OS === 'android' ? `scrollview-${androidForceUpdate}` : undefined}
      // Android-specific: Disable scroll optimization
      removeClippedSubviews={Platform.OS === 'android' ? false : true}
    >
      {/* Header */}
      <RoomsHeader 
        key={Platform.OS === 'android' ? `header-${androidForceUpdate}` : undefined}
        roomCount={project.rooms.length}
        projectProgress={projectProgress}
        projectStatus={projectStatus}
        animations={Platform.OS === 'android' ? undefined : {
          headerTranslateY: interpolations.headerTranslateY,
          headerOpacity: interpolations.headerOpacity,
        }}
      />

      {/* Rooms List */}
      {roomDisplayData.length > 0 ? (
        <View 
          key={Platform.OS === 'android' ? `rooms-container-${androidForceUpdate}` : undefined}
          style={Platform.OS === 'android' ? { minHeight: 1 } : undefined} // Force layout on Android
        >
          {roomDisplayData.map((room, index) => (
            <View 
              key={getRoomKey(room, index)}
              style={Platform.OS === 'android' ? { 
                opacity: 1, 
                minHeight: 1,
                marginBottom: 16 
              } : undefined}
            >
              <RoomCard
                key={`room-card-${getRoomKey(room, index)}`}
                room={room}
                onEdit={onEditRoom}
                onDelete={handleDeleteRoom}
                onPress={onRoomPress}
                onCalculate={onCalculateRoom}
                animations={getRoomAnimations(index)}
              />
            </View>
          ))}
        </View>
      ) : (
        <EmptyState 
          key={Platform.OS === 'android' ? `empty-state-${androidForceUpdate}` : undefined}
          animations={Platform.OS === 'android' ? undefined : {
            roomsTranslateY: interpolations.roomsTranslateY,
            roomsOpacity: interpolations.roomsOpacity,
          }}
        />
      )}

      {/* Add Room Button */}
      <AddRoomButton 
        key={Platform.OS === 'android' ? `add-button-${androidForceUpdate}` : undefined}
        onPress={onAddRoom}
        animations={Platform.OS === 'android' ? undefined : {
          addButtonScale: interpolations.addButtonScale,
          addButtonOpacity: interpolations.addButtonOpacity,
        }}
      />
    </ScrollView>
  );
}
