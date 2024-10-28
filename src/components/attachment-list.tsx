import React from "react";
import { Box, VStack, HStack, Icon, IconButton, Text, useBreakpointValue } from "@chakra-ui/react";
import { FaDownload, FaTrash, FaFile, FaImage, FaFileWord, FaFileExcel, FaFilePdf } from "react-icons/fa";
import { type Attachment } from "@prisma/client";
import { useAttachments } from "~/contexts/attachment-context";

const getFileIcon = (fileType: string) => {
  if (fileType.startsWith("image/")) return FaImage;
  if (fileType === "application/pdf") return FaFilePdf;
  if (fileType.includes("word")) return FaFileWord;
  if (fileType.includes("excel") || fileType.includes("spreadsheet")) return FaFileExcel;
  return FaFile;
};

interface AttachmentListProps {
  taskId: string;
}

const AttachmentList = ({ taskId }: AttachmentListProps) => {
  const { deleteAttachment, getAttachmentsForTask } = useAttachments();
  const attachments = getAttachmentsForTask(taskId);
  const isMobile = useBreakpointValue({ base: true, md: false });
  console.log(attachments);
  const handleDownload = async (attachment: Attachment) => {
    const response = await fetch(`/api/files/${attachment.fileKey}`);
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = attachment.fileName;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  if (!attachments.length) {
    return null;
  }

  return (
    <Box borderTop="1px solid" borderColor="brand.2" bg="brand.1" p={2}>
      <VStack
        spacing={2}
        align="stretch"
        maxH="200px"
        overflowY="auto"
        sx={{
          "&::-webkit-scrollbar": {
            width: "4px",
          },
          "&::-webkit-scrollbar-track": {
            background: "brand.1",
          },
          "&::-webkit-scrollbar-thumb": {
            background: "brand.3",
            borderRadius: "2px",
          },
        }}
      >
        {attachments.map((attachment) => (
          <HStack
            key={attachment.id}
            p={2}
            borderRadius="md"
            bg="brand.2"
            _hover={{ bg: "brand.3" }}
            transition="background 0.2s"
            spacing={3}
          >
            <Icon as={getFileIcon(attachment.fileName)} boxSize={isMobile ? 4 : 5} color="brand.4" />
            <Text flex="1" fontSize={isMobile ? "sm" : "md"} noOfLines={1} color="brand.4">
              {attachment.fileName}
            </Text>
            <HStack spacing={2}>
              <IconButton
                aria-label="Download file"
                icon={<FaDownload />}
                size={isMobile ? "sm" : "md"}
                variant="ghost"
                color="brand.4"
                onClick={() => handleDownload(attachment)}
              />
              <IconButton
                aria-label="Delete file"
                icon={<FaTrash />}
                size={isMobile ? "sm" : "md"}
                variant="ghost"
                color="red.500"
                _hover={{ bg: "red.100" }}
                onClick={() => deleteAttachment(attachment.fileKey, taskId)}
              />
            </HStack>
          </HStack>
        ))}
      </VStack>
    </Box>
  );
};

export default AttachmentList;
