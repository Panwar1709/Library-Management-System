const API_BASE = import.meta.env.VITE_API_BASE ?? "http://localhost:8080";

async function request(path, options = {}) {
  const { body, headers = {}, ...rest } = options;
  const res = await fetch(`${API_BASE}${path}`, {
    ...rest,
    headers: {
      ...(body != null ? { "Content-Type": "application/json" } : {}),
      ...headers,
    },
    body: body != null ? JSON.stringify(body) : undefined,
  });
  if (res.status === 204) {
    return null;
  }
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;
  if (!res.ok) {
    const msg =
      typeof data === "object" && data !== null && data.message != null
        ? data.message
        : typeof data === "object" && data !== null
          ? JSON.stringify(data)
          : text || res.statusText;
    throw new Error(msg || `HTTP ${res.status}`);
  }
  return data;
}

export const api = {
  base: API_BASE,
  getBooks: () => request("/books"),
  addBook: (dto) => request("/books", { method: "POST", body: dto }),
  borrowBook: (bookId, userId) =>
    request(`/books/${bookId}/borrow/${userId}`, { method: "PUT" }),
  returnBook: (bookId) => request(`/books/${bookId}/return`, { method: "PUT" }),

  getAuthors: () => request("/authors"),
  addAuthor: (name) => request("/authors", { method: "POST", body: { name } }),

  getCategories: () => request("/categories"),
  addCategory: (name) => request("/categories", { method: "POST", body: { name } }),

  getUsers: () => request("/users"),
  addUser: (dto) => request("/users", { method: "POST", body: dto }),
  deleteUser: (id) => request(`/users/${id}`, { method: "DELETE" }),
};
