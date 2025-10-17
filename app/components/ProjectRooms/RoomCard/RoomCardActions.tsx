import React from "react";
import { View, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Edit, Trash2, Calculator } from "lucide-react-native";
import { colors, gradients, spacing, borderRadius, shadows } from "../../../utils/theme";
import { RoomDisplayData } from "../utils/roomCalculations";

interface RoomCardActionsProps {
  room: RoomDisplayData;
  onEdit: () => void;
  onDelete: () => void;
  onCalculate: () => void;
}

export default function RoomCardActions({ room, onEdit, onDelete, onCalculate }: RoomCardActionsProps) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: spacing.sm }}>
      {/* Calculate Costs Button */}
      <TouchableOpacity onPress={onCalculate} activeOpacity={0.8}>
        <LinearGradient
          colors={gradients.success.colors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            borderRadius: borderRadius.md,
            padding: spacing.sm,
            ...shadows.sm,
          }}
        >
          <Calculator size={16} color={colors.text.primary} />
        </LinearGradient>
      </TouchableOpacity>
      
      {/* Edit Button */}
      <TouchableOpacity onPress={onEdit} activeOpacity={0.8}>
        <LinearGradient
          colors={gradients.primary.colors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            borderRadius: borderRadius.md,
            padding: spacing.sm,
            ...shadows.sm,
          }}
        >
          <Edit size={16} color={colors.text.primary} />
        </LinearGradient>
      </TouchableOpacity>
      
      {/* Delete Button */}
      <TouchableOpacity onPress={onDelete} activeOpacity={0.8}>
        <LinearGradient
          colors={['#ef4444', '#dc2626']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            borderRadius: borderRadius.md,
            padding: spacing.sm,
            ...shadows.sm,
          }}
        >
          <Trash2 size={16} color="white" />
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}
