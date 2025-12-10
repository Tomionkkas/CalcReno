import React, { useState, useEffect } from "react";
import { View, ScrollView, Platform } from "react-native";
import { Project, Room } from "../../utils/storage";
import { useRoomAnimations, getAnimationInterpolations, createStaggeredRoomAnimations } from "./utils/roomAnimations";
import { 
  getRoomDisplayData, 
  getProjectProgress,
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
  // Initialize roomDisplayData immediately to prevent empty state flash
  const [roomDisplayData, setRoomDisplayData] = useState<ReturnType<typeof getRoomDisplayData>[]>(() => {
    const sortedRooms = sortRoomsByStatus(project.rooms);
    return sortedRooms.map(room => getRoomDisplayData(room));
  });
  
  // Force re-render state (needed for both Android and iOS to ensure list updates)
  const [forceUpdate, setForceUpdate] = useState(0);
  
  // Animations (disabled for Android due to rendering issues)
  const animations = useRoomAnimations();
  const interpolations = getAnimationInterpolations(animations);
  
  const { startStaggeredAnimations, getRoomAnimationInterpolations } = createStaggeredRoomAnimations(project.rooms.length);

  // Initialize room display data with cross-platform handling
  useEffect(() => {
    console.log("ProjectRoomsTab: Updating room display data", {
      platform: Platform.OS,
      roomsCount: project.rooms.length,
      roomIds: project.rooms.map(r => r.id)
    });

    const sortedRooms = sortRoomsByStatus(project.rooms);
    const displayData = sortedRooms.map(room => getRoomDisplayData(room));
    
    setRoomDisplayData(displayData);
    
    // Force re-render after state update (both Android and iOS)
    setTimeout(() => {
      setForceUpdate(prev => prev + 1);
      console.log(`ProjectRoomsTab: ${Platform.OS} force update triggered`);
    }, Platform.OS === 'ios' ? 100 : 50); // iOS needs more time
  }, [project.rooms]);

  // Animations disabled - rooms appear immediately without fade-in
  // useEffect(() => {
  //   if (roomDisplayData.length > 0 && Platform.OS !== 'android') {
  //     startStaggeredAnimations();
  //   }
  // }, [roomDisplayData.length, forceUpdate]);

  const projectProgress = getProjectProgress(project.rooms);
  // Use actual project status instead of calculating from rooms
  const projectStatus = project.status;

  const handleDeleteRoom = (roomId: string) => {
    // No need for double confirmation - useProjectData.tsx already shows styled confirmation modal
    onDeleteRoom(roomId);
  };

  // Enhanced key generation for better list updates
  const getRoomKey = (room: ReturnType<typeof getRoomDisplayData>, index: number) => {
    // Include forceUpdate in key to trigger re-renders when needed
    return `${room.id}-${forceUpdate}-${index}`;
  };

  // Get animation interpolations (disabled for all platforms to ensure immediate visibility)
  const getRoomAnimations = (index: number) => {
    // Disable animations on both platforms to prevent invisible rooms
    return undefined;
  };

  return (
    <ScrollView 
      style={{ flex: 1 }} 
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ padding: 20, minHeight: 1 }}
      // Force re-render on scroll for better update reliability
      key={`scrollview-${forceUpdate}`}
      // CRITICAL FIX: Disable removeClippedSubviews on all platforms to prevent iOS room culling
      removeClippedSubviews={false}
    >
      {/* Header */}
      <RoomsHeader 
        key={`header-${forceUpdate}`}
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
          key={`rooms-container-${forceUpdate}`}
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
          key={`empty-state-${forceUpdate}`}
          animations={Platform.OS === 'android' ? undefined : {
            roomsTranslateY: interpolations.roomsTranslateY,
            roomsOpacity: interpolations.roomsOpacity,
          }}
        />
      )}

      {/* Add Room Button */}
      <AddRoomButton 
        key={`add-button-${forceUpdate}`}
        onPress={onAddRoom}
        animations={Platform.OS === 'android' ? undefined : {
          addButtonScale: interpolations.addButtonScale,
          addButtonOpacity: interpolations.addButtonOpacity,
        }}
      />
    </ScrollView>
  );
}
