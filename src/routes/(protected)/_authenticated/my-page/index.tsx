import { createFileRoute } from "@tanstack/react-router";
import { MyPage } from "@/pages/profile/my-page";

export const Route = createFileRoute("/(protected)/_authenticated/my-page/")({ component: MyPage });
