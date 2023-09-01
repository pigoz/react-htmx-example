import { TodoMvc } from "@/components/TodoMvc";
import { toggle } from "@/database";
import { FormHandler } from "@/server";
import z from "zod";

export const POST = FormHandler(z.object({ todo: z.string() }), {
  onSuccess(data) {
    toggle(data.todo);
    return <TodoMvc />;
  },
});
