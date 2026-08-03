export const queryKeys = {
  auth: {
    me: ["auth", "me"] as const,
  },
  documents: {
    mine: ["documents", "mine"] as const,
    all: ["documents", "all"] as const,
    pending: ["documents", "pending"] as const,
    detail: (id: number) => ["documents", "detail", id] as const,
  },
  review: {
    fields: (docId: number) => ["review", "fields", docId] as const,
  },
  notifications: {
    list: ["notifications", "list"] as const,
  },
};
