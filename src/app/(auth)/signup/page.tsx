import type { Metadata } from "next";
import { AuthForm } from "@/components/ui/auth-form";

export const metadata: Metadata = {
  title: "세계 입장",
};

export default function SignupPage() {
  return <AuthForm mode="signup" />;
}
