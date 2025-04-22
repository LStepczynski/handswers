import { Button } from "@/components/ui/button";

export const Hero = () => {
  return (
    <div className="flex flex-col justify-center gap-4">
      <div className="flex justify-center items-center gap-2">
        <img
          src="/handraise.png"
          alt="Icon"
          className="lg:w-10 w-8 lg:h-10 h-8"
        />
        <h1 className="text-xl lg:text-2xl font-semibold">Handswers!</h1>
      </div>
      <div className="flex flex-col items-center gap-4 w-full">
        <div className="w-[90%] xs:w-[80%] lg:w-[90%]">
          <h4 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-[82px] lg:leading-none font-[800] text-end leading-none font-inter">
            Offload the Repeats
          </h4>
          <h4 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-[82px] lg:leading-none font-[800] leading-none font-inter">
            Focus on What Matters
          </h4>
        </div>
      </div>
      <div className="flex flex-col items-center w-full">
        <p className="text-center text-sm lg:text-lg w-[90%] lg:w-[50%]">
          Handswers helps teachers focus on what matters by letting students get
          thoughtful, AI-guided support—anytime they need it.
        </p>
      </div>
      <div className="w-full flex justify-center gap-6 lg:gap-8 mt-6">
        <a href="#how-to">
          <Button className="w-28 sm:w-32 rounded-none text-white font-semibold bg-orange-600 hover:bg-orange-500">
            Learn More
          </Button>
        </a>
        <a>
          <Button className="w-28 sm:w-32 rounded-none text-white font-semibold bg-orange-600 hover:bg-orange-500">
            Request Access
          </Button>
        </a>
      </div>
    </div>
  );
};
