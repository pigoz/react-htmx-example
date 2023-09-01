import { Filter, Todo, getAllTodos, getFilter } from "@/database";
import cx from "classnames";

function hxPost(action: string) {
  const post = `/todo/${action}`;
  return {
    "hx-post": post,
    "hx-target": ".todoapp",
    "hx-swap": "outerHtml",
  };
}

export function TodoMvc() {
  const filter = getFilter();
  const todos = getAllTodos();

  return (
    <>
      <section className="todoapp">
        <header className="header">
          <h1>todos</h1>
          <form {...hxPost("insert")} method="post">
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
          style={todos.length <= 0 ? { display: "none" } : {}}
        >
          <input
            id="toggle-all"
            className="toggle-all"
            type="checkbox"
            {...hxPost("toggle-all")}
          />
          <label htmlFor="toggle-all">Mark all as complete</label>
          <ul className="todo-list">
            {todos.map((t) => (
              <TodoView key={t.id} todo={t} />
            ))}
          </ul>
        </section>
        <footer
          className="footer"
          style={todos.length <= 0 ? { display: "none" } : {}}
        >
          <span className="todo-count">
            <strong>{todos.length}</strong> item left
          </span>
          <Filters filter={filter} />
          <button className="clear-completed" {...hxPost("clear-completed")}>
            Clear completed
          </button>
        </footer>
      </section>
    </>
  );
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

function Filters(props: { filter: Filter }) {
  const map = {
    all: "All",
    active: "Active",
    completed: "Completed",
  };
  return (
    <ul className="filters">
      {Object.entries(map).map(([key, label]) => (
        <li key={key}>
          <form method="post" {...hxPost("filter")}>
            <input type="hidden" name="filter" value={key} />
            <button
              className={props.filter === key ? "selected" : undefined}
              type="submit"
            >
              {label}
            </button>
          </form>
        </li>
      ))}
    </ul>
  );
}
