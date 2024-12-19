import { useMdastNodeUpdater, type JsxComponentDescriptor } from "@mdxeditor/editor";
import { usePublisher, insertJsx$ } from "@mdxeditor/editor";
import { Button, Modal, ModalOverlay, ModalContent, ModalBody, Input, VStack, Text, Box } from "@chakra-ui/react";
import { FaHashtag } from "react-icons/fa";
import { useState, useEffect } from "react";
import { useTasks } from "~/contexts/task-context";
import { type Task } from "@prisma/client";
import { MdxJsxAttribute, MdxJsxTextElement } from "mdast-util-mdx";
import { DrawIORef } from "./drawio-ref";

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
      <Button onClick={insertDrawIO} leftIcon={<FaHashtag />} size="sm">
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
    console.log("node", mdastNode);
    console.log(mdastNode.attributes);
    const updateMdastNode = useMdastNodeUpdater();
    const handleSave = (xml: string) => {
      console.log("saving", xml);
      const new_attributes: MdxJsxAttribute[] = [{ name: "xml", value: xml } as MdxJsxAttribute];
      updateMdastNode({ attributes: new_attributes });
    };

    return <DrawIORef xml={(mdastNode.attributes[0]?.value as string) || ""} onSave={handleSave} />;
  },
};
