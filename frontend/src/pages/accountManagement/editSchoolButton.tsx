import React, { useState } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Spinner } from "@/components/custom/spinner";
import { alertPopup } from "@/components/custom/alertPopup";
import { Settings } from "lucide-react";
import { fetchWrapper } from "@/utils/fetchWrapper";

interface School {
  id: string;
  name: string;
  address: string;
  [key: string]: any;
}

interface EditSchoolButtonProps {
  school: School;
  setData: any;
}

const backendUrl = import.meta.env.VITE_BACKEND_URL;

export const EditSchoolButton: React.FC<EditSchoolButtonProps> = ({
  school,
  setData,
}) => {
  const [name, setName] = useState(school.name);
  const [address, setAddress] = useState(school.address);
  const [isDeleteMode, setIsDeleteMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      let data;
      if (isDeleteMode) {
        data = await fetchWrapper(
          `${backendUrl}/user/delete/school/${school.id}`,
          {
            method: "DELETE",
          }
        );
      } else {
        data = await fetchWrapper(
          `${backendUrl}/user/edit/school/${school.id}`,
          {
            method: "PUT",
            body: JSON.stringify({
              name,
              address,
            }),
          }
        );
      }

      if (data.statusCode == 200) {
        if (isDeleteMode) {
          setData((prev: any[]) =>
            prev.filter((item) => item.id !== school.id)
          );
        } else {
          setData((prev: any[]) =>
            prev.map((item) => {
              if (item.id === school.id) {
                return {
                  ...item,
                  name: name,
                  address: address,
                };
              }
              return item;
            })
          );
        }
      } else {
        throw new Error();
      }
    } catch (err) {
      alertPopup({
        title: isDeleteMode ? "Delete Failed" : "Save Failed",
        description: "An unexpected error occurred. Please try again later",
        close: { label: "OK" },
      });
    } finally {
      setIsLoading(false);
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(open) => setOpen(open)}>
      <Button
        onClick={() => setOpen(true)}
        variant="ghost"
        aria-label="Edit school"
      >
        <Settings />
      </Button>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit School</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* delete-mode toggle */}
          <div className="flex items-center justify-between">
            <Label htmlFor="toggle-delete-mode">Delete</Label>
            <Switch
              id="toggle-delete-mode"
              checked={isDeleteMode}
              onCheckedChange={setIsDeleteMode}
              className="data-[state=checked]:bg-red-600"
            />
          </div>

          <Separator />

          {/* name */}
          <div className="grid gap-2">
            <Label htmlFor="school-name">Name</Label>
            <Input
              maxLength={150}
              id="school-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter school name"
              disabled={isDeleteMode || isLoading}
              required
            />
          </div>

          {/* address */}
          <div className="grid gap-2">
            <Label htmlFor="school-address">Address</Label>
            <Input
              maxLength={150}
              id="school-address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Enter school address"
              disabled={isDeleteMode || isLoading}
              required
            />
          </div>

          <DialogFooter>
            <Button
              type="submit"
              variant={isDeleteMode ? "destructive" : "default"}
              disabled={isLoading}
              className="w-16 font-semibold"
            >
              {isLoading ? <Spinner /> : isDeleteMode ? "Delete" : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
