import { Outlet } from "react-router-dom";

export default function AuthLayout() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", backgroundColor: "var(--bg-primary)" }}>
      <Outlet />
    </div>
  );
}
