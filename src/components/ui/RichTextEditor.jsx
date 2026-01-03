/**
 * Enhanced Rich Text Editor Component
 * Built with Tiptap - Full Featured
 */

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Link } from "@tiptap/extension-link";
import { TextStyle } from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";
import { Underline } from "@tiptap/extension-underline";
import { TextAlign } from "@tiptap/extension-text-align";
import { Highlight } from "@tiptap/extension-highlight";
import { Subscript } from "@tiptap/extension-subscript";
import { Superscript } from "@tiptap/extension-superscript";
import { Placeholder } from "@tiptap/extension-placeholder";
import { CharacterCount } from "@tiptap/extension-character-count";
import { TaskList } from "@tiptap/extension-task-list";
import { TaskItem } from "@tiptap/extension-task-item";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableCell } from "@tiptap/extension-table-cell";
import { TableHeader } from "@tiptap/extension-table-header";
import { Image } from "@tiptap/extension-image";
import { Youtube } from "@tiptap/extension-youtube";
import { FontFamily } from "@tiptap/extension-font-family";
import { useEffect, useState, useRef, useCallback } from "react";
import { cn } from "@/utils/cn";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  List,
  ListOrdered,
  Link as LinkIcon,
  Unlink,
  Undo,
  Redo,
  Palette,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Highlighter,
  Subscript as SubscriptIcon,
  Superscript as SuperscriptIcon,
  Code,
  Quote,
  Minus,
  RemoveFormatting,
  ListChecks,
  Table as TableIcon,
  Image as ImageIcon,
  Youtube as YoutubeIcon,
  Type,
  ChevronDown,
  Maximize2,
  Minimize2,
  Copy,
  Scissors,
  Clipboard,
  Search,
  Replace,
  Download,
  Printer,
  FileCode,
  Eye,
  EyeOff,
  Indent,
  Outdent,
  RotateCcw,
  Smile,
  Hash,
  AtSign,
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  Heading5,
  Heading6,
  Pilcrow,
  WrapText,
  MoveHorizontal,
  TableProperties,
  Rows,
  Columns,
  Trash2,
  Plus,
  X,
  Check,
} from "lucide-react";

// Extended color palette
const TEXT_COLORS = [
  // Grayscale
  { name: "Black", color: "#000000" },
  { name: "Dark Gray", color: "#374151" },
  { name: "Gray", color: "#6B7280" },
  { name: "Light Gray", color: "#9CA3AF" },
  { name: "Silver", color: "#D1D5DB" },
  // Reds
  { name: "Dark Red", color: "#7F1D1D" },
  { name: "Red", color: "#DC2626" },
  { name: "Light Red", color: "#F87171" },
  { name: "Rose", color: "#E11D48" },
  { name: "Pink", color: "#EC4899" },
  // Oranges
  { name: "Dark Orange", color: "#9A3412" },
  { name: "Orange", color: "#EA580C" },
  { name: "Light Orange", color: "#FB923C" },
  { name: "Amber", color: "#F59E0B" },
  { name: "Yellow", color: "#EAB308" },
  // Greens
  { name: "Dark Green", color: "#14532D" },
  { name: "Green", color: "#16A34A" },
  { name: "Light Green", color: "#4ADE80" },
  { name: "Lime", color: "#84CC16" },
  { name: "Emerald", color: "#10B981" },
  // Blues
  { name: "Dark Blue", color: "#1E3A8A" },
  { name: "Blue", color: "#2563EB" },
  { name: "Light Blue", color: "#60A5FA" },
  { name: "Sky", color: "#0EA5E9" },
  { name: "Cyan", color: "#06B6D4" },
  // Purples
  { name: "Dark Purple", color: "#581C87" },
  { name: "Purple", color: "#9333EA" },
  { name: "Light Purple", color: "#C084FC" },
  { name: "Violet", color: "#8B5CF6" },
  { name: "Indigo", color: "#6366F1" },
  // Browns
  { name: "Dark Brown", color: "#451A03" },
  { name: "Brown", color: "#92400E" },
  { name: "Light Brown", color: "#D97706" },
  { name: "Tan", color: "#FCD34D" },
  { name: "Cream", color: "#FEF3C7" },
  // Teals
  { name: "Dark Teal", color: "#134E4A" },
  { name: "Teal", color: "#14B8A6" },
  { name: "Light Teal", color: "#5EEAD4" },
  { name: "Aqua", color: "#22D3D8" },
  { name: "Mint", color: "#6EE7B7" },
];

const HIGHLIGHT_COLORS = [
  { name: "Yellow", color: "#FEF08A" },
  { name: "Lime", color: "#BEF264" },
  { name: "Green", color: "#86EFAC" },
  { name: "Cyan", color: "#67E8F9" },
  { name: "Blue", color: "#93C5FD" },
  { name: "Purple", color: "#C4B5FD" },
  { name: "Pink", color: "#F9A8D4" },
  { name: "Red", color: "#FCA5A5" },
  { name: "Orange", color: "#FDBA74" },
  { name: "White", color: "#FFFFFF" },
];

