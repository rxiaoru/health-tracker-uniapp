// WeChat Mini Program compatible API wrapper (uses uni.request instead of fetch)

const SUPABASE_URL = 'https://yplaxysgxzeezkrjylqu.supabase.co'
const SUPABASE_KEY = 'sb_publishable_M_15QzYI_gVeLvAD2koRCQ_e0DCBmbE'

function request(method: string, table: string, options?: {
  data?: any
  filter?: string
  select?: string
}): Promise<any[]> {
  return new Promise((resolve, reject) => {
    let url = `${SUPABASE_URL}/rest/v1/${table}`
    if (options?.select) url += `?select=${options.select}`
    if (options?.filter) url += (url.includes('?') ? '&' : '?') + options.filter

    uni.request({
      url,
      method: method as any,
      data: options?.data,
      header: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': method === 'POST' ? 'return=representation' : ''
      },
      success: (res: any) => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(res.data || [])
        } else {
          reject(new Error(`API ${res.statusCode}: ${JSON.stringify(res.data)}`))
        }
      },
      fail: (err: any) => reject(new Error(err.errMsg || 'Request failed'))
    })
  })
}

// ===== Weight Records =====
export function getWeights() {
  return request('GET', 'weight_records', { select: '*', filter: 'order=date.desc' })
}

export function upsertWeight(data: {
  date: string
  morning_weight?: number
  evening_weight?: number
  note?: string
}) {
  return request('POST', 'weight_records', {
    data,
    select: '*',
    filter: 'on_conflict=date'
  })
}

// ===== Meal Records =====
export function getMeals(date?: string) {
  var filter = 'order=created_at.desc'
  if (date) filter = `date=eq.${date}&` + filter
  return request('GET', 'meal_records', { select: '*', filter })
}

export function addMeal(data: {
  date: string
  meal_type: string
  food_name: string
  portion?: string
  kcal: number
}) {
  return request('POST', 'meal_records', { data, select: '*' })
}

export function deleteMeal(id: string) {
  return request('DELETE', 'meal_records', { filter: `id=eq.${id}` })
}

// ===== Journal =====
export function getJournal() {
  return request('GET', 'journal_events', { select: '*', filter: 'order=date.desc' })
}

export function addJournal(data: {
  date: string
  type: string
  title: string
  description?: string
  impact?: string
}) {
  return request('POST', 'journal_events', { data, select: '*' })
}

export function deleteJournal(id: string) {
  return request('DELETE', 'journal_events', { filter: `id=eq.${id}` })
}

// ===== User =====
export function saveProfile(data: {
  height?: number
  weight?: number
  age?: number
  gender?: string
}) {
  return request('POST', 'users', { data, select: '*' })
}

export function getProfile(userId: string) {
  return request('GET', 'users', { select: '*', filter: `id=eq.${userId}` })
}
