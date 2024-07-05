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
} from "@mdxeditor/editor";

type InitializedMDXEditorProps = MDXEditorProps & {
  editorRef: ForwardedRef<MDXEditorMethods> | null;
  showToolbar?: boolean;
};

export default function InitializedMDXEditor({ editorRef, showToolbar = true, ...props }: InitializedMDXEditorProps) {
  const plugins = [
    listsPlugin(),
    quotePlugin(),
    headingsPlugin(),
    linkPlugin(),
    linkDialogPlugin(),
    imagePlugin(),
    tablePlugin(),
    thematicBreakPlugin(),
    frontmatterPlugin(),
    codeBlockPlugin({ defaultCodeBlockLanguage: "txt" }),
    codeMirrorPlugin({ codeBlockLanguages: { js: "JavaScript", css: "CSS", txt: "text", tsx: "TypeScript" } }),
    diffSourcePlugin({ viewMode: "rich-text", diffMarkdown: "boo" }),
    markdownShortcutPlugin(),
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
          </>
        ),
      })
    );
  }

  return <MDXEditor plugins={plugins} {...props} ref={editorRef} />;
}
