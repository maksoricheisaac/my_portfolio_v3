"use client";

import { useEffect, useState, type ReactNode } from "react";
import { EditorContent, useEditor, useEditorState, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import {
  Bold,
  Code2,
  Heading2,
  Heading3,
  ImageIcon,
  Italic,
  Link2,
  Link2Off,
  List,
  ListOrdered,
  Minus,
  Quote,
  Redo2,
  Strikethrough,
  Underline as UnderlineIcon,
  Undo2,
} from "lucide-react";
import { MediaPicker } from "@/components/admin/media-picker";
import { cn } from "@/lib/utils";

function ToolButton({
  label,
  active,
  disabled,
  onClick,
  children,
}: {
  label: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={active}
      disabled={disabled}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={cn(
        "inline-flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-40",
        active && "bg-muted text-foreground",
      )}
    >
      {children}
    </button>
  );
}

function Toolbar({ editor, onImage }: { editor: Editor; onImage: () => void }) {
  const s = useEditorState({
    editor,
    selector: ({ editor: e }) => ({
      bold: e.isActive("bold"),
      italic: e.isActive("italic"),
      underline: e.isActive("underline"),
      strike: e.isActive("strike"),
      h2: e.isActive("heading", { level: 2 }),
      h3: e.isActive("heading", { level: 3 }),
      bullet: e.isActive("bulletList"),
      ordered: e.isActive("orderedList"),
      quote: e.isActive("blockquote"),
      code: e.isActive("codeBlock"),
      link: e.isActive("link"),
      canUndo: e.can().undo(),
      canRedo: e.can().redo(),
    }),
  });

  function setLink() {
    const previous = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Adresse du lien (https://…)", previous ?? "https://");
    if (url === null) return;
    if (url.trim() === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    if (!/^(https?:\/\/|mailto:)/i.test(url.trim())) {
      window.alert("Le lien doit commencer par https://, http:// ou mailto:");
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url.trim() }).run();
  }

  const c = () => editor.chain().focus();
  return (
    <div className="flex flex-wrap items-center gap-0.5 border-b border-border bg-surface-2/60 p-1.5">
      <ToolButton label="Titre 2" active={s.h2} onClick={() => c().toggleHeading({ level: 2 }).run()}>
        <Heading2 className="size-4" />
      </ToolButton>
      <ToolButton label="Titre 3" active={s.h3} onClick={() => c().toggleHeading({ level: 3 }).run()}>
        <Heading3 className="size-4" />
      </ToolButton>
      <span className="mx-1 h-5 w-px bg-border" />
      <ToolButton label="Gras" active={s.bold} onClick={() => c().toggleBold().run()}>
        <Bold className="size-4" />
      </ToolButton>
      <ToolButton label="Italique" active={s.italic} onClick={() => c().toggleItalic().run()}>
        <Italic className="size-4" />
      </ToolButton>
      <ToolButton label="Souligné" active={s.underline} onClick={() => c().toggleUnderline().run()}>
        <UnderlineIcon className="size-4" />
      </ToolButton>
      <ToolButton label="Barré" active={s.strike} onClick={() => c().toggleStrike().run()}>
        <Strikethrough className="size-4" />
      </ToolButton>
      <span className="mx-1 h-5 w-px bg-border" />
      <ToolButton label="Liste à puces" active={s.bullet} onClick={() => c().toggleBulletList().run()}>
        <List className="size-4" />
      </ToolButton>
      <ToolButton label="Liste numérotée" active={s.ordered} onClick={() => c().toggleOrderedList().run()}>
        <ListOrdered className="size-4" />
      </ToolButton>
      <ToolButton label="Citation" active={s.quote} onClick={() => c().toggleBlockquote().run()}>
        <Quote className="size-4" />
      </ToolButton>
      <ToolButton label="Bloc de code" active={s.code} onClick={() => c().toggleCodeBlock().run()}>
        <Code2 className="size-4" />
      </ToolButton>
      <ToolButton label="Séparateur" onClick={() => c().setHorizontalRule().run()}>
        <Minus className="size-4" />
      </ToolButton>
      <span className="mx-1 h-5 w-px bg-border" />
      <ToolButton label="Lien" active={s.link} onClick={setLink}>
        <Link2 className="size-4" />
      </ToolButton>
      <ToolButton
        label="Retirer le lien"
        disabled={!s.link}
        onClick={() => c().extendMarkRange("link").unsetLink().run()}
      >
        <Link2Off className="size-4" />
      </ToolButton>
      <ToolButton label="Image" onClick={onImage}>
        <ImageIcon className="size-4" />
      </ToolButton>
      <span className="mx-1 h-5 w-px bg-border" />
      <ToolButton label="Annuler" disabled={!s.canUndo} onClick={() => c().undo().run()}>
        <Undo2 className="size-4" />
      </ToolButton>
      <ToolButton label="Rétablir" disabled={!s.canRedo} onClick={() => c().redo().run()}>
        <Redo2 className="size-4" />
      </ToolButton>
    </div>
  );
}

/**
 * WYSIWYG editor (Tiptap). Emits HTML; the API sanitises it again on save, so the editor
 * only needs to produce well-formed, conservative markup.
 */
export function RichEditor({
  value,
  onChange,
  placeholder,
  label,
}: {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  label: string;
}) {
  const [picker, setPicker] = useState(false);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3, 4] },
        link: {
          openOnClick: false,
          autolink: true,
          HTMLAttributes: { rel: "noopener noreferrer nofollow", target: "_blank" },
        },
      }),
      Image.configure({ inline: false }),
      Placeholder.configure({ placeholder: placeholder ?? "Rédigez l'étude de cas…" }),
    ],
    content: value,
    editorProps: {
      attributes: {
        "aria-label": label,
        class: "rich-content min-h-72 max-w-none px-4 py-3 outline-none",
      },
    },
    onUpdate: ({ editor: e }) => onChange(e.isEmpty ? "" : e.getHTML()),
  });

  // Keep the editor in sync when the value is replaced from outside (e.g. after loading).
  useEffect(() => {
    if (editor && value !== editor.getHTML() && !(value === "" && editor.isEmpty)) {
      editor.commands.setContent(value, { emitUpdate: false });
    }
  }, [value, editor]);

  return (
    <div className="overflow-hidden rounded-xl border border-input bg-surface focus-within:border-signal">
      {editor && <Toolbar editor={editor} onImage={() => setPicker(true)} />}
      <EditorContent editor={editor} />
      <MediaPicker
        open={picker}
        onClose={() => setPicker(false)}
        onPick={(m) => editor?.chain().focus().setImage({ src: m.url, alt: m.alt }).run()}
      />
    </div>
  );
}
