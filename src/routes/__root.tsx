import { createRootRoute, Outlet } from "@tanstack/react-router";
import  Header  from "../components/layout/header";

export const Route = createRootRoute({
  component: () => (
    <div className="[&_button:focus-visible]:outline-2 [&_button:focus-visible]:outline-[#2563eb] [&_button:focus-visible]:outline-offset-2 [&_a:focus-visible]:outline-2 [&_a:focus-visible]:outline-[#2563eb] [&_a:focus-visible]:outline-offset-2">
      <Header />
      <Outlet />
    </div>
  ),
  notFoundComponent: () => <main>페이지를 찾을 수 없어요.</main>,
});
