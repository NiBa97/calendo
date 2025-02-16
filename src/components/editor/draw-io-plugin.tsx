import { useMdastNodeUpdater, type JsxComponentDescriptor } from "@mdxeditor/editor";
import { usePublisher, insertJsx$ } from "@mdxeditor/editor";
import { FaHashtag } from "react-icons/fa";
import { MdxJsxAttribute } from "mdast-util-mdx";

import { Image, Box, Button, useDisclosure } from "@chakra-ui/react";
import { useRef } from "react";
import { DrawIoEmbed } from "react-drawio";
import { DialogBody, DialogContent, DialogRoot } from "../ui/dialog";

export interface DrawIORefProps {
  xml: string;
  onSave?: (xml: string) => void;
}

export const DrawIORef: React.FC<DrawIORefProps> = ({ xml, onSave }) => {
  const { open: isOpen, onOpen, onClose } = useDisclosure();
  const { open: isAlertOpen, onOpen: onAlertOpen, onClose: onAlertClose } = useDisclosure();

  // Function to handle saving
  const handleSave = (newXml: string) => {
    if (onSave) {
      onSave(newXml);
    }
  };

  // Function to handle confirmed close
  const handleConfirmedClose = () => {
    onAlertClose();
    onClose();
  };

  return (
    <>
      <Box
        cursor="pointer"
        onClick={onOpen}
        bg="gray.100"
        w="fit-content"
        h="fit-content"
        p={2}
        position="relative"
        _hover={{
          cursor: "hand",
          bg: "gray.200",
          "& > .hover-text": {
            opacity: 1,
            cursor: "pointer",
          },
        }}
      >
        <Image src={xml} alt="drawio" w="auto" h="auto" />
        <Box
          className="hover-text"
          position="absolute"
          top="0"
          left="0"
          right="0"
          bottom="0"
          display="flex"
          alignItems="center"
          justifyContent="center"
          bg="blackAlpha.600"
          color="white"
          opacity="0"
          transition="opacity 0.2s"
          cursor={"pointer"}
        >
          Click to edit
        </Box>
      </Box>
      {/* Main Modal */}
      <DialogRoot
        open={isOpen}
        onOpenChange={(open) => {
          if (!open) onClose();
        }}
        size="full"
      >
        <DialogContent h="80vh" maxW="90vw" maxH="80vh" background={"transparent"}>
          <DialogBody py={4} background={"transparent"}>
            <DrawIoEmbed xml={xml} onSave={(data) => handleSave(data.xml)} onClose={onClose} />
          </DialogBody>
        </DialogContent>
      </DialogRoot>
      {/* Confirmation Dialog */}
      <DialogRoot
        role="alertdialog"
        open={isAlertOpen}
        onOpenChange={(open) => {
          if (!open) onAlertClose();
        }}
      >
        <DialogContent>
          <DialogBody>Are you sure? Any unsaved changes will be lost.</DialogBody>
        </DialogContent>
      </DialogRoot>
    </>
  );
};

// Toolbar button component
export const InsertDrawIOButton = () => {
  const insertJsx = usePublisher(insertJsx$);
  const insertDrawIO = () => {
    insertJsx({
      name: "DrawIORef",
      kind: "text",
      props: {
        xml: "",
      },
    });
  };
  return (
    <>
      <Button onClick={insertDrawIO} size="sm">
        <FaHashtag />
        Insert DrawIO
      </Button>
    </>
  );
};

// JSX Component Descriptor

export const drawIORefComponentDescriptor: JsxComponentDescriptor = {
  name: "DrawIORef",
  kind: "text",
  source: "~/components/drawio-ref.tsx",
  props: [{ name: "xml", type: "string" }],
  hasChildren: false,
  defaultExport: true,
  Editor: ({ mdastNode }) => {
    const updateMdastNode = useMdastNodeUpdater();
    const handleSave = (xml: string) => {
      const new_attributes: MdxJsxAttribute[] = [{ name: "xml", value: xml } as MdxJsxAttribute];
      updateMdastNode({ attributes: new_attributes });
    };

    return <DrawIORef xml={(mdastNode.attributes[0]?.value as string) || ""} onSave={handleSave} />;
  },
};
