import React, { createContext, useContext, useState, useEffect } from "react";
import { getPb } from "../pocketbaseUtils";
import { Tag, convertTagRecordToTag } from "../types";
import { useOperationStatus } from "./operation-status-context";

interface TagContextType {
  tags: Tag[];
  createTag: (tagData: Partial<Tag>) => Promise<Tag>;
  updateTag: (tagId: string, updatedData: Partial<Tag>) => Promise<void>;
  deleteTag: (tagId: string) => Promise<void>;
}

const TagContext = createContext<TagContextType | undefined>(undefined);

export const TagProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pb = getPb();
  const [tags, setTags] = useState<Tag[]>([]);
  const { setStatus } = useOperationStatus();

  useEffect(() => {
    setStatus("loading");
    pb.collection("tag")
      .getFullList()
      .then((records) => {
        setTags(records.map(convertTagRecordToTag));
        setStatus("idle");
      })
      .catch((error) => {
        console.error("Failed to load tags:", error);
        setStatus("error");
      });
  }, []);

  const createTag = async (tagData: Partial<Tag>) => {
    try {
      setStatus("loading");
      const data = {
        name: tagData.name || "",
        color: tagData.color || "#808080",
        user: [pb.authStore.model?.id],
      };

      const record = await pb.collection("tag").create(data);
      const newTag = convertTagRecordToTag(record);
      setTags((prevTags) => [...prevTags, newTag]);
      setStatus("idle");
      return newTag;
    } catch (error) {
      setStatus("error");
      throw error;
    }
  };

  const updateTag = async (tagId: string, updatedData: Partial<Tag>) => {
    try {
      setStatus("loading");
      const data = {
        name: updatedData.name,
        color: updatedData.color,
        user: updatedData.user,
      };

      const record = await pb.collection("tag").update(tagId, data);
      const updatedTag = convertTagRecordToTag(record);
      setTags((prevTags) => prevTags.map((tag) => (tag.id === tagId ? updatedTag : tag)));
      setStatus("idle");
    } catch (error) {
      setStatus("error");
      throw error;
    }
  };

  const deleteTag = async (tagId: string) => {
    try {
      setStatus("loading");
      await pb.collection("tag").delete(tagId);
      setTags((prevTags) => prevTags.filter((tag) => tag.id !== tagId));
      setStatus("idle");
    } catch (error) {
      setStatus("error");
      throw error;
    }
  };

  return (
    <TagContext.Provider
      value={{
        tags,
        createTag,
        updateTag,
        deleteTag,
      }}
    >
      {children}
    </TagContext.Provider>
  );
};

export const useTags = () => {
  const context = useContext(TagContext);
  if (context === undefined) {
    throw new Error("useTags must be used within a TagProvider");
  }
  return context;
};
