import React from "react";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { fetchWrapper } from "@/utils/fetchWrapper";
import { alertPopup } from "@/components/custom/alertPopup";

const backendUrl = import.meta.env.VITE_BACKEND_URL;

export const AddSchoolButton = () => {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");
  const [formState, setFormState] = React.useState({
    name: "",
    address: "",
  });

  const onSubmit = async () => {
    if (formState.name.trim() == "" || formState.address.trim() == "") {
      return setError("Fill out all the fields.");
    }

    setLoading(true);

    const data = await fetchWrapper(`${backendUrl}/user/create/school`, {
      method: "POST",
      body: JSON.stringify({
        name: formState.name.trim(),
        address: formState.address.trim(),
      }),
    });

    setLoading(false);

    if (data.statusCode == 200) {
      window.location.reload();
    } else {
      alertPopup({
        title: "Error!",
        description:
          "Something went wrong while creating the school. Please try again later.",
        action: { visible: false },
      });
    }
  };

  return (
    <Dialog>
      <DialogTrigger>
        <Button className="font-semibold">
          Add School
          <Plus />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create School</DialogTitle>
        </DialogHeader>
        <div className="grid gap-6">
          <div className="grid gap-2">
            <p>Name:</p>
            <Input
              value={formState.name}
              maxLength={150}
              onChange={(e) =>
                setFormState((prev: any) => ({ ...prev, name: e.target.value }))
              }
            />
          </div>
          <div className="grid gap-2">
            <p>Address:</p>
            <Input
              value={formState.address}
              maxLength={150}
              onChange={(e) =>
                setFormState((prev: any) => ({
                  ...prev,
                  address: e.target.value,
                }))
              }
            />
          </div>
          <p className="text-center text-red-600">{error}</p>
        </div>
        <DialogFooter>
          <Button
            disabled={loading}
            onClick={onSubmit}
            className="font-semibold"
          >
            Submit
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
