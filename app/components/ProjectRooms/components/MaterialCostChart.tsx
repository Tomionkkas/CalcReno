import React from "react";
import { View, Text, TouchableOpacity, Dimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { PieChart } from "react-native-chart-kit";
import { colors, typography, spacing, borderRadius, shadows } from "../../../utils/theme";

interface MaterialCostData {
  name: string;
  cost: number;
  color: string;
  percentage: number;
}

interface MaterialCostChartProps {
  materials: MaterialCostData[];
  totalCost: number;
  onMaterialPress?: (material: MaterialCostData) => void;
}

export default function MaterialCostChart({ 
  materials, 
  totalCost, 
  onMaterialPress 
}: MaterialCostChartProps) {
  if (materials.length === 0) {
    return (
      <View style={{ alignItems: 'center', padding: spacing.md }}>
        <Text
          style={{
            color: colors.text.tertiary,
            fontSize: typography.sizes.sm,
            fontFamily: typography.fonts.primary,
            textAlign: 'center',
          }}
        >
          Brak danych o materiałach
        </Text>
      </View>
    );
  }

  const chartData = materials.map((material, index) => ({
    name: material.name,
    population: material.cost,
    color: material.color,
    legendFontColor: colors.text.primary,
    legendFontSize: 10,
  }));

  const screenWidth = Dimensions.get('window').width;
  const chartWidth = Math.min(screenWidth - 40, 200);

  // Ensure we have valid chart data
  const validChartData = chartData.filter(item => 
    item.population > 0 && 
    item.color && 
    typeof item.color === 'string'
  );

  return (
    <View style={{ marginVertical: spacing.sm }}>
      <Text
        style={{
          color: colors.text.primary,
          fontSize: typography.sizes.sm,
          fontWeight: 600,
          fontFamily: typography.fonts.primary,
          marginBottom: spacing.sm,
        }}
      >
        Podział kosztów materiałów
      </Text>
      
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        {/* Pie Chart */}
        <View style={{ marginRight: spacing.md }}>
          {validChartData.length > 0 ? (
            <PieChart
              data={validChartData}
              width={chartWidth}
              height={120}
              chartConfig={{
                backgroundColor: 'transparent',
                backgroundGradientFrom: 'transparent',
                backgroundGradientTo: 'transparent',
                color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
              }}
              accessor="population"
              backgroundColor="transparent"
              paddingLeft="0"
              absolute
            />
          ) : (
            <View style={{
              width: chartWidth,
              height: 120,
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              borderRadius: 60,
              justifyContent: 'center',
              alignItems: 'center',
            }}>
              <Text style={{
                color: colors.text.tertiary,
                fontSize: typography.sizes.xs,
                fontFamily: typography.fonts.primary,
                textAlign: 'center',
              }}>
                Brak danych
              </Text>
            </View>
          )}
        </View>
        
        {/* Legend */}
        <View style={{ flex: 1 }}>
          {materials.map((material, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => onMaterialPress?.(material)}
              activeOpacity={0.7}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: spacing.xs,
                padding: spacing.xs,
                borderRadius: borderRadius.sm,
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
              }}
            >
              <View
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: 6,
                  backgroundColor: material.color,
                  marginRight: spacing.xs,
                }}
              />
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    color: colors.text.primary,
                    fontSize: typography.sizes.xs,
                    fontFamily: typography.fonts.primary,
                    fontWeight: 500,
                  }}
                  numberOfLines={1}
                >
                  {material.name}
                </Text>
                <Text
                  style={{
                    color: colors.text.secondary,
                    fontSize: typography.sizes.xs,
                    fontFamily: typography.fonts.primary,
                  }}
                >
                  {material.cost.toFixed(2)} zł ({material.percentage.toFixed(1)}%)
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      
      {/* Total Cost */}
      <View
        style={{
          marginTop: spacing.sm,
          padding: spacing.sm,
          borderRadius: borderRadius.md,
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          alignItems: 'center',
        }}
      >
        <Text
          style={{
            color: colors.text.primary,
            fontSize: typography.sizes.sm,
            fontFamily: typography.fonts.primary,
            fontWeight: 600,
          }}
        >
          Całkowity koszt: {totalCost.toFixed(2)} zł
        </Text>
      </View>
    </View>
  );
}

