import { getAllTodos, getFilter, insertTodo } from "@/database";
import { FormHandler } from "@/server";
import { z } from "zod";
import { TodoMvc } from "..";

// export function POST(props: RouteProps) {
//   const name = props.formData.get("todo")!.toString();
//   insertTodo(name);
// }

export const POST = FormHandler(z.object({ todo: z.string() }), {
  onSuccess: (data) => {
    insertTodo(data.todo);
    return <TodoMvc filter={getFilter()} todos={getAllTodos()} />;
  },
  onError: () => {
    return null;
  },
});
