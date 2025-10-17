import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { spacing, borderRadius, colors, typography, shadows, gradients } from "../../../utils/theme";
import GlassmorphicView from "../../ui/GlassmorphicView";

interface RoomControlsProps {
  project: any;
  canvasRooms: any[];
  onAddRoomToCanvas: (room: any) => void;
  onClearCanvas: () => void;
  isCleanMode: boolean;
}

export default function RoomControls({
  project,
  canvasRooms,
  onAddRoomToCanvas,
  onClearCanvas,
  isCleanMode
}: RoomControlsProps) {
  return (
    <View style={{ marginBottom: spacing.lg }}>
      {/* Section Title */}
      <Text
        style={{
          color: colors.text.primary,
          fontSize: typography.sizes.lg,
          fontWeight: '600',
          fontFamily: typography.fonts.primary,
          marginBottom: spacing.md,
        }}
      >
        Dostępne pomieszczenia
      </Text>
      
      {/* Room Cards Container */}
      <View style={{ gap: spacing.sm }}>
        {project?.rooms.map((room: any) => {
          const isOnCanvas = canvasRooms.some((cr) => cr.id === room.id);
          const hasElements = room.elements && room.elements.length > 0;
          
          return (
            <TouchableOpacity
              key={room.id}
              onPress={() => !isOnCanvas && onAddRoomToCanvas(room)}
              disabled={isOnCanvas}
              activeOpacity={0.8}
            >
              <GlassmorphicView 
                intensity="light" 
                style={{
                  borderRadius: borderRadius.lg,
                  opacity: isOnCanvas ? 0.6 : 1,
                  ...shadows.md,
                }}
              >
                <LinearGradient
                  colors={isOnCanvas
                    ? [colors.glass.background, colors.glass.background]
                    : gradients.secondary.colors
                  }
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{
                    borderRadius: borderRadius.lg,
                    padding: spacing.md,
                    borderWidth: 1,
                    borderColor: isOnCanvas
                      ? colors.glass.border
                      : colors.glass.border,
                  }}
                >
                  <View style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}>
                    <View style={{ flex: 1 }}>
                      <Text style={{
                        color: colors.text.primary,
                        fontWeight: '600',
                        fontSize: typography.sizes.base,
                        fontFamily: typography.fonts.primary,
                        marginBottom: spacing.xs,
                      }}>
                        {room.name}
                      </Text>
                      <Text style={{
                        color: colors.text.tertiary,
                        fontSize: typography.sizes.sm,
                        fontFamily: typography.fonts.primary,
                        marginBottom: spacing.xs,
                      }}>
                        {room.shape === "rectangle" ? "Prostokąt" : "Kształt L"} • {" "}
                        {(room.dimensions.width / 100).toFixed(2)}m × {(room.dimensions.length / 100).toFixed(2)}m
                      </Text>
                      {hasElements && (
                        <View style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          marginTop: spacing.xs,
                        }}>
                          <View style={{
                            width: 6,
                            height: 6,
                            borderRadius: 3,
                            backgroundColor: colors.accent.blue,
                            marginRight: spacing.xs,
                          }} />
                          <Text style={{
                            color: colors.accent.blue,
                            fontSize: typography.sizes.xs,
                            fontWeight: '500',
                            fontFamily: typography.fonts.primary,
                          }}>
                            {room.elements!.filter((e: any) => e.type === "door").length} drzwi, {" "}
                            {room.elements!.filter((e: any) => e.type === "window").length} okien
                          </Text>
                        </View>
                      )}
                    </View>
                    <View style={{
                      backgroundColor: isOnCanvas
                        ? colors.glass.background
                        : colors.primary.start,
                      paddingHorizontal: spacing.sm,
                      paddingVertical: spacing.xs,
                      borderRadius: borderRadius.md,
                      borderWidth: 1,
                      borderColor: isOnCanvas
                        ? colors.glass.border
                        : colors.primary.end,
                      minWidth: 60,
                      alignItems: 'center',
                    }}>
                      <Text style={{
                        color: colors.text.primary,
                        fontSize: typography.sizes.xs,
                        fontWeight: '500',
                        fontFamily: typography.fonts.primary,
                      }}>
                        {isOnCanvas ? "Na planie" : "Dodaj"}
                      </Text>
                    </View>
                  </View>
                </LinearGradient>
              </GlassmorphicView>
            </TouchableOpacity>
          );
        })}
      </View>
      
      {/* Clear Canvas Button */}
      {canvasRooms.length > 0 && (
        <TouchableOpacity
          onPress={onClearCanvas}
          style={{
            marginTop: spacing.md,
          }}
          activeOpacity={0.8}
        >
          <GlassmorphicView intensity="medium" style={{
            borderRadius: borderRadius.lg,
            ...shadows.md,
          }}>
            <LinearGradient
              colors={[colors.status.error.start, colors.status.error.end]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{
                borderRadius: borderRadius.lg,
                padding: spacing.md,
                alignItems: "center",
                justifyContent: "center",
                minHeight: 44,
              }}
            >
              <Text style={{
                color: colors.text.primary,
                fontWeight: '600',
                fontSize: typography.sizes.base,
                fontFamily: typography.fonts.primary,
              }}>
                Wyczyść plan ({canvasRooms.length})
              </Text>
            </LinearGradient>
          </GlassmorphicView>
        </TouchableOpacity>
      )}
    </View>
  );
}
