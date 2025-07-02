import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { Note } from "../types";
import { Task } from "../types";

// Combined type for list items (notes and tasks)
export type ListItem = {
  id: string;
  title: string;
  isTask: boolean;
  status?: boolean;
  created: Date;
  updated?: Date;
  dueDate?: Date;
  tags: string[];
  shared: boolean;
};

export const useListFilters = (notes: Note[], tasks: Task[]) => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Local state for filters
  const [titleFilter, setTitleFilter] = useState(searchParams.get("title") || "");
  const [typeFilter, setTypeFilter] = useState(searchParams.get("type") || "all");
  const [statusFilter, setStatusFilter] = useState(searchParams.get("status") || "open");
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>(
    searchParams.get("tags") ? searchParams.get("tags")!.split(",") : []
  );

  // Sync local state with URL parameter changes
  useEffect(() => {
    const titleParam = searchParams.get("title") || "";
    const typeParam = searchParams.get("type") || "all";
    const statusParam = searchParams.get("status") || "open";
    const tagsParam = searchParams.get("tags") ? searchParams.get("tags")!.split(",") : [];

    if (titleParam !== titleFilter) setTitleFilter(titleParam);
    if (typeParam !== typeFilter) setTypeFilter(typeParam);
    if (statusParam !== statusFilter) setStatusFilter(statusParam);
    if (JSON.stringify(tagsParam) !== JSON.stringify(selectedTagIds)) {
      setSelectedTagIds(tagsParam);
    }
  }, [searchParams]);

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();

    if (titleFilter) params.set("title", titleFilter);
    if (typeFilter !== "all") params.set("type", typeFilter);
    if (statusFilter !== "all") params.set("status", statusFilter);
    if (selectedTagIds.length > 0) params.set("tags", selectedTagIds.join(","));

    setSearchParams(params, { replace: true });
  }, [titleFilter, typeFilter, statusFilter, selectedTagIds, setSearchParams]);

  // Convert notes and tasks to a unified list item format
  const allItems = useMemo(() => {
    const noteItems: ListItem[] = notes.map((note) => ({
      id: note.id,
      title: note.title || "Untitled Note",
      isTask: false,
      status: note.status,
      created: note.created,
      updated: note.updated,
      tags: note.tags || [],
      shared: note.user?.length > 1 || false,
    }));

    const taskItems: ListItem[] = tasks.map((task) => ({
      id: task.id,
      title: task.title || "Untitled Task",
      isTask: true,
      status: task.status,
      created: task.created,
      dueDate: task.startDate ? new Date(task.startDate) : undefined,
      tags: task.tags || [],
      shared: task.user?.length > 1 || false,
    }));

    return [...noteItems, ...taskItems];
  }, [notes, tasks]);

  // Apply all filters
  const filteredItems = useMemo(() => {
    return allItems.filter((item) => {
      // Filter by title
      const matchesTitle = !titleFilter || item.title.toLowerCase().includes(titleFilter.toLowerCase());

      // Filter by type (note/task)
      const matchesType =
        typeFilter === "all" || (typeFilter === "notes" && !item.isTask) || (typeFilter === "tasks" && item.isTask);

      // Filter by tags
      const matchesTags = selectedTagIds.length === 0 || selectedTagIds.some((tagId) => item.tags.includes(tagId));

      return matchesTitle && matchesType && matchesTags;
    });
  }, [allItems, titleFilter, typeFilter, selectedTagIds]);

  // Sort by created date
  const sortedItems = useMemo(() => {
    return [...filteredItems].sort((a, b) => {
      return b.created.getTime() - a.created.getTime();
    });
  }, [filteredItems]);

  const handleTagClick = (tagId: string) => {
    setSelectedTagIds((prev) => {
      if (prev.includes(tagId)) {
        return prev.filter((id) => id !== tagId);
      } else {
        return [...prev, tagId];
      }
    });
  };

  const clearFilters = () => {
    setTitleFilter("");
    setTypeFilter("all");
    setSelectedTagIds([]);
  };

  const getCurrentFilters = () => ({
    title: titleFilter,
    type: typeFilter,
    status: statusFilter,
    tags: selectedTagIds,
  });

  const applyFilters = (filters: {
    title: string;
    type: string;
    status: string;
    tags: string[];
  }) => {
    setTitleFilter(filters.title);
    setTypeFilter(filters.type);
    setStatusFilter(filters.status);
    setSelectedTagIds(filters.tags);
  };

  return {
    // Filter state
    titleFilter,
    typeFilter,
    statusFilter,
    selectedTagIds,
    
    // Filter setters
    setTitleFilter,
    setTypeFilter,
    setStatusFilter,
    setSelectedTagIds,
    
    // Filtered data
    allItems,
    filteredItems,
    sortedItems,
    
    // Helper functions
    handleTagClick,
    clearFilters,
    getCurrentFilters,
    applyFilters,
  };
};