const FONT_FAMILIES = [
  { name: "Default", value: "" },
  { name: "Arial", value: "Arial, sans-serif" },
  { name: "Times New Roman", value: "Times New Roman, serif" },
  { name: "Georgia", value: "Georgia, serif" },
  { name: "Courier New", value: "Courier New, monospace" },
  { name: "Verdana", value: "Verdana, sans-serif" },
  { name: "Trebuchet MS", value: "Trebuchet MS, sans-serif" },
  { name: "Comic Sans MS", value: "Comic Sans MS, cursive" },
  { name: "Impact", value: "Impact, sans-serif" },
  { name: "Lucida Console", value: "Lucida Console, monospace" },
];

const FONT_SIZES = [
  { name: "Tiny", value: "0.75em" },
  { name: "Small", value: "0.875em" },
  { name: "Normal", value: "1em" },
  { name: "Medium", value: "1.125em" },
  { name: "Large", value: "1.25em" },
  { name: "XL", value: "1.5em" },
  { name: "2XL", value: "1.875em" },
  { name: "3XL", value: "2.25em" },
  { name: "4XL", value: "3em" },
];

const EMOJI_LIST = [
  "😀",
  "😃",
  "😄",
  "😁",
  "😅",
  "😂",
  "🤣",
  "😊",
  "😇",
  "🙂",
  "😉",
  "😌",
  "😍",
  "🥰",
  "😘",
  "😗",
  "😙",
  "😚",
  "😋",
  "😛",
  "👍",
  "👎",
  "👏",
  "🙌",
  "🤝",
  "💪",
  "✌️",
  "🤞",
  "🤟",
  "👌",
  "❤️",
  "🧡",
  "💛",
  "💚",
  "💙",
  "💜",
  "🖤",
  "🤍",
  "💔",
  "💕",
  "⭐",
  "🌟",
  "✨",
  "💫",
  "🔥",
  "💥",
  "💯",
  "✅",
  "❌",
  "❓",
  "🎉",
  "🎊",
  "🎁",
  "🎈",
  "🏆",
  "🥇",
  "🏅",
  "🎯",
  "🚀",
  "💡",
];

// Dropdown component
const Dropdown = ({ trigger, children, className, align = "left" }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <div onClick={() => setOpen(!open)}>{trigger}</div>
      {open && (
        <div
          className={cn(
            "absolute top-full mt-1 bg-white rounded-lg shadow-xl border border-gray-200 z-50",
            align === "right" ? "right-0" : "left-0",
            className
          )}
          onClick={() => setOpen(false)}
        >
          {children}
        </div>
      )}
    </div>
  );
};

// Toolbar Button
const ToolbarButton = ({
  onClick,
  active,
  disabled,
  title,
  children,
  className,
}) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    className={cn(
      "p-2 rounded transition-all duration-150",
      "hover:bg-gray-200 active:scale-95",
      "disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent",
      active && "bg-blue-100 text-blue-700 hover:bg-blue-200",
      className
    )}
    title={title}
  >
    {children}
  </button>
);

// Toolbar Divider
const ToolbarDivider = () => <div className="w-px h-6 bg-gray-300 mx-1" />;

// Toolbar Group
const ToolbarGroup = ({ children, label }) => (
  <div className="flex items-center gap-0.5">
    {label && (
      <span className="text-[10px] text-gray-400 uppercase tracking-wide mr-1 hidden lg:block">
        {label}
      </span>
    )}
    {children}
  </div>
);

