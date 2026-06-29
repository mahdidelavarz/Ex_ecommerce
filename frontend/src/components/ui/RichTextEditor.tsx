"use client";

import { useCallback, useEffect } from "react";
import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  /** Optional cover/inline image uploader; enables the image toolbar button. */
  onUploadImage?: (file: File) => Promise<string>;
  placeholder?: string;
  error?: string;
}

interface ToolbarButtonProps {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  label: string;
  children: React.ReactNode;
}

function ToolbarButton({
  onClick,
  active,
  disabled,
  label,
  children,
}: ToolbarButtonProps) {
  return (
    <button
      type="button"
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={`flex h-8 min-w-8 items-center justify-center rounded px-2 text-sm font-medium transition-colors ${
        active
          ? "bg-primary text-white"
          : "text-text-secondary hover:bg-surface-raised"
      } disabled:cursor-not-allowed disabled:opacity-40`}
    >
      {children}
    </button>
  );
}

function Toolbar({
  editor,
  onUploadImage,
}: {
  editor: Editor;
  onUploadImage?: (file: File) => Promise<string>;
}) {
  const addLink = useCallback(() => {
    const previous = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("آدرس لینک:", previous ?? "https://");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor
      .chain()
      .focus()
      .extendMarkRange("link")
      .setLink({ href: url })
      .run();
  }, [editor]);

  const addImage = useCallback(async () => {
    if (!onUploadImage) return;
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      try {
        const url = await onUploadImage(file);
        editor.chain().focus().setImage({ src: url }).run();
      } catch {
        // upstream surfaces the toast
      }
    };
    input.click();
  }, [editor, onUploadImage]);

  return (
    <div className="flex flex-wrap items-center gap-1 border-b border-border bg-surface-raised p-2">
      <ToolbarButton
        label="درشت"
        onClick={() => editor.chain().focus().toggleBold().run()}
        active={editor.isActive("bold")}
      >
        <span className="font-bold">B</span>
      </ToolbarButton>
      <ToolbarButton
        label="مورب"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        active={editor.isActive("italic")}
      >
        <span className="italic">I</span>
      </ToolbarButton>
      <div className="mx-1 h-5 w-px bg-border" />
      <ToolbarButton
        label="تیتر ۲"
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        active={editor.isActive("heading", { level: 2 })}
      >
        H2
      </ToolbarButton>
      <ToolbarButton
        label="تیتر ۳"
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        active={editor.isActive("heading", { level: 3 })}
      >
        H3
      </ToolbarButton>
      <div className="mx-1 h-5 w-px bg-border" />
      <ToolbarButton
        label="فهرست نقطه‌ای"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        active={editor.isActive("bulletList")}
      >
        ●
      </ToolbarButton>
      <ToolbarButton
        label="فهرست عددی"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        active={editor.isActive("orderedList")}
      >
        ۱.
      </ToolbarButton>
      <ToolbarButton
        label="نقل قول"
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        active={editor.isActive("blockquote")}
      >
        ❝
      </ToolbarButton>
      <div className="mx-1 h-5 w-px bg-border" />
      <ToolbarButton
        label="لینک"
        onClick={addLink}
        active={editor.isActive("link")}
      >
        🔗
      </ToolbarButton>
      {onUploadImage && (
        <ToolbarButton label="تصویر" onClick={addImage}>
          🖼
        </ToolbarButton>
      )}
    </div>
  );
}

export default function RichTextEditor({
  value,
  onChange,
  onUploadImage,
  placeholder,
  error,
}: RichTextEditorProps) {
  const editor = useEditor({
    // Next.js SSR: defer first render to the client to avoid hydration mismatch.
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({ link: false }),
      Link.configure({
        openOnClick: false,
        autolink: true,
        HTMLAttributes: { rel: "noopener noreferrer", target: "_blank" },
      }),
      Image,
    ],
    content: value || "",
    editorProps: {
      attributes: {
        class:
          "blog-content min-h-[300px] px-4 py-3 focus:outline-none",
        dir: "rtl",
        ...(placeholder ? { "data-placeholder": placeholder } : {}),
      },
    },
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  });

  // Keep the editor in sync when the form loads/reset external content.
  useEffect(() => {
    if (!editor) return;
    const current = editor.getHTML();
    if (value !== current && (value || "") !== current) {
      editor.commands.setContent(value || "", { emitUpdate: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, editor]);

  return (
    <div
      className={`overflow-hidden rounded-card border bg-surface ${
        error ? "border-error" : "border-border"
      }`}
    >
      {editor && <Toolbar editor={editor} onUploadImage={onUploadImage} />}
      <EditorContent editor={editor} />
      {error && (
        <p className="border-t border-border px-4 py-2 text-xs text-error">
          {error}
        </p>
      )}
    </div>
  );
}
