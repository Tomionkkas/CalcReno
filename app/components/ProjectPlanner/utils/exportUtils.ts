import { View } from "react-native";
import { captureRef } from "react-native-view-shot";
import { Project } from "../../../utils/storage";

export const exportCanvasToPNG = async (
  canvasRef: React.RefObject<View>,
  project: Project,
  showError?: (title: string, message?: string) => void
): Promise<string | null> => {
  try {
    if (!canvasRef.current) {
      showError?.("Błąd eksportu", "Nie można uzyskać dostępu do canvas");
      return null;
    }

    const options = {
      format: 'png' as const,
      quality: 1,
      result: 'tmpfile' as const,
    };

    const uri = await captureRef(canvasRef, options);
    return uri;
  } catch (error) {
    showError?.("Błąd eksportu", "Nie udało się wyeksportować planu do PNG");
    return null;
  }
};

export const getCanvasFileName = (project: Project): string => {
  const timestamp = new Date().getTime();
  const sanitizedName = project.name.replace(/[^a-zA-Z0-9]/g, '_');
  return `${sanitizedName}_plan_${timestamp}.png`;
};
