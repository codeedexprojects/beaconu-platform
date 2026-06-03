"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@/lib/zod-resolver";
import * as z from "zod";
import { Loader2, ArrowRight, ArrowLeft, Plus, MapPin } from "lucide-react";
import { toast } from "sonner";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { IndiaStateSelect } from "@/components/ui/india-state-select";

import {
  useCollegeCampuses,
  useCreateCollegeCampus,
} from "@/hooks/use-colleges";
import { getCollegeSlugFromPath, getPortalPath } from "@/lib/portal-path";

const campusSchema = z.object({
  name: z.string().min(2, "Campus name is required"),
  address: z.string().min(5, "Address is required"),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  pinCode: z.string().min(6, "Valid PIN code is required"),
  isMainCampus: z.boolean().default(false),
});

type CampusFormData = z.infer<typeof campusSchema>;

export default function SetupCampusesPage() {
  const router = useRouter();
  const collegeSlug =
    typeof window === "undefined"
      ? null
      : getCollegeSlugFromPath(window.location.pathname, window.location.host);
  const [isAdding, setIsAdding] = useState(false);

  const { data: campuses = [], isLoading } = useCollegeCampuses();
  const { mutate: createCampus, isPending } = useCreateCollegeCampus();

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<CampusFormData>({
    resolver: zodResolver(campusSchema as any),
    defaultValues: {
      isMainCampus: campuses.length === 0, // Auto-check if first campus
    },
  });

  const onSubmit = (data: CampusFormData) => {
    createCampus(data, {
      onSuccess: () => {
        toast.success("Campus added successfully");
        setIsAdding(false);
        reset();
      },
    });
  };

  const onInvalidSubmit = () => {
    toast.error("Please fix the errors before saving");
  };

  const hasCampuses = campuses.length > 0;

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="border-0 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-4 border-b">
          <div>
            <CardTitle>Campuses</CardTitle>
            <CardDescription>
              Add the locations where your college operates. You must add at
              least one main campus.
            </CardDescription>
          </div>
          {!isAdding && (
            <Button onClick={() => setIsAdding(true)} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Campus
            </Button>
          )}
        </CardHeader>
        <CardContent className="pt-6">
          {hasCampuses && !isAdding && (
            <div className="grid gap-4 md:grid-cols-2">
              {campuses.map((campus) => (
                <Card key={campus.id} className="overflow-hidden">
                  <div className="p-4 bg-muted/30">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold text-base">{campus.name}</h4>
                      {campus.isMainCampus && (
                        <Badge variant="default" className="text-[10px]">
                          Main Campus
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-start gap-2 text-sm text-muted-foreground mt-3">
                      <MapPin className="h-4 w-4 shrink-0 mt-0.5" />
                      <p className="line-clamp-2 leading-relaxed">
                        {[
                          campus.address,
                          campus.city,
                          campus.state,
                          campus.pinCode,
                        ]
                          .filter(Boolean)
                          .join(", ")}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {!hasCampuses && !isAdding && (
            <div className="text-center py-12">
              <div className="mx-auto h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
                <MapPin className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium">No campuses added</h3>
              <p className="text-muted-foreground mt-2 mb-6">
                You need to add at least one main campus to continue.
              </p>
              <Button onClick={() => setIsAdding(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add First Campus
              </Button>
            </div>
          )}

          {isAdding && (
            <form
              onSubmit={handleSubmit(onSubmit, onInvalidSubmit)}
              className="space-y-4 bg-muted/20 p-6 rounded-xl border"
            >
              <h4 className="font-medium flex items-center gap-2 mb-4">
                <MapPin className="h-4 w-4 text-primary" />
                New Campus Details
              </h4>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="name">Campus Name</Label>
                  <Input
                    id="name"
                    placeholder="e.g. North Campus, Main Campus"
                    aria-invalid={!!errors.name}
                    {...register("name")}
                  />
                  {errors.name && (
                    <p className="text-sm text-destructive">
                      {errors.name.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    aria-invalid={!!errors.address}
                    {...register("address")}
                  />
                  {errors.address && (
                    <p className="text-sm text-destructive">
                      {errors.address.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    aria-invalid={!!errors.city}
                    {...register("city")}
                  />
                  {errors.city && (
                    <p className="text-sm text-destructive">
                      {errors.city.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>State</Label>
                  <Controller
                    name="state"
                    control={control}
                    render={({ field }) => (
                      <IndiaStateSelect
                        value={field.value ?? ""}
                        onChange={field.onChange}
                      />
                    )}
                  />
                  {errors.state && (
                    <p className="text-sm text-destructive">
                      {errors.state.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pinCode">PIN Code</Label>
                  <Input
                    id="pinCode"
                    aria-invalid={!!errors.pinCode}
                    {...register("pinCode")}
                  />
                  {errors.pinCode && (
                    <p className="text-sm text-destructive">
                      {errors.pinCode.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2 md:col-span-2 flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="isMainCampus"
                    {...register("isMainCampus")}
                    className="h-4 w-4 rounded border-input text-primary focus:ring-primary"
                  />
                  <Label htmlFor="isMainCampus" className="font-normal">
                    This is the main campus
                  </Label>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                {hasCampuses && (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setIsAdding(false)}
                  >
                    Cancel
                  </Button>
                )}
                <Button type="submit" disabled={isPending}>
                  {isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Save Campus
                </Button>
              </div>
            </form>
          )}

          <div className="flex justify-between pt-8 border-t mt-8">
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                router.push(getPortalPath(collegeSlug, "/setup/profile"))
              }
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <Button
              onClick={() =>
                router.push(getPortalPath(collegeSlug, "/setup/academics"))
              }
              disabled={!hasCampuses}
            >
              Continue
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
