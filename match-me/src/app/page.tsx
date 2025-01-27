import { Button } from "@heroui/react";
import { GoSmiley } from "react-icons/go";

export default function Home() {
  return (
    <div>
      <h1 className="text-3xl">hello</h1>
      <Button
        color="danger"
        variant="bordered"
        startContent={<GoSmiley />}
        >
          Click Me!
        </Button>
    </div>
  );
}
