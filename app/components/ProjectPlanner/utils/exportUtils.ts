import { View } from "react-native";
import { captureRef } from "react-native-view-shot";
import { Project } from "../../../utils/storage";

export const exportCanvasToPNG = async (
  canvasRef: React.RefObject<View>,
  project: Project,
  showError?: (title: string, message?: string) => void,
  showSuccess?: (title: string, message?: string) => void
) => {
  try {
    if (!canvasRef.current) {
      showError?.("Błąd eksportu", "Nie można uzyskać dostępu do canvas");
      return;
    }

    const options = {
      format: 'png' as const,
      quality: 1,
      result: 'tmpfile' as const,
    };

    const uri = await captureRef(canvasRef, options);
    
    // Share the PNG
    const Sharing = require('expo-sharing');
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(uri, {
        UTI: '.png',
        mimeType: 'image/png',
      });
    } else {
      showSuccess?.("Sukces", `Plan zapisany w: ${uri}`);
    }
  } catch (error) {
    showError?.("Błąd eksportu", "Nie udało się wyeksportować planu do PNG");
  }
};

export const getCanvasFileName = (project: Project): string => {
  const sanitizedName = project.name.replace(/[^a-zA-Z0-9]/g, '_');
  return `${sanitizedName}_plan.png`;
};
