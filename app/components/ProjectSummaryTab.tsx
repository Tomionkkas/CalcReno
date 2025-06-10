import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Project } from "../utils/storage";
// TODO: Install these packages: npm install expo-print expo-sharing expo-file-system
// import * as Print from 'expo-print';
// import * as Sharing from 'expo-sharing';
// import * as FileSystem from 'expo-file-system';

interface ProjectSummaryTabProps {
  project: Project;
  showError?: (title: string, message?: string) => void;
  showSuccess?: (title: string, message?: string) => void;
}

export default function ProjectSummaryTab({ project, showError, showSuccess }: ProjectSummaryTabProps) {
  const [showAdvancedDetails, setShowAdvancedDetails] = useState(false);

  const totalCost =
    project?.rooms.reduce(
      (sum, room) => sum + (room.materials?.totalCost || 0),
      0,
    ) || 0;

  const roomsWithMaterials =
    project?.rooms.filter((room) => room.materials) || [];

  // Export functions
  const exportToPDF = async () => {
    try {
      // Check if expo-print is available
      const Print = require('expo-print');
      const Sharing = require('expo-sharing');
      
      if (!Print || !Sharing) {
        showError?.("Eksport PDF niedostępny", "Aby używać eksportu PDF, zainstaluj wymagane pakiety:\nnpm install expo-print expo-sharing");
        return;
      }

      // Generate HTML content for PDF
      const htmlContent = generatePDFContent();
      
      // Create PDF
      const { uri } = await Print.printToFileAsync({
        html: htmlContent,
        base64: false
      });
      
      // Share the PDF
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          UTI: '.pdf',
          mimeType: 'application/pdf',
        });
      } else {
        showSuccess?.("Sukces", `PDF zapisany w: ${uri}`);
      }
    } catch (error) {
      showError?.("Błąd eksportu", "Aby używać eksportu PDF, zainstaluj wymagane pakiety:\nnpm install expo-print expo-sharing");
    }
  };

  const exportToCSV = async () => {
    try {
      // Check if expo-file-system is available
      const FileSystem = require('expo-file-system');
      const Sharing = require('expo-sharing');
      
      if (!FileSystem || !Sharing) {
        showError?.("Eksport CSV niedostępny", "Aby używać eksportu CSV, zainstaluj wymagane pakiety:\nnpm install expo-file-system expo-sharing");
        return;
      }

      // Generate CSV content
      const csvContent = generateCSVContent();
      
      // Create file
      const fileName = `${project.name.replace(/[^a-zA-Z0-9]/g, '_')}_kosztorys.csv`;
      const fileUri = FileSystem.documentDirectory + fileName;
      
      await FileSystem.writeAsStringAsync(fileUri, csvContent, {
        encoding: FileSystem.EncodingType.UTF8,
      });
      
      // Share the CSV
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          UTI: '.csv',
          mimeType: 'text/csv',
        });
      } else {
        showSuccess?.("Sukces", `CSV zapisany w: ${fileUri}`);
      }
    } catch (error) {
      showError?.("Błąd eksportu", "Aby używać eksportu CSV, zainstaluj wymagane pakiety:\nnpm install expo-file-system expo-sharing");
    }
  };

  const generatePDFContent = () => {
    // Aggregate all materials
    const allMaterials: { [key: string]: number } = {};
    project?.rooms
      .filter((room) => room.materials)
      .forEach((room) => {
        if (room.materials && room.materials.materials) {
          Object.entries(room.materials.materials).forEach(
            ([material, quantity]) => {
              allMaterials[material] =
                (allMaterials[material] || 0) + (quantity as number);
            },
          );
        }
      });

         const firstRoomWithMaterials = project?.rooms.find((room) => room.materials);
     const roomMaterialNames = (firstRoomWithMaterials?.materials as any)?.materialNames || materialNames;
     const roomMaterialUnits = (firstRoomWithMaterials?.materials as any)?.materialUnits || materialUnits;

     return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Kosztorys - ${project.name}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .summary { background: #f5f5f5; padding: 15px; border-radius: 8px; margin-bottom: 20px; }
          .room { margin-bottom: 20px; border: 1px solid #ddd; border-radius: 8px; padding: 15px; }
          .room-header { font-weight: bold; margin-bottom: 10px; font-size: 16px; }
          .materials-table { width: 100%; border-collapse: collapse; margin-top: 10px; }
          .materials-table th, .materials-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          .materials-table th { background-color: #f2f2f2; }
          .total-cost { font-size: 18px; font-weight: bold; color: #2563eb; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Kosztorys Renovacji</h1>
          <h2>${project.name}</h2>
          <p>Data wygenerowania: ${new Date().toLocaleDateString('pl-PL')}</p>
        </div>
        
        <div class="summary">
          <div class="total-cost">Całkowity koszt projektu: ${totalCost.toFixed(2)} zł</div>
          <p>Liczba pomieszczeń z wycenami: ${roomsWithMaterials.length} z ${project?.rooms.length || 0}</p>
        </div>

        <h3>Łączne zapotrzebowanie na materiały</h3>
        <table class="materials-table">
          <thead>
            <tr><th>Materiał</th><th>Ilość</th><th>Jednostka</th></tr>
          </thead>
          <tbody>
                         ${Object.entries(allMaterials).map(([material, quantity]) => `
               <tr>
                 <td>${roomMaterialNames[material] || material}</td>
                 <td>${quantity}</td>
                 <td>${roomMaterialUnits[material] || 'szt'}</td>
               </tr>
             `).join('')}
          </tbody>
        </table>

        <h3>Szczegóły według pomieszczeń</h3>
        ${roomsWithMaterials.map(room => `
          <div class="room">
            <div class="room-header">
              ${room.name} - ${room.materials?.totalCost.toFixed(2)} zł
              <br><small>${(room.dimensions.width / 100).toFixed(2)}m × ${(room.dimensions.length / 100).toFixed(2)}m</small>
            </div>
            <table class="materials-table">
              <thead>
                <tr><th>Materiał</th><th>Ilość</th><th>Jednostka</th></tr>
              </thead>
              <tbody>
                                 ${Object.entries(room.materials?.materials || {}).map(([material, quantity]) => `
                   <tr>
                     <td>${roomMaterialNames[material] || material}</td>
                     <td>${quantity}</td>
                     <td>${roomMaterialUnits[material] || 'szt'}</td>
                   </tr>
                 `).join('')}
              </tbody>
            </table>
          </div>
        `).join('')}
      </body>
      </html>
    `;
  };

  const generateCSVContent = () => {
    // Aggregate all materials
    const allMaterials: { [key: string]: number } = {};
    project?.rooms
      .filter((room) => room.materials)
      .forEach((room) => {
        if (room.materials && room.materials.materials) {
          Object.entries(room.materials.materials).forEach(
            ([material, quantity]) => {
              allMaterials[material] =
                (allMaterials[material] || 0) + (quantity as number);
            },
          );
        }
      });

         const firstRoomWithMaterials = project?.rooms.find((room) => room.materials);
     const roomMaterialNames = (firstRoomWithMaterials?.materials as any)?.materialNames || materialNames;
     const roomMaterialUnits = (firstRoomWithMaterials?.materials as any)?.materialUnits || materialUnits;

    let csv = `Kosztorys - ${project.name}\n`;
    csv += `Data wygenerowania,${new Date().toLocaleDateString('pl-PL')}\n`;
    csv += `Całkowity koszt,${totalCost.toFixed(2)} zł\n`;
    csv += `Pomieszczenia z wycenami,${roomsWithMaterials.length} z ${project?.rooms.length || 0}\n\n`;
    
    csv += `ŁĄCZNE ZAPOTRZEBOWANIE NA MATERIAŁY\n`;
    csv += `Materiał,Ilość,Jednostka\n`;
         Object.entries(allMaterials).forEach(([material, quantity]) => {
       csv += `"${roomMaterialNames[material] || material}",${quantity},"${roomMaterialUnits[material] || 'szt'}"\n`;
     });
    
    csv += `\nSZCZEGÓŁY WEDŁUG POMIESZCZEŃ\n`;
    roomsWithMaterials.forEach(room => {
      csv += `\n"${room.name}","${room.materials?.totalCost.toFixed(2)} zł","${(room.dimensions.width / 100).toFixed(2)}m × ${(room.dimensions.length / 100).toFixed(2)}m"\n`;
      csv += `Materiał,Ilość,Jednostka\n`;
             Object.entries(room.materials?.materials || {}).forEach(([material, quantity]) => {
         csv += `"${roomMaterialNames[material] || material}",${quantity},"${roomMaterialUnits[material] || 'szt'}"\n`;
       });
    });
    
    return csv;
  };

  // Material names for display
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

  return (
    <>
      <ScrollView style={{ flex: 1, padding: 16 }}>
        <View style={{ marginBottom: 24 }}>
          <Text
            style={{
              color: "white",
              fontSize: 24,
              fontWeight: "bold",
              marginBottom: 16,
            }}
          >
            Podsumowanie Kosztów
          </Text>

          <LinearGradient
            colors={["#1E2139", "#2A2D4A"]}
            style={{ borderRadius: 12, padding: 20, marginBottom: 20 }}
          >
            <Text
              style={{
                color: "white",
                fontSize: 18,
                fontWeight: "bold",
                marginBottom: 8,
              }}
            >
              Całkowity koszt projektu
            </Text>
            <Text
              style={{ color: "#4DABF7", fontSize: 32, fontWeight: "bold" }}
            >
              {totalCost.toFixed(2)} zł
            </Text>
            <Text style={{ color: "#B8BCC8", fontSize: 14, marginTop: 4 }}>
              {roomsWithMaterials.length} z {project?.rooms.length || 0}{" "}
              pomieszczeń wycenionych
            </Text>
          </LinearGradient>

          {roomsWithMaterials.map((room) => (
            <LinearGradient
              key={room.id}
              colors={["#1E2139", "#2A2D4A"]}
              style={{ borderRadius: 12, marginBottom: 12, padding: 16 }}
            >
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    color: "white",
                    fontSize: 16,
                    fontWeight: "bold",
                    flex: 1,
                  }}
                >
                  {room.name}
                </Text>
                <Text
                  style={{ color: "#10B981", fontSize: 16, fontWeight: "bold" }}
                >
                  {room.materials?.totalCost.toFixed(2)} zł
                </Text>
              </View>
              <Text style={{ color: "#B8BCC8", fontSize: 12, marginTop: 4 }}>
                {(room.dimensions.width / 100).toFixed(2)}m ×{" "}
                {(room.dimensions.length / 100).toFixed(2)}m
              </Text>
            </LinearGradient>
          ))}

          <TouchableOpacity
            onPress={() => setShowAdvancedDetails(true)}
            style={{ borderRadius: 8, overflow: "hidden", marginTop: 16 }}
          >
            <LinearGradient
              colors={["#6C63FF", "#4DABF7"]}
              style={{
                paddingVertical: 12,
                paddingHorizontal: 16,
                alignItems: "center",
              }}
            >
              <Text style={{ color: "white", fontWeight: "500" }}>
                Szczegóły materiałów
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          <View style={{ flexDirection: "row", marginTop: 16 }}>
            <TouchableOpacity
              onPress={exportToPDF}
              style={{
                flex: 1,
                backgroundColor: "#374151",
                padding: 12,
                borderRadius: 8,
                marginRight: 8,
                alignItems: "center",
              }}
            >
              <Text style={{ color: "white" }}>Eksport PDF</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={exportToCSV}
              style={{
                flex: 1,
                backgroundColor: "#374151",
                padding: 12,
                borderRadius: 8,
                marginLeft: 8,
                alignItems: "center",
              }}
            >
              <Text style={{ color: "white" }}>Eksport CSV</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Advanced Details Modal */}
      <Modal
        visible={showAdvancedDetails}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAdvancedDetails(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            justifyContent: "center",
            alignItems: "center",
            padding: 20,
          }}
        >
          <LinearGradient
            colors={["#1E2139", "#2A2D4A"]}
            style={{
              width: "100%",
              maxWidth: 400,
              maxHeight: "80%",
              borderRadius: 16,
              padding: 24,
            }}
          >
            <Text
              style={{
                color: "white",
                fontSize: 24,
                fontWeight: "bold",
                marginBottom: 20,
                textAlign: "center",
              }}
            >
              Szczegóły Materiałów
            </Text>

            {/* Project Summary Header */}
            <LinearGradient
              colors={["#374151", "#4B5563"]}
              style={{ borderRadius: 12, padding: 16, marginBottom: 20 }}
            >
              <Text style={{ color: "white", fontSize: 18, fontWeight: "bold", marginBottom: 8 }}>
                Podsumowanie Projektu
              </Text>
              <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 4 }}>
                <Text style={{ color: "#B8BCC8", fontSize: 14 }}>Pokoje z wycenami:</Text>
                <Text style={{ color: "#4DABF7", fontSize: 14, fontWeight: "bold" }}>
                  {roomsWithMaterials.length} z {project?.rooms.length || 0}
                </Text>
              </View>
            </LinearGradient>

            <ScrollView style={{ maxHeight: 350 }} showsVerticalScrollIndicator={true}>
              
              {/* Check if any rooms have materials calculated */}
              {(() => {
                const totalRooms = project?.rooms.length || 0;
                
                if (roomsWithMaterials.length === 0) {
                  return (
                    <View style={{ alignItems: "center", marginBottom: 24 }}>
                      <Text style={{ color: "#FFD700", fontSize: 12, textAlign: "center", marginBottom: 8 }}>
                        🔍 DEBUG: Rooms: {totalRooms}, Materials: {roomsWithMaterials.length}
                      </Text>
                      <Text style={{ color: "#6B7280", fontSize: 16, textAlign: "center", marginBottom: 16 }}>
                        ⚠️ Brak obliczonych materiałów
                      </Text>
                      <Text style={{ color: "#9CA3AF", fontSize: 14, textAlign: "center", marginBottom: 20 }}>
                        Aby zobaczyć szczegóły materiałów, najpierw oblicz materiały dla pomieszczeń używając przycisku "Oblicz materiały" w zakładce Pomieszczenia.
                      </Text>
                    </View>
                  );
                }

                // Aggregate all materials from all rooms
                const allMaterials: { [key: string]: number } = {};
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

                // Aggregate materials from all rooms
                project?.rooms
                  .filter((room) => room.materials)
                  .forEach((room) => {
                    if (room.materials && room.materials.materials) {
                      Object.entries(room.materials.materials).forEach(
                        ([material, quantity]) => {
                          allMaterials[material] =
                            (allMaterials[material] || 0) + (quantity as number);
                        },
                      );
                    }
                  });

                const firstRoomWithMaterials = project?.rooms.find((room) => room.materials);
                const roomMaterialNames = (firstRoomWithMaterials?.materials as any)?.materialNames || materialNames;
                const roomMaterialUnits = (firstRoomWithMaterials?.materials as any)?.materialUnits || materialUnits;

                if (Object.keys(allMaterials).length === 0 && roomsWithMaterials.length > 0) {
                  return (
                    <View style={{ alignItems: "center", marginBottom: 24 }}>
                      <Text style={{ color: "#F87171", fontSize: 16, textAlign: "center", marginBottom: 16 }}>
                        🔧 Wymagana aktualizacja danych
                      </Text>
                      <Text style={{ color: "#9CA3AF", fontSize: 14, textAlign: "center", marginBottom: 20 }}>
                        Twoje materiały zostały obliczone starszą wersją aplikacji. Aby zobaczyć szczegóły, ponownie oblicz materiały.
                      </Text>
                    </View>
                  );
                }

                return Object.keys(allMaterials).length > 0 ? (
                  <View style={{ marginBottom: 24 }}>
                    <Text
                      style={{
                        color: "white",
                        fontSize: 18,
                        fontWeight: "bold",
                        marginBottom: 16,
                        textAlign: "center",
                      }}
                    >
                      Łączne zapotrzebowanie na materiały
                    </Text>
                    
                    {/* Group materials by category */}
                    {(() => {
                      const materialCategories = {
                        "Podłoga": ["floorPanels", "underlayment", "osb", "osbScrews", "baseboards", "baseboardEnds"],
                        "Ściany": ["paint", "drywall", "cwProfiles", "uwProfiles", "mineralWool", "tnScrews", "wallPlaster", "finishingPlaster"],
                        "Sufit": ["cdProfiles", "udProfiles", "hangers", "gypsum", "plaster"],
                        "Instalacja elektryczna": ["sockets", "switches", "cable15", "cable25", "junctionBox"]
                      };

                      return Object.entries(materialCategories).map(([category, materials]) => {
                        const categoryMaterials = materials.filter(material => allMaterials[material]);
                        if (categoryMaterials.length === 0) return null;

                        return (
                          <View key={category} style={{ marginBottom: 20 }}>
                            <Text style={{ 
                              color: "#4DABF7", 
                              fontSize: 16, 
                              fontWeight: "bold", 
                              marginBottom: 8,
                              borderBottomWidth: 1,
                              borderBottomColor: "#4DABF7",
                              paddingBottom: 4
                            }}>
                              {category}
                            </Text>
                            {categoryMaterials.map((material) => (
                              <LinearGradient
                                key={material}
                                colors={["#374151", "#4B5563"]}
                                style={{
                                  flexDirection: "row",
                                  justifyContent: "space-between",
                                  paddingVertical: 10,
                                  paddingHorizontal: 16,
                                  borderRadius: 8,
                                  marginBottom: 6,
                                  alignItems: "center",
                                }}
                              >
                                <Text style={{ color: "#E5E7EB", flex: 1, fontSize: 14 }}>
                                  {materialNames[material] || material}
                                </Text>
                                <Text style={{ 
                                  color: "white", 
                                  fontWeight: "bold",
                                  fontSize: 14,
                                  backgroundColor: "#6C63FF",
                                  paddingHorizontal: 8,
                                  paddingVertical: 4,
                                  borderRadius: 6
                                }}>
                                  {allMaterials[material]} {materialUnits[material] || "szt"}
                                </Text>
                              </LinearGradient>
                            ))}
                          </View>
                        );
                      });
                    })()}
                  </View>
                ) : null;
              })()}

              {/* Per Room Details */}
              <Text
                style={{
                  color: "white",
                  fontSize: 18,
                  fontWeight: "bold",
                  marginBottom: 16,
                  textAlign: "center",
                }}
              >
                Szczegóły według pomieszczeń
              </Text>
              {roomsWithMaterials.map((room) => (
                <LinearGradient
                  key={room.id}
                  colors={["#1E2139", "#2A2D4A"]}
                  style={{ 
                    marginBottom: 20, 
                    borderRadius: 12, 
                    padding: 16,
                    borderWidth: 1,
                    borderColor: "#4DABF7"
                  }}
                >
                  <View style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 12,
                    paddingBottom: 8,
                    borderBottomWidth: 1,
                    borderBottomColor: "#374151"
                  }}>
                    <Text
                      style={{
                        color: "white",
                        fontSize: 16,
                        fontWeight: "bold",
                      }}
                    >
                      {room.name}
                    </Text>
                    <Text
                      style={{
                        color: "#10B981",
                        fontSize: 14,
                        fontWeight: "bold",
                      }}
                    >
                      {room.materials?.totalCost.toFixed(2)} zł
                    </Text>
                  </View>

                  {room.materials &&
                    Object.entries(room.materials.materials || {}).map(
                      ([material, quantity]) => (
                        <View
                          key={material}
                          style={{
                            flexDirection: "row",
                            justifyContent: "space-between",
                            paddingVertical: 6,
                            paddingHorizontal: 12,
                            marginBottom: 4,
                            backgroundColor: "#374151",
                            borderRadius: 6,
                          }}
                        >
                          <Text
                            style={{
                              color: "#E5E7EB",
                              flex: 1,
                              fontSize: 13,
                            }}
                          >
                            {materialNames[material] || material}
                          </Text>
                          <Text style={{ 
                            color: "white", 
                            fontSize: 13, 
                            fontWeight: "500",
                            backgroundColor: "#6C63FF",
                            paddingHorizontal: 6,
                            paddingVertical: 2,
                            borderRadius: 4
                          }}>
                            {quantity} {materialUnits[material] || "szt"}
                          </Text>
                        </View>
                      ),
                    )}
                </LinearGradient>
              ))}
            </ScrollView>

            <TouchableOpacity
              onPress={() => setShowAdvancedDetails(false)}
              style={{
                backgroundColor: "#6C63FF",
                padding: 12,
                borderRadius: 8,
                alignItems: "center",
                marginTop: 16,
              }}
            >
              <Text style={{ color: "white", fontSize: 16, fontWeight: "500" }}>
                Zamknij
              </Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>
      </Modal>
    </>
  );
} 