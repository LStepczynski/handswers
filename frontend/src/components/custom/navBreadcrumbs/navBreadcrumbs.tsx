import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

import { useBreadcrumbs } from "./breadcrumbProvider";

export function NavBreadcrumbs() {
  const { breadcrumbs } = useBreadcrumbs();

  const crumbs =
    breadcrumbs &&
    breadcrumbs.map((crumb: any) => (
      <>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbLink href={crumb.link}>{crumb.label}</BreadcrumbLink>
        </BreadcrumbItem>
      </>
    ));

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="/">Home</BreadcrumbLink>
        </BreadcrumbItem>
        {crumbs}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
