import { TodoMvc } from "@/components/TodoMvc";
import { destroy } from "@/database";
import { FormHandler } from "@/server";
import z from "zod";

export const POST = FormHandler(z.object({ todo: z.string() }), {
  onSuccess(data) {
    destroy(data.todo);
    return <TodoMvc />;
  },
});
