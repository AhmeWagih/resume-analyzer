// cspell:ignore puter
import { create } from 'zustand';
import { authApi, resumeApi, analysisApi, filesApi } from './api';

/**
 * Rewritten Zustand store that keeps the same shape and exported hook name
 * as the original Puter-based store, so all route/component consumers work
 * without changes. Internally delegates to lib/api.ts (axios → NestJS).
 */

interface StoredUser {
  uuid: string;
  username: string;
}

interface PuterStore {
  isLoading: boolean;
  error: string | null;
  puterReady: boolean;
  auth: {
    user: StoredUser | null;
    isAuthenticated: boolean;
    signIn: (...args: any[]) => Promise<void>;
    signOut: () => Promise<void>;
    refreshUser: () => Promise<void>;
    checkAuthStatus: () => Promise<boolean>;
    getUser: () => StoredUser | null;
    register: (email: string, password: string) => Promise<void>;
  };
  fs: {
    write: (path: string, data: string | File | Blob) => Promise<File | undefined>;
    read: (path: string) => Promise<Blob | undefined>;
    upload: (files: File[] | Blob[]) => Promise<any | undefined>;
    delete: (path: string) => Promise<void>;
    readDir: (path: string) => Promise<any[] | undefined>;
  };
  ai: {
    chat: (...args: any[]) => Promise<any>;
    feedback: (resumeId: string, jobDescription: string) => Promise<any>;
    img2txt: (...args: any[]) => Promise<string | undefined>;
  };
  kv: {
    get: (key: string) => Promise<string | null | undefined>;
    set: (key: string, value: string) => Promise<boolean | undefined>;
    delete: (key: string) => Promise<boolean | undefined>;
    list: (pattern: string, returnValues?: boolean) => Promise<any[] | undefined>;
    flush: () => Promise<boolean | undefined>;
  };
  init: () => void;
  clearError: () => void;
}

