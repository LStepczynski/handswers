import React from "react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Settings } from "lucide-react";

import { Button } from "@/components/ui/button";
import { UserEdit } from "./userEdit";

interface Props {
  users: Record<string, any>[];
  setUsers: any;
}

export const UserTable = (props: Props) => {
  const [dialog, setDialog] = React.useState({
    open: false,
    target: null as Record<string, any> | null,
    deleteUser: false,
    canSubmit: false,
    isLoading: false,
    newValue: {
      enabled: false,
    },
  });

  const { users, setUsers } = props;

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Email</TableHead>
            <TableHead>Enabled</TableHead>
            <TableHead>
              <p className="ml-3">Edit</p>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {(users as any).map((user: any) => {
            if (user.deleted) return null;
            return (
              <TableRow key={user.email}>
                <TableCell className="font-medium">{user.email}</TableCell>
                <TableCell>
                  <p className="font-semibold">
                    {user.enabled ? "True" : "False"}
                  </p>
                </TableCell>
                <TableCell>
                  <Button
                    onClick={() =>
                      setDialog({
                        open: true,
                        target: user,
                        deleteUser: false,
                        canSubmit: false,
                        isLoading: false,
                        newValue: {
                          enabled: user.enabled,
                        },
                      })
                    }
                    variant="ghost"
                  >
                    <Settings />
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
      <UserEdit dialog={dialog} setDialog={setDialog} setUsers={setUsers} />
    </div>
  );
};
