import React from "react";
import {
  fetchCurrentUserLikeIds,
  fetchLikedMembers,
} from "../actions/likeActions";
import ListsTab from "./ListsTab";

export default async function ListPage({
  searchParams,
}: {
  searchParams: { type: string };
}) {
  const { type } = await searchParams;
  const likeIds = await fetchCurrentUserLikeIds();
  const members = await fetchLikedMembers(type);

  return (
    <div>
      <ListsTab members={members} likeIds={likeIds} />
    </div>
  );
}
