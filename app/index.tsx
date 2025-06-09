import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StatusBar,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  Modal,
  Alert,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Plus, Search, Filter, SortDesc } from "lucide-react-native";
import ProjectCard from "./components/ProjectCard";
import { useRouter, useFocusEffect } from "expo-router";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { StorageService, Project } from "./utils/storage";

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState("");
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filterVisible, setFilterVisible] = useState(false);
  const [sortVisible, setSortVisible] = useState(false);
  const [activeFilter, setActiveFilter] = useState("Wszystkie");
  const [showAddModal, setShowAddModal] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectDescription, setNewProjectDescription] = useState("");
  const [newProjectStatus, setNewProjectStatus] = useState("Planowany");
  const [newProjectStartDate, setNewProjectStartDate] = useState("");
  const [newProjectEndDate, setNewProjectEndDate] = useState("");

  const statusFilters = [
    "Wszystkie",
    "W trakcie",
    "Planowany",
    "Zakończony",
    "Wstrzymany",
  ];

  // Load projects on component mount and when screen is focused
  useFocusEffect(
    useCallback(() => {
      loadProjects();
    }, []),
  );

  const loadProjects = async () => {
    try {
      setLoading(true);
      const projectsData = await StorageService.getProjects();
      setProjects(projectsData);
    } catch (error) {
      console.error("Error loading projects:", error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadProjects();
    setRefreshing(false);
  };

  const filteredProjects = projects
    .filter((project) => {
      // Apply search filter
      if (
        searchQuery &&
        !project.name.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }

      // Apply status filter
      if (activeFilter !== "Wszystkie" && project.status !== activeFilter) {
        return false;
      }

      return true;
    })
    .sort((a, b) => {
      // Sort pinned projects first
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return 0;
    });

  const handleAddProject = () => {
    setShowAddModal(true);
  };

  const handleSaveProject = async () => {
    if (!newProjectName.trim()) {
      Alert.alert("Błąd", "Nazwa projektu jest wymagana");
      return;
    }

    const newProject = {
      id: Date.now().toString(),
      name: newProjectName,
      description: newProjectDescription,
      status: newProjectStatus as any,
      startDate: newProjectStartDate || new Date().toISOString().split("T")[0],
      endDate: newProjectEndDate || new Date().toISOString().split("T")[0],
      isPinned: false,
      rooms: [],
    };

    try {
      await StorageService.addProject(newProject);
      setProjects([...projects, newProject]);
      setShowAddModal(false);
      setNewProjectName("");
      setNewProjectDescription("");
      setNewProjectStatus("Planowany");
      setNewProjectStartDate("");
      setNewProjectEndDate("");
      Alert.alert("Sukces", "Projekt został dodany");
    } catch (error) {
      Alert.alert("Błąd", "Nie udało się dodać projektu");
    }
  };

  const handleEditProject = (projectId: string) => {
    router.push(`/project/${projectId}`);
  };

  const handleDeleteProject = async (projectId: string) => {
    try {
      await StorageService.deleteProject(projectId);
      setProjects(projects.filter((project) => project.id !== projectId));
    } catch (error) {
      console.error("Error deleting project:", error);
    }
  };

  const handleTogglePin = async (projectId: string) => {
    try {
      const project = projects.find((p) => p.id === projectId);
      if (project) {
        const updatedProject = { ...project, isPinned: !project.isPinned };
        await StorageService.updateProject(updatedProject);
        setProjects(
          projects.map((p) => (p.id === projectId ? updatedProject : p)),
        );
      }
    } catch (error) {
      console.error("Error updating project:", error);
    }
  };

  const toggleFilter = () => {
    setFilterVisible(!filterVisible);
    setSortVisible(false);
  };

  const toggleSort = () => {
    setSortVisible(!sortVisible);
    setFilterVisible(false);
  };

  const applyFilter = (filter) => {
    setActiveFilter(filter);
    setFilterVisible(false);
  };

  const sortProjects = (sortType: string) => {
    let sortedProjects = [...projects];

    switch (sortType) {
      case "name":
        sortedProjects.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "date":
        sortedProjects.sort(
          (a, b) =>
            new Date(a.startDate).getTime() - new Date(b.startDate).getTime(),
        );
        break;
      case "status":
        sortedProjects.sort((a, b) => a.status.localeCompare(b.status));
        break;
    }

    setProjects(sortedProjects);
    setSortVisible(false);
  };

  const renderEmptyState = () => (
    <View
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
    >
      <View
        style={{
          backgroundColor: "#1E2139",
          borderRadius: 16,
          padding: 32,
          alignItems: "center",
          maxWidth: 320,
        }}
      >
        <Text
          style={{
            color: "white",
            fontSize: 20,
            fontWeight: "bold",
            marginBottom: 16,
            textAlign: "center",
          }}
        >
          Brak projektów
        </Text>
        <Text
          style={{
            color: "#B8BCC8",
            textAlign: "center",
            marginBottom: 24,
            fontSize: 16,
            lineHeight: 24,
          }}
        >
          Dodaj swój pierwszy projekt remontowy, aby rozpocząć korzystanie z
          kalkulatora materiałów.
        </Text>
        <TouchableOpacity
          onPress={handleAddProject}
          style={{ borderRadius: 12, overflow: "hidden" }}
        >
          <LinearGradient
            colors={["#6C63FF", "#4DABF7"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{
              paddingHorizontal: 24,
              paddingVertical: 12,
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <Plus size={20} color="#FFFFFF" />
            <Text
              style={{
                color: "white",
                fontWeight: "500",
                marginLeft: 8,
                fontSize: 16,
              }}
            >
              Dodaj projekt
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#0A0B1E" }}>
      <StatusBar barStyle="light-content" backgroundColor="#0A0B1E" />

      {/* Header with gradient */}
      <LinearGradient
        colors={["#0A0B1E", "#151829"]}
        style={{ paddingTop: 16, paddingBottom: 16, paddingHorizontal: 16 }}
      >
        <Text
          style={{
            color: "white",
            fontSize: 28,
            fontWeight: "bold",
            marginBottom: 8,
          }}
        >
          CalcReno
        </Text>
        <Text style={{ color: "#B8BCC8", fontSize: 16 }}>
          Kalkulator Materiałów Remontowych
        </Text>
      </LinearGradient>

      {/* Search and filter bar */}
      <View
        style={{
          paddingHorizontal: 16,
          paddingVertical: 12,
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: "#151829",
        }}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "#1E2139",
            borderRadius: 12,
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 12,
            paddingVertical: 8,
            marginRight: 8,
          }}
        >
          <Search size={20} color="#6B7280" />
          <TextInput
            style={{ flex: 1, color: "white", marginLeft: 8, fontSize: 16 }}
            placeholder="Szukaj projektu..."
            placeholderTextColor="#6B7280"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <TouchableOpacity
          onPress={toggleFilter}
          style={{
            padding: 8,
            borderRadius: 12,
            backgroundColor: filterVisible ? "#6C63FF" : "#1E2139",
            minWidth: 44,
            minHeight: 44,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Filter size={20} color={filterVisible ? "#FFFFFF" : "#6B7280"} />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={toggleSort}
          style={{
            padding: 8,
            borderRadius: 12,
            backgroundColor: sortVisible ? "#6C63FF" : "#1E2139",
            marginLeft: 8,
            minWidth: 44,
            minHeight: 44,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <SortDesc size={20} color={sortVisible ? "#FFFFFF" : "#6B7280"} />
        </TouchableOpacity>
      </View>

      {/* Filter dropdown */}
      {filterVisible && (
        <View
          style={{
            marginHorizontal: 16,
            backgroundColor: "#1E2139",
            borderRadius: 12,
            padding: 8,
            elevation: 5,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
          }}
        >
          {statusFilters.map((filter) => (
            <TouchableOpacity
              key={filter}
              onPress={() => applyFilter(filter)}
              style={{
                padding: 12,
                borderRadius: 8,
                backgroundColor:
                  activeFilter === filter ? "#2A2D4A" : "transparent",
                minHeight: 44,
              }}
            >
              <Text
                style={{
                  color: activeFilter === filter ? "#6C63FF" : "white",
                  fontSize: 16,
                }}
              >
                {filter}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Sort dropdown */}
      {sortVisible && (
        <View
          style={{
            marginHorizontal: 16,
            backgroundColor: "#1E2139",
            borderRadius: 12,
            padding: 8,
            elevation: 5,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
          }}
        >
          <TouchableOpacity
            onPress={() => sortProjects("name")}
            style={{ padding: 12, borderRadius: 8, minHeight: 44 }}
          >
            <Text style={{ color: "white", fontSize: 16 }}>Alfabetycznie</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => sortProjects("date")}
            style={{ padding: 12, borderRadius: 8, minHeight: 44 }}
          >
            <Text style={{ color: "white", fontSize: 16 }}>
              Data rozpoczęcia
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => sortProjects("status")}
            style={{ padding: 12, borderRadius: 8, minHeight: 44 }}
          >
            <Text style={{ color: "white", fontSize: 16 }}>Status</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Projects list */}
      {loading ? (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ActivityIndicator size="large" color="#6C63FF" />
          <Text style={{ color: "white", marginTop: 16 }}>
            Ładowanie projektów...
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredProjects}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{
            padding: 16,
            paddingBottom: insets.bottom + 80,
          }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#6C63FF"]}
              tintColor="#6C63FF"
            />
          }
          ListEmptyComponent={renderEmptyState}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => handleEditProject(item.id)}
              activeOpacity={0.8}
            >
              <ProjectCard
                id={item.id}
                name={item.name}
                status={item.status as any}
                startDate={item.startDate}
                endDate={item.endDate}
                isPinned={item.isPinned}
                onEdit={() => handleEditProject(item.id)}
                onDelete={() => handleDeleteProject(item.id)}
                onPin={() => handleTogglePin(item.id)}
              />
            </TouchableOpacity>
          )}
        />
      )}

      {/* Floating Action Button */}
      <TouchableOpacity
        onPress={handleAddProject}
        style={{
          position: "absolute",
          bottom: insets.bottom + 24,
          right: 24,
          borderRadius: 32,
          overflow: "hidden",
          elevation: 8,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 4.65,
        }}
      >
        <LinearGradient
          colors={["#6C63FF", "#4DABF7"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{
            width: 64,
            height: 64,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Plus size={28} color="#FFFFFF" />
        </LinearGradient>
      </TouchableOpacity>

      {/* Add Project Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAddModal(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
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
                  Nowy Projekt
                </Text>

                <View style={{ marginBottom: 16 }}>
                  <Text
                    style={{ color: "white", marginBottom: 8, fontSize: 16 }}
                  >
                    Nazwa projektu *
                  </Text>
                  <TextInput
                    style={{
                      backgroundColor: "#374151",
                      color: "white",
                      padding: 12,
                      borderRadius: 8,
                      fontSize: 16,
                    }}
                    value={newProjectName}
                    onChangeText={setNewProjectName}
                    placeholder="Wprowadź nazwę projektu"
                    placeholderTextColor="#9CA3AF"
                  />
                </View>

                <View style={{ marginBottom: 16 }}>
                  <Text
                    style={{ color: "white", marginBottom: 8, fontSize: 16 }}
                  >
                    Opis
                  </Text>
                  <TextInput
                    style={{
                      backgroundColor: "#374151",
                      color: "white",
                      padding: 12,
                      borderRadius: 8,
                      fontSize: 16,
                      minHeight: 80,
                    }}
                    value={newProjectDescription}
                    onChangeText={setNewProjectDescription}
                    placeholder="Opis projektu (opcjonalnie)"
                    placeholderTextColor="#9CA3AF"
                    multiline
                    textAlignVertical="top"
                  />
                </View>

                <View style={{ marginBottom: 16 }}>
                  <Text
                    style={{ color: "white", marginBottom: 8, fontSize: 16 }}
                  >
                    Status
                  </Text>
                  <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
                    {["Planowany", "W trakcie", "Wstrzymany", "Zakończony"].map(
                      (status) => (
                        <TouchableOpacity
                          key={status}
                          onPress={() => setNewProjectStatus(status)}
                          style={{
                            backgroundColor:
                              newProjectStatus === status
                                ? "#6C63FF"
                                : "#374151",
                            paddingHorizontal: 12,
                            paddingVertical: 8,
                            borderRadius: 8,
                            marginRight: 8,
                            marginBottom: 8,
                          }}
                        >
                          <Text style={{ color: "white", fontSize: 14 }}>
                            {status}
                          </Text>
                        </TouchableOpacity>
                      ),
                    )}
                  </View>
                </View>

                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    marginTop: 24,
                  }}
                >
                  <TouchableOpacity
                    onPress={() => setShowAddModal(false)}
                    style={{
                      flex: 1,
                      backgroundColor: "#374151",
                      padding: 12,
                      borderRadius: 8,
                      marginRight: 8,
                    }}
                  >
                    <Text
                      style={{
                        color: "white",
                        textAlign: "center",
                        fontSize: 16,
                      }}
                    >
                      Anuluj
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={handleSaveProject}
                    style={{
                      flex: 1,
                      borderRadius: 8,
                      overflow: "hidden",
                      marginLeft: 8,
                    }}
                  >
                    <LinearGradient
                      colors={["#6C63FF", "#4DABF7"]}
                      style={{
                        padding: 12,
                        alignItems: "center",
                      }}
                    >
                      <Text
                        style={{
                          color: "white",
                          fontSize: 16,
                          fontWeight: "500",
                        }}
                      >
                        Zapisz
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </LinearGradient>
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}
