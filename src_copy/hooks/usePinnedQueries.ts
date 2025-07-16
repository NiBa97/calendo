import { useState, useEffect } from "react";

export type PinnedQuery = {
  id: string;
  name: string;
  filters: {
    title: string;
    type: string;
    status: string;
    tags: string[];
  };
};

export const usePinnedQueries = () => {
  const [pinnedQueries, setPinnedQueries] = useState<PinnedQuery[]>([]);

  // Load pinned queries from localStorage on mount
  useEffect(() => {
    try {
      const savedQueries = localStorage.getItem("pinnedQueries");
      if (savedQueries) {
        const queries = JSON.parse(savedQueries);
        setPinnedQueries(queries);
      }
    } catch (error) {
      console.error("Error loading pinned queries:", error);
      localStorage.removeItem("pinnedQueries");
      setPinnedQueries([]);
    }
  }, []);

  // Save pinned queries to localStorage whenever they change
  useEffect(() => {
    try {
      if (pinnedQueries.length > 0) {
        localStorage.setItem("pinnedQueries", JSON.stringify(pinnedQueries));
      }
    } catch (error) {
      console.error("Error saving pinned queries:", error);
    }
  }, [pinnedQueries]);

  const addPinnedQuery = (name: string, filters: PinnedQuery["filters"]) => {
    if (!name.trim()) return;

    const newQuery: PinnedQuery = {
      id: Date.now().toString(),
      name: name.trim(),
      filters: {
        title: filters.title,
        type: filters.type,
        status: filters.status,
        tags: [...filters.tags],
      },
    };

    setPinnedQueries((prev) => [...prev, newQuery]);
  };

  const deletePinnedQuery = (queryId: string) => {
    setPinnedQueries((prev) => prev.filter((q) => q.id !== queryId));
  };

  return {
    pinnedQueries,
    addPinnedQuery,
    deletePinnedQuery,
  };
};