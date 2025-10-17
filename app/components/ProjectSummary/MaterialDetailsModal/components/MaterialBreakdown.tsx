import React from "react";
import { View, Text, ScrollView } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { GlassmorphicView } from "../../../ui";
import { colors, gradients, typography, spacing, borderRadius, shadows } from "../../../../utils/theme";
import { materialCategories } from "../../utils/materialCalculations";

interface MaterialBreakdownProps {
  allMaterials: { [key: string]: number };
  roomMaterialNames: { [key: string]: string };
  roomMaterialUnits: { [key: string]: string };
}

export default function MaterialBreakdown({ 
  allMaterials, 
  roomMaterialNames, 
  roomMaterialUnits 
}: MaterialBreakdownProps) {
  return (
    <ScrollView 
      style={{ maxHeight: 300 }} 
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: spacing.md }}
    >
      {Object.entries(materialCategories).map(([category, materials]) => {
        const categoryMaterials = materials.filter(material => allMaterials[material]);
        
        if (categoryMaterials.length === 0) return null;
        
        return (
          <View key={category} style={{ marginBottom: spacing.lg }}>
            <Text
              style={{
                color: colors.text.primary,
                fontSize: typography.sizes.lg,
                fontWeight: 600,
                fontFamily: typography.fonts.primary,
                marginBottom: spacing.sm,
              }}
            >
              {category}
            </Text>
            
            {categoryMaterials.map((material) => (
              <GlassmorphicView 
                key={material} 
                intensity="light" 
                style={{ 
                  borderRadius: borderRadius.md, 
                  marginBottom: spacing.sm 
                }}
              >
                <View
                  style={{
                    borderRadius: borderRadius.md,
                    padding: spacing.md,
                    backgroundColor: colors.glass.background,
                    borderWidth: 1,
                    borderColor: colors.glass.border,
                  }}
                >
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text
                      style={{
                        color: colors.text.primary,
                        fontSize: typography.sizes.sm,
                        fontWeight: 500,
                        fontFamily: typography.fonts.primary,
                        flex: 1,
                      }}
                    >
                      {roomMaterialNames[material] || material}
                    </Text>
                    
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text
                        style={{
                          color: colors.text.primary,
                          fontSize: typography.sizes.sm,
                          fontWeight: 600,
                          fontFamily: typography.fonts.primary,
                        }}
                      >
                        {allMaterials[material]}
                      </Text>
                      
                      <Text
                        style={{
                          color: colors.text.tertiary,
                          fontSize: typography.sizes.xs,
                          fontFamily: typography.fonts.primary,
                        }}
                      >
                        {roomMaterialUnits[material] || 'szt'}
                      </Text>
                    </View>
                  </View>
                </View>
              </GlassmorphicView>
            ))}
          </View>
        );
      })}
    </ScrollView>
  );
}
