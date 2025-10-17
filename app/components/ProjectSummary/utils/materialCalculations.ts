import { Project, Room } from "../../../utils/storage";

// Material names for display
export const materialNames: { [key: string]: string } = {
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

export const materialUnits: { [key: string]: string } = {
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

export const materialCategories = {
  "Podłoga": ["floorPanels", "underlayment", "osb", "osbScrews", "baseboards", "baseboardEnds"],
  "Ściany": ["paint", "drywall", "cwProfiles", "uwProfiles", "mineralWool", "tnScrews", "wallPlaster", "finishingPlaster"],
  "Sufit": ["cdProfiles", "udProfiles", "hangers", "gypsum", "plaster"],
  "Instalacja elektryczna": ["sockets", "switches", "cable15", "cable25", "junctionBox"]
};

export interface ProjectSummaryData {
  totalCost: number;
  roomsWithMaterials: Room[];
  projectProgress: number;
  projectStatus: {
    type: 'planned' | 'completed' | 'inProgress';
    label: string;
    color: string;
  };
}

export const calculateProjectSummary = (project: Project): ProjectSummaryData => {
  const totalCost = project?.rooms.reduce(
    (sum, room) => sum + (room.materials?.totalCost || 0),
    0,
  ) || 0;

  const roomsWithMaterials = project?.rooms.filter((room) => room.materials) || [];

  const getProjectProgress = () => {
    if (!project.rooms.length) return 0;
    return Math.round((roomsWithMaterials.length / project.rooms.length) * 100);
  };

  const getProjectStatus = () => {
    const progress = getProjectProgress();
    if (progress === 0) return { type: 'planned' as const, label: 'Oczekuje', color: '#F59E0B' };
    if (progress === 100) return { type: 'completed' as const, label: 'Ukończone', color: '#10B981' };
    return { type: 'inProgress' as const, label: 'W trakcie', color: '#3B82F6' };
  };

  return {
    totalCost,
    roomsWithMaterials,
    projectProgress: getProjectProgress(),
    projectStatus: getProjectStatus(),
  };
};

export const aggregateMaterials = (project: Project) => {
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

  return allMaterials;
};

export const getMaterialDisplayData = (project: Project) => {
  const firstRoomWithMaterials = project?.rooms.find((room) => room.materials);
  const roomMaterialNames = (firstRoomWithMaterials?.materials as any)?.materialNames || materialNames;
  const roomMaterialUnits = (firstRoomWithMaterials?.materials as any)?.materialUnits || materialUnits;

  return {
    roomMaterialNames,
    roomMaterialUnits,
  };
};
