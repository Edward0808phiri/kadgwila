import { useSyncExternalStore } from 'react'

// Tiny localStorage-backed store for tickets + installment (down-payment) plans.
// No backend — everything lives in the browser and survives refreshes.
const KEY = 'zikets.account.v1'
const empty = { purchases: [], plans: [] }

function read() {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? { ...empty, ...JSON.parse(raw) } : { ...empty }
  } catch {
    return { ...empty }
  }
}

let state = read()
const listeners = new Set()

function commit(next) {
  state = next
  try {
    localStorage.setItem(KEY, JSON.stringify(state))
  } catch {
    /* storage full / disabled — keep working in-memory */
  }
  listeners.forEach((l) => l())
}

function subscribe(fn) {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

const uid = () =>
  (crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`)
const makeRef = () => 'ZK-' + Math.random().toString(36).slice(2, 7).toUpperCase()

// ---- Snapshot / summary --------------------------------------------------
export function useAccount() {
  return useSyncExternalStore(subscribe, () => state)
}

// ---- Tickets bought outright (or free reservations) ----------------------
export function addPurchase(p) {
  const purchase = {
    id: uid(),
    ref: makeRef(),
    boughtAt: Date.now(),
    method: 'full',
    ...p,
  }
  commit({ ...state, purchases: [purchase, ...state.purchases] })
  return purchase
}

// ---- Down-payment (layaway) plans ----------------------------------------
// deposit = paid today, paymentsLeft = remaining scheduled installments.
export function startPlan({ deposit, paymentsLeft, ...rest }) {
  const plan = {
    id: uid(),
    ref: makeRef(),
    startedAt: Date.now(),
    paid: deposit,
    payments: [{ amount: deposit, at: Date.now(), kind: 'Deposit' }],
    paymentsLeft,
    ...rest,
  }
  commit({ ...state, plans: [plan, ...state.plans] })
  return plan
}

// Pay the next scheduled installment on a plan. When the balance clears, the
// plan graduates into a real ticket in the purchases list.
export function payInstallment(planId) {
  const plan = state.plans.find((p) => p.id === planId)
  if (!plan) return
  const amount = nextInstallment(plan)
  const paid = Math.min(plan.total, plan.paid + amount)
  const payments = [...plan.payments, { amount, at: Date.now(), kind: 'Installment' }]
  const paymentsLeft = Math.max(0, plan.paymentsLeft - 1)
  const done = paid >= plan.total || paymentsLeft === 0

  if (done) {
    const purchase = {
      id: uid(),
      ref: plan.ref,
      boughtAt: Date.now(),
      method: 'plan',
      eventId: plan.eventId,
      title: plan.title,
      artist: plan.artist,
      category: plan.category,
      city: plan.city,
      image: plan.image,
      date: plan.date,
      time: plan.time,
      venue: plan.venue,
      qty: plan.qty,
      total: plan.total,
    }
    commit({
      ...state,
      plans: state.plans.filter((p) => p.id !== planId),
      purchases: [purchase, ...state.purchases],
    })
  } else {
    commit({
      ...state,
      plans: state.plans.map((p) =>
        p.id === planId ? { ...p, paid, payments, paymentsLeft } : p,
      ),
    })
  }
}

// Even-ish next payment across whatever installments remain.
export function nextInstallment(plan) {
  const remaining = Math.max(0, plan.total - plan.paid)
  if (plan.paymentsLeft <= 1) return remaining
  return Math.ceil(remaining / plan.paymentsLeft / 5) * 5 // round up to nearest K5
}
