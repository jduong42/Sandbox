import { CardHeader, CardBody, Divider } from "@heroui/react";
import React from "react";

export default function ChatPage() {
  return (
    <>
      <CardHeader className="text-2xl font-semibold text-default">
        Chat
      </CardHeader>
      <Divider />
      <CardBody>Chat goes here</CardBody>
    </>
  );
}
