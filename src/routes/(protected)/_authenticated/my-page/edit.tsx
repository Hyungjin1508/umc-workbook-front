import { createFileRoute } from "@tanstack/react-router";
import { EditProfilePage } from "@/pages/profile/edit-profile-page";

export const Route = createFileRoute("/(protected)/_authenticated/my-page/edit")({ component: EditProfilePage });
