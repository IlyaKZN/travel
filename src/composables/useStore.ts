import { ref, reactive } from 'vue'
import type { User, Post, Tour, Trip } from '@/types'
import { authApi, postsApi, toursApi, tripsApi, usersApi } from '@/api'
import { getToken, setToken } from '@/api/client'
import { getInitData } from '@/composables/useTelegram'

const isAuthenticated = ref(false)
const isLoading = ref(false)
const user = reactive<User>({
  id: '',
  nickname: '',
  firstName: '',
  lastName: '',
  birthDate: '',
  avatar: '',
  showTours: true,
  following: 0,
  followers: 0,
})
const posts = ref<Post[]>([])
const tours = ref<Tour[]>([])
const trips = ref<Trip[]>([])

function applyUser(data: User) {
  Object.assign(user, data)
  isAuthenticated.value = true
}

export function useStore() {
  async function init() {
    if (!getToken()) return
    try {
      isLoading.value = true
      const me = await authApi.me()
      applyUser(me)
    } catch {
      setToken(null)
      isAuthenticated.value = false
    } finally {
      isLoading.value = false
    }
  }

  async function login(contact: string, password: string) {
    const { user: u } = await authApi.login(contact, password)
    applyUser(u)
  }

  async function loginTelegram() {
    const initData = getInitData()
    if (!initData) throw new Error('Telegram initData недоступен')

    const res = await authApi.telegram(initData)
    applyUser(res.user)
    return { needsProfile: res.needsProfile ?? !res.user.profileComplete }
  }

  function logout() {
    setToken(null)
    isAuthenticated.value = false
    Object.assign(user, {
      id: '',
      nickname: '',
      firstName: '',
      lastName: '',
      birthDate: '',
      avatar: '',
      showTours: true,
      following: 0,
      followers: 0,
    })
  }

  async function fetchPosts(userId?: string) {
    posts.value = await postsApi.list(userId)
  }

  async function fetchTours(params?: Parameters<typeof toursApi.list>[0]) {
    tours.value = await toursApi.list(params)
  }

  async function fetchTrips(params?: Parameters<typeof tripsApi.list>[0]) {
    trips.value = await tripsApi.list(params)
  }

  async function updateUser(data: Partial<User>) {
    const updated = await usersApi.updateSettings(data)
    applyUser(updated)
  }

  async function createProfile(data: Parameters<typeof usersApi.createProfile>[0]) {
    const updated = await usersApi.createProfile(data)
    applyUser(updated)
  }

  async function addPost(post: { text: string; image?: string }) {
    const created = await postsApi.create(post)
    posts.value.unshift(created)
  }

  async function deletePost(id: string) {
    await postsApi.delete(id)
    posts.value = posts.value.filter((p) => p.id !== id)
  }

  async function addTour(tour: Parameters<typeof toursApi.create>[0]) {
    const created = await toursApi.create(tour)
    tours.value.unshift(created)
    return created
  }

  async function addTrip(trip: Parameters<typeof tripsApi.create>[0]) {
    const created = await tripsApi.create(trip)
    trips.value.unshift(created)
    return created
  }

  async function getTour(id: string) {
    return toursApi.get(id)
  }

  async function getTrip(id: string) {
    return tripsApi.get(id)
  }

  async function signupTour(id: string) {
    return toursApi.signup(id)
  }

  async function signupTrip(id: string) {
    return tripsApi.signup(id)
  }

  return {
    isAuthenticated,
    isLoading,
    user,
    posts,
    tours,
    trips,
    init,
    login,
    loginTelegram,
    logout,
    updateUser,
    createProfile,
    fetchPosts,
    fetchTours,
    fetchTrips,
    addPost,
    deletePost,
    addTour,
    addTrip,
    getTour,
    getTrip,
    signupTour,
    signupTrip,
  }
}
