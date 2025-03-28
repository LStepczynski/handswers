import { useParams } from "react-router-dom";
import React from "react";

import { ChevronsUpDown, School, UsersRound, BookOpenText } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

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

const backendUrl = import.meta.env.VITE_BACKEND_URL;

const cacheSettings = {
  schoolFetch: {
    cache: true,
    duration: 60 * 15,
  },
};

export const AccountManagement = () => {
  const page = Number(useParams().page);

  const user = getUser();
  if (!user || !user.roles.includes("admin")) {
    window.location.href = "/";
  }

  const { data: schools } = useFetchData(
    `${backendUrl}/user/get/schools?page=${page}`,
    [],
    {},
    cacheSettings.schoolFetch.cache,
    cacheSettings.schoolFetch.duration
  );

  const [openSchools, setOpenSchools] = React.useState<Set<string>>(new Set());

  const toggleSchool = (id: string) => {
    setOpenSchools((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

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
        {(schools as any).map((school: any) => (
          <Collapsible
            key={school.id}
            open={openSchools.has(school.id)}
            onOpenChange={() => toggleSchool(school.id)}
          >
            {/* Trigger for the dropdown */}
            <CollapsibleTrigger asChild>
              <Button variant="outline" className="w-full h-16 justify-between">
                <h4 className="text-lg font-semibold">{school.name}</h4>
                <ChevronsUpDown />
              </Button>
            </CollapsibleTrigger>
            {/* Content of the dropdown */}
            <CollapsibleContent className="mt-2 px-4 py-2 bg-muted rounded-md transition-all data-[state=open]:animate-collapsible-down data-[state=closed]:animate-collapsible-up">
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
            </CollapsibleContent>
          </Collapsible>
        ))}
      </div>
      {/* Pagination */}
      <div>
        <Separator className="mb-10 mt-10" />
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
