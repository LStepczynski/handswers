import React from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { UserPlus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { fetchWrapper } from "@/utils/fetchWrapper";
import { Spinner } from "@/components/custom/spinner";

interface Props {
  school: Record<string, any>;
}

const backendUrl = import.meta.env.VITE_BACKEND_URL;

export const AddUsersButton = (props: Props) => {
  const [dialogState, setDialogState] = React.useState({
    open: false,
    alertOpen: false,
    isLoading: false,
    canSubmit: false,
    formatError: "",
    alertMessage: { title: "", description: "" },
  });
  const [formData, setFormData] = React.useState({
    userType: undefined as string | undefined,
    emailInput: "",
  });
  const { school } = props;

  React.useEffect(() => {
    const parsedEmails = parseEmails(formData.emailInput);
    const { valid, invalid } = validateGoogleEmails(parsedEmails);
    if (invalid.length !== 0) {
      setDialogState((prev) => ({
        ...prev,
        formatError: "The email addresses are not properly formated.",
        canSubmit: false,
      }));
    } else {
      setDialogState((prev) => ({
        ...prev,
        formatError: "",
        canSubmit: valid.length !== 0 && formData.userType !== undefined,
      }));
    }
  }, [formData.emailInput, formData.userType]);

  const onFormSubmit = async () => {
    setDialogState((prev) => ({ ...prev, isLoading: true }));
    const data = await fetchWrapper(`${backendUrl}/user/create/users`, {
      method: "POST",
      body: JSON.stringify({
        schoolId: school.id,
        userList: parseEmails(formData.emailInput),
        userType: formData.userType,
      }),
    });
    setDialogState((prev) => ({ ...prev, isLoading: false, alertOpen: true }));
    if (data.statusCode == 200) {
      setDialogState((prev) => ({
        ...prev,
        alertMessage: {
          title: "Success!",
          description: `The email addresses were successfully added to ${school.name}.`,
        },
        open: false,
      }));
    } else {
      setDialogState((prev) => ({
        ...prev,
        alertMessage: {
          title: "Error!",
          description: `There was an issue while adding email addresses to ${school.name}. Please try again later.`,
        },
      }));
    }
  };

  const parseEmails = (input: string): string[] => {
    return input
      .split(",")
      .map((email) => email.trim())
      .filter((email) => email.length > 0);
  };

  const validateGoogleEmails = (
    emails: string[]
  ): { valid: string[]; invalid: string[] } => {
    const googleEmailRegex =
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(com|org|edu|net)$/;
    const valid: string[] = [];
    const invalid: string[] = [];
    emails.forEach((email) => {
      if (googleEmailRegex.test(email)) {
        valid.push(email);
      } else {
        invalid.push(email);
      }
    });
    return { valid, invalid };
  };

  return (
    <div>
      <Dialog
        open={dialogState.open}
        onOpenChange={(open) => setDialogState((prev) => ({ ...prev, open }))}
      >
        <DialogTrigger className="w-full h-12">
          <Button
            onClick={() => setDialogState((prev) => ({ ...prev, open: true }))}
            variant="outline"
            className="w-full h-12 justify-start"
          >
            <UserPlus />
            Add Account
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add new users</DialogTitle>
            <DialogDescription>
              Add new users to{" "}
              <span className="font-semibold">{school.name}</span>
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <Select
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, userType: value }))
              }
              value={formData.userType}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="student">Student</SelectItem>
                  <SelectItem value="teacher">Teacher</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
            <div className="grid gap-2">
              <label className="text-muted-foreground">
                Enter google email addresses separated by a comma
              </label>
              <Textarea
                value={formData.emailInput}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    emailInput: e.target.value,
                  }))
                }
                placeholder="email1, email2, email3 ..."
                className="h-40"
              />
              <p className="w-full text-center text-red-600 text-sm">
                {dialogState.formatError}
              </p>
            </div>
          </div>
          <DialogFooter>
            <div className="flex gap-6 justify-center w-full">
              <DialogClose>
                <Button
                  onClick={() =>
                    setDialogState((prev) => ({ ...prev, open: false }))
                  }
                  variant="secondary"
                  className="font-semibold w-20"
                >
                  Close
                </Button>
              </DialogClose>
              <Button
                disabled={!dialogState.canSubmit || dialogState.isLoading}
                variant="destructive"
                className="font-semibold w-20"
                onClick={onFormSubmit}
              >
                {dialogState.isLoading ? <Spinner /> : "Submit"}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <AlertDialog
        open={dialogState.alertOpen}
        onOpenChange={(open) =>
          setDialogState((prev) => ({ ...prev, alertOpen: open }))
        }
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {dialogState.alertMessage.title}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {dialogState.alertMessage.description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Close</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
