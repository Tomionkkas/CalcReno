import React, { useState, useMemo, useCallback, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  Switch,
  TextInput,
  TouchableOpacity,
  Animated,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import {
  ChevronDown,
  ChevronUp,
  Calculator,
  Save,
  RefreshCw,
  Home,
  Wrench,
  Zap,
  DollarSign,
  Info,
  Layers,
} from "lucide-react-native";
import { 
  colors, 
  gradients, 
  typography, 
  spacing, 
  borderRadius, 
  shadows, 
  glassmorphism,
  animations 
} from "../utils/theme";
import { useMaterialPrices } from "../hooks/useMaterialPrices";
import { PricingTier } from "../utils/pricingSupabase";

interface MaterialCalculatorProps {
  roomDetails?: {
    shape: "rectangle" | "l-shape";
    length: number;
    width: number;
    height: number;
    length2?: number;
    width2?: number;
    corner?: "top-left" | "top-right" | "bottom-left" | "bottom-right";
    walls: { length: number }[];
    doors: { width: number; height: number }[];
    windows: { width: number; height: number }[];
  };
  onSave?: (calculations: any) => void;
}

const MaterialCalculator = ({
  roomDetails = {
    shape: "rectangle",
    length: 4,
    width: 3,
    height: 2.5,
    walls: [{ length: 4 }, { length: 3 }, { length: 4 }, { length: 3 }],
    doors: [{ width: 0.9, height: 2 }],
    windows: [{ width: 1.5, height: 1.2 }],
  },
  onSave = () => {},
}: MaterialCalculatorProps) => {
  const [expanded, setExpanded] = useState<{ [key: string]: boolean }>({
    floor: true,
    walls: true,
    ceiling: false,
    electrical: false,
  });

  const [useOsbFloor, setUseOsbFloor] = useState(false);
  const [useSuspendedCeiling, setUseSuspendedCeiling] = useState(false);
  const [socketsCount, setSocketsCount] = useState("4");
  const [switchesCount, setSwitchesCount] = useState("3");
  const [selectedTier, setSelectedTier] = useState<PricingTier>("mid_range");
  
  const { prices: fetchedPrices, loading: pricesLoading } = useMaterialPrices(selectedTier);

  const [costs, setCosts] = useState({
    floorPanels: 45, // zł/m²
    underlayment: 10, // zł/m²
    paint: 60, // zł/litr
    drywall: 40, // zł/płyta
    cwProfiles: 15, // zł/szt
    uwProfiles: 12, // zł/szt
    mineralWool: 50, // zł/paczka
    tnScrews: 20, // zł/opakowanie
    wallPlaster: 30, // zł/worek
    finishingPlaster: 35, // zł/worek
    osb: 60, // zł/płyta
    osbScrews: 15, // zł/opakowanie
    baseboards: 25, // zł/szt
    baseboardEnds: 8, // zł/szt
    cdProfiles: 18, // zł/szt
    udProfiles: 15, // zł/szt
    hangers: 2, // zł/szt
    gypsum: 40, // zł/płyta
    plaster: 30, // zł/worek
    sockets: 25, // zł/szt
    switches: 30, // zł/szt
    cable15: 5, // zł/m
    cable25: 7, // zł/m
    junctionBox: 5, // zł/szt
  });

  // Update costs when fetched prices change
  useEffect(() => {
    if (Object.keys(fetchedPrices).length > 0) {
      setCosts(prev => ({
        ...prev,
        ...fetchedPrices
      }));
    }
  }, [fetchedPrices]);

  const toggleSection = useCallback((section: string) => {
    setExpanded((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  }, []);

  // Helper functions for L-shape calculations
  const calculateFloorArea = useCallback(() => {
    if (roomDetails.shape === "l-shape") {
      const mainArea = roomDetails.length * roomDetails.width;
      const extensionArea = (roomDetails.length2 || 0) * (roomDetails.width2 || 0);
      return mainArea + extensionArea;
    }
    return roomDetails.length * roomDetails.width;
  }, [roomDetails]);

  const calculateRoomPerimeter = useCallback(() => {
    if (roomDetails.shape === "l-shape") {
      return roomDetails.walls.reduce((sum, wall) => sum + wall.length, 0);
    }
    return 2 * (roomDetails.length + roomDetails.width);
  }, [roomDetails]);

  const getCalculationSummary = useCallback(() => {
    const floorArea = calculateFloorArea();
    const perimeter = calculateRoomPerimeter();
    
    return {
      shape: roomDetails.shape,
      floorArea: floorArea.toFixed(2),
      perimeter: perimeter.toFixed(2),
      complexity: roomDetails.shape === "l-shape" ? "Wysoka (kształt L)" : "Standardowa (prostokąt)",
      wasteFactor: roomDetails.shape === "l-shape" ? "15% (dodatkowe odpady)" : "10% (standardowe odpady)",
    };
  }, [roomDetails, calculateFloorArea, calculateRoomPerimeter]);

  const calculateRequiredMaterials = useCallback(() => {
    const summary = getCalculationSummary();
    const floorArea = calculateFloorArea();
    const roomPerimeter = calculateRoomPerimeter();

    const totalDoorArea = roomDetails.doors.reduce(
      (sum, door) => sum + door.width * door.height,
      0,
    );

    const totalWindowArea = roomDetails.windows.reduce(
      (sum, window) => sum + window.width * window.height,
      0,
    );

    const grossWallArea = roomPerimeter * roomDetails.height;
    const netWallArea = grossWallArea - totalDoorArea - totalWindowArea;

    let materials: { [key: string]: number } = {};
    let totalCost = 0;

    const addMaterial = (key: string, amount: number) => {
      materials[key] = amount;
      totalCost += amount * (costs[key as keyof typeof costs] || 0);
    };

    const floorWasteFactor = roomDetails.shape === "l-shape" ? 1.15 : 1.1;
    addMaterial("floorPanels", Math.ceil(floorArea * floorWasteFactor));
    addMaterial("underlayment", Math.ceil(floorArea * floorWasteFactor));
    addMaterial("paint", Math.ceil(netWallArea * 0.25));
    
    const wallComplexityFactor = roomDetails.shape === "l-shape" ? 1.15 : 1.1;
    addMaterial("drywall", Math.ceil((netWallArea / 3.12) * wallComplexityFactor));
    addMaterial("cwProfiles", Math.ceil((roomPerimeter / 0.6) * wallComplexityFactor));
    addMaterial("uwProfiles", Math.ceil((roomPerimeter / 3) * wallComplexityFactor));
    addMaterial("mineralWool", Math.ceil(netWallArea / 5));
    addMaterial("tnScrews", Math.ceil(netWallArea / 10));
    addMaterial("wallPlaster", Math.ceil(netWallArea / 30));
    addMaterial("finishingPlaster", Math.ceil(netWallArea / 25));

    if (useOsbFloor) {
      addMaterial("osb", Math.ceil((floorArea * floorWasteFactor) / 3.125));
      addMaterial("osbScrews", Math.ceil((floorArea * floorWasteFactor) / 10));

      const doorWidthTotal = roomDetails.doors.reduce(
        (sum, door) => sum + door.width,
        0,
      );
      addMaterial(
        "baseboards",
        Math.ceil((roomPerimeter - doorWidthTotal) / 2.5),
      );

      const cornerCount = roomDetails.shape === "l-shape" ? 6 : 4;
      addMaterial("baseboardEnds", roomDetails.doors.length * 2 + cornerCount);
    }

    if (useSuspendedCeiling) {
      addMaterial("cdProfiles", Math.ceil(floorArea));
      addMaterial("udProfiles", Math.ceil(floorArea * 0.4));
      addMaterial("hangers", Math.ceil(floorArea * 4.5));
      addMaterial("gypsum", Math.ceil(floorArea / 2.4));
      addMaterial("plaster", Math.ceil(floorArea / 30));
    }

    const socketsCountNum = parseInt(socketsCount) || 0;
    const switchesCountNum = parseInt(switchesCount) || 0;

    const avgCableLength = roomDetails.shape === "l-shape" 
      ? Math.max(6, roomPerimeter * 0.4)
      : Math.max(5, roomPerimeter * 0.3);

    addMaterial("sockets", socketsCountNum);
    addMaterial("switches", switchesCountNum);
    addMaterial("cable15", Math.ceil(switchesCountNum * avgCableLength));
    addMaterial("cable25", Math.ceil(socketsCountNum * avgCableLength));
    addMaterial("junctionBox", Math.ceil(socketsCountNum + switchesCountNum));

    return { 
      materials, 
      totalCost, 
      floorArea, 
      netWallArea, 
      roomPerimeter,
      roomShape: roomDetails.shape,
      calculationSummary: summary,
      costs,
      materialNames: {
        floorPanels: "Panele podłogowe",
        underlayment: "Podkład pod panele",
        paint: "Farba",
        drywall: "Płyty GK ścienne",
        cwProfiles: "Profile CW",
        uwProfiles: "Profile UW",
        mineralWool: "Wełna mineralna",
        tnScrews: "Wkręty TN do GK",
        wallPlaster: "Gips szpachlowy ścienny",
        finishingPlaster: "Gładź szpachlowa",
        osb: "Płyta OSB",
        osbScrews: "Wkręty OSB",
        baseboards: "Listwy przypodłogowe",
        baseboardEnds: "Narożniki/zakończenia listew",
        cdProfiles: "Profile CD 60",
        udProfiles: "Profile UD 27",
        hangers: "Wieszaki ES",
        gypsum: "Płyty GK sufitowe",
        plaster: "Gips szpachlowy sufitowy",
        sockets: "Gniazdka",
        switches: "Włączniki",
        cable15: "Przewód YDY 3x1.5",
        cable25: "Przewód YDY 3x2.5",
        junctionBox: "Puszki podtynkowe",
      },
      materialUnits: {
        floorPanels: "m²",
        underlayment: "m²",
        paint: "l",
        drywall: "szt",
        cwProfiles: "szt",
        uwProfiles: "szt",
        mineralWool: "paczek",
        tnScrews: "opak",
        wallPlaster: "worków",
        finishingPlaster: "worków",
        osb: "szt",
        osbScrews: "opak",
        baseboards: "szt",
        baseboardEnds: "szt",
        cdProfiles: "szt",
        udProfiles: "szt",
        hangers: "szt",
        gypsum: "szt",
        plaster: "worków",
        sockets: "szt",
        switches: "szt",
        cable15: "m",
        cable25: "m",
        junctionBox: "szt",
      }
    };
  }, [roomDetails, costs, useOsbFloor, useSuspendedCeiling, socketsCount, switchesCount, getCalculationSummary, calculateFloorArea, calculateRoomPerimeter]);

  const result = calculateRequiredMaterials();

  const materialNames: { [key: string]: string } = {
    floorPanels: "Panele podłogowe",
    underlayment: "Podkład pod panele",
    paint: "Farba",
    drywall: "Płyty GK ścienne",
    cwProfiles: "Profile CW",
    uwProfiles: "Profile UW",
    mineralWool: "Wełna mineralna",
    tnScrews: "Wkręty TN do GK",
    wallPlaster: "Gips szpachlowy ścienny",
    finishingPlaster: "Gładź szpachlowa",
    osb: "Płyta OSB",
    osbScrews: "Wkręty OSB",
    baseboards: "Listwy przypodłogowe",
    baseboardEnds: "Narożniki/zakończenia listew",
    cdProfiles: "Profile CD 60",
    udProfiles: "Profile UD 27",
    hangers: "Wieszaki ES",
    gypsum: "Płyty GK sufitowe",
    plaster: "Gips szpachlowy sufitowy",
    sockets: "Gniazdka",
    switches: "Włączniki",
    cable15: "Przewód YDY 3x1.5",
    cable25: "Przewód YDY 3x2.5",
    junctionBox: "Puszki podtynkowe",
  };

  const materialUnits: { [key: string]: string } = {
    floorPanels: "m²",
    underlayment: "m²",
    paint: "l",
    drywall: "szt",
    cwProfiles: "szt",
    uwProfiles: "szt",
    mineralWool: "paczek",
    tnScrews: "opak",
    wallPlaster: "worków",
    finishingPlaster: "worków",
    osb: "szt",
    osbScrews: "opak",
    baseboards: "szt",
    baseboardEnds: "szt",
    cdProfiles: "szt",
    udProfiles: "szt",
    hangers: "szt",
    gypsum: "szt",
    plaster: "worków",
    sockets: "szt",
    switches: "szt",
    cable15: "m",
    cable25: "m",
    junctionBox: "szt",
  };

  // Styled components
  const containerStyle = useMemo(() => ({
    flex: 1,
    backgroundColor: colors.background.primary,
  }), []);

  const headerContainerStyle = useMemo(() => ({
    padding: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.glass.border,
  }), []);

  const headerTitleStyle = useMemo(() => ({
    color: colors.text.primary,
    fontSize: typography.sizes['2xl'],
    fontWeight: typography.weights.bold as any,
    marginBottom: spacing.sm,
  }), []);

  const headerSubtitleStyle = useMemo(() => ({
    color: colors.text.secondary,
    fontSize: typography.sizes.base,
    marginBottom: spacing.xs,
  }), []);

  const infoContainerStyle = useMemo(() => ({
    marginBottom: spacing.lg,
    ...glassmorphism.medium,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
  }), []);

  const infoRowStyle = useMemo(() => ({
    flexDirection: "row" as const,
    alignItems: "center" as const,
    marginBottom: spacing.xs,
  }), []);

  const infoIconStyle = useMemo(() => ({
    marginRight: spacing.sm,
  }), []);

  const infoTextStyle = useMemo(() => ({
    color: colors.text.secondary,
    fontSize: typography.sizes.sm,
    flex: 1,
  }), []);

  const sectionHeaderStyle = useMemo(() => ({
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.sm,
    ...glassmorphism.light,
  }), []);

  const sectionTitleStyle = useMemo(() => ({
    color: colors.text.primary,
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold as any,
  }), []);

  const sectionContentStyle = useMemo(() => ({
    ...glassmorphism.medium,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.lg,
  }), []);

  const materialItemStyle = useMemo(() => ({
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.glass.border,
  }), []);

  const materialInfoStyle = useMemo(() => ({
    flex: 1,
  }), []);

  const materialNameStyle = useMemo(() => ({
    color: colors.text.primary,
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.medium as any,
  }), []);

  const materialQuantityStyle = useMemo(() => ({
    color: colors.text.tertiary,
    fontSize: typography.sizes.sm,
    marginTop: spacing.xs,
  }), []);

  const priceContainerStyle = useMemo(() => ({
    flexDirection: "row" as const,
    alignItems: "center" as const,
  }), []);

  const priceInputStyle = useMemo(() => ({
    backgroundColor: colors.background.tertiary,
    color: colors.text.primary,
    padding: spacing.xs,
    borderRadius: borderRadius.sm,
    fontSize: typography.sizes.sm,
    width: 60,
    textAlign: "center" as const,
    borderWidth: 1,
    borderColor: colors.glass.border,
    marginRight: spacing.xs,
  }), []);

  const priceLabelStyle = useMemo(() => ({
    color: colors.text.tertiary,
    fontSize: typography.sizes.sm,
    width: 30,
  }), []);

  const totalPriceStyle = useMemo(() => ({
    color: colors.text.primary,
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold as any,
    width: 80,
    textAlign: "right" as const,
  }), []);

  const switchContainerStyle = useMemo(() => ({
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
    paddingVertical: spacing.sm,
    marginBottom: spacing.md,
  }), []);

  const switchLabelStyle = useMemo(() => ({
    color: colors.text.primary,
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.medium as any,
  }), []);

  const inputContainerStyle = useMemo(() => ({
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
    paddingVertical: spacing.sm,
    marginBottom: spacing.md,
  }), []);

  const inputLabelStyle = useMemo(() => ({
    color: colors.text.primary,
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.medium as any,
  }), []);

  const inputStyle = useMemo(() => ({
    backgroundColor: colors.background.tertiary,
    color: colors.text.primary,
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    fontSize: typography.sizes.base,
    width: 80,
    textAlign: "center" as const,
    borderWidth: 1,
    borderColor: colors.glass.border,
  }), []);

  const summaryContainerStyle = useMemo(() => ({
    ...glassmorphism.heavy,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  }), []);

  const summaryTitleStyle = useMemo(() => ({
    color: colors.text.primary,
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold as any,
    marginBottom: spacing.md,
  }), []);

  const summaryRowStyle = useMemo(() => ({
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
    marginBottom: spacing.sm,
  }), []);

  const summaryLabelStyle = useMemo(() => ({
    color: colors.text.secondary,
    fontSize: typography.sizes.base,
  }), []);

  const summaryValueStyle = useMemo(() => ({
    color: colors.text.primary,
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold as any,
  }), []);

  const actionButtonsContainerStyle = useMemo(() => ({
    flexDirection: "row" as const,
    padding: spacing.lg,
    paddingTop: spacing.md,
  }), []);

  const resetButtonStyle = useMemo(() => ({
    flex: 1,
    backgroundColor: colors.background.tertiary,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginRight: spacing.sm,
    borderWidth: 1,
    borderColor: colors.glass.border,
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    ...shadows.sm,
  }), []);

  const saveButtonStyle = useMemo(() => ({
    flex: 1,
    borderRadius: borderRadius.lg,
    overflow: "hidden" as const,
    marginLeft: spacing.sm,
    ...shadows.md,
  }), []);

  const saveButtonGradientStyle = useMemo(() => ({
    padding: spacing.md,
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  }), []);

  const buttonTextStyle = useMemo(() => ({
    color: colors.text.primary,
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold as any,
  }), []);

  const buttonIconStyle = useMemo(() => ({
    marginRight: spacing.sm,
  }), []);

  const tierSelectorStyle = useMemo(() => ({
    flexDirection: "row" as const,
    backgroundColor: colors.background.tertiary,
    borderRadius: borderRadius.lg,
    padding: spacing.xs,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.glass.border,
  }), []);

  const tierOptionStyle = useCallback((isActive: boolean) => ({
    flex: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
    borderRadius: borderRadius.md,
    backgroundColor: isActive ? colors.background.secondary : "transparent",
    alignItems: "center" as const,
    justifyContent: "center" as const,
    borderWidth: isActive ? 1 : 0,
    borderColor: isActive ? colors.primary.start : "transparent",
  }), []);

  const tierTextStyle = useCallback((isActive: boolean) => ({
    color: isActive ? colors.text.primary : colors.text.secondary,
    fontSize: typography.sizes.sm,
    fontWeight: isActive ? typography.weights.semibold : typography.weights.regular,
  }), []);

  const renderMaterialItem = useCallback((key: string) => {
    const material = result.materials[key];
    const cost = material * (costs[key as keyof typeof costs] || 0);

    return (
      <View key={key} style={materialItemStyle}>
        <View style={materialInfoStyle}>
          <Text style={materialNameStyle}>{materialNames[key] || key}</Text>
          <Text style={materialQuantityStyle}>
            {material} {materialUnits[key] || "szt"}
          </Text>
        </View>
        <View style={priceContainerStyle}>
          <TextInput
            style={priceInputStyle}
            value={costs[key as keyof typeof costs]?.toString() || "0"}
            onChangeText={(value) => {
              setCosts((prev) => ({
                ...prev,
                [key]: parseFloat(value) || 0,
              }));
            }}
            keyboardType="numeric"
            placeholderTextColor={colors.text.muted}
          />
          <Text style={priceLabelStyle}>zł</Text>
          <Text style={totalPriceStyle}>
            {cost.toFixed(2)} zł
          </Text>
        </View>
      </View>
    );
  }, [result.materials, costs, materialNames, materialUnits, materialItemStyle, materialInfoStyle, materialNameStyle, materialQuantityStyle, priceContainerStyle, priceInputStyle, priceLabelStyle, totalPriceStyle]);

  const handleResetPrices = useCallback(() => {
    setCosts({
      floorPanels: 45,
      underlayment: 10,
      paint: 60,
      drywall: 40,
      cwProfiles: 15,
      uwProfiles: 12,
      mineralWool: 50,
      tnScrews: 20,
      wallPlaster: 30,
      finishingPlaster: 35,
      osb: 60,
      osbScrews: 15,
      baseboards: 25,
      baseboardEnds: 8,
      cdProfiles: 18,
      udProfiles: 15,
      hangers: 2,
      gypsum: 40,
      plaster: 30,
      sockets: 25,
      switches: 30,
      cable15: 5,
      cable25: 7,
      junctionBox: 5,
    });
  }, []);

  const handleSaveCalculation = useCallback(() => {
    if (onSave) {
      onSave(result);
    }
  }, [onSave, result]);

  return (
    <View style={containerStyle}>
      <LinearGradient
        colors={gradients.background.colors}
        start={gradients.background.start}
        end={gradients.background.end}
        style={{ flex: 1 }}
      >
        <ScrollView 
          style={{ flex: 1 }}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: spacing.xl }}
        >
          {/* Header */}
          <View style={headerContainerStyle}>
            <Text style={headerTitleStyle}>
              Kalkulator Materiałów
            </Text>
            <Text style={headerSubtitleStyle}>
              {roomDetails.shape === "l-shape" ? (
                `Kształt L: ${roomDetails.width.toFixed(2)}m × ${roomDetails.length.toFixed(2)}m + ${(roomDetails.width2 || 0).toFixed(2)}m × ${(roomDetails.length2 || 0).toFixed(2)}m`
              ) : (
                `Prostokąt: ${roomDetails.length.toFixed(2)}m × ${roomDetails.width.toFixed(2)}m`
              )}
            </Text>
          </View>

          {/* Room Info */}
          <View style={infoContainerStyle}>
            <View style={infoRowStyle}>
              <Home size={16} color={colors.text.tertiary} style={infoIconStyle} />
              <Text style={infoTextStyle}>
                Wysokość: {roomDetails.height.toFixed(2)}m | Powierzchnia: {result.floorArea.toFixed(2)}m² | Ściany: {result.netWallArea.toFixed(2)}m²
              </Text>
            </View>
            <View style={infoRowStyle}>
              <Wrench size={16} color={colors.text.tertiary} style={infoIconStyle} />
              <Text style={infoTextStyle}>
                Kompleksowość: {result.calculationSummary.complexity}
              </Text>
            </View>
            <View style={infoRowStyle}>
              <Info size={16} color={colors.text.tertiary} style={infoIconStyle} />
              <Text style={infoTextStyle}>
                Zapas materiałowy: {result.calculationSummary.wasteFactor}
              </Text>
            </View>
          </View>

          {/* Price Tier Selector */}
          <View>
             <Text style={[sectionTitleStyle, { marginBottom: spacing.sm, marginLeft: spacing.xs }]}>
                Poziom cenowy
             </Text>
             <View style={tierSelectorStyle}>
              {(['budget', 'mid_range', 'premium'] as const).map((tier) => (
                <TouchableOpacity
                  key={tier}
                  style={tierOptionStyle(selectedTier === tier)}
                  onPress={() => setSelectedTier(tier)}
                  activeOpacity={0.7}
                >
                   {pricesLoading && selectedTier === tier ? (
                      <ActivityIndicator size="small" color={colors.primary.start} />
                   ) : (
                      <Text style={tierTextStyle(selectedTier === tier)}>
                        {tier === 'budget' ? 'Budżetowy' : tier === 'mid_range' ? 'Średni' : 'Premium'}
                      </Text>
                   )}
                </TouchableOpacity>
              ))}
             </View>
          </View>

          {/* Floor Section */}
          <TouchableOpacity
            onPress={() => toggleSection("floor")}
            style={sectionHeaderStyle}
            activeOpacity={0.8}
          >
            <Text style={sectionTitleStyle}>Podłoga</Text>
            {expanded.floor ? (
              <ChevronUp size={20} color={colors.text.primary} />
            ) : (
              <ChevronDown size={20} color={colors.text.primary} />
            )}
          </TouchableOpacity>

          {expanded.floor && (
            <View style={sectionContentStyle}>
              <View style={switchContainerStyle}>
                <Text style={switchLabelStyle}>Podłoga OSB</Text>
                <Switch
                  value={useOsbFloor}
                  onValueChange={setUseOsbFloor}
                  trackColor={{ false: colors.background.tertiary, true: colors.accent.purple }}
                  thumbColor={useOsbFloor ? colors.primary.start : colors.text.tertiary}
                />
              </View>

              {renderMaterialItem("floorPanels")}
              {renderMaterialItem("underlayment")}

              {useOsbFloor && (
                <>
                  {renderMaterialItem("osb")}
                  {renderMaterialItem("osbScrews")}
                  {renderMaterialItem("baseboards")}
                  {renderMaterialItem("baseboardEnds")}
                </>
              )}
            </View>
          )}

          {/* Walls Section */}
          <TouchableOpacity
            onPress={() => toggleSection("walls")}
            style={sectionHeaderStyle}
            activeOpacity={0.8}
          >
            <Text style={sectionTitleStyle}>Ściany</Text>
            {expanded.walls ? (
              <ChevronUp size={20} color={colors.text.primary} />
            ) : (
              <ChevronDown size={20} color={colors.text.primary} />
            )}
          </TouchableOpacity>

          {expanded.walls && (
            <View style={sectionContentStyle}>
              {renderMaterialItem("drywall")}
              {renderMaterialItem("cwProfiles")}
              {renderMaterialItem("uwProfiles")}
              {renderMaterialItem("mineralWool")}
              {renderMaterialItem("tnScrews")}
              {renderMaterialItem("wallPlaster")}
              {renderMaterialItem("finishingPlaster")}
              {renderMaterialItem("paint")}
            </View>
          )}

          {/* Ceiling Section */}
          <TouchableOpacity
            onPress={() => toggleSection("ceiling")}
            style={sectionHeaderStyle}
            activeOpacity={0.8}
          >
            <Text style={sectionTitleStyle}>Sufit</Text>
            {expanded.ceiling ? (
              <ChevronUp size={20} color={colors.text.primary} />
            ) : (
              <ChevronDown size={20} color={colors.text.primary} />
            )}
          </TouchableOpacity>

          {expanded.ceiling && (
            <View style={sectionContentStyle}>
              <View style={switchContainerStyle}>
                <Text style={switchLabelStyle}>Sufit podwieszany</Text>
                <Switch
                  value={useSuspendedCeiling}
                  onValueChange={setUseSuspendedCeiling}
                  trackColor={{ false: colors.background.tertiary, true: colors.accent.purple }}
                  thumbColor={useSuspendedCeiling ? colors.primary.start : colors.text.tertiary}
                />
              </View>

              {useSuspendedCeiling && (
                <>
                  {renderMaterialItem("cdProfiles")}
                  {renderMaterialItem("udProfiles")}
                  {renderMaterialItem("hangers")}
                  {renderMaterialItem("gypsum")}
                  {renderMaterialItem("plaster")}
                </>
              )}
            </View>
          )}

          {/* Electrical Section */}
          <TouchableOpacity
            onPress={() => toggleSection("electrical")}
            style={sectionHeaderStyle}
            activeOpacity={0.8}
          >
            <Text style={sectionTitleStyle}>Instalacja elektryczna</Text>
            {expanded.electrical ? (
              <ChevronUp size={20} color={colors.text.primary} />
            ) : (
              <ChevronDown size={20} color={colors.text.primary} />
            )}
          </TouchableOpacity>

          {expanded.electrical && (
            <View style={sectionContentStyle}>
              <View style={inputContainerStyle}>
                <Text style={inputLabelStyle}>Liczba gniazdek</Text>
                <TextInput
                  style={inputStyle}
                  value={socketsCount}
                  onChangeText={setSocketsCount}
                  keyboardType="numeric"
                  placeholderTextColor={colors.text.muted}
                />
              </View>

              <View style={inputContainerStyle}>
                <Text style={inputLabelStyle}>Liczba włączników</Text>
                <TextInput
                  style={inputStyle}
                  value={switchesCount}
                  onChangeText={setSwitchesCount}
                  keyboardType="numeric"
                  placeholderTextColor={colors.text.muted}
                />
              </View>

              {renderMaterialItem("sockets")}
              {renderMaterialItem("switches")}
              {renderMaterialItem("cable15")}
              {renderMaterialItem("cable25")}
              {renderMaterialItem("junctionBox")}
            </View>
          )}

          {/* Summary */}
          <View style={summaryContainerStyle}>
            <Text style={summaryTitleStyle}>Podsumowanie</Text>
            <View style={summaryRowStyle}>
              <Text style={summaryLabelStyle}>Całkowity koszt materiałów:</Text>
              <Text style={summaryValueStyle}>
                {result.totalCost.toFixed(2)} zł
              </Text>
            </View>
            <View style={summaryRowStyle}>
              <Text style={summaryLabelStyle}>Koszt na m²:</Text>
              <Text style={summaryValueStyle}>
                {(result.totalCost / result.floorArea).toFixed(2)} zł/m²
              </Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={actionButtonsContainerStyle}>
            <TouchableOpacity
              style={resetButtonStyle}
              onPress={handleResetPrices}
              activeOpacity={0.8}
            >
              <RefreshCw size={18} color={colors.text.secondary} style={buttonIconStyle} />
              <Text style={[buttonTextStyle, { color: colors.text.secondary }]}>
                Reset cen
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={saveButtonStyle}
              onPress={handleSaveCalculation}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={gradients.primary.colors}
                start={gradients.primary.start}
                end={gradients.primary.end}
                style={saveButtonGradientStyle}
              >
                <Save size={18} color={colors.text.primary} style={buttonIconStyle} />
                <Text style={buttonTextStyle}>
                  Zapisz kalkulację
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </LinearGradient>
    </View>
  );
};

export default MaterialCalculator;
