"use client";

import { type MDXEditorMethods, type MDXEditorProps } from "@mdxeditor/editor";
import dynamic from "next/dynamic";
import { forwardRef } from "react";
import "@mdxeditor/editor/style.css";

// ForwardRefEditor.tsx

const Editor = dynamic(() => import("./app-editor"), {
  ssr: false,
});

type ForwardRefEditorProps = MDXEditorProps & {
  showToolbar?: boolean;
};

export const ForwardRefEditor = forwardRef<MDXEditorMethods, ForwardRefEditorProps>(
  ({ showToolbar = true, ...props }, ref) => <Editor {...props} editorRef={ref} showToolbar={showToolbar} />
);

ForwardRefEditor.displayName = "ForwardRefEditor";
