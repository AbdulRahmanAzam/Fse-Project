import { create } from 'zustand'
import { Community } from '../api.d'

interface CommunitiesStore {
  communities: Community[]
  joinedCommunities: number[]
  setCommunities: (communities: Community[]) => void
  joinCommunity: (communityId: number) => void
  leaveCommunity: (communityId: number) => void
}

export const useCommunitiesStore = create<CommunitiesStore>((set) => ({
  communities: [],
  joinedCommunities: [],
  setCommunities: (communities) => set({ communities }),
  joinCommunity: (communityId) => 
    set((state) => ({ 
      joinedCommunities: [...state.joinedCommunities, communityId],
      communities: state.communities.map(c => 
        c.id === communityId ? { ...c, isMember: true } : c
      )
    })),
  leaveCommunity: (communityId) => 
    set((state) => ({ 
      joinedCommunities: state.joinedCommunities.filter(id => id !== communityId),
      communities: state.communities.map(c => 
        c.id === communityId ? { ...c, isMember: false } : c
      )
    })),
}))
