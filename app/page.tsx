// app/page.tsx
import { redirect } from "next/navigation";

export default function Home() {
  redirect("/auth/login"); // send all traffic from "/" to "/log-in"
}
