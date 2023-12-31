import { TodoMvc } from "@/components/TodoMvc";
import { insertTodo } from "@/database";
import { FormHandler } from "@/server";
import { z } from "zod";

export const POST = FormHandler(z.object({ todo: z.string() }), {
  onSuccess(data) {
    insertTodo(data.todo);
    return <TodoMvc />;
  },
});
