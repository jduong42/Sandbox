"use client";

import { signOutUser } from "@/app/actions/authActions";
import {
  Avatar,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownSection,
  DropdownTrigger,
} from "@heroui/react";
import Link from "next/link";
import React from "react";

type Props = {
  userInfo: {
    name: string | null;
    image: string | null;
  } | null;
};

export default function UserMenu({ userInfo }: Props) {
  return (
    <Dropdown placement="bottom-end">
      <DropdownTrigger>
        <Avatar
          isBordered
          as="button"
          className="transition-transform"
          color="default"
          name={userInfo?.name || "user avatar"}
          size="sm"
          src={userInfo?.image || "/images/user.png"}
        />
      </DropdownTrigger>
      <DropdownMenu variant="flat" aria-label="User actions menu.">
        <DropdownSection showDivider>
          <DropdownItem
            key="username"
            isReadOnly
            as="span"
            className="h-14 flex flex-row"
            aria-label="username"
          >
            Signed in as {userInfo?.name}.
          </DropdownItem>
        </DropdownSection>
        <DropdownItem key="edit" as={Link} href="/members/edit">
          Edit profile.
        </DropdownItem>
        <DropdownItem
          key="signout"
          color="danger"
          onPress={async () => signOutUser()}
        >
          Sign out.
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );
}
