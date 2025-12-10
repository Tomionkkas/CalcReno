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
      encoding: 'utf8',
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
        :root {
          --primary: #4F46E5;
          --text: #1F2937;
          --text-light: #6B7280;
          --bg-gray: #F9FAFB;
          --border: #E5E7EB;
        }
        body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          color: var(--text);
          line-height: 1.5;
          margin: 0;
          padding: 40px;
        }
        .header {
          border-bottom: 2px solid var(--primary);
          padding-bottom: 20px;
          margin-bottom: 40px;
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
        }
        .brand {
          font-size: 24px;
          font-weight: 800;
          color: var(--primary);
          text-transform: uppercase;
          letter-spacing: -0.5px;
        }
        .meta {
          text-align: right;
          font-size: 14px;
          color: var(--text-light);
        }
        .summary-card {
          background: var(--bg-gray);
          padding: 24px;
          border-radius: 12px;
          margin-bottom: 40px;
          border: 1px solid var(--border);
        }
        .total-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }
        .total-label {
          font-size: 16px;
          font-weight: 600;
          color: var(--text-light);
        }
        .total-value {
          font-size: 32px;
          font-weight: 800;
          color: var(--primary);
        }
        h2 {
          font-size: 20px;
          font-weight: 700;
          margin-top: 40px;
          margin-bottom: 20px;
          color: var(--text);
        }
        table {
          width: 100%;
          border-collapse: collapse;
          font-size: 14px;
        }
        th {
          text-align: left;
          padding: 12px 16px;
          background: var(--bg-gray);
          color: var(--text-light);
          font-weight: 600;
          text-transform: uppercase;
          font-size: 12px;
          letter-spacing: 0.5px;
        }
        td {
          padding: 12px 16px;
          border-bottom: 1px solid var(--border);
        }
        tr:last-child td {
          border-bottom: none;
        }
        .room-section {
          margin-top: 40px;
          page-break-inside: avoid;
        }
        .room-header {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          padding-bottom: 8px;
          border-bottom: 1px solid var(--border);
          margin-bottom: 16px;
        }
        .room-title {
          font-size: 18px;
          font-weight: 700;
        }
        .room-meta {
          font-size: 14px;
          color: var(--text-light);
        }
        .footer {
          margin-top: 60px;
          text-align: center;
          font-size: 12px;
          color: var(--text-light);
          border-top: 1px solid var(--border);
          padding-top: 20px;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div>
          <div class="brand">CalcReno</div>
          <div style="font-size: 20px; font-weight: 600; margin-top: 8px;">${project.name}</div>
        </div>
        <div class="meta">
          Data wygenerowania<br>
          <strong>${new Date().toLocaleDateString('pl-PL')}</strong>
        </div>
      </div>

      <div class="summary-card">
        <div class="total-row">
          <span class="total-label">Całkowity koszt projektu</span>
          <span class="total-value">${totalCost.toFixed(2)} zł</span>
        </div>
        <div style="font-size: 14px; color: var(--text-light);">
          Obejmuje ${roomsWithMaterials.length} ${roomsWithMaterials.length === 1 ? 'pomieszczenie' : 'pomieszczeń'}
        </div>
      </div>

      <h2>Zestawienie Materiałów (Całość)</h2>
      <table>
        <thead>
          <tr>
            <th>Materiał</th>
            <th style="text-align: right;">Ilość</th>
            <th style="width: 100px;">Jedn.</th>
          </tr>
        </thead>
        <tbody>
          ${Object.entries(allMaterials).map(([material, quantity]) => `
            <tr>
              <td style="font-weight: 500;">${roomMaterialNames[material] || material}</td>
              <td style="text-align: right;">${quantity}</td>
              <td style="color: var(--text-light);">${roomMaterialUnits[material] || 'szt'}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      ${roomsWithMaterials.map(room => `
        <div class="room-section">
          <div class="room-header">
            <div class="room-title">${room.name}</div>
            <div class="room-meta">
              ${(room.dimensions.width / 100).toFixed(2)}m × ${(room.dimensions.length / 100).toFixed(2)}m
              <span style="margin-left: 12px; font-weight: 600; color: var(--text);">${room.materials?.totalCost.toFixed(2)} zł</span>
            </div>
          </div>
          <table>
            <thead>
              <tr>
                <th>Materiał</th>
                <th style="text-align: right;">Ilość</th>
                <th style="width: 100px;">Jedn.</th>
              </tr>
            </thead>
            <tbody>
              ${Object.entries(room.materials?.materials || {}).map(([material, quantity]) => `
                <tr>
                  <td>${roomMaterialNames[material] || material}</td>
                  <td style="text-align: right;">${quantity}</td>
                  <td style="color: var(--text-light);">${roomMaterialUnits[material] || 'szt'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `).join('')}

      <div class="footer">
        Wygenerowano w aplikacji CalcReno
      </div>
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
