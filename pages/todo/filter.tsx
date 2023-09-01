import { TodoMvc } from "@/components/TodoMvc";
import { setFilter } from "@/database";
import { FormHandler } from "@/server";
import z from "zod";

const filter = z.enum(["all", "active", "completed"]);

export const POST = FormHandler(z.object({ filter }), {
  onSuccess(data) {
    setFilter(data.filter);
    return <TodoMvc />;
  },
});
