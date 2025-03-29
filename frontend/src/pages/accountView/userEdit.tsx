import React from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/custom/spinner";

import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { fetchWrapper } from "@/utils/fetchWrapper";
import { clearSessionKeysContaining } from "@/utils/storageManagement";

interface Props {
  dialog: Record<string, any>;
  setDialog: any;
  setUsers: any;
}

const backendUrl = import.meta.env.VITE_BACKEND_URL;

export const UserEdit = (props: Props) => {
  const [alertDialog, setAlertDialog] = React.useState({
    open: false,
    title: "",
    description: "",
  });

  const { dialog, setDialog, setUsers } = props;

  const onDelete = async () => {
    setDialog((prev: any) => ({ ...prev, isLoading: true }));

    const data = await fetchWrapper(
      `${backendUrl}/user/delete/${dialog.target.id}`,
      {
        method: "DELETE",
      }
    );

    setDialog((prev: any) => ({ ...prev, isLoading: false, open: false }));

    if (data.statusCode == 200) {
      // Show popup
      setAlertDialog((prev: any) => ({
        ...prev,
        open: true,
        title: "Success!",
        description: "The user was successfully deleted.",
      }));

      // Edit the users list to incorporate the user change without reload
      setUsers((prevUsers: any) =>
        prevUsers.map((u: any) =>
          u.id === dialog.target.id ? { ...u, deleted: true } : u
        )
      );

      // Clear cache
      clearSessionKeysContaining(`/user/get/users/${dialog.target.school}`);
    } else {
      setAlertDialog((prev: any) => ({
        ...prev,
        open: true,
        title: "Error!",
        description:
          "There was an issue while deleting the user. Please try again later.",
      }));
    }
  };

  const onEdit = async () => {
    setDialog((prev: any) => ({ ...prev, isLoading: true }));

    const data = await fetchWrapper(
      `${backendUrl}/user/edit/${dialog.target.id}`,
      {
        method: "PUT",
        body: JSON.stringify(dialog.newValue),
      }
    );

    setDialog((prev: any) => ({ ...prev, isLoading: false, open: false }));

    if (data.statusCode == 200) {
      // Show popup
      setAlertDialog((prev: any) => ({
        ...prev,
        open: true,
        title: "Success!",
        description: "The user was successfully updated.",
      }));

      // Edit the users list to incorporate the user change without reload
      setUsers((prevUsers: any) =>
        prevUsers.map((u: any) =>
          u.id === dialog.target.id ? { ...u, ...dialog.newValue } : u
        )
      );

      // Clear cache
      clearSessionKeysContaining(`/user/get/users/${dialog.target.school}`);
    } else {
      setAlertDialog((prev: any) => ({
        ...prev,
        open: true,
        title: "Error!",
        description:
          "There was an issue while updating the user. Please try again later.",
      }));
    }
  };

  return (
    <div>
      <Dialog
        open={dialog.open}
        onOpenChange={(open) => setDialog((prev: any) => ({ ...prev, open }))}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Edit user {dialog?.target?.email}
            </DialogDescription>
          </DialogHeader>
          <div>
            <div className="flex items-center space-x-2">
              <Switch
                onCheckedChange={(value) => {
                  if (value) {
                    setAlertDialog((prev: any) => ({
                      ...prev,
                      open: true,
                      title: "User Deletion",
                      description:
                        "This action cannot be undone. This will permanently delete this account and remove data from our servers.",
                    }));
                  }

                  setDialog((prev: any) => ({ ...prev, deleteUser: value }));
                }}
                checked={dialog.deleteUser}
                className="data-[state=checked]:bg-red-700"
              />
              <Label className={`font-bold`}>Delete User</Label>
            </div>
            <Separator className="my-4" />
            <div className="relative">
              <div
                className={`absolute top-0 left-0 w-full h-full bg-background opacity-70 ${
                  !dialog.deleteUser && "hidden"
                }`}
              ></div>
              <div className="flex items-center space-x-2">
                <Switch
                  onCheckedChange={(value) => {
                    const canSubmit = value != dialog.target.enabled;
                    setDialog((prev: any) => ({
                      ...prev,
                      canSubmit: canSubmit,
                    }));
                    setDialog((prev: any) => ({
                      ...prev,
                      newValue: { ...prev.newValue, enabled: value },
                    }));
                  }}
                  checked={dialog.newValue.enabled}
                  color="red"
                />
                <Label className={`font-semibold`}>Account Enabled</Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <div className="flex gap-6 justify-center w-full">
              <DialogClose>
                <Button
                  onClick={() =>
                    setDialog((prev: any) => ({ ...prev, open: false }))
                  }
                  variant="secondary"
                  className="font-semibold w-20"
                >
                  Close
                </Button>
              </DialogClose>
              {dialog.deleteUser ? (
                <Button
                  disabled={dialog.isLoading}
                  variant={"destructive"}
                  className="font-semibold w-20"
                  onClick={onDelete}
                >
                  {dialog.isLoading ? <Spinner /> : "Delete"}
                </Button>
              ) : (
                <Button
                  disabled={!dialog.canSubmit || dialog.isLoading}
                  variant={"default"}
                  className="font-semibold w-20"
                  onClick={onEdit}
                >
                  {dialog.isLoading ? <Spinner /> : "Edit"}
                </Button>
              )}
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <AlertDialog
        open={alertDialog.open}
        onOpenChange={(open) =>
          setAlertDialog((prev: any) => ({ ...prev, open: open }))
        }
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{alertDialog.title}</AlertDialogTitle>
            <AlertDialogDescription>
              {alertDialog.description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Okay</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
