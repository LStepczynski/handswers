import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils"; // Optional utility from shadcn

export const Spinner = ({
  className,
  color,
}: {
  className?: string;
  color?: string;
}) => {
  return (
    <Loader2 className={cn("h-5 w-5 animate-spin", className)} color={color} />
  );
};
