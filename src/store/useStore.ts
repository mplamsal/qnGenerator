import create from 'zustand'

type User = { id: string; role: 'teacher'|'admin'; school_id: string; name?: string; email?: string } | null

type State = {
  user: User
  token?: string | null
  setUser: (u: User, token?: string|null)=>void
}

// Default demo user so app works without sign-in during development
const demoUser: User = { id: 'demo_teacher', role: 'teacher', school_id: 'demo_school', email: 'teacher@local' }

export const useStore = create<State>((set)=>({
  user: demoUser,
  token: null,
  setUser: (u, token=null)=>set({user: u, token})
}))

export type { User }
