import type { Metadata } from "next";
import { AuthForm } from "@/components/ui/auth-form";

export const metadata: Metadata = {
  title: "다시 입장",
};

export default function LoginPage() {
  return <AuthForm mode="login" />;
}
