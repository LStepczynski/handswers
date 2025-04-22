import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const HowTo = () => {
  return (
    <div className="flex flex-wrap gap-6 justify-center">
      <div className="w-full">
        <h4 className="w-full text-center font-semibold text-4xl lg:text-5xl mb-2 lg:mb-6">
          How to start ?
        </h4>
      </div>
      <Card className="w-[95%] lg:w-[45%] rounded-none">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-3xl">
            1. Create a Room
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-md text-muted-foreground leading-relaxed">
            Teachers begin by creating a dedicated room for any topic, unit, or
            assignment they’re teaching. This room acts as a focused space where
            student questions are grouped by context. It keeps discussions
            organized and gives teachers a clear view of where students need
            support.
          </p>
        </CardContent>
      </Card>

      <Card className="w-[95%] lg:w-[45%] rounded-none">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-3xl">
            2. Join
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-md text-muted-foreground leading-relaxed">
            Students join rooms instantly using a simple link or code—no logins
            or accounts needed. This lowers barriers to participation and keeps
            the experience smooth across any device. Everyone starts on the same
            page, ready to ask questions without delay or confusion.
          </p>
        </CardContent>
      </Card>

      <Card className="w-[95%] lg:w-[45%] rounded-none">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-3xl">
            3. Ask Questions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-md text-muted-foreground leading-relaxed">
            Once in a room, students can submit questions at any time—during
            class, after school, or while studying. Every question becomes its
            own thread, making it easy to follow and revisit. No more repeating
            the same answers or losing track of student needs.
          </p>
        </CardContent>
      </Card>

      <Card className="w-[95%] lg:w-[45%] rounded-none">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-3xl">
            4. Get Help
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-md text-muted-foreground leading-relaxed">
            The AI provides instant, guided responses that encourage students to
            think critically and explore answers on their own. If needed,
            teachers can jump into threads to clarify, redirect, or expand.
            Support happens in real time—without draining teacher attention.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
