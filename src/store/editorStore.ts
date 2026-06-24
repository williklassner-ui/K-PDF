import { create } from 'zustand';

export type Tool = 'none' | 'highlight' | 'sign' | 'form' | 'redact';

export interface Annotation {
  id: string;
  type: 'highlight' | 'signature' | 'redact';
  pageIndex: number;
  // Normalized coords 0–1 relative to page dimensions
  x: number;
  y: number;
  width: number;
  height: number;
  color?: string;
  opacity?: number;
  imageBase64?: string;
  points?: Array<{ x: number; y: number }>;
}

export interface FormFieldValue {
  fieldName: string;
  fieldType: 'text' | 'checkbox' | 'radio' | 'dropdown';
  value: string | boolean;
  x: number;
  y: number;
  width: number;
  height: number;
  pageIndex: number;
  options?: string[];
}

interface EditorState {
  fileId: string | null;
  activeTool: Tool;
  highlightColor: string;
  annotations: Annotation[];
  formFields: FormFieldValue[];
  undoStack: Annotation[][];
  redoStack: Annotation[][];
  isDirty: boolean;
  isSaving: boolean;

  setFileId: (id: string) => void;
  setTool: (tool: Tool) => void;
  setHighlightColor: (color: string) => void;
  addAnnotation: (annotation: Annotation) => void;
  removeAnnotation: (id: string) => void;
  updateAnnotation: (id: string, updates: Partial<Annotation>) => void;
  setFormFields: (fields: FormFieldValue[]) => void;
  updateFormField: (fieldName: string, value: string | boolean) => void;
  undo: () => void;
  redo: () => void;
  setDirty: (dirty: boolean) => void;
  setSaving: (saving: boolean) => void;
  reset: () => void;
}

const initialState = {
  fileId: null,
  activeTool: 'none' as Tool,
  highlightColor: 'rgba(255, 235, 59, 0.5)',
  annotations: [] as Annotation[],
  formFields: [] as FormFieldValue[],
  undoStack: [] as Annotation[][],
  redoStack: [] as Annotation[][],
  isDirty: false,
  isSaving: false,
};

export const useEditorStore = create<EditorState>((set, get) => ({
  ...initialState,

  setFileId: (fileId) => set({ fileId }),
  setTool: (activeTool) => set({ activeTool }),
  setHighlightColor: (highlightColor) => set({ highlightColor }),

  addAnnotation: (annotation) => {
    const { annotations, undoStack } = get();
    set({
      annotations: [...annotations, annotation],
      undoStack: [...undoStack, [...annotations]],
      redoStack: [],
      isDirty: true,
    });
  },

  removeAnnotation: (id) => {
    const { annotations, undoStack } = get();
    set({
      annotations: annotations.filter((a) => a.id !== id),
      undoStack: [...undoStack, [...annotations]],
      redoStack: [],
      isDirty: true,
    });
  },

  updateAnnotation: (id, updates) =>
    set((s) => ({
      annotations: s.annotations.map((a) =>
        a.id === id ? { ...a, ...updates } : a
      ),
      isDirty: true,
    })),

  setFormFields: (formFields) => set({ formFields }),

  updateFormField: (fieldName, value) =>
    set((s) => ({
      formFields: s.formFields.map((f) =>
        f.fieldName === fieldName ? { ...f, value } : f
      ),
      isDirty: true,
    })),

  undo: () => {
    const { undoStack, annotations, redoStack } = get();
    if (undoStack.length === 0) return;
    const prev = undoStack[undoStack.length - 1];
    set({
      annotations: prev,
      undoStack: undoStack.slice(0, -1),
      redoStack: [...redoStack, [...annotations]],
      isDirty: true,
    });
  },

  redo: () => {
    const { redoStack, annotations, undoStack } = get();
    if (redoStack.length === 0) return;
    const next = redoStack[redoStack.length - 1];
    set({
      annotations: next,
      redoStack: redoStack.slice(0, -1),
      undoStack: [...undoStack, [...annotations]],
      isDirty: true,
    });
  },

  setDirty: (isDirty) => set({ isDirty }),
  setSaving: (isSaving) => set({ isSaving }),
  reset: () => set(initialState),
}));
