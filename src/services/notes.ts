const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export interface Note {
  _id: string;
  title: string;
  description?: string;
  cloudinary_url: string;
  cloudinary_public_id: string;
  thumbnail_url?: string;
  file_size?: number;
  uploaded_by: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

export interface NoteCreate {
  title: string;
  description?: string;
}

export interface NoteUpdate {
  title?: string;
  description?: string;
  is_active?: boolean;
}

export interface NoteListResponse {
  notes: Note[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface UploadNoteData {
  title: string;
  description?: string;
  file: File;
}

class NoteService {
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('auth_access_token');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }

  private getUploadHeaders(): HeadersInit {
    const token = localStorage.getItem('auth_access_token');
    return {
      'Authorization': `Bearer ${token}`,
      // Don't set Content-Type for FormData, let browser set it
    };
  }

  async uploadNote(data: UploadNoteData): Promise<Note> {
    const formData = new FormData();
    formData.append('title', data.title);
    if (data.description) {
      formData.append('description', data.description);
    }
    formData.append('file', data.file);

    const response = await fetch(`${API_BASE_URL}/api/v1/notes/upload`, {
      method: 'POST',
      headers: this.getUploadHeaders(),
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to upload note');
    }

    return response.json();
  }

  async getNotes(page: number = 1, pageSize: number = 10, search?: string): Promise<NoteListResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      page_size: pageSize.toString(),
    });

    if (search) {
      params.append('search', search);
    }

    const response = await fetch(`${API_BASE_URL}/api/v1/notes?${params.toString()}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to fetch notes');
    }

    return response.json();
  }

  async getNote(noteId: string): Promise<Note> {
    const response = await fetch(`${API_BASE_URL}/api/v1/notes/${noteId}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to fetch note');
    }

    return response.json();
  }

  async updateNote(noteId: string, data: NoteUpdate): Promise<Note> {
    const response = await fetch(`${API_BASE_URL}/api/v1/notes/${noteId}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to update note');
    }

    return response.json();
  }

  async deleteNote(noteId: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/v1/notes/${noteId}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to delete note');
    }
  }

  async getUserNotes(userId: string, page: number = 1, pageSize: number = 10): Promise<NoteListResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      page_size: pageSize.toString(),
    });

    const response = await fetch(`${API_BASE_URL}/api/v1/notes/user/${userId}?${params.toString()}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to fetch user notes');
    }

    return response.json();
  }

  // Helper function to generate thumbnail URL from PDF URL
  generateThumbnailUrl(pdfUrl: string): string {
    // Extract the public ID from the PDF URL
    // Example: https://res.cloudinary.com/dzacbdici/raw/upload/v1751991990/notes/Chemistry-book.pdf
    // Extract: v1751991990/notes/Chemistry-book
    const match = pdfUrl.match(/\/v(\d+)\/(.+)\.pdf$/);
    if (match) {
      const version = match[1];
      const publicId = match[2];
      // Return thumbnail URL: first page as JPG with dimensions
      return `https://res.cloudinary.com/dzacbdici/image/upload/c_fill,w_300,h_400,pg_1/v${version}/${publicId}.jpg`;
    }
    return ''; // Fallback if URL doesn't match expected pattern
  }
}

export const noteService = new NoteService();
