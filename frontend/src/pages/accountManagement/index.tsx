import React from "react";
import { useParams } from "react-router-dom";

import { School, UsersRound, BookOpenText } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

import { Spinner } from "@/components/custom/spinner";
import { useFetchData } from "@/hooks/useFetchData";
import { Separator } from "@/components/ui/separator";
import { AddUsersButton } from "./addUsersButton";
import { getUser } from "@/utils/getUser";
import { useBreadcrumbs } from "@/components/custom/navBreadcrumbs/breadcrumbProvider";
import { AddSchoolButton } from "./addSchoolButton";
import { EditSchoolButton } from "./editSchoolButton";

const backendUrl = import.meta.env.VITE_BACKEND_URL;

const breadcrumbs = [
  {
    label: "Admin",
    link: "#",
  },
  {
    label: "Accounts",
    link: "#",
  },
];

export const AccountManagement = () => {
  const page = Number(useParams().page);

  // Set breadcrumbs
  const { setBreadcrumbs } = useBreadcrumbs();
  React.useEffect(() => {
    setBreadcrumbs(breadcrumbs);
  }, []);

  const user = getUser();
  if (!user || !user.roles.includes("admin")) {
    window.location.href = "/";
    return null;
  }

  const { data: schools, setData } = useFetchData(
    `${backendUrl}/user/get/schools?page=${page}`,
    [],
    {}
  );

  if (schools == null) {
    return (
      <div className="grid justify-center items-center h-[75%]">
        <Spinner className="h-12 w-12" />
      </div>
    );
  }
  return (
    <div>
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-semibold">Schools and Users</h1>
        <School className="w-8 h-8" />
      </div>
      <Separator className="mb-6 mt-3" />
      <div className="space-y-2">
        <Accordion type="single" collapsible className="w-full">
          {(schools as any).map((school: any) => (
            <AccordionItem value={school.id}>
              {/* Trigger for the dropdown */}
              <div className="relative">
                <AccordionTrigger className="h-20 w-full">
                  <h4 className="text-lg font-semibold">{school.name}</h4>
                </AccordionTrigger>
                <div className="absolute top-[50%] right-[25px] translate-y-[-50%]">
                  <EditSchoolButton school={school} setData={setData} />
                </div>
              </div>
              {/* Content of the dropdown */}
              <AccordionContent className="mb-6 px-4 py-2 bg-muted rounded-md transition-all data-[state=open]:animate-collapsible-down data-[state=closed]:animate-collapsible-up">
                {/* Add users button */}
                <AddUsersButton school={school} />
                {/* View students button */}
                <Button
                  onClick={() =>
                    (window.location.href = `/admin/account-management/${school.id}/1?userType=student&schoolName=${school.name}`)
                  }
                  variant="outline"
                  className="w-full h-12 justify-start"
                >
                  <UsersRound />
                  View Students
                </Button>
                {/* View teachers button */}
                <Button
                  onClick={() =>
                    (window.location.href = `/admin/account-management/${school.id}/1?userType=teacher&schoolName=${school.name}`)
                  }
                  variant="outline"
                  className="w-full h-12 justify-start"
                >
                  <BookOpenText />
                  View Teachers
                </Button>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
      <div className="w-full flex justify-end my-4">
        <AddSchoolButton />
      </div>
      {/* Pagination */}
      <div className="mt-8">
        <Pagination>
          <PaginationContent>
            {/* Previous Button */}
            <PaginationItem>
              {page === 1 ? (
                <PaginationPrevious
                  aria-disabled="true"
                  className="pointer-events-none opacity-50"
                />
              ) : (
                <PaginationPrevious
                  href={`/admin/account-management/${page - 1}`}
                />
              )}
            </PaginationItem>

            {/* First Page */}
            {page !== 1 && (
              <PaginationItem>
                <PaginationLink href={`/admin/account-management/1`}>
                  1
                </PaginationLink>
              </PaginationItem>
            )}

            {/* Current Page */}
            <PaginationItem>
              <PaginationLink isActive>{page}</PaginationLink>
            </PaginationItem>

            {/* Ellipsis */}
            <PaginationItem>
              <PaginationEllipsis />
            </PaginationItem>

            {/* Next Button */}
            <PaginationItem>
              {(schools as any).length < 10 ? (
                <PaginationNext
                  aria-disabled="true"
                  className="pointer-events-none opacity-50"
                />
              ) : (
                <PaginationNext
                  href={`/admin/account-management/${page + 1}`}
                />
              )}
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
};
