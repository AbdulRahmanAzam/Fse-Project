import { create } from 'zustand';

interface ReplyState {
  replyingTo: number | null;
  setReplyingTo: (commentId: number | null) => void;
}

export const useReplyStore = create<ReplyState>((set) => ({
  replyingTo: null,
  setReplyingTo: (commentId) => set({ replyingTo: commentId }),
})); 