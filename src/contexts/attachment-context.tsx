import React, { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { type Attachment } from "@prisma/client";
import { ParentType } from "@prisma/client";
import { api } from "~/trpc/react";

export interface AttachmentContextType {
  getAttachmentsForParent: (parentId: string, parentType: ParentType) => Attachment[];
  addAttachment: (parentId: string, parentType: ParentType, attachment: Partial<Attachment>) => Promise<void>;
  deleteAttachment: (fileKey: string, parentId: string) => Promise<void>;
}

export const AttachmentContext = createContext<AttachmentContextType | undefined>(undefined);

export const AttachmentProvider = ({ children }: { children: ReactNode }) => {
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const { mutateAsync: addAttachmentMutation } = api.attachments.create.useMutation();
  const { mutateAsync: deleteAttachmentMutation } = api.attachments.delete.useMutation();
  const { data: fetched_attachments } = api.attachments.getAllForUser.useQuery();

  useEffect(() => {
    if (fetched_attachments) {
      setAttachments(fetched_attachments);
    }
  }, [fetched_attachments]);

  const getAttachmentsForParent = (parentId: string, parentType: ParentType): Attachment[] => {
    if (parentType === ParentType.TASK) {
      return attachments.filter((attachment) => attachment.taskId === parentId && attachment.parentType === parentType);
    } else {
      return attachments.filter((attachment) => attachment.noteId === parentId && attachment.parentType === parentType);
    }
  };

  const addAttachment = async (parentId: string, parentType: ParentType, attachment: Partial<Attachment>) => {
    console.log("addAttachment", parentId, parentType, attachment);
    const new_attachment = await addAttachmentMutation({
      parentId: parentId,
      parentType: parentType,
      fileName: attachment.fileName!,
      fileKey: attachment.fileKey!,
    });

    setAttachments((prevAttachments) => [...prevAttachments, new_attachment]);
  };

  const deleteAttachment = async (attachmentKey: string) => {
    await deleteAttachmentMutation({ fileKey: attachmentKey });
    setAttachments((prevAttachments) => prevAttachments.filter((attachment) => attachment.fileKey !== attachmentKey));
  };

  return (
    <AttachmentContext.Provider
      value={{
        getAttachmentsForParent,
        addAttachment,
        deleteAttachment,
      }}
    >
      {children}
    </AttachmentContext.Provider>
  );
};

export const useAttachments = () => {
  const context = useContext(AttachmentContext);
  if (context === undefined) {
    throw new Error("useAttachments must be used within an AttachmentProvider");
  }
  return context;
};
