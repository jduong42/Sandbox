import { getMemberByUserId } from "@/app/actions/memberActions";
import { notFound } from "next/navigation";
import { CardBody, CardHeader, Divider } from "@heroui/react";
import React from "react";

export default async function MemberDetailedPage({
  params,
}: {
  params: { userId: string };
}) {
  const { userId } = await params;

  const member = await getMemberByUserId(userId);

  if (!member) return notFound();

  return (
    <>
      <CardHeader className="text-2xl font-semibold text-default">
        Profile
      </CardHeader>
      <Divider />
      <CardBody>{member.description}</CardBody>
    </>
  );
}
