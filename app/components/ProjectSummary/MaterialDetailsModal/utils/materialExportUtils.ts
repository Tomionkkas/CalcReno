import { Project, Room } from "../../../../utils/storage";
import { materialNames, materialUnits } from "../../utils/materialCalculations";

export const exportToPDF = async (
  project: Project,
  totalCost: number,
  roomsWithMaterials: Room[],
  showError?: (title: string, message?: string) => void,
  showSuccess?: (title: string, message?: string) => void
) => {
  try {
    // Check if expo-print is available
    const Print = require('expo-print');
    const Sharing = require('expo-sharing');
    
    if (!Print || !Sharing) {
      showError?.("Eksport PDF niedostępny", "Aby używać eksportu PDF, zainstaluj wymagane pakiety:\nnpm install expo-print expo-sharing");
      return;
    }

    // Generate HTML content for PDF
    const htmlContent = generatePDFContent(project, totalCost, roomsWithMaterials);
    
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

export const exportToCSV = async (
  project: Project,
  totalCost: number,
  roomsWithMaterials: Room[],
  showError?: (title: string, message?: string) => void,
  showSuccess?: (title: string, message?: string) => void
) => {
  try {
    // Check if expo-file-system is available
    const FileSystem = require('expo-file-system');
    const Sharing = require('expo-sharing');
    
    if (!FileSystem || !Sharing) {
      showError?.("Eksport CSV niedostępny", "Aby używać eksportu CSV, zainstaluj wymagane pakiety:\nnpm install expo-file-system expo-sharing");
      return;
    }

    // Generate CSV content
    const csvContent = generateCSVContent(project, totalCost, roomsWithMaterials);
    
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

const generatePDFContent = (project: Project, totalCost: number, roomsWithMaterials: Room[]) => {
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

const generateCSVContent = (project: Project, totalCost: number, roomsWithMaterials: Room[]) => {
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
