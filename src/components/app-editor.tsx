"use client";
// InitializedMDXEditor.tsx
import type { ForwardedRef } from "react";
import {
  headingsPlugin,
  listsPlugin,
  quotePlugin,
  thematicBreakPlugin,
  markdownShortcutPlugin,
  MDXEditor,
  type MDXEditorMethods,
  type MDXEditorProps,
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
} from "@mdxeditor/editor";
import { api } from "~/trpc/react";
type InitializedMDXEditorProps = MDXEditorProps & {
  editorRef: ForwardedRef<MDXEditorMethods> | null;
  showToolbar?: boolean;
};

export default function InitializedMDXEditor({ editorRef, showToolbar = true, ...props }: InitializedMDXEditorProps) {
  const presignedUrlMutation = api.upload.getPresignedUrl.useMutation();

  const plugins = [
    listsPlugin(),
    quotePlugin(),
    headingsPlugin(),
    linkPlugin(),
    linkDialogPlugin(),
    tablePlugin(),
    thematicBreakPlugin(),
    frontmatterPlugin(),
    codeBlockPlugin({ defaultCodeBlockLanguage: "txt" }),
    codeMirrorPlugin({ codeBlockLanguages: { js: "JavaScript", css: "CSS", txt: "text", tsx: "TypeScript" } }),
    diffSourcePlugin({ viewMode: "rich-text", diffMarkdown: "boo" }),
    markdownShortcutPlugin(),
    imagePlugin({
      imageUploadHandler: async (file) => {
        const { url, fields, key } = await presignedUrlMutation.mutateAsync({
          fileName: file.name,
          fileType: file.type,
        });
        const formData = new FormData();
        Object.entries(fields).forEach(([key, value]) => {
          formData.append(key, value);
        });
        formData.append("file", file);
        await fetch(url, {
          method: "POST",
          body: formData,
        });

        // Return the URL where the image can be accessed
        // Assuming your S3 or storage URL structure. Adjust this based on your actual URL pattern
        return `/api/files/${key}`;
      }, // Add image handler configuration
    }),
  ];

  if (showToolbar) {
    plugins.unshift(
      toolbarPlugin({
        toolbarContents: () => (
          <>
            <BoldItalicUnderlineToggles />
            <CreateLink />
            <Separator />
            <ListsToggle />
            <Separator />
            <BlockTypeSelect />
            <InsertImage />
          </>
        ),
      })
    );
  }

  return <MDXEditor plugins={plugins} {...props} ref={editorRef} />;
}
