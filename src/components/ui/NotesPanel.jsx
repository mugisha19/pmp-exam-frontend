import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getNotes,
  createNote,
  updateNote,
  deleteNote,
} from "@/services/note.service";
import { StickyNote, Plus, Search, Edit2, Trash2, X, Save } from "lucide-react";
import { cn } from "@/utils/cn";
import { showToast } from "@/utils/toast.utils";
import { RichTextEditor } from "@/components/ui/RichTextEditor";
import "./NotesPanel.css";

export const NotesPanel = ({ isOpen, onClose }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedNote, setSelectedNote] = useState(null);
  const [editingNote, setEditingNote] = useState(null);
  const [newNote, setNewNote] = useState({ title: "", content: "", tags: "" });
  const [showCreateForm, setShowCreateForm] = useState(false);

  const queryClient = useQueryClient();

  const { data: notes = [], isLoading } = useQuery({
    queryKey: ["notes", searchQuery],
    queryFn: () => getNotes(searchQuery || null),
  });

  const createMutation = useMutation({
    mutationFn: createNote,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      setNewNote({ title: "", content: "", tags: "" });
      setShowCreateForm(false);
      showToast.success("Note Created", "Your note has been saved");
    },
    onError: () => showToast.error("Error", "Failed to create note"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ noteId, data }) => updateNote(noteId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      setEditingNote(null);
      showToast.success("Note Updated", "Changes saved successfully");
    },
    onError: () => showToast.error("Error", "Failed to update note"),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteNote,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      showToast.success("Note Deleted", "Note removed successfully");
    },
    onError: () => showToast.error("Error", "Failed to delete note"),
  });

  const handleCreate = () => {
    if (!newNote.title.trim() || !newNote.content.trim()) {
      showToast.error("Validation Error", "Title and content are required");
      return;
    }
    createMutation.mutate(newNote);
  };

  const handleUpdate = () => {
    if (!editingNote.title.trim() || !editingNote.content.trim()) {
      showToast.error("Validation Error", "Title and content are required");
      return;
    }
    updateMutation.mutate({
      noteId: editingNote.note_id,
      data: {
        title: editingNote.title,
        content: editingNote.content,
        tags: editingNote.tags,
      },
    });
  };

  const handleBack = () => {
    setSelectedNote(null);
    setEditingNote(null);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed top-0 right-0 bottom-0 z-50 w-full sm:w-[600px] bg-white shadow-2xl overflow-x-hidden">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="px-4 py-3 bg-gradient-to-r from-[#476072] to-[#5a7a8f] text-white">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h2 className="text-base font-bold">My Notes</h2>
                <p className="text-xs text-white/80">
                  {notes.length} note{notes.length !== 1 ? "s" : ""}
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-1 hover:bg-white/10 rounded transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Search & Create */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/60" />
                <input
                  type="text"
                  placeholder="Search notes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-2 py-1.5 text-xs bg-white/10 border border-white/20 rounded text-white placeholder-white/60 focus:outline-none focus:bg-white/20"
                />
              </div>
              <button
                onClick={() => setShowCreateForm(!showCreateForm)}
                className="flex items-center gap-1 px-2 py-1.5 text-xs font-medium bg-white/10 hover:bg-white/20 rounded transition-colors whitespace-nowrap"
              >
                <Plus className="w-3.5 h-3.5" />
                New
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto bg-gray-50">
            {showCreateForm && (
              <div className="p-4 bg-white border-b border-gray-200">
                <input
                  type="text"
                  placeholder="Title"
                  value={newNote.title}
                  onChange={(e) =>
                    setNewNote({ ...newNote, title: e.target.value })
                  }
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#476072]/20 focus:border-[#476072] outline-none mb-2"
                />
                <div className="mb-2">
                  <RichTextEditor
                    value={newNote.content}
                    onChange={(content) =>
                      setNewNote({ ...newNote, content: content || "" })
                    }
                    placeholder="Write your note..."
                    className="min-h-[100px]"
                  />
                </div>
                <input
                  type="text"
                  placeholder="Tags (comma-separated)"
                  value={newNote.tags}
                  onChange={(e) =>
                    setNewNote({ ...newNote, tags: e.target.value })
                  }
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#476072]/20 focus:border-[#476072] outline-none mb-2"
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleCreate}
                    disabled={createMutation.isPending}
                    className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-xs font-medium text-white rounded-lg transition-colors disabled:opacity-50"
                    style={{ backgroundColor: "#476072" }}
                  >
                    <Save className="w-3 h-3" />
                    {createMutation.isPending ? "Saving..." : "Save"}
                  </button>
                  <button
                    onClick={() => {
                      setShowCreateForm(false);
                      setNewNote({ title: "", content: "", tags: "" });
                    }}
                    className="px-3 py-2 text-xs font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Notes List or Detail View */}
            <div className="p-4">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="w-8 h-8 border-3 border-[#476072]/30 border-t-[#476072] rounded-full animate-spin" />
                </div>
              ) : selectedNote ? (
                /* Detail View */
                <div className="space-y-4">
                  <button
                    onClick={handleBack}
                    className="text-xs text-[#476072] hover:underline mb-2"
                  >
                    ← Back to notes
                  </button>

                  {editingNote?.note_id === selectedNote.note_id ? (
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={editingNote.title}
                        onChange={(e) =>
                          setEditingNote({
                            ...editingNote,
                            title: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 text-sm font-medium border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#476072]/20 focus:border-[#476072] outline-none"
                      />
                      <RichTextEditor
                        value={editingNote.content}
                        onChange={(content) =>
                          setEditingNote({
                            ...editingNote,
                            content: content || "",
                          })
                        }
                        placeholder="Write your note..."
                        className="min-h-[200px]"
                      />
                      <input
                        type="text"
                        value={editingNote.tags || ""}
                        onChange={(e) =>
                          setEditingNote({
                            ...editingNote,
                            tags: e.target.value,
                          })
                        }
                        placeholder="Tags (comma-separated)"
                        className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#476072]/20 focus:border-[#476072] outline-none"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={handleUpdate}
                          disabled={updateMutation.isPending}
                          className="flex-1 px-3 py-2 text-xs font-medium text-white rounded-lg transition-colors disabled:opacity-50"
                          style={{ backgroundColor: "#476072" }}
                        >
                          {updateMutation.isPending
                            ? "Saving..."
                            : "Save Changes"}
                        </button>
                        <button
                          onClick={() => setEditingNote(null)}
                          className="px-3 py-2 text-xs font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-white border border-gray-200 rounded-xl p-4">
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <h3 className="text-base font-semibold text-gray-900">
                          {selectedNote.title}
                        </h3>
                        <div className="flex gap-1">
                          <button
                            onClick={() => setEditingNote(selectedNote)}
                            className="p-1.5 text-gray-400 hover:text-[#476072] hover:bg-gray-100 rounded transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm("Delete this note?")) {
                                deleteMutation.mutate(selectedNote.note_id);
                                handleBack();
                              }
                            }}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div
                        className="note-content text-sm text-gray-700 mb-3"
                        dangerouslySetInnerHTML={{
                          __html: selectedNote.content,
                        }}
                      />

                      {selectedNote.tags && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {selectedNote.tags.split(",").map((tag, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-1 text-xs font-medium text-[#476072] bg-[#476072]/10 rounded"
                            >
                              {tag.trim()}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="pt-3 border-t border-gray-200">
                        <p className="text-xs text-gray-500">
                          Created:{" "}
                          {new Date(selectedNote.created_at).toLocaleString()}
                        </p>
                        {selectedNote.updated_at &&
                          selectedNote.updated_at !==
                            selectedNote.created_at && (
                            <p className="text-xs text-gray-500 mt-1">
                              Updated:{" "}
                              {new Date(
                                selectedNote.updated_at
                              ).toLocaleString()}
                            </p>
                          )}
                      </div>
                    </div>
                  )}
                </div>
              ) : notes.length === 0 ? (
                /* Empty State */
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                    <StickyNote className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-sm font-medium text-gray-900 mb-1">
                    No notes yet
                  </p>
                  <p className="text-xs text-gray-500 mb-4">
                    Create your first note
                  </p>
                  <button
                    onClick={() => setShowCreateForm(true)}
                    className="px-4 py-2 bg-gradient-to-r from-[#476072] to-[#5a7a8f] text-white rounded-lg hover:opacity-90 transition-opacity text-sm font-medium"
                  >
                    Create Note
                  </button>
                </div>
              ) : (
                /* Notes List */
                <div className="space-y-2">
                  {notes.map((note) => (
                    <div
                      key={note.note_id}
                      onClick={() => setSelectedNote(note)}
                      className="bg-white border border-gray-200 rounded-lg p-3 hover:shadow-md hover:border-[#476072]/30 transition-all cursor-pointer"
                    >
                      <h4 className="text-sm font-semibold text-gray-900 mb-1 line-clamp-1">
                        {note.title}
                      </h4>
                      <p className="text-xs text-gray-500">
                        {new Date(note.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
