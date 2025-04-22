import { Separator } from "@/components/ui/separator";
import { Hero } from "./hero";
import { HowTo } from "./howTo";
import { TargetGroups } from "./targetGroups";

export const Home = () => {
  return (
    <>
      <div className="mt-20"></div>
      {/* Hero section */}
      <Hero />
      {/* Who is it for section */}
      <div className="mt-32"></div>
      <TargetGroups />

      <div
        className="my-40 lg:my-60 flex flex-col items-center gap-4"
        id="how-to"
      >
        <Separator className="w-[70%]" />
        <Separator className="w-[65%]" />
        <Separator className="w-[15%]" />
      </div>

      <HowTo />

      <div className="my-32 lg:mt-60 flex flex-col items-center gap-4">
        <Separator className="w-[15%]" />
        <Separator className="w-[65%]" />
        <Separator className="w-[70%]" />
      </div>
    </>
  );
};
