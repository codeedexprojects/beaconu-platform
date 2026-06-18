"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@/lib/zod-resolver";
import * as z from "zod";
import {
  Loader2,
  ArrowRight,
  ArrowLeft,
  Plus,
  MapPin,
  CheckCircle2,
  Building2,
} from "lucide-react";
import { toast } from "sonner";

import { Card, CardContent } from "@/components/ui/card";
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
      isMainCampus: campuses.length === 0,
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
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">
            Campuses
          </h2>
          <p className="text-muted-foreground mt-1">
            Manage the locations where your college operates.
          </p>
        </div>
        {!isAdding && (
          <Button
            onClick={() => setIsAdding(true)}
            size="lg"
            className="shadow-lg shadow-primary/20"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add New Campus
          </Button>
        )}
      </div>

      {!isAdding && hasCampuses && (
        <div className="grid gap-6 md:grid-cols-2">
          {campuses.map((campus) => (
            <Card
              key={campus.id}
              className="group overflow-hidden border border-border/50 bg-card/40 backdrop-blur-sm transition-all hover:shadow-lg hover:border-primary/30"
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Building2 className="h-5 w-5 text-primary" />
                    </div>
                    <h4 className="font-bold text-lg">{campus.name}</h4>
                  </div>
                  {campus.isMainCampus && (
                    <Badge variant="default" className="shadow-sm">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Main Campus
                    </Badge>
                  )}
                </div>
                <div className="flex items-start gap-3 text-sm text-muted-foreground bg-muted/30 p-3 rounded-lg border border-border/40">
                  <MapPin className="h-4 w-4 shrink-0 mt-0.5 text-primary/70" />
                  <p className="leading-relaxed">
                    {[campus.address, campus.city, campus.state, campus.pinCode]
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
        <Card className="border-dashed bg-muted/10">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mx-auto h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
              <MapPin className="h-10 w-10 text-primary" />
            </div>
            <h3 className="text-2xl font-bold tracking-tight mb-2">
              No campuses added
            </h3>
            <p className="text-muted-foreground max-w-sm mb-8">
              You need to add at least one main campus to continue with your
              setup.
            </p>
            <Button
              onClick={() => setIsAdding(true)}
              size="lg"
              className="shadow-lg shadow-primary/20"
            >
              <Plus className="h-5 w-5 mr-2" />
              Add First Campus
            </Button>
          </CardContent>
        </Card>
      )}

      {isAdding && (
        <Card className="border-0 shadow-2xl bg-card/80 backdrop-blur-xl ring-1 ring-border/50">
          <div className="bg-muted/30 border-b border-border/50 p-6 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <MapPin className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-bold">New Campus Details</h3>
              <p className="text-sm text-muted-foreground">
                Enter the address and details for this location.
              </p>
            </div>
          </div>
          <CardContent className="p-8">
            <form
              onSubmit={handleSubmit(onSubmit, onInvalidSubmit)}
              className="space-y-8"
            >
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="name">
                    Campus Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="name"
                    placeholder="e.g. North Campus, Main Campus"
                    className="h-11"
                    aria-invalid={!!errors.name}
                    {...register("name")}
                  />
                  {errors.name && (
                    <p className="text-xs text-destructive">
                      {errors.name.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="address">
                    Address <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="address"
                    placeholder="123 University Ave"
                    className="h-11"
                    aria-invalid={!!errors.address}
                    {...register("address")}
                  />
                  {errors.address && (
                    <p className="text-xs text-destructive">
                      {errors.address.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city">
                    City <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="city"
                    placeholder="City"
                    className="h-11"
                    aria-invalid={!!errors.city}
                    {...register("city")}
                  />
                  {errors.city && (
                    <p className="text-xs text-destructive">
                      {errors.city.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>
                    State <span className="text-destructive">*</span>
                  </Label>
                  <div className="h-11">
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
                  </div>
                  {errors.state && (
                    <p className="text-xs text-destructive">
                      {errors.state.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pinCode">
                    PIN Code <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="pinCode"
                    placeholder="Postal Code"
                    className="h-11"
                    aria-invalid={!!errors.pinCode}
                    {...register("pinCode")}
                  />
                  {errors.pinCode && (
                    <p className="text-xs text-destructive">
                      {errors.pinCode.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2 md:col-span-2 pt-4">
                  <div className="flex items-center gap-3 p-4 border border-border/50 rounded-lg bg-muted/20">
                    <input
                      type="checkbox"
                      id="isMainCampus"
                      {...register("isMainCampus")}
                      className="h-5 w-5 rounded border-input text-primary focus:ring-primary"
                    />
                    <div>
                      <Label
                        htmlFor="isMainCampus"
                        className="font-semibold text-base cursor-pointer"
                      >
                        This is the Main Campus
                      </Label>
                      <p className="text-sm text-muted-foreground mt-0.5 cursor-pointer">
                        Set this as the primary headquarters for the
                        institution.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-border/50">
                {hasCampuses && (
                  <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    onClick={() => setIsAdding(false)}
                  >
                    Cancel
                  </Button>
                )}
                <Button
                  type="submit"
                  size="lg"
                  disabled={isPending}
                  className="shadow-lg shadow-primary/20"
                >
                  {isPending && (
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  )}
                  Save Campus
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {!isAdding && (
        <div className="flex justify-between pt-8 border-t border-border/60 mt-8">
          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={() =>
              router.push(getPortalPath(collegeSlug, "/setup/profile"))
            }
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Profile
          </Button>
          <Button
            size="lg"
            className="shadow-lg shadow-primary/20"
            onClick={() =>
              router.push(getPortalPath(collegeSlug, "/setup/academics"))
            }
            disabled={!hasCampuses}
          >
            Continue to Academics
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
