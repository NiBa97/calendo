// contexts/AttachmentContext.tsx
import React, { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { type Attachment } from "@prisma/client";

import { api } from "~/trpc/react";

interface AttachmentContextType {
  getAttachmentsForTask: (taskId: string) => Attachment[];
  addAttachment: (taskId: string, attachment: Partial<Attachment>) => Promise<void>;
  deleteAttachment: (attachmentId: string, taskId: string) => Promise<void>;
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

  const getAttachmentsForTask = (taskId: string): Attachment[] => {
    return attachments.filter((attachment) => attachment.taskId === taskId);
  };

  const addAttachment = async (taskId: string, attachment: Partial<Attachment>) => {
    const new_attachment = await addAttachmentMutation({
      taskId: taskId,
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
        getAttachmentsForTask,
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
