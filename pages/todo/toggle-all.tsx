import { TodoMvc } from "@/components/TodoMvc";
import { toggleAll } from "@/database";

export function POST() {
  toggleAll();
  return <TodoMvc />;
}