export const RichTextEditor = ({
  value = "",
  onChange,
  placeholder = "Start writing...",
  error,
  className,
  wrapperClassName,
  maxCharacters,
  showWordCount = true,
  editable = true,
  autofocus = false,
  onBlur,
  onFocus,
  ...props
}) => {
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showHighlightPicker, setShowHighlightPicker] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showFindReplace, setShowFindReplace] = useState(false);
  const [findText, setFindText] = useState("");
  const [replaceText, setReplaceText] = useState("");
  const [showSourceCode, setShowSourceCode] = useState(false);
  const [sourceCode, setSourceCode] = useState("");
  const [showTableMenu, setShowTableMenu] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [linkText, setLinkText] = useState("");

  const colorPickerRef = useRef(null);
  const highlightPickerRef = useRef(null);
  const editorWrapperRef = useRef(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3, 4, 5, 6] },
        bulletList: { keepMarks: true, keepAttributes: false },
        orderedList: { keepMarks: true, keepAttributes: false },
        codeBlock: {
          HTMLAttributes: {
            class: "bg-gray-900 text-gray-100 rounded-lg p-4 font-mono text-sm",
          },
        },
        blockquote: {
          HTMLAttributes: {
            class: "border-l-4 border-gray-300 pl-4 italic text-gray-600",
          },
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { class: "text-blue-600 underline cursor-pointer" },
      }),
      TextStyle,
      Color,
      Underline,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Highlight.configure({ multicolor: true }),
      Subscript,
      Superscript,
      Placeholder.configure({ placeholder }),
      CharacterCount.configure({ limit: maxCharacters }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Table.configure({ resizable: true }),
      TableRow,
      TableCell,
      TableHeader,
      Image.configure({
        HTMLAttributes: { class: "max-w-full h-auto rounded-lg" },
      }),
      Youtube.configure({
        HTMLAttributes: { class: "w-full aspect-video rounded-lg" },
      }),
      FontFamily,
    ],
    content: value || "",
    editable,
    autofocus,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      const plainText = html.replace(/<[^>]*>/g, "").trim();
      onChange?.(plainText ? html : null);
    },
    onBlur: ({ event }) => onBlur?.(event),
    onFocus: ({ event }) => onFocus?.(event),
    editorProps: {
      attributes: {
        class: cn(
          "prose prose-sm sm:prose-base max-w-none focus:outline-none min-h-[200px] p-4",
          "prose-headings:font-semibold prose-p:my-2",
          "prose-a:text-blue-600 prose-strong:font-bold",
          "prose-ul:my-2 prose-ol:my-2 prose-li:my-0.5",
          "prose-table:border-collapse prose-td:border prose-td:p-2",
          "prose-th:border prose-th:p-2 prose-th:bg-gray-100"
        ),
      },
      handleDrop: (view, event, slice, moved) => {
        if (!moved && event.dataTransfer?.files?.length) {
          const file = event.dataTransfer.files[0];
          if (file.type.startsWith("image/")) {
            handleImageUpload(file);
            return true;
          }
        }
        return false;
      },
      handlePaste: (view, event) => {
        const items = event.clipboardData?.items;
        if (items) {
          for (const item of items) {
            if (item.type.startsWith("image/")) {
              const file = item.getAsFile();
              if (file) {
                handleImageUpload(file);
                return true;
              }
            }
          }
        }
        return false;
      },
    },
  });

  // Handle image upload
  const handleImageUpload = useCallback(
    (file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        editor?.chain().focus().setImage({ src: e.target.result }).run();
      };
      reader.readAsDataURL(file);
    },
    [editor]
  );

  // Update editor when value changes externally
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || "");
    }
  }, [value, editor]);

  // Close pickers on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        colorPickerRef.current &&
        !colorPickerRef.current.contains(e.target)
      ) {
        setShowColorPicker(false);
      }
      if (
        highlightPickerRef.current &&
        !highlightPickerRef.current.contains(e.target)
      ) {
        setShowHighlightPicker(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fullscreen handling
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape" && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [isFullscreen]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "f") {
        e.preventDefault();
        setShowFindReplace(true);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  if (!editor) return null;

  // Link handling
  const handleSetLink = () => {
    if (linkUrl === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
    } else {
      editor
        .chain()
        .focus()
        .extendMarkRange("link")
        .setLink({ href: linkUrl })
        .run();
    }
    setShowLinkModal(false);
    setLinkUrl("");
  };

  const openLinkModal = () => {
    const previousUrl = editor.getAttributes("link").href || "";
    setLinkUrl(previousUrl);
    setShowLinkModal(true);
  };

  // Image upload
  const handleImageButtonClick = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = (e) => {
      const file = e.target.files?.[0];
      if (file) handleImageUpload(file);
    };
    input.click();
  };

  // YouTube embed
  const handleYoutubeEmbed = () => {
    const url = window.prompt("Enter YouTube URL:");
    if (url) {
      editor.commands.setYoutubeVideo({ src: url });
    }
  };

  // Table functions
  const insertTable = (rows = 3, cols = 3) => {
    editor
      .chain()
      .focus()
      .insertTable({ rows, cols, withHeaderRow: true })
      .run();
    setShowTableMenu(false);
  };

  // Find and Replace
  const handleFind = () => {
    if (!findText) return;
    // Simple find - highlight matching text
    const content = editor.getHTML();
    // This is a simplified version - in production, use a proper find/replace extension
    window.find(findText);
  };

  const handleReplace = () => {
    if (!findText || !replaceText) return;
    const content = editor.getHTML();
    const newContent = content.replace(new RegExp(findText, "g"), replaceText);
    editor.commands.setContent(newContent);
  };

  // Source code view
  const toggleSourceCode = () => {
    if (showSourceCode) {
      editor.commands.setContent(sourceCode);
    } else {
      setSourceCode(editor.getHTML());
    }
    setShowSourceCode(!showSourceCode);
  };

  // Export functions
  const exportHTML = () => {
    const html = editor.getHTML();
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "document.html";
    a.click();
  };

  const exportText = () => {
    const text = editor.getText();
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "document.txt";
    a.click();
  };

  const handlePrint = () => {
    const content = editor.getHTML();
    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <html>
        <head>
          <title>Print Document</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { font-size: 2em; }
            h2 { font-size: 1.5em; }
            h3 { font-size: 1.25em; }
          </style>
        </head>
        <body>${content}</body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  // Character/Word count
  const characterCount = editor.storage.characterCount.characters();
  const wordCount = editor.storage.characterCount.words();

  return (
    <div
      ref={editorWrapperRef}
      className={cn(
        "w-full",
        isFullscreen && "fixed inset-0 z-50 bg-white flex flex-col",
        wrapperClassName
      )}
    >
      <div
        className={cn(
          "rounded-xl border transition-all duration-200 bg-white flex flex-col",
          error
            ? "border-red-500 focus-within:ring-2 focus-within:ring-red-500/50"
            : "border-gray-300 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/50",
          isFullscreen && "flex-1 rounded-none border-0",
          className
        )}
      >
        {/* Main Toolbar */}
        <div className="flex flex-wrap items-center gap-1 p-2 border-b border-gray-200 bg-gray-50 rounded-t-xl">
          {/* Undo/Redo */}
          <ToolbarGroup>
            <ToolbarButton
              onClick={() => editor.chain().focus().undo().run()}
              disabled={!editor.can().undo()}
              title="Undo (Ctrl+Z)"
            >
              <Undo className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().redo().run()}
              disabled={!editor.can().redo()}
              title="Redo (Ctrl+Y)"
            >
              <Redo className="w-4 h-4" />
            </ToolbarButton>
          </ToolbarGroup>

          <ToolbarDivider />

          {/* Font Family */}
          <Dropdown
            trigger={
              <button className="flex items-center gap-1 px-2 py-1.5 text-sm rounded hover:bg-gray-200 min-w-[100px]">
                <Type className="w-4 h-4" />
                <span className="truncate">Font</span>
                <ChevronDown className="w-3 h-3" />
              </button>
            }
            className="w-48 max-h-64 overflow-y-auto"
          >
            {FONT_FAMILIES.map((font) => (
              <button
                key={font.name}
                onClick={() =>
                  font.value
                    ? editor.chain().focus().setFontFamily(font.value).run()
                    : editor.chain().focus().unsetFontFamily().run()
                }
                className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 transition-colors"
                style={{ fontFamily: font.value || "inherit" }}
              >
                {font.name}
              </button>
            ))}
          </Dropdown>

          {/* Headings Dropdown */}
          <Dropdown
            trigger={
              <button className="flex items-center gap-1 px-2 py-1.5 text-sm rounded hover:bg-gray-200 min-w-[80px]">
                <Pilcrow className="w-4 h-4" />
                <span>Style</span>
                <ChevronDown className="w-3 h-3" />
              </button>
            }
            className="w-48"
          >
            <button
              onClick={() => editor.chain().focus().setParagraph().run()}
              className={cn(
                "w-full px-3 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2",
                editor.isActive("paragraph") && "bg-blue-50 text-blue-700"
              )}
            >
              <Pilcrow className="w-4 h-4" /> Paragraph
            </button>
            {[1, 2, 3, 4, 5, 6].map((level) => (
              <button
                key={level}
                onClick={() =>
                  editor.chain().focus().toggleHeading({ level }).run()
                }
                className={cn(
                  "w-full px-3 py-2 text-left hover:bg-gray-100 flex items-center gap-2",
                  editor.isActive("heading", { level }) &&
                    "bg-blue-50 text-blue-700"
                )}
                style={{ fontSize: `${1.5 - level * 0.15}em`, fontWeight: 600 }}
              >
                H{level}
              </button>
            ))}
          </Dropdown>

          {/* Font Size */}
          <Dropdown
            trigger={
              <button className="flex items-center gap-1 px-2 py-1.5 text-sm rounded hover:bg-gray-200">
                <span>Size</span>
                <ChevronDown className="w-3 h-3" />
              </button>
            }
            className="w-32"
          >
            {FONT_SIZES.map((size) => (
              <button
                key={size.name}
                onClick={() => {
                  editor
                    .chain()
                    .focus()
                    .setMark("textStyle", { fontSize: size.value })
                    .run();
                }}
                className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100"
                style={{ fontSize: size.value }}
              >
                {size.name}
              </button>
            ))}
          </Dropdown>

          <ToolbarDivider />

          {/* Text Formatting */}
          <ToolbarGroup>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleBold().run()}
              active={editor.isActive("bold")}
              title="Bold (Ctrl+B)"
            >
              <Bold className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleItalic().run()}
              active={editor.isActive("italic")}
              title="Italic (Ctrl+I)"
            >
              <Italic className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleUnderline().run()}
              active={editor.isActive("underline")}
              title="Underline (Ctrl+U)"
            >
              <UnderlineIcon className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleStrike().run()}
              active={editor.isActive("strike")}
              title="Strikethrough"
            >
              <Strikethrough className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleSubscript().run()}
              active={editor.isActive("subscript")}
              title="Subscript"
            >
              <SubscriptIcon className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleSuperscript().run()}
              active={editor.isActive("superscript")}
              title="Superscript"
            >
              <SuperscriptIcon className="w-4 h-4" />
            </ToolbarButton>
          </ToolbarGroup>

          <ToolbarDivider />

          {/* Colors */}
          <ToolbarGroup>
            {/* Text Color */}
            <div className="relative" ref={colorPickerRef}>
              <ToolbarButton
                onClick={() => setShowColorPicker(!showColorPicker)}
                active={showColorPicker}
                title="Text Color"
              >
                <div className="flex flex-col items-center">
                  <Palette className="w-4 h-4" />
                  <div
                    className="w-4 h-1 mt-0.5 rounded-sm"
                    style={{
                      backgroundColor:
                        editor.getAttributes("textStyle").color || "#000000",
                    }}
                  />
                </div>
              </ToolbarButton>
              {showColorPicker && (
                <div className="absolute top-full left-0 mt-1 p-3 bg-white rounded-lg shadow-xl border border-gray-200 z-50 w-[280px]">
                  <div className="text-xs font-medium text-gray-500 mb-2">
                    Text Color
                  </div>
                  <div className="grid grid-cols-10 gap-1">
                    {TEXT_COLORS.map((item) => (
                      <button
                        key={item.color}
                        type="button"
                        onClick={() => {
                          editor.chain().focus().setColor(item.color).run();
                          setShowColorPicker(false);
                        }}
                        className={cn(
                          "w-6 h-6 rounded border transition-all hover:scale-110",
                          editor.getAttributes("textStyle").color === item.color
                            ? "ring-2 ring-blue-500 ring-offset-1"
                            : "border-gray-200 hover:border-gray-400"
                        )}
                        style={{ backgroundColor: item.color }}
                        title={item.name}
                      />
                    ))}
                  </div>
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <label className="text-xs text-gray-500 mb-1 block">
                      Custom Color
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        className="w-10 h-8 rounded border border-gray-300 cursor-pointer"
                        onChange={(e) => {
                          editor.chain().focus().setColor(e.target.value).run();
                        }}
                      />
                      <button
                        onClick={() => {
                          editor.chain().focus().unsetColor().run();
                          setShowColorPicker(false);
                        }}
                        className="flex-1 px-2 py-1 text-xs text-gray-600 bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                      >
                        Remove Color
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Highlight Color */}
            <div className="relative" ref={highlightPickerRef}>
              <ToolbarButton
                onClick={() => setShowHighlightPicker(!showHighlightPicker)}
                active={editor.isActive("highlight")}
                title="Highlight"
              >
                <Highlighter className="w-4 h-4" />
              </ToolbarButton>
              {showHighlightPicker && (
                <div className="absolute top-full left-0 mt-1 p-3 bg-white rounded-lg shadow-xl border border-gray-200 z-50 w-[200px]">
                  <div className="text-xs font-medium text-gray-500 mb-2">
                    Highlight Color
                  </div>
                  <div className="grid grid-cols-5 gap-1">
                    {HIGHLIGHT_COLORS.map((item) => (
                      <button
                        key={item.color}
                        type="button"
                        onClick={() => {
                          editor
                            .chain()
                            .focus()
                            .toggleHighlight({ color: item.color })
                            .run();
                          setShowHighlightPicker(false);
                        }}
                        className={cn(
                          "w-8 h-8 rounded border transition-all hover:scale-110",
                          "border-gray-200 hover:border-gray-400"
                        )}
                        style={{ backgroundColor: item.color }}
                        title={item.name}
                      />
                    ))}
                  </div>
                  <button
                    onClick={() => {
                      editor.chain().focus().unsetHighlight().run();
                      setShowHighlightPicker(false);
                    }}
                    className="w-full mt-2 px-2 py-1 text-xs text-gray-600 bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                  >
                    Remove Highlight
                  </button>
                </div>
              )}
            </div>
          </ToolbarGroup>

          <ToolbarDivider />

          {/* Alignment */}
          <ToolbarGroup>
            <ToolbarButton
              onClick={() => editor.chain().focus().setTextAlign("left").run()}
              active={editor.isActive({ textAlign: "left" })}
              title="Align Left"
            >
              <AlignLeft className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() =>
                editor.chain().focus().setTextAlign("center").run()
              }
              active={editor.isActive({ textAlign: "center" })}
              title="Align Center"
            >
              <AlignCenter className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().setTextAlign("right").run()}
              active={editor.isActive({ textAlign: "right" })}
              title="Align Right"
            >
              <AlignRight className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() =>
                editor.chain().focus().setTextAlign("justify").run()
              }
              active={editor.isActive({ textAlign: "justify" })}
              title="Justify"
            >
              <AlignJustify className="w-4 h-4" />
            </ToolbarButton>
          </ToolbarGroup>

          <ToolbarDivider />

          {/* Lists */}
          <ToolbarGroup>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              active={editor.isActive("bulletList")}
              title="Bullet List"
            >
              <List className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              active={editor.isActive("orderedList")}
              title="Numbered List"
            >
              <ListOrdered className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleTaskList().run()}
              active={editor.isActive("taskList")}
              title="Task List"
            >
              <ListChecks className="w-4 h-4" />
            </ToolbarButton>
          </ToolbarGroup>

          <ToolbarDivider />

          {/* Indentation */}
          <ToolbarGroup>
            <ToolbarButton
              onClick={() =>
                editor.chain().focus().liftListItem("listItem").run()
              }
              title="Decrease Indent"
            >
              <Outdent className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() =>
                editor.chain().focus().sinkListItem("listItem").run()
              }
              title="Increase Indent"
            >
              <Indent className="w-4 h-4" />
            </ToolbarButton>
          </ToolbarGroup>

          <ToolbarDivider />

          {/* Insert Elements */}
          <ToolbarGroup>
            <ToolbarButton
              onClick={openLinkModal}
              active={editor.isActive("link")}
              title="Insert Link"
            >
              <LinkIcon className="w-4 h-4" />
            </ToolbarButton>
            {editor.isActive("link") && (
              <ToolbarButton
                onClick={() => editor.chain().focus().unsetLink().run()}
                title="Remove Link"
              >
                <Unlink className="w-4 h-4" />
              </ToolbarButton>
            )}
            <ToolbarButton
              onClick={handleImageButtonClick}
              title="Insert Image"
            >
              <ImageIcon className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton onClick={handleYoutubeEmbed} title="Embed YouTube">
              <YoutubeIcon className="w-4 h-4" />
            </ToolbarButton>

            {/* Table Dropdown */}
            <Dropdown
              trigger={
                <ToolbarButton active={showTableMenu} title="Insert Table">
                  <TableIcon className="w-4 h-4" />
                </ToolbarButton>
              }
              className="w-64 p-3"
            >
              <div className="text-xs font-medium text-gray-500 mb-2">
                Insert Table
              </div>
              <div className="grid grid-cols-5 gap-1 mb-3">
                {[...Array(25)].map((_, i) => {
                  const row = Math.floor(i / 5) + 1;
                  const col = (i % 5) + 1;
                  return (
                    <button
                      key={i}
                      className="w-6 h-6 border border-gray-300 hover:bg-blue-100 hover:border-blue-400 transition-colors"
                      onClick={() => insertTable(row, col)}
                      title={`${row}×${col}`}
                    />
                  );
                })}
              </div>
              {editor.isActive("table") && (
                <div className="border-t border-gray-200 pt-3 space-y-1">
                  <button
                    onClick={() => editor.chain().focus().addRowBefore().run()}
                    className="w-full px-2 py-1 text-sm text-left hover:bg-gray-100 rounded flex items-center gap-2"
                  >
                    <Plus className="w-3 h-3" /> Add Row Above
                  </button>
                  <button
                    onClick={() => editor.chain().focus().addRowAfter().run()}
                    className="w-full px-2 py-1 text-sm text-left hover:bg-gray-100 rounded flex items-center gap-2"
                  >
                    <Plus className="w-3 h-3" /> Add Row Below
                  </button>
                  <button
                    onClick={() =>
                      editor.chain().focus().addColumnBefore().run()
                    }
                    className="w-full px-2 py-1 text-sm text-left hover:bg-gray-100 rounded flex items-center gap-2"
                  >
                    <Plus className="w-3 h-3" /> Add Column Left
                  </button>
                  <button
                    onClick={() =>
                      editor.chain().focus().addColumnAfter().run()
                    }
                    className="w-full px-2 py-1 text-sm text-left hover:bg-gray-100 rounded flex items-center gap-2"
                  >
                    <Plus className="w-3 h-3" /> Add Column Right
                  </button>
                  <button
                    onClick={() => editor.chain().focus().deleteRow().run()}
                    className="w-full px-2 py-1 text-sm text-left hover:bg-red-50 text-red-600 rounded flex items-center gap-2"
                  >
                    <Trash2 className="w-3 h-3" /> Delete Row
                  </button>
                  <button
                    onClick={() => editor.chain().focus().deleteColumn().run()}
                    className="w-full px-2 py-1 text-sm text-left hover:bg-red-50 text-red-600 rounded flex items-center gap-2"
                  >
                    <Trash2 className="w-3 h-3" /> Delete Column
                  </button>
                  <button
                    onClick={() => editor.chain().focus().deleteTable().run()}
                    className="w-full px-2 py-1 text-sm text-left hover:bg-red-50 text-red-600 rounded flex items-center gap-2"
                  >
                    <Trash2 className="w-3 h-3" /> Delete Table
                  </button>
                </div>
              )}
            </Dropdown>
          </ToolbarGroup>

          <ToolbarDivider />

          {/* Block Elements */}
          <ToolbarGroup>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
              active={editor.isActive("blockquote")}
              title="Blockquote"
            >
              <Quote className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleCode().run()}
              active={editor.isActive("code")}
              title="Inline Code"
            >
              <Code className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleCodeBlock().run()}
              active={editor.isActive("codeBlock")}
              title="Code Block"
            >
              <FileCode className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().setHorizontalRule().run()}
              title="Horizontal Rule"
            >
              <Minus className="w-4 h-4" />
            </ToolbarButton>
          </ToolbarGroup>

          <ToolbarDivider />

          {/* Emoji */}
          <Dropdown
            trigger={
              <ToolbarButton title="Insert Emoji">
                <Smile className="w-4 h-4" />
              </ToolbarButton>
            }
            align="right"
            className="w-[240px] max-h-[300px] overflow-y-auto p-3"
          >
            <div className="grid grid-cols-8 gap-1">
              {EMOJI_LIST.map((emoji, i) => (
                <button
                  key={i}
                  onClick={() =>
                    editor.chain().focus().insertContent(emoji).run()
                  }
                  className="w-6 h-6 flex items-center justify-center hover:bg-gray-100 rounded transition-colors text-lg"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </Dropdown>

          <ToolbarDivider />

          {/* Clear Formatting */}
          <ToolbarButton
            onClick={() =>
              editor.chain().focus().clearNodes().unsetAllMarks().run()
            }
            title="Clear Formatting"
          >
            <RemoveFormatting className="w-4 h-4" />
          </ToolbarButton>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Utility Buttons */}
          <ToolbarGroup>
            <ToolbarButton
              onClick={() => setShowFindReplace(!showFindReplace)}
              active={showFindReplace}
              title="Find & Replace (Ctrl+F)"
            >
              <Search className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={toggleSourceCode}
              active={showSourceCode}
              title="View Source"
            >
              <FileCode className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton onClick={handlePrint} title="Print">
              <Printer className="w-4 h-4" />
            </ToolbarButton>

            {/* Export Dropdown */}
            <Dropdown
              trigger={
                <ToolbarButton title="Export">
                  <Download className="w-4 h-4" />
                </ToolbarButton>
              }
              className="w-40"
            >
              <button
                onClick={exportHTML}
                className="w-full px-3 py-2 text-sm text-left hover:bg-gray-100"
              >
                Export as HTML
              </button>
              <button
                onClick={exportText}
                className="w-full px-3 py-2 text-sm text-left hover:bg-gray-100"
              >
                Export as Text
              </button>
            </Dropdown>

            <ToolbarButton
              onClick={() => setIsFullscreen(!isFullscreen)}
              title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
            >
              {isFullscreen ? (
                <Minimize2 className="w-4 h-4" />
              ) : (
                <Maximize2 className="w-4 h-4" />
              )}
            </ToolbarButton>
          </ToolbarGroup>
        </div>

        {/* Find & Replace Bar */}
        {showFindReplace && (
          <div className="flex items-center gap-2 p-2 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center gap-1 flex-1">
              <Search className="w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={findText}
                onChange={(e) => setFindText(e.target.value)}
                placeholder="Find..."
                className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-center gap-1 flex-1">
              <Replace className="w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={replaceText}
                onChange={(e) => setReplaceText(e.target.value)}
                placeholder="Replace with..."
                className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <button
              onClick={handleFind}
              className="px-3 py-1 text-sm bg-gray-200 hover:bg-gray-300 rounded transition-colors"
            >
              Find
            </button>
            <button
              onClick={handleReplace}
              className="px-3 py-1 text-sm bg-blue-500 text-white hover:bg-blue-600 rounded transition-colors"
            >
              Replace All
            </button>
            <button
              onClick={() => setShowFindReplace(false)}
              className="p-1 hover:bg-gray-200 rounded"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Editor Content or Source Code */}
        <div
          className={cn(
            "min-h-[200px] overflow-y-auto overflow-x-hidden",
            isFullscreen && "flex-1"
          )}
          style={{ maxHeight: isFullscreen ? "none" : "500px" }}
        >
          {showSourceCode ? (
            <textarea
              value={sourceCode}
              onChange={(e) => setSourceCode(e.target.value)}
              className="w-full h-full min-h-[200px] p-4 font-mono text-sm bg-gray-900 text-green-400 resize-none focus:outline-none"
              spellCheck={false}
            />
          ) : (
            <EditorContent editor={editor} {...props} />
          )}
        </div>

        {/* Status Bar */}
        {showWordCount && (
          <div className="flex items-center justify-between px-3 py-1.5 border-t border-gray-200 bg-gray-50 rounded-b-xl text-xs text-gray-500">
            <div className="flex items-center gap-4">
              <span>Words: {wordCount}</span>
              <span>Characters: {characterCount}</span>
              {maxCharacters && (
                <span
                  className={cn(
                    characterCount > maxCharacters * 0.9 && "text-orange-500",
                    characterCount >= maxCharacters && "text-red-500"
                  )}
                >
                  Limit: {characterCount}/{maxCharacters}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {editor.isActive("link") && (
                <span className="text-blue-600">
                  Link: {editor.getAttributes("link").href}
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Link Modal */}
      {showLinkModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-lg font-semibold mb-4">Insert Link</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  URL
                </label>
                <input
                  type="url"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="https://example.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowLinkModal(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSetLink}
                  className="px-4 py-2 bg-blue-500 text-white hover:bg-blue-600 rounded-lg transition-colors"
                >
                  {linkUrl ? "Apply" : "Remove Link"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <p className="mt-2 text-sm text-red-500 animate-pulse">{error}</p>
      )}

      {/* Styles */}
      <style>{`
        .ProseMirror {
          outline: none;
          min-height: 200px;
          padding: 16px;
          overflow-x: hidden;
          word-wrap: break-word;
        }
        
        .ProseMirror p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: #9ca3af;
          pointer-events: none;
          height: 0;
        }
        
        .ProseMirror > * + * {
          margin-top: 0.75em;
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
        
        .ProseMirror ul[data-type="taskList"] {
          list-style: none;
          padding: 0;
        }
        
        .ProseMirror ul[data-type="taskList"] li {
          display: flex;
          align-items: flex-start;
          gap: 0.5rem;
        }
        
        .ProseMirror ul[data-type="taskList"] li > label {
          flex: 0 0 auto;
          margin-top: 0.25rem;
        }
        
        .ProseMirror ul[data-type="taskList"] li > div {
          flex: 1 1 auto;
        }
        
        .ProseMirror ul[data-type="taskList"] input[type="checkbox"] {
          cursor: pointer;
          width: 1rem;
          height: 1rem;
          accent-color: #2563eb;
        }
        
        .ProseMirror h1 { font-size: 2em; font-weight: 700; margin-top: 1em; margin-bottom: 0.5em; }
        .ProseMirror h2 { font-size: 1.75em; font-weight: 700; margin-top: 0.875em; margin-bottom: 0.5em; }
        .ProseMirror h3 { font-size: 1.5em; font-weight: 600; margin-top: 0.75em; margin-bottom: 0.5em; }
        .ProseMirror h4 { font-size: 1.25em; font-weight: 600; margin-top: 0.625em; margin-bottom: 0.5em; }
        .ProseMirror h5 { font-size: 1.125em; font-weight: 600; margin-top: 0.5em; margin-bottom: 0.5em; }
        .ProseMirror h6 { font-size: 1em; font-weight: 600; margin-top: 0.5em; margin-bottom: 0.5em; }
        
        .ProseMirror a {
          color: #2563eb;
          text-decoration: underline;
          cursor: pointer;
        }
        
        .ProseMirror a:hover {
          color: #1d4ed8;
        }
        
        .ProseMirror strong { font-weight: 700; }
        .ProseMirror em { font-style: italic; }
        .ProseMirror s { text-decoration: line-through; }
        .ProseMirror u { text-decoration: underline; }
        
        .ProseMirror code {
          background-color: #f3f4f6;
          color: #e11d48;
          padding: 0.2em 0.4em;
          border-radius: 0.25rem;
          font-family: ui-monospace, monospace;
          font-size: 0.875em;
        }
        
        .ProseMirror pre {
          background-color: #1f2937;
          color: #e5e7eb;
          padding: 1rem;
          border-radius: 0.5rem;
          overflow-x: auto;
        }
        
        .ProseMirror pre code {
          background: none;
          color: inherit;
          padding: 0;
          font-size: 0.875rem;
        }
        
        .ProseMirror blockquote {
          border-left: 4px solid #d1d5db;
          padding-left: 1rem;
          font-style: italic;
          color: #6b7280;
          margin: 1rem 0;
        }
        
        .ProseMirror hr {
          border: none;
          border-top: 2px solid #e5e7eb;
          margin: 2rem 0;
        }
        
        .ProseMirror img {
          max-width: 100%;
          height: auto;
          border-radius: 0.5rem;
          margin: 1rem 0;
        }
        
        .ProseMirror img.ProseMirror-selectednode {
          outline: 3px solid #2563eb;
          outline-offset: 2px;
        }
        
        .ProseMirror table {
          border-collapse: collapse;
          width: 100%;
          margin: 1rem 0;
        }
        
        .ProseMirror td,
        .ProseMirror th {
          border: 1px solid #d1d5db;
          padding: 0.5rem;
          text-align: left;
          position: relative;
        }
        
        .ProseMirror th {
          background-color: #f3f4f6;
          font-weight: 600;
        }
        
        .ProseMirror .selectedCell {
          background-color: #dbeafe;
        }
        
        .ProseMirror mark {
          border-radius: 0.125rem;
          padding: 0.125rem 0;
        }
        
        .ProseMirror sub { vertical-align: sub; font-size: 0.75em; }
        .ProseMirror sup { vertical-align: super; font-size: 0.75em; }
        
        .ProseMirror iframe {
          max-width: 100%;
          border-radius: 0.5rem;
          margin: 1rem 0;
        }
        
        /* Selection styles */
        .ProseMirror ::selection {
          background-color: #bfdbfe;
        }
        
        /* Placeholder for empty editor */
        .ProseMirror.is-empty::before {
          content: attr(data-placeholder);
          color: #9ca3af;
          float: left;
          pointer-events: none;
          height: 0;
        }
        
        /* Responsive toolbar */
        @media (max-width: 768px) {
          .ProseMirror {
            padding: 12px;
          }
        }
      `}</style>
    </div>
  );
};

RichTextEditor.displayName = "RichTextEditor";

export default RichTextEditor;
