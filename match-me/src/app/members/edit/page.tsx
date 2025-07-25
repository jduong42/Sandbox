import { CardHeader, Divider, CardBody } from "@heroui/react";
import React from "react";
import EditForm from "./EditForm";
import { getAuthUserId } from "@/app/actions/authActions";
import { getMemberByUserId } from "@/app/actions/memberActions";
import { notFound } from "next/navigation";

export default async function MemberEditPage() {
  const userId = await getAuthUserId();

  const member = await getMemberByUserId(userId);

  if (!member) return notFound();
  return (
    <>
      <CardHeader className="text-2xl font-semibold text-default">
        Edit Profile
      </CardHeader>
      <Divider />
      <CardBody>
        <EditForm member={member} />
      </CardBody>
    </>
  );
}
