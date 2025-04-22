import React from "react";
import { useParams, useLocation } from "react-router-dom";

import { UsersRound } from "lucide-react";

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

import { getUser } from "@/utils/getUser";
import { useFetchData } from "@/hooks/useFetchData";
import { Spinner } from "@/components/custom/spinner";
import { Separator } from "@/components/ui/separator";
import { UserTable } from "./userTable";
import { useBreadcrumbs } from "@/components/custom/navBreadcrumbs/breadcrumbProvider";

const backendUrl = import.meta.env.VITE_BACKEND_URL;

const cacheSettings = {
  userFetch: {
    cache: true,
    duration: 60 * 15,
  },
};

const breadcrumbs = [
  {
    label: "Accounts",
    link: "/admin/account-management/1",
  },
  {
    label: "View",
    link: "#",
  },
];

export const AccountView = () => {
  const pageParams = useParams();
  const page = Number(pageParams.page);
  const schoolId = pageParams.schoolId;

  // Set breadcrumbs
  const { setBreadcrumbs } = useBreadcrumbs();
  React.useEffect(() => {
    setBreadcrumbs(breadcrumbs);
  }, []);

  const { search } = useLocation();
  const userType = new URLSearchParams(search).get("userType");
  const schoolName = new URLSearchParams(search).get("schoolName");

  const user = getUser();
  if (!user || !user.roles.includes("admin")) {
    window.location.href = "/";
    return null;
  }

  // Fetch users for school
  const { data: users, setData: setUsers } = useFetchData(
    `${backendUrl}/user/get/users/${schoolId}?page=${page}&userType=${userType}`,
    [],
    {},
    cacheSettings.userFetch.cache,
    cacheSettings.userFetch.duration
  );
  if (users == null) {
    return (
      <div className="grid justify-center items-center h-[75%]">
        <Spinner className="h-12 w-12" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-semibold">
          {schoolName} {userType} list
        </h1>
        <UsersRound className="w-8 h-8" />
      </div>
      <Separator className="mb-6 mt-3" />
      {/* Display users in a table */}
      <UserTable users={users as Record<string, any>[]} setUsers={setUsers} />
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
                  href={`/admin/account-management/${schoolId}/${
                    page - 1
                  }?userType=${userType}&schoolName=${schoolName}`}
                />
              )}
            </PaginationItem>

            {/* First Page */}
            {page !== 1 && (
              <PaginationItem>
                <PaginationLink
                  href={`/admin/account-management/${schoolId}/1?userType=${userType}&schoolName=${schoolName}`}
                >
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
              {(users as any).length < 25 ? (
                <PaginationNext
                  aria-disabled="true"
                  className="pointer-events-none opacity-50"
                />
              ) : (
                <PaginationNext
                  href={`/admin/account-management/${schoolId}/${
                    page + 1
                  }?userType=${userType}&schoolName=${schoolName}`}
                />
              )}
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
};
