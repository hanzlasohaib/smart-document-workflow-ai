export const queryKeys = {
  auth: {
    me: ["auth", "me"] as const,
  },
  documents: {
    mine: (page = 1, pageSize = 20) => ["documents", "mine", page, pageSize] as const,
    all: (page = 1, pageSize = 20) => ["documents", "all", page, pageSize] as const,
    pending: (page = 1, pageSize = 20) =>
      ["documents", "pending", page, pageSize] as const,
    detail: (id: number) => ["documents", "detail", id] as const,
  },
  review: {
    fields: (docId: number) => ["review", "fields", docId] as const,
  },
  notifications: {
    list: (page = 1, pageSize = 20) => ["notifications", "list", page, pageSize] as const,
  },
};
