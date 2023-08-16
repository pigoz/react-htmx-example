import {
  Todo,
  clearCompleted,
  destroy,
  getAllTodos,
  insertTodo,
  toggle,
  toggleAll,
} from "@/database";
import { RouteProps } from "@/server";
import cx from "classnames";

function filterFromSearchParams(
  search: URLSearchParams
): TodoMvcProps["filter"] {
  const active = search.has("active");
  const completed = search.has("completed");
  return active ? "active" : completed ? "completed" : "all";
}

export function GET(props: RouteProps) {
  const filter = filterFromSearchParams(props.search);

  return (
    <>
      <TodoMvc filter={filter} todos={getAllTodos()} />
      <Credits />
    </>
  );
}

export function POST(props: RouteProps) {
  const filter = filterFromSearchParams(props.search);

  const action = props.search.get("action");

  if (action === "insert-todo") {
    const name = props.formData.get("todo")!.toString();
    insertTodo(name);
  }

  if (action === "toggle-all") {
    toggleAll();
  }

  if (action === "toggle") {
    toggle(props.formData.get("todo")!.toString());
  }

  if (action === "destroy") {
    destroy(props.formData.get("todo")!.toString());
  }

  if (action === "clear-completed") {
    clearCompleted();
  }

  return <TodoMvc filter={filter} todos={getAllTodos()} />;
}

function hxPost(action: string) {
  return {
    "hx-post": `/?action=${action}`,
    "hx-target": ".todoapp",
    "hx-swap": "outerHtml",
  };
}

function TodoView(props: { todo: Todo }) {
  const todo = props.todo;
  return (
    <li
      className={cx(
        todo.flags.completed ? "completed" : null,
        todo.flags.editing ? "editing" : null
      )}
    >
      <div className="view">
        <form>
          <input type="hidden" name="todo" value={todo.id} readOnly />
          <input
            className="toggle"
            type="checkbox"
            defaultChecked={todo.flags.completed}
            {...hxPost("toggle")}
          />
          <label>{todo.name}</label>
          <button className="destroy" {...hxPost("destroy")}></button>
        </form>
      </div>
      <input className="edit" defaultValue={todo.name} />
    </li>
  );
}

function Filters(props: { filter: TodoMvcProps["filter"] }) {
  const map = {
    all: "All",
    active: "Active",
    completed: "Completed",
  };
  return (
    <ul className="filters">
      {Object.entries(map).map(([key, label]) => (
        <li key={key}>
          <a
            className={props.filter === key ? "selected" : undefined}
            href={key === "all" ? "?" : `?${key}`}
          >
            {label}
          </a>
        </li>
      ))}
    </ul>
  );
}

interface TodoMvcProps {
  filter: "all" | "active" | "completed";
  todos: Todo[];
}

function TodoMvc(props: TodoMvcProps) {
  return (
    <>
      <section className="todoapp">
        <header className="header">
          <h1>todos</h1>
          <form action="/" method="post" {...hxPost("insert-todo")}>
            <input
              name="todo"
              className="new-todo"
              placeholder="What needs to be done?"
              autoFocus
            />
          </form>
        </header>
        <section
          className="main"
          style={props.todos.length <= 0 ? { display: "none" } : {}}
        >
          <input
            id="toggle-all"
            className="toggle-all"
            type="checkbox"
            {...hxPost("toggle-all")}
          />
          <label htmlFor="toggle-all">Mark all as complete</label>
          <ul className="todo-list">
            {props.todos.map((t) => (
              <TodoView key={t.id} todo={t} />
            ))}
          </ul>
        </section>
        <footer
          className="footer"
          style={props.todos.length <= 0 ? { display: "none" } : {}}
        >
          <span className="todo-count">
            <strong>{props.todos.length}</strong> item left
          </span>
          <Filters filter={props.filter} />
          <button className="clear-completed" {...hxPost("clear-completed")}>
            Clear completed
          </button>
        </footer>
      </section>
    </>
  );
}

function Credits() {
  return (
    <footer className="info">
      <p>Double-click to edit a todo</p>
      <p>
        Created by <a href="http://github.com/pigoz">@pigoz</a>
      </p>
      <p>
        Part of <a href="http://todomvc.com">TodoMVC</a>
      </p>
    </footer>
  );
}
