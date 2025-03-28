import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { useMemo } from "react";

export function generateBreadcrumbs() {
  const pathSegments = useMemo(() => {
    return window.location.pathname
      .split("/")
      .filter((segment) => segment && isNaN(Number(segment))); // removes empty strings and numeric segments
  }, [window.location.pathname]);

  const capitalized = (str: string) =>
    str.charAt(0).toUpperCase() + str.slice(1);

  const crumbs = pathSegments.map((segment, index) => {
    const href = "/" + pathSegments.slice(0, index + 1).join("/");
    const isLast = index === pathSegments.length - 1;

    return (
      <BreadcrumbItem key={href}>
        {isLast ? (
          <BreadcrumbPage>{capitalized(segment)}</BreadcrumbPage>
        ) : (
          <>
            <BreadcrumbLink href={href}>{capitalized(segment)}</BreadcrumbLink>
            <BreadcrumbSeparator />
          </>
        )}
      </BreadcrumbItem>
    );
  });

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="/">Home</BreadcrumbLink>
        </BreadcrumbItem>
        {crumbs.length > 0 && <BreadcrumbSeparator />}
        {crumbs}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
