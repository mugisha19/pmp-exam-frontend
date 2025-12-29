/**
 * Rich Text Editor Component
 * Built with Tiptap (React 19 compatible)
 */

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import { useEffect } from "react";
import { cn } from "@/utils/cn";
import {
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Link as LinkIcon,
  Undo,
  Redo,
} from "lucide-react";

export const RichTextEditor = ({
  value = "",
  onChange,
  placeholder = "Enter description...",
  error,
  className,
  wrapperClassName,
  ...props
}) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
        bulletList: {
          keepMarks: true,
          keepAttributes: false,
        },
        orderedList: {
          keepMarks: true,
          keepAttributes: false,
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-blue-600 underline",
        },
      }),
    ],
    content: value || "",
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      // Convert to null if empty (only whitespace/tags)
      const plainText = html.replace(/<[^>]*>/g, "").trim();
      onChange?.(plainText ? html : null);
    },
    editorProps: {
      attributes: {
        class: cn(
          "prose prose-sm sm:prose-base lg:prose-lg xl:prose-xl mx-auto focus:outline-none min-h-[150px] p-4",
          "prose-headings:font-semibold prose-p:my-2 prose-ul:my-2 prose-ol:my-2",
          "prose-a:text-blue-600 prose-strong:font-semibold"
        ),
        "data-placeholder": placeholder,
      },
    },
  });

  // Update editor content when value prop changes externally
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || "");
    }
  }, [value, editor]);

  if (!editor) {
    return null;
  }

  const setLink = () => {
    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("URL", previousUrl);

    if (url === null) {
      return;
    }

    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  return (
    <div className={cn("w-full", wrapperClassName)}>
      <div
        className={cn(
          "rounded-xl border transition-all duration-200 bg-white",
          error
            ? "border-red-500 focus-within:ring-2 focus-within:ring-red-500/50"
            : "border-gray-300 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/50",
          className
        )}
      >
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-1 p-2 border-b border-gray-200 bg-gray-50 rounded-t-xl">
          {/* Text Formatting */}
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBold().run()}
            disabled={!editor.can().chain().focus().toggleBold().run()}
            className={cn(
              "p-2 rounded hover:bg-gray-200 transition-colors",
              editor.isActive("bold") && "bg-blue-100 text-blue-700"
            )}
            title="Bold"
          >
            <Bold className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            disabled={!editor.can().chain().focus().toggleItalic().run()}
            className={cn(
              "p-2 rounded hover:bg-gray-200 transition-colors",
              editor.isActive("italic") && "bg-blue-100 text-blue-700"
            )}
            title="Italic"
          >
            <Italic className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleStrike().run()}
            disabled={!editor.can().chain().focus().toggleStrike().run()}
            className={cn(
              "p-2 rounded hover:bg-gray-200 transition-colors",
              editor.isActive("strike") && "bg-blue-100 text-blue-700"
            )}
            title="Strikethrough"
          >
            <Underline className="w-4 h-4" />
          </button>

          <div className="w-px h-6 bg-gray-300 mx-1" />

          {/* Headings */}
          <button
            type="button"
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 1 }).run()
            }
            className={cn(
              "px-2 py-1 text-sm rounded hover:bg-gray-200 transition-colors",
              editor.isActive("heading", { level: 1 }) &&
                "bg-blue-100 text-blue-700 font-semibold"
            )}
            title="Heading 1"
          >
            H1
          </button>
          <button
            type="button"
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 2 }).run()
            }
            className={cn(
              "px-2 py-1 text-sm rounded hover:bg-gray-200 transition-colors",
              editor.isActive("heading", { level: 2 }) &&
                "bg-blue-100 text-blue-700 font-semibold"
            )}
            title="Heading 2"
          >
            H2
          </button>
          <button
            type="button"
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 3 }).run()
            }
            className={cn(
              "px-2 py-1 text-sm rounded hover:bg-gray-200 transition-colors",
              editor.isActive("heading", { level: 3 }) &&
                "bg-blue-100 text-blue-700 font-semibold"
            )}
            title="Heading 3"
          >
            H3
          </button>

          <div className="w-px h-6 bg-gray-300 mx-1" />

          {/* Lists */}
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={cn(
              "p-2 rounded hover:bg-gray-200 transition-colors",
              editor.isActive("bulletList") && "bg-blue-100 text-blue-700"
            )}
            title="Bullet List"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={cn(
              "p-2 rounded hover:bg-gray-200 transition-colors",
              editor.isActive("orderedList") && "bg-blue-100 text-blue-700"
            )}
            title="Ordered List"
          >
            <ListOrdered className="w-4 h-4" />
          </button>

          <div className="w-px h-6 bg-gray-300 mx-1" />

          {/* Link */}
          <button
            type="button"
            onClick={setLink}
            className={cn(
              "p-2 rounded hover:bg-gray-200 transition-colors",
              editor.isActive("link") && "bg-blue-100 text-blue-700"
            )}
            title="Add Link"
          >
            <LinkIcon className="w-4 h-4" />
          </button>

          <div className="w-px h-6 bg-gray-300 mx-1" />

          {/* Undo/Redo */}
          <button
            type="button"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().chain().focus().undo().run()}
            className="p-2 rounded hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Undo"
          >
            <Undo className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().chain().focus().redo().run()}
            className="p-2 rounded hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Redo"
          >
            <Redo className="w-4 h-4" />
          </button>
        </div>

        {/* Editor Content */}
        <div className="min-h-[150px] max-h-[400px] overflow-y-auto">
          <EditorContent
            editor={editor}
            {...props}
          />
        </div>
      </div>
      {error && (
        <p className="mt-2 text-sm text-red-500 animate-shake">{error}</p>
      )}
      <style>{`
        .ProseMirror {
          outline: none;
          min-height: 150px;
          padding: 12px 16px;
        }
        .ProseMirror p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: #9ca3af;
          pointer-events: none;
          height: 0;
        }
        .ProseMirror ul,
        .ProseMirror ol {
          padding-left: 1.5rem;
        }
        .ProseMirror ul {
          list-style-type: disc;
        }
        .ProseMirror ol {
          list-style-type: decimal;
        }
        .ProseMirror h1 {
          font-size: 2em;
          font-weight: 600;
          margin-top: 0.5em;
          margin-bottom: 0.5em;
        }
        .ProseMirror h2 {
          font-size: 1.5em;
          font-weight: 600;
          margin-top: 0.5em;
          margin-bottom: 0.5em;
        }
        .ProseMirror h3 {
          font-size: 1.25em;
          font-weight: 600;
          margin-top: 0.5em;
          margin-bottom: 0.5em;
        }
        .ProseMirror a {
          color: #2563eb;
          text-decoration: underline;
          cursor: pointer;
        }
        .ProseMirror strong {
          font-weight: 600;
        }
        .ProseMirror em {
          font-style: italic;
        }
        .ProseMirror s {
          text-decoration: line-through;
        }
      `}</style>
    </div>
  );
};

RichTextEditor.displayName = "RichTextEditor";

export default RichTextEditor;
