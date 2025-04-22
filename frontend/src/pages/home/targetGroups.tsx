import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { User, School, GraduationCap } from "lucide-react";

export const TargetGroups = () => {
  return (
    <div className="flex flex-col flex-wrap lg:flex-row justify-center items-center gap-6">
      <Card className="w-[90%] xs:w-[70%] lg:w-[40%] xl:w-[30%]">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <GraduationCap className="w-8 h-8" />
            Teachers
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc ml-4 font-semibold text-sm sm:text-lg">
            <li>Create rooms</li>
            <li>View student questions</li>
            <li>Guide student progress</li>
          </ul>
        </CardContent>
      </Card>
      <Card className="w-[90%] xs:w-[70%] lg:w-[40%] xl:w-[30%]">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <User className="w-8 h-8" />
            Students
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc ml-4 font-semibold text-sm sm:text-lg">
            <li>Ask questions</li>
            <li>Get AI-guided help</li>
            <li>Know when to reach out for help</li>
          </ul>
        </CardContent>
      </Card>
      <Card className="w-[90%] xs:w-[70%] lg:w-[40%] xl:w-[30%]">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <School className="w-8 h-8" />
            Schools
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc ml-4 font-semibold text-sm sm:text-lg">
            <li>Quick setup</li>
            <li>Boost outcomes</li>
            <li>Enhance student support</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};
