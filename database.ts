import { randomUUID } from "crypto";

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
};

export function getAllTodos(): Todo[] {
  return db.todos;
}

export function insertTodo(t: string) {
  db.todos = [new Todo(t, {})].concat(db.todos);
}

export function toggleAll() {
  const originState = db.todos.every((todo) => todo.flags.completed);

  db.todos.forEach((todo) => {
    todo.flags.completed = !originState;
  });
}

export function toggle(id: string) {
  const todo = db.todos.find((t) => t.id === id);
  if (todo) {
    todo.flags.completed = !todo.flags.completed;
  }
}

export function destroy(id: string) {
  db.todos = db.todos.filter((t) => t.id !== id);
}

export function clearCompleted() {
  db.todos = db.todos.filter((t) => !t.flags.completed);
}
