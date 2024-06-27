"use client";
import {
  KitchenSinkToolbar,
  MDXEditor,
  type MDXEditorMethods,
  codeBlockPlugin,
  codeMirrorPlugin,
  diffSourcePlugin,
  frontmatterPlugin,
  headingsPlugin,
  imagePlugin,
  linkDialogPlugin,
  linkPlugin,
  listsPlugin,
  markdownShortcutPlugin,
  quotePlugin,
  tablePlugin,
  thematicBreakPlugin,
  toolbarPlugin,
} from "@mdxeditor/editor";
import "@mdxeditor/editor/style.css";
import { type FC } from "react";
interface EditorProps {
  markdown: string;
  editorRef?: React.MutableRefObject<MDXEditorMethods | null>;
  setMarkdown: (markdown: string) => void;
}

/**
 * Extend this Component further with the necessary plugins or props you need.
 * proxying the ref is necessary. Next.js dynamically imported components don't support refs.
 */
const Editor: FC<EditorProps> = ({ markdown, editorRef, setMarkdown }) => {
  return (
    <MDXEditor
      onChange={(e) => setMarkdown(e)}
      ref={editorRef}
      markdown={markdown}
      plugins={[
        toolbarPlugin({ toolbarContents: () => <KitchenSinkToolbar /> }),
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
      ]}
    />
  );
};

export default Editor;
