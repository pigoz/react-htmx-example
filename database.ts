import { randomUUID } from "crypto";

export type Filter = "all" | "active" | "completed";

export class Todo {
  readonly id = randomUUID();

  constructor(
    readonly name: string,
    readonly flags: Partial<{
      completed: boolean;
      editing: boolean;
    }>
  ) {}
}

const db = {
  todos: [
    new Todo("Taste JavaScript", {
      completed: true,
    }),
    new Todo("Buy a unicorn", {}),
  ],
  filter: "all" as Filter,
};

export function getAllTodos(): Todo[] {
  const filter = db.filter;

  return db.todos.filter(
    (t) =>
      filter === "all" ||
      (filter === "active" && !t.flags.completed) ||
      (filter === "completed" && t.flags.completed)
  );
}

export function insertTodo(t: string) {
  db.filter = "all";
  db.todos = [new Todo(t, {})].concat(db.todos);
}

export function toggleAll() {
  db.filter = "all";
  const originState = db.todos.every((todo) => todo.flags.completed);

  getAllTodos().forEach((todo) => {
    todo.flags.completed = !originState;
  });
}

export function toggle(id: string) {
  db.filter = "all";
  const todo = db.todos.find((t) => t.id === id);
  if (todo) {
    todo.flags.completed = !todo.flags.completed;
  }
}

export function destroy(id: string) {
  db.todos = db.todos.filter((t) => t.id !== id);
}

export function clearCompleted() {
  db.todos = getAllTodos().filter((t) => !t.flags.completed);
}

export function getFilter() {
  return db.filter;
}

export function setFilter(filter: Filter) {
  db.filter = filter;
}
