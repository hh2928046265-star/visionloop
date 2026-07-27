'use client';
import { createContext, useContext, useReducer, type Dispatch } from "react";
import type { ProjectState, ProjectAction, PipelineSnapshot } from "@/types";
function projectReducer(state: ProjectState, action: ProjectAction): ProjectState {
  switch (action.type) {
    case 'SET_PROJECT':
      return { ...state, id: action.payload.id, title: action.payload.title, description: action.payload.description || '', type: action.payload.type, status: action.payload.status };
    case 'SET_TITLE':       return { ...state, title: action.payload };
    case 'SET_TYPE':        return { ...state, type: action.payload };
    case 'SET_STATUS':      return { ...state, status: action.payload };
    case 'SET_THEME_INPUT': return { ...state, themeInput: action.payload };
    case 'SET_THEME_ANALYSIS': return { ...state, themeAnalysis: action.payload, status: 'constraints' };
    case 'SET_CONSTRAINTS': return { ...state, constraints: action.payload };
    case 'SET_STORY_DATA':  return { ...state, storyData: action.payload };
    case 'SET_SCENES':      return { ...state, scenes: action.payload, status: 'story' };
    case 'SET_SHOTS':       return { ...state, shots: action.payload, status: 'storyboard' };
    case 'SET_STORYBOARD_IMAGES': return { ...state, storyboardImages: action.payload };
    case 'SET_MODEL_ID':    return { ...state, modelId: action.payload };
    case 'SET_GENERATING':  return { ...state, generating: action.payload };
    
    case 'SAVE_SNAPSHOT': {
      const snap: PipelineSnapshot = {
        id: crypto.randomUUID(),
        version: state.snapshots.length + 1,
        label: action.payload.label || '版本 ' + (state.snapshots.length + 1),
        createdAt: new Date().toISOString(),
        themeInput: state.themeInput,
        themeAnalysis: state.themeAnalysis,
        constraints: state.constraints,
        storyData: state.storyData,
        scenes: state.scenes,
        shots: state.shots,
        storyboardImages: state.storyboardImages,
        isActive: true,
      };
      return { ...state, snapshots: [...state.snapshots.map(s => ({...s, isActive: false})), snap], activeSnapshotId: snap.id };
    }
    case 'LOAD_SNAPSHOT': {
      const target = state.snapshots.find(s => s.id === action.payload);
      if (!target) return state;
      return {
        ...state,
        themeInput: target.themeInput,
        themeAnalysis: target.themeAnalysis,
        constraints: target.constraints,
        storyData: target.storyData,
        scenes: target.scenes,
        shots: target.shots,
        storyboardImages: target.storyboardImages,
        snapshots: state.snapshots.map(s => ({...s, isActive: s.id === action.payload})),
        activeSnapshotId: action.payload,
      };
    }
    case 'DELETE_SNAPSHOT':
      return { ...state, snapshots: state.snapshots.filter(s => s.id !== action.payload) };
    case 'COMPARE_SNAPSHOT':
      return { ...state, activeSnapshotId: action.payload };
    default:
      return state;
  }
}

// ============================================================
// Context
// ============================================================
const initialState: ProjectState = {
  id: '', title: '', description: '', type: 'seeding', status: 'theme' as import("@/types").PipelineStep,
  modelId: "deepseek-r1:8b", generating: '',
  themeInput: '', themeAnalysis: null,
  constraints: { talentMode: 'actors', locationType: 'any', equipment: 'camera', budget: 'low', lighting: 'natural', crew: 'solo' },
  storyData: null, scenes: [], shots: [], storyboardImages: {},
  snapshots: [], activeSnapshotId: null,
};

export const ProjectContext = createContext<{ state: ProjectState; dispatch: Dispatch<ProjectAction> }>({
  state: initialState,
  dispatch: () => {},
});

export function useProject() { return useContext(ProjectContext); }
