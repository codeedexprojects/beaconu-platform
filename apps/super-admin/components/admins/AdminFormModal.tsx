"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  createPlatformAdminSchema,
  updatePlatformAdminSchema,
  type CreatePlatformAdminData,
} from "@beaconu/validation";
import { usePlatformAdminMutations } from "@/hooks/use-platform-admins-mgmt";
import { usePlatformRoles } from "@/hooks/use-roles";
import type { ZodSchema } from "zod";
import type {
  Resolver,
  ResolverSuccess,
  ResolverError,
  FieldErrors,
  FieldError,
} from "react-hook-form";

// @hookform/resolvers v3 is incompatible with Zod v4 — use safeParse directly.
function makeZodResolver<T extends Record<string, unknown>>(
  schema: ZodSchema,
): Resolver<T> {
  return async (values) => {
    const result = schema.safeParse(values);
    if (result.success) {
      return { values: result.data as T, errors: {} } as ResolverSuccess<T>;
    }
    const errors = {} as FieldErrors<T>;
    const errorsMap = errors as Record<string, FieldError>;
    for (const issue of result.error.issues) {
      const key = String(issue.path[0] ?? "");
      if (key && !errorsMap[key]) {
        errorsMap[key] = {
          type: issue.code,
          message: issue.message,
        };
      }
    }
    return { values: {} as T, errors } as ResolverError<T>;
  };
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editAdmin?: any;
}

export function AdminFormModal({ open, onOpenChange, editAdmin }: Props) {
  const { create, update } = usePlatformAdminMutations();
  const { data: roles } = usePlatformRoles();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreatePlatformAdminData>({
    resolver: makeZodResolver<CreatePlatformAdminData>(
      editAdmin ? updatePlatformAdminSchema : createPlatformAdminSchema,
    ),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      platformRoleId: "",
    },
  });

  useEffect(() => {
    if (editAdmin) {
      reset({
        fullName: editAdmin.fullName ?? "",
        email: editAdmin.email ?? "",
        platformRoleId: editAdmin.platformRoleId ?? "",
        password: "",
      });
    } else {
      reset({ fullName: "", email: "", password: "", platformRoleId: "" });
    }
  }, [editAdmin, reset]);

  const onSubmit = (values: CreatePlatformAdminData) => {
    if (editAdmin) {
      update.mutate(
        { id: editAdmin.id, data: values },
        {
          onSuccess: () => {
            toast.success("Admin updated successfully");
            onOpenChange(false);
          },
        },
      );
    } else {
      create.mutate(values, {
        onSuccess: () => {
          toast.success("Admin created successfully");
          onOpenChange(false);
        },
      });
    }
  };

  const [showPassword, setShowPassword] = useState(false);
  const isPending = create.isPending || update.isPending;

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            {editAdmin ? "Edit Admin" : "Invite Admin"}
          </h2>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onOpenChange(false)}
          >
            Close
          </Button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="fullName">Full Name</Label>
            <Input id="fullName" {...register("fullName")} />
            {errors.fullName && (
              <p className="text-xs text-destructive">
                {errors.fullName.message}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" {...register("email")} />
            {errors.email && (
              <p className="text-xs text-destructive">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password">
              {editAdmin ? "New Password (optional)" : "Password"}
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                className="pr-10"
                {...register("password")}
              />
              <button
                type="button"
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground transition-colors hover:text-foreground"
                onClick={() => setShowPassword((v) => !v)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs text-destructive">
                {errors.password.message}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label>Role</Label>
            <Select
              onValueChange={(value) =>
                setValue("platformRoleId", value, { shouldValidate: true })
              }
              value={watch("platformRoleId")}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                {roles?.map((r: any) => (
                  <SelectItem key={r.id} value={r.id}>
                    {r.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.platformRoleId && (
              <p className="text-xs text-destructive">
                {errors.platformRoleId.message}
              </p>
            )}
          </div>

          <Button
            type="submit"
            disabled={isPending || isSubmitting}
            className="w-full"
          >
            {(isPending || isSubmitting) && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            {editAdmin ? "Update Account" : "Create Account"}
          </Button>
        </form>
      </div>
    </div>
  );
}
