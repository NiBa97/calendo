import "@mdxeditor/editor/style.css";
import { useState } from "react";
import {
  headingsPlugin,
  listsPlugin,
  quotePlugin,
  thematicBreakPlugin,
  markdownShortcutPlugin,
  MDXEditor,
  type MDXEditorMethods,
  codeBlockPlugin,
  codeMirrorPlugin,
  diffSourcePlugin,
  frontmatterPlugin,
  imagePlugin,
  linkDialogPlugin,
  linkPlugin,
  tablePlugin,
  toolbarPlugin,
  BoldItalicUnderlineToggles,
  ListsToggle,
  CreateLink,
  Separator,
  BlockTypeSelect,
  InsertImage,
  jsxPlugin,
  DiffSourceToggleWrapper,
  CodeMirrorEditor,
} from "@mdxeditor/editor";
import { Box } from "@chakra-ui/react";
import React from "react";
import { type FC } from "react";
import { CreateTaskButton, InsertTaskButton, taskRefComponentDescriptor } from "./task-editor-plugin";
import { drawIORefComponentDescriptor, InsertDrawIOButton } from "./draw-io-plugin";
// import { useAttachments } from "~/contexts/attachment-context";
interface EditorProps {
  markdown: string;
  editorRef?: React.MutableRefObject<MDXEditorMethods | null>;
  onChange: (content: string) => void;
  showToolbar?: boolean;
  readOnly?: boolean;
  //   parentType: ParentType;
}
const SUPPORTED_IMAGE_FORMATS = ["image/jpeg", "image/png", "image/gif", "image/webp"];

// Only import this to the next file
const Editor: FC<EditorProps> = ({ markdown, editorRef, onChange, showToolbar = true, readOnly = false }) => {
  //   const presignedUrlMutation = api.upload.getPresignedUrl.useMutation();
  //   const { addAttachment } = useAttachments();

  const plugins = [
    jsxPlugin({ jsxComponentDescriptors: [taskRefComponentDescriptor, drawIORefComponentDescriptor] }),
    listsPlugin(),
    quotePlugin(),
    headingsPlugin(),
    linkPlugin(),
    imagePlugin(),
    linkDialogPlugin(),
    tablePlugin(),
    thematicBreakPlugin(),
    frontmatterPlugin(),
    codeBlockPlugin({
      codeBlockEditorDescriptors: [
        {
          priority: -10,
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          match: (_) => true,
          Editor: CodeMirrorEditor,
        },
      ],
    }),
    codeMirrorPlugin({
      autoLoadLanguageSupport: true,
      codeBlockLanguages: { js: "JavaScript", css: "CSS", txt: "text", tsx: "TypeScript" },
    }),
    diffSourcePlugin({ viewMode: "rich-text" }),
    markdownShortcutPlugin(),
  ];
  if (showToolbar) {
    plugins.unshift(
      toolbarPlugin({
        toolbarContents: () => (
          <>
            {" "}
            <InsertTaskButton />
            <CreateTaskButton />
            <InsertDrawIOButton />
            <BoldItalicUnderlineToggles />
            <CreateLink />
            <Separator />
            <ListsToggle />
            <Separator />
            <BlockTypeSelect />
            <InsertImage />
            <DiffSourceToggleWrapper>-</DiffSourceToggleWrapper>
          </>
        ),
      })
    );
  }
  const [isDragging, setIsDragging] = useState(false);

  const handleDragEnter = (event: React.DragEvent<HTMLDivElement>) => {
    const items = Array.from(event.dataTransfer.items);
    const files = items.filter((item) => item.kind === "file");

    if (files.length === 0) return;

    // Check if any of the dragged files is an image
    const hasImage = files.some((file) => SUPPORTED_IMAGE_FORMATS.includes(file.type));

    // Only show dragging state if none of the files are images
    if (!hasImage) {
      event.preventDefault();
      setIsDragging(true);
    }
    return true;
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    // Only handle drag leave if the mouse leaves the wrapper element
    if (event.currentTarget === event.target) {
      setIsDragging(false);
    }
  };
  //   const handleDrop = async (event: React.DragEvent<HTMLDivElement>) => {
  //     const files = Array.from(event.dataTransfer.files);
  //     if (files.length === 0 || !files[0] === undefined) return;
  //     // Check if the dropped file is an image
  //     const isImage = SUPPORTED_IMAGE_FORMATS.includes(files[0]!.type);
  //     event.preventDefault();
  //     // Handle non-image file upload
  //     setIsDragging(false);

  //     try {
  //       const { url, fields, key } = await presignedUrlMutation.mutateAsync({
  //         fileName: files[0]!.name,
  //         fileType: files[0]!.type,
  //       });

  //       const formData = new FormData();
  //       Object.entries(fields).forEach(([key, value]) => {
  //         formData.append(key, value);
  //       });
  //       formData.append("file", files[0]!);
  //       await fetch(url, {
  //         method: "POST",
  //         body: formData,
  //       });
  //       await addAttachment(parentId, parentType, {
  //         fileName: files[0]!.name,
  //         fileKey: key,
  //       });
  //       if (isImage) {
  //         editorRef!.current!.insertMarkdown(`<img src="/api/files/${key}" alt="${files[0]!.name}" name="test"/>`);
  //       } else {
  //         editorRef!.current!.insertMarkdown(`NEW FILE! {{${key}}}`);
  //       }
  //     } catch (error) {
  //       console.error("Error uploading file:", error);
  //     }
  //   };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    // Check if the dragged file is an image
    const items = Array.from(event.dataTransfer.items);
    const hasFile = items.some((item) => item.kind === "file");

    // If it's not an image, prevent propagation to allow our drop handler to work
    if (hasFile) {
      event.preventDefault();
      event.stopPropagation();
    }
  };
  return (
    <Box
      //   onDrop={handleDrop}
      onDragOver={handleDragOver} // Allow drop
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        opacity: readOnly ? 0.7 : 1,
      }}
    >
      {isDragging && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.2)", // Transparent overlay
            border: "2px dashed #00f", // Dashed border for feedback
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#00f",
            fontSize: "1.2em",
            transition: "opacity 0.3s ease-in-out",
          }}
        >
          Drop your file here
        </div>
      )}
      <MDXEditor
        plugins={plugins}
        markdown={markdown}
        ref={editorRef}
        onChange={onChange}
        className="dark-theme dark-editor"
        readOnly={readOnly}
      />
    </Box>
  );
};
export default Editor;
