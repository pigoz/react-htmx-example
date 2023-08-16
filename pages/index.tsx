import { RouteProps } from "@/server";
import cx from "classnames";
import { randomUUID } from "crypto";

class todo {
  readonly id = randomUUID();

  constructor(
    readonly name: string,
    readonly flags: { completed: boolean; checked: boolean; editing: boolean }
  ) {}
}

const db = {
  todos: [
    new todo("Taste JavaScript", {
      completed: true,
      checked: true,
      editing: false,
    }),
    new todo("Buy a unicorn", {
      completed: false,
      checked: false,
      editing: false,
    }),
  ],
};

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
      <TodoMvc filter={filter} todos={db.todos} />
      <Credits />
    </>
  );
}

export function POST(props: RouteProps) {
  const filter = filterFromSearchParams(props.search);

  const name = props.formData.get("todo")?.toString();

  if (name) {
    db.todos = [
      new todo(name, { completed: false, editing: false, checked: false }),
    ].concat(db.todos);
  }

  console.log(props.formData);

  return <TodoMvc filter={filter} todos={db.todos} />;
}

interface TodoProps {
  id: todo["id"];
  name: todo["name"];
  flags: todo["flags"];
}

function Todo(props: TodoProps) {
  return (
    <li
      className={cx(
        props.flags.completed ? "completed" : null,
        props.flags.editing ? "editing" : null
      )}
    >
      <div className="view">
        <input
          className="toggle"
          type="checkbox"
          defaultChecked={props.flags.checked}
        />
        <label>{props.name}</label>
        <button className="destroy"></button>
      </div>
      <input className="edit" defaultValue={props.name} />
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
  todos: todo[];
}

function TodoMvc(props: TodoMvcProps) {
  return (
    <>
      <section className="todoapp">
        <header className="header">
          <h1>todos</h1>
          <form
            action="/"
            method="post"
            hx-post="/"
            hx-target=".todoapp"
            hx-swap="outerHtml"
          >
            <input
              name="todo"
              className="new-todo"
              placeholder="What needs to be done?"
              autoFocus
            />
          </form>
        </header>
        {/*-- This section should be hidden by default and shown when there are todos */}
        <section className="main">
          <input id="toggle-all" className="toggle-all" type="checkbox" />
          <label htmlFor="toggle-all">Mark all as complete</label>
          <ul className="todo-list">
            {props.todos.map((t) => (
              <Todo key={t.id} id={t.id} name={t.name} flags={t.flags} />
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
          <button className="clear-completed">Clear completed</button>
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
