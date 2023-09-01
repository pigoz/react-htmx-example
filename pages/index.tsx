import { Credits } from "@/components/Credits";
import { TodoMvc } from "@/components/TodoMvc";

export function GET() {
  return (
    <>
      <TodoMvc />
      <Credits />
    </>
  );
}
