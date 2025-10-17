import { useState, useMemo } from "react";
import { Project } from "../utils/storage";

export function useSearchFilter(projects: Project[]) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterVisible, setFilterVisible] = useState(false);
  const [sortVisible, setSortVisible] = useState(false);
  const [activeFilter, setActiveFilter] = useState("Wszystkie");

  const statusFilters = [
    "Wszystkie",
    "W trakcie",
    "Planowany",
    "Zakończony",
    "Wstrzymany",
  ];

  const filteredProjects = useMemo(() => {
    return projects
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
  }, [projects, searchQuery, activeFilter]);

  const toggleFilter = () => {
    setFilterVisible(!filterVisible);
    setSortVisible(false);
  };

  const toggleSort = () => {
    setSortVisible(!sortVisible);
    setFilterVisible(false);
  };

  const applyFilter = (filter: string) => {
    setActiveFilter(filter);
    setFilterVisible(false);
  };

  return {
    searchQuery,
    setSearchQuery,
    filterVisible,
    sortVisible,
    activeFilter,
    statusFilters,
    filteredProjects,
    toggleFilter,
    toggleSort,
    applyFilter,
  };
}
