import { create } from 'zustand'

interface userState {
  username: string
  headpic: string
  hasLogin: boolean
  userId: number
  bmr: number
  setBmr(weight?: number, height?: number, age?: number, sex?: boolean)
  setLogin: (hasLogin: boolean) => void
  updatePic: (pic: string) => void
  updateUserName: (username: string) => void
  setuserId: (id: number) => void
}

const useStore = create<userState>((set) => ({
  username: '未登录',
  headpic: 'https://img.ixintu.com/download/jpg/20200807/d0c358d183132ba04ff9c09706145567_512_512.jpg',
  hasLogin: false,
  userId: 0,
  bmr: 1600,
  setLogin: (hasLogin) => {
    set({ hasLogin: hasLogin })
  },
  setBmr: (weight = 60, height = 170, age = 25, sex = true) => {
    if (sex) {
      set({
        bmr: 13.7 * weight + 5 * height - 6.8 * age + 66
      })
    } else {
      set({
        bmr: 9.6 * weight + 1.8 * height - 4.7 * age + 655
      })
    }
  },
  updatePic: (pic) => set({ headpic: pic }),
  updateUserName: (username) => set({ username: username }),
  setuserId: (id) => set({ userId: id }),
}))

export { useStore }