export const usePuterStore = create<PuterStore>((set, get) => {
  const setError = (msg: string) => {
    set({
      error: msg,
      isLoading: false,
    });
  };

  const setUser = (user: StoredUser | null) => {
    const state = get();
    set({
      auth: {
        ...state.auth,
        user,
        isAuthenticated: !!user,
        getUser: () => user,
      },
    });
  };

  const checkAuthStatus = async (): Promise<boolean> => {
    const token = localStorage.getItem('token');
    const userJson = localStorage.getItem('user');
    if (token && userJson) {
      try {
        const userData = JSON.parse(userJson);
        const user: StoredUser = {
          uuid: userData.id,
          username: userData.email,
        };
        setUser(user);
        set({ isLoading: false });
        return true;
      } catch {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setUser(null);
    set({ isLoading: false });
    return false;
  };

  const signIn = async (...args: any[]): Promise<void> => {
    const email = typeof args[0] === 'string' ? args[0] : undefined;
    const password = typeof args[1] === 'string' ? args[1] : undefined;
    if (!email || !password) {
      // If called without args (like the old puter signIn), redirect to auth page
      if (typeof window !== 'undefined') {
        window.location.href = '/auth';
      }
      return;
    }
    set({ isLoading: true, error: null });
    try {
      const result = await authApi.login(email, password);
      localStorage.setItem('token', result.access_token);
      localStorage.setItem('user', JSON.stringify(result.user));
      const user: StoredUser = {
        uuid: result.user.id,
        username: result.user.email,
      };
      setUser(user);
      set({ isLoading: false });
    } catch (err: any) {
      const msg =
        err?.response?.data?.message || err?.message || 'Login failed';
      setError(typeof msg === 'string' ? msg : JSON.stringify(msg));
    }
  };

  const register = async (email: string, password: string): Promise<void> => {
    set({ isLoading: true, error: null });
    try {
      const result = await authApi.register(email, password);
      localStorage.setItem('token', result.access_token);
      localStorage.setItem('user', JSON.stringify(result.user));
      const user: StoredUser = {
        uuid: result.user.id,
        username: result.user.email,
      };
      setUser(user);
      set({ isLoading: false });
    } catch (err: any) {
      const msg =
        err?.response?.data?.message || err?.message || 'Registration failed';
      setError(typeof msg === 'string' ? msg : JSON.stringify(msg));
    }
  };

  const signOut = async (): Promise<void> => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    set({ isLoading: false });
  };

  const refreshUser = async (): Promise<void> => {
    await checkAuthStatus();
  };

  const init = (): void => {
    set({ puterReady: true });
    checkAuthStatus();
  };

  // ── fs shim ───────────────────────────────────────────────────────
  // The routes use fs.upload() to upload PDF & preview image,
  // fs.read() to fetch blobs for display, and fs.delete() for cleanup.
  // In the new architecture these go through the NestJS backend.

  const fsUpload = async (files: File[] | Blob[]): Promise<any | undefined> => {
    try {
      const file = files[0];
      if (file instanceof File) {
        const isPdf = file.type === 'application/pdf' ||
          file.name.toLowerCase().endsWith('.pdf');

        if (isPdf) {
          // PDF → POST /resumes (creates a resume record)
          const result = await resumeApi.upload(file);
          return {
            id: result.id,
            path: `${result.id}|${result.pdfPath || result.previewPath}`,
            name: result.originalName,
            ...result,
          };
        } else {
          // Image/other → POST /files/upload (saves to previews dir)
          const result = await filesApi.upload(file);
          return {
            id: result.filename,
            path: result.path,
            name: result.originalName,
            ...result,
          };
        }
      }
      return undefined;
    } catch (err: any) {
      console.error('Upload error:', err);
      return undefined;
    }
  };

  const fsRead = async (pathOrFilename: string): Promise<Blob | undefined> => {
    try {
      // Extract just the filename from any path (handling the id|filename packed format)
      let filename = pathOrFilename;
      if (pathOrFilename.includes('|')) {
        filename = pathOrFilename.split('|')[1];
      } else {
        filename = pathOrFilename.split('/').pop() || pathOrFilename;
      }
      const url = filesApi.getUrl(filename);
      const response = await fetch(url);
      if (!response.ok) return undefined;
      return await response.blob();
    } catch {
      return undefined;
    }
  };

  const fsDelete = async (_path: string): Promise<void> => {
    // File deletion happens on the server side when resume is deleted
    // This is a no-op shim for compatibility
  };

  const fsWrite = async (
    _path: string,
    _data: string | File | Blob,
  ): Promise<File | undefined> => {
    // Not used in the new architecture
    return undefined;
  };

  const fsReadDir = async (_path: string): Promise<any[] | undefined> => {
    // Not used in the new architecture
    return undefined;
  };

  // ── kv shim ───────────────────────────────────────────────────────
  // The routes use kv to store/retrieve resume data as JSON strings.
  // In the new architecture, resume data lives in the PostgreSQL DB.
  // We shim kv.get/set/list to proxy through the resume + analysis APIs.

  const kvGet = async (key: string): Promise<string | null | undefined> => {
    try {
      // key format: "resume:{id}"
      const match = key.match(/^resume:(.+)$/);
      if (!match) return null;

      const requestedId = match[1];
      
      // Look up mapping if this is a client UUID
      const mappedId = typeof window !== 'undefined' ? localStorage.getItem(`resume_map_${requestedId}`) : null;
      const serverId = mappedId || requestedId;

      const resume = await resumeApi.getOne(serverId);

      // Try to get analysis too
      let analysis = null;
      try {
        analysis = await analysisApi.get(serverId);
      } catch {
        // Analysis might not exist yet
      }

      // Lookup saved metadata if it exists
      let savedMeta: any = {};
      try {
        if (typeof window !== 'undefined') {
          const metaStr = localStorage.getItem(`resume_meta_${serverId}`);
          if (metaStr) savedMeta = JSON.parse(metaStr);
        }
      } catch (e) {}

      // Build the data object that matches the old KV format
      const data: any = {
        id: requestedId, // return the ID that was requested to satisfy UI
        resumePath: `${resume.id}|${resume.pdfPath}`,
        imagePath: resume.previewPath || resume.pdfPath,
        companyName: savedMeta.companyName || (resume.originalName ? resume.originalName.replace(/\.[^/.]+$/, "") : ''),
        jobTitle: savedMeta.jobTitle || 'General Resume',
        feedback: null,
      };

      if (analysis) {
        data.jobDescription = analysis.jobDescription;
        data.feedback = transformAnalysisToFeedback(analysis.feedbackJson);
      }

      return JSON.stringify(data);
    } catch {
      return null;
    }
  };

  const kvSet = async (
    _key: string,
    value: string,
  ): Promise<boolean | undefined> => {
    try {
      const parsed = JSON.parse(value);
      if (parsed.resumePath && parsed.resumePath.includes('|')) {
        const serverId = parsed.resumePath.split('|')[0];
        
        // Save the image path to the server
        if (parsed.imagePath) {
          await resumeApi.updatePreview(serverId, parsed.imagePath).catch(console.error);
        }
        
        // Store mapping from client UUID to server UUID and metadata
        if (parsed.id && typeof window !== 'undefined') {
          localStorage.setItem(`resume_map_${parsed.id}`, serverId);
          localStorage.setItem(`resume_meta_${serverId}`, JSON.stringify({
            companyName: parsed.companyName || '',
            jobTitle: parsed.jobTitle || ''
          }));
        }
      }
      return true;
    } catch {
      return true;
    }
  };

  const kvDelete = async (key: string): Promise<boolean | undefined> => {
    try {
      const match = key.match(/^resume:(.+)$/);
      if (!match) return false;
      await resumeApi.delete(match[1]);
      return true;
    } catch {
      return false;
    }
  };

  const kvList = async (
    _pattern: string,
    _returnValues?: boolean,
  ): Promise<any[] | undefined> => {
    try {
      const resumes = await resumeApi.getAll();
      return resumes.map((resume: any) => {
        // Try to get saved metadata
        let savedMeta: any = {};
        try {
          if (typeof window !== 'undefined') {
            const metaStr = localStorage.getItem(`resume_meta_${resume.id}`);
            if (metaStr) savedMeta = JSON.parse(metaStr);
          }
        } catch (e) {}

        // Try to build the data that matches old KV format
        const data: any = {
          id: resume.id,
          resumePath: `${resume.id}|${resume.pdfPath}`,
          imagePath: resume.previewPath || resume.pdfPath,
          companyName: savedMeta.companyName || (resume.originalName ? resume.originalName.replace(/\.[^/.]+$/, "") : ''),
          jobTitle: savedMeta.jobTitle || 'General Resume',
          feedback: resume.analysis
            ? transformAnalysisToFeedback(resume.analysis.feedbackJson)
            : { overallScore: 0 },
        };

        if (resume.analysis) {
          data.jobDescription = resume.analysis.jobDescription;
        }

        return {
          key: `resume:${resume.id}`,
          value: JSON.stringify(data),
        };
      });
    } catch {
      return [];
    }
  };

  const kvFlush = async (): Promise<boolean | undefined> => {
    return true;
  };

  // ── ai shim ───────────────────────────────────────────────────────
  // The upload route uses ai.feedback(path, message) to run analysis.
  // In the new architecture this goes through the analysis API.

  const aiChat = async (..._args: any[]): Promise<any> => {
    return undefined;
  };

  const aiFeedback = async (
    path: string,
    jobDescription: string,
  ): Promise<any> => {
    try {
      const resumeId = path.includes('|') ? path.split('|')[0] : path;
      const analysis = await analysisApi.run(resumeId, jobDescription);
      // Return in a shape that mimics the old AIResponse
      return {
        message: {
          content: JSON.stringify(
            transformAnalysisToFeedback(analysis.feedbackJson),
          ),
        },
      };
    } catch (err: any) {
      console.error('Analysis error:', err);
      return undefined;
    }
  };

  const aiImg2txt = async (
    _image: string | File | Blob,
    _testMode?: boolean,
  ): Promise<string | undefined> => {
    return undefined;
  };

  return {
    isLoading: true,
    error: null,
    puterReady: false,
    auth: {
      user: null,
      isAuthenticated: false,
      signIn,
      signOut,
      refreshUser,
      checkAuthStatus,
      getUser: () => get().auth.user,
      register,
    },
    fs: {
      write: fsWrite,
      read: fsRead,
      readDir: fsReadDir,
      upload: fsUpload,
      delete: fsDelete,
    },
    ai: {
      chat: aiChat,
      feedback: aiFeedback,
      img2txt: aiImg2txt,
    },
    kv: {
      get: kvGet,
      set: kvSet,
      delete: kvDelete,
      list: kvList,
      flush: kvFlush,
    },
    init,
    clearError: () => set({ error: null }),
  };
});

/**
 * Transforms the server's analysis feedbackJson into the Feedback shape
 * expected by the UI components (types/index.ts).
 */
function transformAnalysisToFeedback(feedbackJson: any): any {
  if (!feedbackJson) return null;

  return {
    overallScore: feedbackJson.overallScore ?? feedbackJson.atsScore ?? 0,
    ATS: {
      score: feedbackJson.ats?.score ?? feedbackJson.atsScore ?? 0,
      tips: [
        ...(feedbackJson.ats?.issues?.map((issue: string) => ({
          type: 'improve' as const,
          tip: issue,
        })) ?? []),
        ...(feedbackJson.ats?.suggestions?.map((s: string) => ({
          type: 'improve' as const,
          tip: s,
        })) ?? []),
      ],
    },
    toneAndStyle: {
      score: feedbackJson.tone?.score ?? 0,
      tips:
        feedbackJson.tone?.suggestions?.map((s: string) => ({
          type: 'improve' as const,
          tip: s,
          explanation: feedbackJson.tone?.summary ?? '',
        })) ?? [],
    },
    content: {
      score: feedbackJson.content?.score ?? 0,
      tips:
        feedbackJson.content?.suggestions?.map((s: string) => ({
          type: 'improve' as const,
          tip: s,
          explanation: feedbackJson.content?.summary ?? '',
        })) ?? [],
    },
    structure: {
      score: feedbackJson.structure?.score ?? 0,
      tips:
        feedbackJson.structure?.suggestions?.map((s: string) => ({
          type: 'improve' as const,
          tip: s,
          explanation: feedbackJson.structure?.summary ?? '',
        })) ?? [],
    },
    skills: {
      score: 0,
      tips: [
        ...(feedbackJson.skills?.matched?.map((s: string) => ({
          type: 'good' as const,
          tip: s,
          explanation: 'Matched skill from job description',
        })) ?? []),
        ...(feedbackJson.skills?.missing?.map((s: string) => ({
          type: 'improve' as const,
          tip: s,
          explanation: 'Missing skill from job description',
        })) ?? []),
        ...(feedbackJson.skills?.suggestions?.map((s: string) => ({
          type: 'improve' as const,
          tip: s,
          explanation: '',
        })) ?? []),
      ],
    },
  };
}