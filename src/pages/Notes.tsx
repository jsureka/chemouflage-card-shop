import React, { useState, useEffect } from 'react';
import Header from "@/components/Header";
import { noteService, Note, UploadNoteData } from '../services/notes';
import { useToast } from '../hooks/use-toast';

// Upload Modal Component
const UploadModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess: () => void;
}> = ({ isOpen, onClose, onUploadSuccess }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file || !title.trim()) {
      toast({
        title: "Validation Error",
        description: "Please provide a title and select a PDF file.",
        variant: "destructive",
      });
      return;
    }

    if (file.type !== 'application/pdf') {
      toast({
        title: "Invalid File Type",
        description: "Please select a PDF file only.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    try {
      const uploadData: UploadNoteData = {
        title: title.trim(),
        description: description.trim() || undefined,
        file,
      };

      await noteService.uploadNote(uploadData);
      
      toast({
        title: "Success",
        description: "Note uploaded successfully!",
      });

      // Reset form
      setTitle('');
      setDescription('');
      setFile(null);
      onClose();
      onUploadSuccess();
    } catch (error) {
      toast({
        title: "Upload Failed",
        description: error instanceof Error ? error.message : "Failed to upload note",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-background border border-border rounded-lg p-6 w-full max-w-md mx-4">
        <h2 className="text-xl font-semibold text-foreground mb-4">Upload New Note</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-foreground mb-1">
              Title *
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Enter note title"
              maxLength={200}
              required
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-foreground mb-1">
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              placeholder="Enter note description (optional)"
              rows={3}
              maxLength={1000}
            />
          </div>

          <div>
            <label htmlFor="file" className="block text-sm font-medium text-foreground mb-1">
              PDF File *
            </label>
            <input
              type="file"
              id="file"
              accept=".pdf,application/pdf"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
            <p className="text-xs text-muted-foreground mt-1">Maximum file size: 50MB</p>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-border rounded-md text-foreground hover:bg-muted transition-colors"
              disabled={isUploading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUploading || !file || !title.trim()}
              className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUploading ? 'Uploading...' : 'Upload'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const BookCard: React.FC<{ note: Note }> = ({ note }) => {
    const [imageError, setImageError] = useState(false);

    return (
        <div
            className="group cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105 bg-background/80 backdrop-blur-lg border border-border rounded-lg overflow-hidden"
            onClick={() => window.open(note.cloudinary_url, '_blank')}
        >
            <div className="relative w-full aspect-[8/11] bg-gray-100 overflow-hidden flex items-center justify-center">
                {!imageError ? (
                    <img
                        src={note.thumbnail_url || noteService.generateThumbnailUrl(note.cloudinary_url)}
                        alt={`${note.title} - First Page`}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                        onError={() => setImageError(true)}
                    />
                ) : (
                    <div className="flex items-center justify-center w-full h-full text-muted-foreground">
                        <div className="text-center">
                            <svg className="mx-auto h-12 w-12 text-muted-foreground/50 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <p className="text-sm">PDF Preview</p>
                        </div>
                    </div>
                )}
                
                {/* Pop out button */}
                <a
                    href={note.cloudinary_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute top-2 right-2 bg-background/90 backdrop-blur-sm rounded-full shadow-lg p-2 hover:bg-primary hover:text-primary-foreground transition-all duration-200"
                    title="Open in new tab"
                    onClick={(e) => e.stopPropagation()}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 3h7m0 0v7m0-7L10 14m-7 7h7a2 2 0 002-2v-7" />
                    </svg>
                </a>
            </div>
            <div className="flex-1 flex flex-col p-4">
                <h2 className="text-lg font-semibold text-foreground text-center line-clamp-2 mb-2">{note.title}</h2>
                <p className="text-muted-foreground text-sm text-center mb-4 line-clamp-3">{note.description || 'No description available'}</p>
                <a
                    href={note.cloudinary_url}
                    download
                    className="mt-auto inline-block w-full text-center py-2 px-4 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors duration-200"
                    onClick={(e) => e.stopPropagation()}
                >
                    Download PDF
                </a>
            </div>
        </div>
    );
};

const NotePage: React.FC = () => {
    const [notes, setNotes] = useState<Note[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const { toast } = useToast();

    const loadNotes = async (page: number = 1, search?: string) => {
        try {
            setLoading(true);
            const response = await noteService.getNotes(page, 12, search);
            setNotes(response.notes);
            setTotalPages(response.total_pages);
            setCurrentPage(page);
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to load notes",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadNotes();
    }, []);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setCurrentPage(1);
        loadNotes(1, searchQuery.trim() || undefined);
    };

    const handlePageChange = (page: number) => {
        loadNotes(page, searchQuery.trim() || undefined);
    };

    const handleUploadSuccess = () => {
        loadNotes(1, searchQuery.trim() || undefined);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 dark:from-slate-900 dark:via-teal-900 dark:to-emerald-900">
            <Header />
            
            <div className="container mx-auto px-4 py-8">
                {/* Header Section */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
                        Chemistry Notes
                    </h1>
                    <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-6">
                        Access our comprehensive collection of chemistry educational materials.
                        Click on any note to open the PDF in a new tab.
                    </p>

                    {/* Action Bar */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center max-w-2xl mx-auto">
                        {/* Search Bar */}
                        <form onSubmit={handleSearch} className="flex gap-2 flex-1 w-full">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search notes..."
                                className="flex-1 px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                            <button
                                type="submit"
                                className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                            >
                                Search
                            </button>
                        </form>

                        {/* Upload Button */}
                        <button
                            onClick={() => setIsUploadModalOpen(true)}
                            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                        >
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Upload Note
                        </button>
                    </div>
                </div>

                {/* Loading State */}
                {loading && (
                    <div className="text-center py-12">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        <p className="text-muted-foreground mt-2">Loading notes...</p>
                    </div>
                )}

                {/* Notes Grid */}
                {!loading && (
                    <>
                        {notes.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                                {notes.map((note) => (
                                    <BookCard key={note._id} note={note} />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <svg className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                <h3 className="text-lg font-medium text-foreground mb-2">No notes found</h3>
                                <p className="text-muted-foreground mb-4">
                                    {searchQuery ? 'Try adjusting your search terms' : 'Be the first to upload a note!'}
                                </p>
                                <button
                                    onClick={() => setIsUploadModalOpen(true)}
                                    className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                                >
                                    Upload First Note
                                </button>
                            </div>
                        )}

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex justify-center gap-2">
                                <button
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className="px-4 py-2 border border-border rounded-lg bg-background text-foreground hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Previous
                                </button>
                                
                                <span className="px-4 py-2 text-foreground">
                                    Page {currentPage} of {totalPages}
                                </span>
                                
                                <button
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                    className="px-4 py-2 border border-border rounded-lg bg-background text-foreground hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </>
                )}

                {/* Instructions */}
                <div className="mt-12 text-center">
                    <p className="text-muted-foreground">
                        Click on any note thumbnail to open the PDF in a new tab for reading.
                    </p>
                </div>
            </div>

            {/* Upload Modal */}
            <UploadModal
                isOpen={isUploadModalOpen}
                onClose={() => setIsUploadModalOpen(false)}
                onUploadSuccess={handleUploadSuccess}
            />
        </div>
    );
};

export default NotePage;
