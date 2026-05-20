"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Home,
  Plus,
  Trash2,
  Bed,
  MapPin,
  Loader2,
  DollarSign,
  ChevronDown,
  ChevronUp,
  AlertCircle,
} from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import { useAuthStore } from "@/store";

import {
  useCollegeHostels,
  useCreateCollegeHostel,
  useDeleteCollegeHostel,
} from "@/hooks/use-facilities";

const hostelSchema = z.object({
  name: z.string().trim().min(2, "Hostel name is required").max(255),
  hostelType: z.enum(["boys", "girls", "co-ed"]),
  isOnCampus: z.boolean().default(true),
  distanceFromCampus: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  totalBeds: z.preprocess(
    (val) => Number(val),
    z.number().int().positive("Beds count must be positive"),
  ),
});

type HostelFormData = z.infer<typeof hostelSchema>;

export default function HostelsPage() {
  const user = useAuthStore((state) => state.user);
  const { data: hostels = [], isLoading: loadingHostels } = useCollegeHostels();
  const { mutate: createHostel, isPending: creating } =
    useCreateCollegeHostel();
  const { mutate: deleteHostel } = useDeleteCollegeHostel();
  const canManageHostels =
    user?.roleSlug === "college_admin" ||
    (user?.permissions?.includes("hostel.manage") ?? false);

  const [showAddModal, setShowAddModal] = useState(false);
  const [expandedHostel, setExpandedHostel] = useState<string | null>(null);

  // Custom states for interactive additions of room types rows inside modal
  const [roomTypes, setRoomTypes] = useState<
    {
      name: string;
      totalBeds: number;
      annualPlanPrice: number;
      securityDeposit: number;
    }[]
  >([]);
  const [newRoomName, setNewRoomName] = useState("");
  const [newRoomBeds, setNewRoomBeds] = useState("");
  const [newRoomPrice, setNewRoomPrice] = useState("");
  const [newRoomDeposit, setNewRoomDeposit] = useState("");

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<HostelFormData>({
    resolver: zodResolver(hostelSchema),
    defaultValues: {
      name: "",
      hostelType: "co-ed",
      isOnCampus: true,
      distanceFromCampus: "",
      description: "",
      totalBeds: 100,
    },
  });

  const isOnCampus = watch("isOnCampus");

  const addRoomType = () => {
    if (newRoomName.trim() && newRoomBeds.trim()) {
      setRoomTypes([
        ...roomTypes,
        {
          name: newRoomName.trim(),
          totalBeds: parseInt(newRoomBeds) || 0,
          annualPlanPrice: parseFloat(newRoomPrice) || 0,
          securityDeposit: parseFloat(newRoomDeposit) || 0,
        },
      ]);
      setNewRoomName("");
      setNewRoomBeds("");
      setNewRoomPrice("");
      setNewRoomDeposit("");
    } else {
      toast.error("Please fill in room category name and beds capacity");
    }
  };

  const handleOpenAdd = () => {
    if (!canManageHostels) return;
    setRoomTypes([]);
    reset();
    setShowAddModal(true);
  };

  const handleDelete = (id: string, name: string) => {
    if (!canManageHostels) return;
    if (
      confirm(
        `Are you absolutely sure you want to remove hostel facility "${name}"?`,
      )
    ) {
      deleteHostel(id, {
        onSuccess: () => {
          toast.success(`Hostel facility "${name}" removed successfully`);
        },
      });
    }
  };

  const onSubmit = (data: HostelFormData) => {
    const payload = {
      ...data,
      roomTypes: roomTypes,
    };

    createHostel(payload, {
      onSuccess: () => {
        toast.success("Hostel facility provisioned successfully");
        setShowAddModal(false);
        reset();
      },
    });
  };

  if (loadingHostels) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Hostels & Rooms Occupancy
          </h1>
          <p className="text-sm text-muted-foreground">
            Provision residence halls, define student room inventories, and
            track active bookings.
          </p>
        </div>
        <Button
          onClick={handleOpenAdd}
          className="shadow-lg shadow-primary/10"
          disabled={!canManageHostels}
        >
          <Plus className="mr-2 h-4 w-4" /> Provision Hostel Hall
        </Button>
      </div>

      {/* Hostels cards list layout */}
      <div className="grid gap-6 md:grid-cols-2">
        {hostels.map((hostel) => {
          const isExpanded = expandedHostel === hostel.id;
          return (
            <Card
              key={hostel.id}
              className="border border-border/50 bg-card/60 backdrop-blur-md transition-all duration-300 hover:shadow-md hover:border-border/80"
            >
              <CardHeader className="pb-3 flex flex-row justify-between items-start gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Home className="h-5 w-5 text-blue-500" />
                    <CardTitle className="text-lg font-bold">
                      {hostel.name}
                    </CardTitle>
                  </div>
                  <CardDescription className="text-xs flex items-center gap-2 mt-1">
                    <Badge
                      variant="secondary"
                      className="text-[10px] uppercase font-semibold"
                    >
                      {hostel.hostelType} Only
                    </Badge>
                    <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      {hostel.isOnCampus
                        ? "On-Campus"
                        : `Off-Campus (${hostel.distanceFromCampus || "0"} km)`}
                    </span>
                  </CardDescription>
                </div>
                {canManageHostels ? (
                  <button
                    type="button"
                    className="text-destructive hover:scale-105 p-1 rounded-md hover:bg-destructive/10"
                    onClick={() => handleDelete(hostel.id, hostel.name)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                ) : null}
              </CardHeader>

              <CardContent className="space-y-4">
                {hostel.description && (
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {hostel.description}
                  </p>
                )}

                <div className="grid grid-cols-2 gap-4 border-t border-b border-border/40 py-3 my-2">
                  <div className="space-y-0.5">
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                      Total Beds
                    </p>
                    <p className="text-lg font-bold text-foreground flex items-center gap-1">
                      <Bed className="h-4 w-4 text-blue-500" />{" "}
                      {hostel.totalBeds || 0} Beds
                    </p>
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                      Room Categories
                    </p>
                    <p className="text-lg font-bold text-foreground">
                      {hostel.roomTypes?.length ?? 0} Types
                    </p>
                  </div>
                </div>

                {/* Expand/Collapse room details button */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full text-xs font-semibold flex items-center justify-center gap-1 h-8"
                  onClick={() =>
                    setExpandedHostel(isExpanded ? null : hostel.id)
                  }
                >
                  {isExpanded ? (
                    <>
                      Hide Room Matrix <ChevronUp className="h-3.5 w-3.5" />
                    </>
                  ) : (
                    <>
                      Expand Room Matrix <ChevronDown className="h-3.5 w-3.5" />
                    </>
                  )}
                </Button>

                {/* Room categories rows drawer list */}
                {isExpanded && (
                  <div className="space-y-2.5 mt-3 pt-3 border-t border-border/30 animate-fadeIn">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                      Inventories & Pricing Plan
                    </p>
                    {hostel.roomTypes && hostel.roomTypes.length > 0 ? (
                      <div className="space-y-2">
                        {hostel.roomTypes.map((room) => (
                          <div
                            key={room.id}
                            className="flex justify-between items-center p-2.5 rounded-lg border border-border/40 bg-muted/20"
                          >
                            <div>
                              <p className="text-xs font-bold">{room.name}</p>
                              <p className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                                <Bed className="h-3 w-3" /> {room.totalBeds}{" "}
                                total beds
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-xs font-bold text-blue-600 flex items-center justify-end font-mono">
                                <DollarSign className="h-3 w-3" />{" "}
                                {room.annualPlanPrice}/yr
                              </p>
                              <p className="text-[10px] text-muted-foreground mt-0.5 font-mono">
                                + {room.securityDeposit} deposit
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground italic">
                        No room categories defined.
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}

        {hostels.length === 0 && (
          <div className="col-span-2 py-12 text-center text-muted-foreground">
            <AlertCircle className="h-10 w-10 mx-auto text-muted-foreground/60 mb-2" />
            No hostels provisioned yet.
          </div>
        )}
      </div>

      {/* Hostel Provisioning Modal form sheet */}
      {showAddModal && canManageHostels && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
          <Card className="w-full max-w-lg shadow-2xl border-border bg-card/90 my-8">
            <CardHeader>
              <CardTitle>Provision Hostel Hall</CardTitle>
              <CardDescription>
                Define operational capacities, residence rules, and pricing
                templates.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5 sm:col-span-2">
                    <Label htmlFor="hostel-name">Hostel Hall Name</Label>
                    <Input
                      id="hostel-name"
                      placeholder="e.g. CV Raman Boys Hostel"
                      {...register("name")}
                    />
                    {errors.name && (
                      <p className="text-xs text-destructive">
                        {errors.name.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="hostel-type">Target Allocation</Label>
                    <select
                      id="hostel-type"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none"
                      {...register("hostelType")}
                    >
                      <option value="co-ed">Co-Educational</option>
                      <option value="boys">Boys Only</option>
                      <option value="girls">Girls Only</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="hostel-beds">Total Beds Capacity</Label>
                    <Input
                      id="hostel-beds"
                      type="number"
                      placeholder="250"
                      {...register("totalBeds")}
                    />
                    {errors.totalBeds && (
                      <p className="text-xs text-destructive">
                        {errors.totalBeds.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1.5 flex items-center gap-2 mt-6">
                    <input
                      type="checkbox"
                      id="hostel-campus"
                      className="h-4.5 w-4.5 rounded border-gray-300 text-primary focus:ring-primary"
                      {...register("isOnCampus")}
                    />
                    <Label htmlFor="hostel-campus">Located On-Campus</Label>
                  </div>

                  {!isOnCampus && (
                    <div className="space-y-1.5">
                      <Label htmlFor="hostel-dist">
                        Distance from campus (km)
                      </Label>
                      <Input
                        id="hostel-dist"
                        placeholder="e.g. 1.8"
                        {...register("distanceFromCampus")}
                      />
                    </div>
                  )}

                  <div className="space-y-1.5 sm:col-span-2">
                    <Label htmlFor="hostel-desc">Description</Label>
                    <Textarea
                      id="hostel-desc"
                      placeholder="Modern rooms with laundry facility..."
                      {...register("description")}
                    />
                  </div>
                </div>

                {/* Dynamic Room Categories Builder */}
                <div className="border-t pt-4 border-border/40 space-y-3">
                  <div className="flex justify-between items-center">
                    <Label className="text-sm font-semibold">
                      Room Categories & Pricing Plans
                    </Label>
                    <span className="text-[11px] font-bold text-muted-foreground">
                      {roomTypes.length} configured
                    </span>
                  </div>

                  {/* Configured Room types checklist */}
                  <div className="space-y-2">
                    {roomTypes.map((rt, idx) => (
                      <div
                        key={idx}
                        className="flex justify-between items-center p-2 rounded bg-muted/30 border border-border/40 text-xs"
                      >
                        <div>
                          <span className="font-bold">{rt.name}</span>
                          <span className="text-[10px] text-muted-foreground ml-2">
                            ({rt.totalBeds} beds)
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-blue-600 font-bold">
                            ${rt.annualPlanPrice}/yr
                          </span>
                          <button
                            type="button"
                            className="text-destructive hover:scale-105"
                            onClick={() =>
                              setRoomTypes(
                                roomTypes.filter((_, i) => i !== idx),
                              )
                            }
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Add room type fields grid */}
                  <div className="grid gap-2 sm:grid-cols-2 p-3 border rounded-lg bg-muted/10 border-border/30">
                    <Input
                      placeholder="Category (e.g. Double AC Sharing)"
                      className="h-8 text-xs sm:col-span-2"
                      value={newRoomName}
                      onChange={(e) => setNewRoomName(e.target.value)}
                    />
                    <Input
                      type="number"
                      placeholder="Beds Capacity"
                      className="h-8 text-xs"
                      value={newRoomBeds}
                      onChange={(e) => setNewRoomBeds(e.target.value)}
                    />
                    <Input
                      type="number"
                      placeholder="Annual Fee Plan ($)"
                      className="h-8 text-xs"
                      value={newRoomPrice}
                      onChange={(e) => setNewRoomPrice(e.target.value)}
                    />
                    <Input
                      type="number"
                      placeholder="Security Deposit ($)"
                      className="h-8 text-xs"
                      value={newRoomDeposit}
                      onChange={(e) => setNewRoomDeposit(e.target.value)}
                    />
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      className="sm:col-span-2 h-8 text-xs"
                      onClick={addRoomType}
                    >
                      Configure Room Category
                    </Button>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowAddModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={creating}>
                    {creating && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Provision Hostel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
