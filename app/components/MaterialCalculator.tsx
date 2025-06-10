import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Switch,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import {
  ChevronDown,
  ChevronUp,
  Calculator,
  Save,
  RefreshCw,
} from "lucide-react-native";

interface MaterialCalculatorProps {
  roomDetails?: {
    length: number;
    width: number;
    height: number;
    walls: { length: number }[];
    doors: { width: number; height: number }[];
    windows: { width: number; height: number }[];
  };
  onSave?: (calculations: any) => void;
}

const MaterialCalculator = ({
  roomDetails = {
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

  const toggleSection = (section: string) => {
    setExpanded((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const calculateRequiredMaterials = () => {
    // Podstawowe obliczenia geometryczne
    const floorArea = roomDetails.length * roomDetails.width;
    const roomPerimeter = roomDetails.walls.reduce(
      (sum, wall) => sum + wall.length,
      0,
    );

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

    // Funkcja pomocnicza do dodawania materiału i obliczania kosztu
    const addMaterial = (key: string, amount: number) => {
      materials[key] = amount;
      totalCost += amount * (costs[key as keyof typeof costs] || 0);
    };

    // Materiały podstawowe
    addMaterial("floorPanels", Math.ceil(floorArea));
    addMaterial("underlayment", Math.ceil(floorArea));
    addMaterial("paint", Math.ceil(netWallArea * 0.25)); // 0.25l na m² (na dwie warstwy)
    addMaterial("drywall", Math.ceil(netWallArea / 3.12)); // standardowy wymiar płyty
    addMaterial("cwProfiles", Math.ceil((roomPerimeter / 0.6) * 1.1)); // co 60 cm z 10% zapasem
    addMaterial("uwProfiles", Math.ceil((roomPerimeter / 3) * 1.1)); // na obwód z 10% zapasem
    addMaterial("mineralWool", Math.ceil(netWallArea / 5)); // 5 m² w paczce
    addMaterial("tnScrews", Math.ceil(netWallArea / 10)); // opakowanie na 10 m²
    addMaterial("wallPlaster", Math.ceil(netWallArea / 30)); // worek na 30 m²
    addMaterial("finishingPlaster", Math.ceil(netWallArea / 25)); // worek na 25 m²

    // Materiały na podłogę OSB (opcjonalnie)
    if (useOsbFloor) {
      addMaterial("osb", Math.ceil(floorArea / 3.125)); // standardowy wymiar płyty
      addMaterial("osbScrews", Math.ceil(floorArea / 10)); // opakowanie na 10 m²

      // Listwy przypodłogowe (bez szerokości drzwi)
      const doorWidthTotal = roomDetails.doors.reduce(
        (sum, door) => sum + door.width,
        0,
      );
      addMaterial(
        "baseboards",
        Math.ceil((roomPerimeter - doorWidthTotal) / 2.5),
      ); // długość 2.5m

      // Narożniki/zakończenia listew (2 na drzwi + 4 na narożniki)
      addMaterial("baseboardEnds", roomDetails.doors.length * 2 + 4);
    }

    // Materiały na sufit podwieszany (opcjonalnie)
    if (useSuspendedCeiling) {
      addMaterial("cdProfiles", Math.ceil(floorArea));
      addMaterial("udProfiles", Math.ceil(floorArea * 0.4));
      addMaterial("hangers", Math.ceil(floorArea * 4.5));
      addMaterial("gypsum", Math.ceil(floorArea / 2.4)); // standardowy wymiar płyty
      addMaterial("plaster", Math.ceil(floorArea / 30)); // worek na 30 m²
    }

    // Instalacja elektryczna
    const socketsCountNum = parseInt(socketsCount) || 0;
    const switchesCountNum = parseInt(switchesCount) || 0;

    addMaterial("sockets", socketsCountNum);
    addMaterial("switches", switchesCountNum);
    addMaterial("cable15", Math.ceil(switchesCountNum * 5)); // 5m na włącznik
    addMaterial("cable25", Math.ceil(socketsCountNum * 5)); // 5m na gniazdko
    addMaterial("junctionBox", Math.ceil(socketsCountNum + switchesCountNum));

    return { 
      materials, 
      totalCost, 
      floorArea, 
      netWallArea, 
      roomPerimeter,
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
  };

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

  const renderMaterialItem = (key: string) => {
    const material = result.materials[key];
    const cost = material * (costs[key as keyof typeof costs] || 0);

    return (
      <View
        key={key}
        className="flex-row justify-between items-center py-2 border-b border-gray-700"
      >
        <View className="flex-1">
          <Text className="text-white">{materialNames[key] || key}</Text>
          <Text className="text-gray-400 text-xs">
            {material} {materialUnits[key] || "szt"}
          </Text>
        </View>
        <View className="flex-row items-center">
          <TextInput
            className="bg-gray-800 text-white px-2 py-1 rounded w-16 text-right mr-2"
            value={costs[key as keyof typeof costs]?.toString() || "0"}
            onChangeText={(value) => {
              setCosts((prev) => ({
                ...prev,
                [key]: parseFloat(value) || 0,
              }));
            }}
            keyboardType="numeric"
          />
          <Text className="text-gray-400 w-8">zł</Text>
          <Text className="text-white text-right w-20">
            {cost.toFixed(2)} zł
          </Text>
        </View>
      </View>
    );
  };

  const handleSaveCalculation = async (calculation: any) => {
    if (onSave) {
      onSave(calculation);
    }
  };

  return (
    <LinearGradient
      colors={["#0A0B1E", "#151829"]}
      style={{ flex: 1, borderRadius: 8, overflow: "hidden" }}
    >
      <ScrollView style={{ flex: 1, padding: 16 }}>
        <View style={{ marginBottom: 24 }}>
          <Text
            style={{
              fontSize: 24,
              fontWeight: "bold",
              color: "white",
              marginBottom: 8,
            }}
          >
            Kalkulator Materiałów
          </Text>
          <Text style={{ color: "#9CA3AF", fontSize: 16 }}>
            Pomieszczenie: {roomDetails.length.toFixed(2)}m ×{" "}
            {roomDetails.width.toFixed(2)}m × {roomDetails.height.toFixed(2)}m
          </Text>
          <Text style={{ color: "#9CA3AF", fontSize: 16 }}>
            Powierzchnia: {result.floorArea.toFixed(2)}m² | Ściany:{" "}
            {result.netWallArea.toFixed(2)}m²
          </Text>
        </View>

        {/* Sekcja podłogi */}
        <TouchableOpacity
          onPress={() => toggleSection("floor")}
          className="flex-row justify-between items-center bg-gray-800 p-3 rounded-t-lg mb-1"
        >
          <Text className="text-white text-lg font-medium">Podłoga</Text>
          {expanded.floor ? (
            <ChevronUp color="#fff" size={20} />
          ) : (
            <ChevronDown color="#fff" size={20} />
          )}
        </TouchableOpacity>

        {expanded.floor && (
          <View className="bg-gray-900 p-4 rounded-b-lg mb-4">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-white">Podłoga OSB</Text>
              <Switch
                value={useOsbFloor}
                onValueChange={setUseOsbFloor}
                trackColor={{ false: "#3e3e3e", true: "#6C63FF" }}
                thumbColor={useOsbFloor ? "#4DABF7" : "#f4f3f4"}
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

        {/* Sekcja ścian */}
        <TouchableOpacity
          onPress={() => toggleSection("walls")}
          className="flex-row justify-between items-center bg-gray-800 p-3 rounded-t-lg mb-1"
        >
          <Text className="text-white text-lg font-medium">Ściany</Text>
          {expanded.walls ? (
            <ChevronUp color="#fff" size={20} />
          ) : (
            <ChevronDown color="#fff" size={20} />
          )}
        </TouchableOpacity>

        {expanded.walls && (
          <View className="bg-gray-900 p-4 rounded-b-lg mb-4">
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

        {/* Sekcja sufitu */}
        <TouchableOpacity
          onPress={() => toggleSection("ceiling")}
          className="flex-row justify-between items-center bg-gray-800 p-3 rounded-t-lg mb-1"
        >
          <Text className="text-white text-lg font-medium">Sufit</Text>
          {expanded.ceiling ? (
            <ChevronUp color="#fff" size={20} />
          ) : (
            <ChevronDown color="#fff" size={20} />
          )}
        </TouchableOpacity>

        {expanded.ceiling && (
          <View className="bg-gray-900 p-4 rounded-b-lg mb-4">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-white">Sufit podwieszany</Text>
              <Switch
                value={useSuspendedCeiling}
                onValueChange={setUseSuspendedCeiling}
                trackColor={{ false: "#3e3e3e", true: "#6C63FF" }}
                thumbColor={useSuspendedCeiling ? "#4DABF7" : "#f4f3f4"}
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

        {/* Sekcja elektryki */}
        <TouchableOpacity
          onPress={() => toggleSection("electrical")}
          className="flex-row justify-between items-center bg-gray-800 p-3 rounded-t-lg mb-1"
        >
          <Text className="text-white text-lg font-medium">
            Instalacja elektryczna
          </Text>
          {expanded.electrical ? (
            <ChevronUp color="#fff" size={20} />
          ) : (
            <ChevronDown color="#fff" size={20} />
          )}
        </TouchableOpacity>

        {expanded.electrical && (
          <View className="bg-gray-900 p-4 rounded-b-lg mb-4">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-white">Liczba gniazdek</Text>
              <TextInput
                className="bg-gray-800 text-white px-3 py-1 rounded w-16 text-center"
                value={socketsCount}
                onChangeText={setSocketsCount}
                keyboardType="numeric"
              />
            </View>

            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-white">Liczba włączników</Text>
              <TextInput
                className="bg-gray-800 text-white px-3 py-1 rounded w-16 text-center"
                value={switchesCount}
                onChangeText={setSwitchesCount}
                keyboardType="numeric"
              />
            </View>

            {renderMaterialItem("sockets")}
            {renderMaterialItem("switches")}
            {renderMaterialItem("cable15")}
            {renderMaterialItem("cable25")}
            {renderMaterialItem("junctionBox")}
          </View>
        )}

        {/* Podsumowanie */}
        <LinearGradient
          colors={["#1E2139", "#2A2D4A"]}
          className="p-4 rounded-lg mt-4"
        >
          <Text className="text-xl font-bold text-white mb-2">
            Podsumowanie
          </Text>
          <View className="flex-row justify-between mb-2">
            <Text className="text-gray-300">Całkowity koszt materiałów:</Text>
            <Text className="text-white font-bold text-lg">
              {result.totalCost.toFixed(2)} zł
            </Text>
          </View>
          <View className="flex-row justify-between">
            <Text className="text-gray-300">Koszt na m²:</Text>
            <Text className="text-white">
              {(result.totalCost / result.floorArea).toFixed(2)} zł/m²
            </Text>
          </View>
        </LinearGradient>

        {/* Przyciski akcji */}
        <View className="flex-row justify-between mt-6 mb-10">
          <TouchableOpacity
            className="flex-1 mr-2 bg-gray-800 rounded-lg py-3 flex-row justify-center items-center"
            onPress={() => {
              // Reset cen do domyślnych
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
            }}
          >
            <RefreshCw size={18} color="#B8BCC8" />
            <Text className="text-gray-300 ml-2">Reset cen</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => onSave(result)}
            className="flex-1 ml-2 rounded-lg py-3 flex-row justify-center items-center"
            style={{ backgroundColor: "#6C63FF" }}
          >
            <Save size={18} color="#FFFFFF" />
            <Text className="text-white font-medium ml-2">
              Zapisz kalkulację
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </LinearGradient>
  );
};

export default MaterialCalculator;
