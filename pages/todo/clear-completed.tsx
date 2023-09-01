import { TodoMvc } from "@/components/TodoMvc";
import { clearCompleted } from "@/database";

export function POST() {
  clearCompleted();
  return <TodoMvc />;
}
