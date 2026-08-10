"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@/lib/zod-resolver";
import * as z from "zod";
import {
  Truck,
  Plus,
  Trash2,
  MapPin,
  User,
  Phone,
  Loader2,
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
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useAuthStore } from "@/store";

import {
  useCollegeCommutes,
  useCreateCollegeCommute,
  useDeleteCollegeCommute,
} from "@/hooks/use-facilities";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type {
  CreateCommuteBusInput,
  CreateCommuteStopInput,
} from "@/lib/services/colleges.service";
import { EnrolledStudentsTab } from "@/components/commute/enrolled-students-tab";

const DRIVER_STATUS_OPTIONS = ["off_duty", "on_route", "on_leave"] as const;

function toEpochTime(hhmm: string): string {
  return `1970-01-01T${hhmm}:00.000Z`;
}

const routeSchema = z.object({
  name: z.string().trim().min(2, "Route name is required").max(255),
  description: z.string().optional().nullable(),
});

type RouteFormData = z.infer<typeof routeSchema>;

export default function CommutePage() {
  const user = useAuthStore((state) => state.user);
  const [activeTab, setActiveTab] = useState<"routes" | "students">("routes");
  const { data: routes = [], isLoading: loadingRoutes } = useCollegeCommutes();
  const { mutate: createRoute, isPending: creating } =
    useCreateCollegeCommute();
  const { mutate: deleteRoute, isPending: isDeleting } =
    useDeleteCollegeCommute();
  const canManageCommute =
    user?.roleSlug === "college_admin" ||
    (user?.permissions?.includes("commute.manage") ?? false);

  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [expandedRoute, setExpandedRoute] = useState<string | null>(null);

  const [stops, setStops] = useState<
    (Omit<CreateCommuteStopInput, "morningTime" | "eveningTime"> & {
      morningTime: string;
      eveningTime: string;
    })[]
  >([]);
  const [newStopName, setNewStopName] = useState("");
  const [newStopLandmark, setNewStopLandmark] = useState("");
  const [newStopMorningTime, setNewStopMorningTime] = useState("");
  const [newStopEveningTime, setNewStopEveningTime] = useState("");
  const [newStopIsPickupPoint, setNewStopIsPickupPoint] = useState(true);

  const [buses, setBuses] = useState<CreateCommuteBusInput[]>([]);
  const [newBusNumber, setNewBusNumber] = useState("");
  const [newBusName, setNewBusName] = useState("");
  const [newBusType, setNewBusType] = useState("");
  const [newBusModel, setNewBusModel] = useState("");
  const [newBusSeats, setNewBusSeats] = useState("");
  const [newBusDriver, setNewBusDriver] = useState("");
  const [newBusPhone, setNewBusPhone] = useState("");
  const [newBusDriverStatus, setNewBusDriverStatus] =
    useState<(typeof DRIVER_STATUS_OPTIONS)[number]>("off_duty");
  const [newBusFee, setNewBusFee] = useState("");
  const [newBusPaymentNotes, setNewBusPaymentNotes] = useState("");

  const [isVerified, setIsVerified] = useState(false);
  const [conductPolicy, setConductPolicy] = useState<
    { title: string; description: string }[]
  >([]);
  const [newPolicyTitle, setNewPolicyTitle] = useState("");
  const [newPolicyDescription, setNewPolicyDescription] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RouteFormData>({
    resolver: zodResolver(routeSchema),
    defaultValues: { name: "", description: "" },
  });

  const addStop = () => {
    if (newStopName.trim()) {
      setStops([
        ...stops,
        {
          stopName: newStopName.trim(),
          landmark: newStopLandmark.trim() || null,
          morningTime: newStopMorningTime,
          eveningTime: newStopEveningTime,
          isPickupPoint: newStopIsPickupPoint,
          stopOrder: stops.length + 1,
        },
      ]);
      setNewStopName("");
      setNewStopLandmark("");
      setNewStopMorningTime("");
      setNewStopEveningTime("");
      setNewStopIsPickupPoint(true);
    } else {
      toast.error("Please fill in stop name");
    }
  };

  const addBus = () => {
    if (newBusNumber.trim() && newBusSeats.trim()) {
      setBuses([
        ...buses,
        {
          busNumber: newBusNumber.trim(),
          busName: newBusName.trim() || null,
          busType: newBusType.trim() || null,
          busModel: newBusModel.trim() || null,
          totalSeats: parseInt(newBusSeats) || 0,
          driverName: newBusDriver.trim() || null,
          driverPhone: newBusPhone.trim() || null,
          driverStatus: newBusDriverStatus,
          monthlyFee: parseFloat(newBusFee) || 0,
          paymentStructureNotes: newBusPaymentNotes.trim() || null,
        },
      ]);
      setNewBusNumber("");
      setNewBusName("");
      setNewBusType("");
      setNewBusModel("");
      setNewBusSeats("");
      setNewBusDriver("");
      setNewBusPhone("");
      setNewBusDriverStatus("off_duty");
      setNewBusFee("");
      setNewBusPaymentNotes("");
    } else {
      toast.error("Please fill in bus license number and seat capacity");
    }
  };

  const addPolicy = () => {
    if (newPolicyTitle.trim() && newPolicyDescription.trim()) {
      setConductPolicy([
        ...conductPolicy,
        {
          title: newPolicyTitle.trim(),
          description: newPolicyDescription.trim(),
        },
      ]);
      setNewPolicyTitle("");
      setNewPolicyDescription("");
    } else {
      toast.error("Please fill in both policy title and description");
    }
  };

  const handleOpenAdd = () => {
    if (!canManageCommute) return;
    setStops([]);
    setBuses([]);
    setIsVerified(false);
    setConductPolicy([]);
    reset();
    setShowAddModal(true);
  };

  const handleDelete = (id: string, name: string) => {
    if (!canManageCommute) return;
    setDeleteTarget({ id, name });
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    deleteRoute(deleteTarget.id, {
      onSuccess: () => {
        toast.success(
          `Commute Route "${deleteTarget.name}" removed successfully`,
        );
        setDeleteTarget(null);
      },
    });
  };

  const onSubmit = (data: RouteFormData) => {
    const payload = {
      ...data,
      isVerified,
      conductPolicy,
      stops: stops.map((s) => ({
        ...s,
        morningTime: s.morningTime ? toEpochTime(s.morningTime) : null,
        eveningTime: s.eveningTime ? toEpochTime(s.eveningTime) : null,
      })),
      buses: buses,
    };

    createRoute(payload, {
      onSuccess: () => {
        toast.success("Commute transit route created successfully");
        setShowAddModal(false);
        reset();
      },
    });
  };

  if (loadingRoutes) {
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
            Bus Routes & Commute Transit
          </h1>
          <p className="text-sm text-muted-foreground">
            Configure transit lines, chronologically organize stops timeline,
            and track bus driver logs.
          </p>
        </div>
        {activeTab === "routes" && (
          <Button
            onClick={handleOpenAdd}
            className="shadow-lg shadow-primary/10"
            disabled={!canManageCommute}
          >
            <Plus className="mr-2 h-4 w-4" /> Configure Transit Route
          </Button>
        )}
      </div>

      <div className="flex gap-2 border-b border-border">
        <button
          type="button"
          onClick={() => setActiveTab("routes")}
          className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${
            activeTab === "routes"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Routes & Buses
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("students")}
          className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${
            activeTab === "students"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Enrolled Students
        </button>
      </div>

      {activeTab === "students" && <EnrolledStudentsTab />}

      {activeTab === "routes" && (
        <div className="grid gap-6 md:grid-cols-2">
          {routes.map((route) => {
            const isExpanded = expandedRoute === route.id;
            return (
              <Card
                key={route.id}
                className="border border-border/50 bg-card/60 backdrop-blur-md transition-all duration-300 hover:shadow-md hover:border-border/80"
              >
                <CardHeader className="pb-3 flex flex-row justify-between items-start gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Truck className="h-5 w-5 text-primary" />
                      <CardTitle className="text-lg font-bold">
                        {route.name}
                      </CardTitle>
                    </div>
                    <CardDescription className="text-xs flex items-center gap-2 mt-1">
                      <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                        <MapPin className="h-3.5 w-3.5" />
                        {route.stops?.length ?? 0} stops configured
                      </span>
                    </CardDescription>
                  </div>
                  {canManageCommute ? (
                    <button
                      type="button"
                      className="text-destructive hover:scale-105 p-1 rounded-md hover:bg-destructive/10"
                      onClick={() => handleDelete(route.id, route.name)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  ) : null}
                </CardHeader>

                <CardContent className="space-y-4">
                  {route.description && (
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {route.description}
                    </p>
                  )}

                  <div className="grid grid-cols-2 gap-4 border-t border-b border-border/40 py-3 my-2">
                    <div className="space-y-0.5">
                      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                        Fleet Registry
                      </p>
                      <p className="text-lg font-bold text-foreground flex items-center gap-1">
                        {route.buses?.length ?? 0} active buses
                      </p>
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                        Status
                      </p>
                      <div className="flex items-center gap-1.5 mt-1">
                        <Badge
                          variant="outline"
                          className={
                            route.isActive
                              ? "text-[10px] text-green-600 border-green-600 bg-green-50/50"
                              : "text-[10px] text-muted-foreground"
                          }
                        >
                          {route.isActive ? "Active" : "Inactive"}
                        </Badge>
                        {route.isVerified && (
                          <Badge
                            variant="outline"
                            className="text-[10px] text-blue-600 border-blue-600 bg-blue-50/50"
                          >
                            Verified
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  {route.conductPolicy && route.conductPolicy.length > 0 && (
                    <div className="space-y-1.5 border-t border-border/30 pt-3">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                        Conduct Policy
                      </p>
                      {route.conductPolicy.map((policy, idx) => (
                        <div key={idx} className="text-xs">
                          <span className="font-semibold">{policy.title}</span>
                          <span className="text-muted-foreground">
                            {" "}
                            — {policy.description}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full text-xs font-semibold flex items-center justify-center gap-1 h-8"
                    onClick={() =>
                      setExpandedRoute(isExpanded ? null : route.id)
                    }
                  >
                    {isExpanded ? (
                      <>
                        Hide Route Matrix <ChevronUp className="h-3.5 w-3.5" />
                      </>
                    ) : (
                      <>
                        Expand Route Matrix{" "}
                        <ChevronDown className="h-3.5 w-3.5" />
                      </>
                    )}
                  </Button>

                  {isExpanded && (
                    <div className="space-y-4 mt-3 pt-3 border-t border-border/30 animate-fadeIn">
                      <div className="space-y-2">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                          <MapPin className="h-3 w-3" /> Stop Chronology
                          Sequence
                        </p>
                        {route.stops && route.stops.length > 0 ? (
                          <div className="relative border-l border-border pl-4 ml-2 space-y-3.5 py-1">
                            {route.stops.map((stop) => (
                              <div key={stop.id} className="relative text-xs">
                                <span className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full border border-primary bg-background flex items-center justify-center font-bold text-[8px] text-primary">
                                  {stop.stopOrder}
                                </span>
                                <p className="font-semibold">
                                  {stop.stopName}
                                  {stop.isPickupPoint === false && (
                                    <span className="ml-1.5 text-[9px] text-muted-foreground font-normal">
                                      (waypoint only)
                                    </span>
                                  )}
                                </p>
                                {stop.landmark && (
                                  <p className="text-[10px] text-muted-foreground mt-0.5">
                                    Landmark: {stop.landmark}
                                  </p>
                                )}
                                {(stop.morningTime || stop.eveningTime) && (
                                  <p className="text-[10px] text-muted-foreground mt-0.5">
                                    {stop.morningTime &&
                                      `AM ${new Date(stop.morningTime).toISOString().slice(11, 16)}`}
                                    {stop.morningTime &&
                                      stop.eveningTime &&
                                      " · "}
                                    {stop.eveningTime &&
                                      `PM ${new Date(stop.eveningTime).toISOString().slice(11, 16)}`}
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-muted-foreground italic">
                            No stops sequence logged.
                          </p>
                        )}
                      </div>

                      <div className="space-y-2 pt-2 border-t border-border/20">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                          <Truck className="h-3 w-3" /> Fleet Allocations &
                          Drivers
                        </p>
                        {route.buses && route.buses.length > 0 ? (
                          <div className="space-y-2">
                            {route.buses.map((bus) => (
                              <div
                                key={bus.id}
                                className="p-2.5 rounded-lg border border-border/40 bg-muted/20 text-xs"
                              >
                                <div className="flex justify-between items-start">
                                  <div>
                                    <p className="font-bold">
                                      {bus.busNumber}{" "}
                                      {bus.busName ? `(${bus.busName})` : ""}
                                      {bus.busType && (
                                        <Badge
                                          variant="outline"
                                          className="ml-1.5 h-4 px-1 text-[9px] align-middle"
                                        >
                                          {bus.busType}
                                        </Badge>
                                      )}
                                    </p>
                                    <p className="text-[10px] text-muted-foreground mt-0.5">
                                      {bus.availableSeats}/{bus.totalSeats}{" "}
                                      seats available
                                      {bus.busModel ? ` · ${bus.busModel}` : ""}
                                    </p>
                                  </div>
                                  <div className="text-right shrink-0">
                                    <span className="font-mono text-primary font-bold block">
                                      ${bus.monthlyFee}/mo
                                    </span>
                                    {bus.driverStatus && (
                                      <span className="text-[9px] text-muted-foreground capitalize">
                                        {bus.driverStatus.replace("_", " ")}
                                      </span>
                                    )}
                                  </div>
                                </div>
                                {bus.driverName && (
                                  <div className="flex gap-4 border-t border-border/20 pt-2 mt-2 text-[10px] text-muted-foreground">
                                    <span className="flex items-center gap-1">
                                      <User className="h-3 w-3" />{" "}
                                      {bus.driverName}
                                    </span>
                                    {bus.driverPhone && (
                                      <span className="flex items-center gap-1">
                                        <Phone className="h-3 w-3" />{" "}
                                        {bus.driverPhone}
                                      </span>
                                    )}
                                  </div>
                                )}
                                {bus.paymentStructureNotes && (
                                  <p className="text-[10px] text-muted-foreground border-t border-border/20 pt-2 mt-2">
                                    {bus.paymentStructureNotes}
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-muted-foreground italic">
                            No fleet registered.
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}

          {routes.length === 0 && (
            <div className="col-span-2 py-12 text-center text-muted-foreground">
              <AlertCircle className="h-10 w-10 mx-auto text-muted-foreground/60 mb-2" />
              No commute transit routes configured yet.
            </div>
          )}
        </div>
      )}

      {showAddModal && canManageCommute && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
          <Card className="w-full max-w-lg shadow-2xl border-border bg-card/90 my-8">
            <CardHeader>
              <CardTitle>Configure Transit Route</CardTitle>
              <CardDescription>
                Define chronologies of pick-up points and allocate fleet
                schedules.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="route-name">Transit Route Name</Label>
                  <Input
                    id="route-name"
                    placeholder="e.g. Route 42 - South Delhi"
                    {...register("name")}
                  />
                  {errors.name && (
                    <p className="text-xs text-destructive">
                      {errors.name.message}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="route-desc">Route Path Summary</Label>
                  <Textarea
                    id="route-desc"
                    placeholder="Details of highways, traffic timeline..."
                    {...register("description")}
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    id="route-verified"
                    type="checkbox"
                    className="h-4 w-4 rounded border-input"
                    checked={isVerified}
                    onChange={(e) => setIsVerified(e.target.checked)}
                  />
                  <Label htmlFor="route-verified" className="text-sm">
                    Route verified
                  </Label>
                </div>

                <div className="border-t pt-4 border-border/40 space-y-3">
                  <div className="flex justify-between items-center">
                    <Label className="text-sm font-semibold">
                      Conduct Policy
                    </Label>
                    <span className="text-[11px] font-bold text-muted-foreground">
                      {conductPolicy.length} configured
                    </span>
                  </div>

                  <div className="space-y-2">
                    {conductPolicy.map((policy, idx) => (
                      <div
                        key={idx}
                        className="flex justify-between items-start p-2 rounded bg-muted/30 border border-border/40 text-xs"
                      >
                        <div>
                          <p className="font-bold">{policy.title}</p>
                          <p className="text-[10px] text-muted-foreground">
                            {policy.description}
                          </p>
                        </div>
                        <button
                          type="button"
                          className="text-destructive hover:scale-105 shrink-0"
                          onClick={() =>
                            setConductPolicy(
                              conductPolicy.filter((_, i) => i !== idx),
                            )
                          }
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-2 p-2 border rounded-lg bg-muted/10 border-border/30">
                    <Input
                      placeholder="Policy title (e.g. No smoking)"
                      className="h-8 text-xs flex-1"
                      value={newPolicyTitle}
                      onChange={(e) => setNewPolicyTitle(e.target.value)}
                    />
                    <Input
                      placeholder="Description"
                      className="h-8 text-xs flex-1"
                      value={newPolicyDescription}
                      onChange={(e) => setNewPolicyDescription(e.target.value)}
                    />
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      className="h-8 text-xs"
                      onClick={addPolicy}
                    >
                      Add
                    </Button>
                  </div>
                </div>

                <div className="border-t pt-4 border-border/40 space-y-3">
                  <div className="flex justify-between items-center">
                    <Label className="text-sm font-semibold">
                      Chronological Pick-up Stops
                    </Label>
                    <span className="text-[11px] font-bold text-muted-foreground">
                      {stops.length} configured
                    </span>
                  </div>

                  <div className="space-y-2">
                    {stops.map((stop, idx) => (
                      <div
                        key={idx}
                        className="flex justify-between items-center p-2 rounded bg-muted/30 border border-border/40 text-xs"
                      >
                        <div>
                          <Badge
                            variant="secondary"
                            className="mr-2 h-4 px-1 rounded-sm text-[9px]"
                          >
                            {stop.stopOrder}
                          </Badge>
                          <span className="font-bold">{stop.stopName}</span>
                          {stop.landmark && (
                            <span className="text-[10px] text-muted-foreground ml-2">
                              ({stop.landmark})
                            </span>
                          )}
                          {!stop.isPickupPoint && (
                            <Badge
                              variant="outline"
                              className="ml-2 h-4 px-1 text-[9px]"
                            >
                              Waypoint only
                            </Badge>
                          )}
                          {(stop.morningTime || stop.eveningTime) && (
                            <p className="text-[10px] text-muted-foreground mt-0.5">
                              {stop.morningTime && `AM ${stop.morningTime}`}
                              {stop.morningTime && stop.eveningTime && " · "}
                              {stop.eveningTime && `PM ${stop.eveningTime}`}
                            </p>
                          )}
                        </div>
                        <button
                          type="button"
                          className="text-destructive hover:scale-105"
                          onClick={() =>
                            setStops(
                              stops
                                .filter((_, i) => i !== idx)
                                .map((s, i) => ({ ...s, stopOrder: i + 1 })),
                            )
                          }
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-2 p-2 border rounded-lg bg-muted/10 border-border/30">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Stop Name (e.g. Noida Sector 15)"
                        className="h-8 text-xs flex-1"
                        value={newStopName}
                        onChange={(e) => setNewStopName(e.target.value)}
                      />
                      <Input
                        placeholder="Landmark (e.g. Near Metro Station)"
                        className="h-8 text-xs flex-1"
                        value={newStopLandmark}
                        onChange={(e) => setNewStopLandmark(e.target.value)}
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 space-y-1">
                        <Label className="text-[10px] text-muted-foreground">
                          Morning time
                        </Label>
                        <Input
                          type="time"
                          className="h-8 text-xs"
                          value={newStopMorningTime}
                          onChange={(e) =>
                            setNewStopMorningTime(e.target.value)
                          }
                        />
                      </div>
                      <div className="flex-1 space-y-1">
                        <Label className="text-[10px] text-muted-foreground">
                          Evening time
                        </Label>
                        <Input
                          type="time"
                          className="h-8 text-xs"
                          value={newStopEveningTime}
                          onChange={(e) =>
                            setNewStopEveningTime(e.target.value)
                          }
                        />
                      </div>
                      <label className="flex items-center gap-1.5 text-[11px] text-muted-foreground pt-4">
                        <input
                          type="checkbox"
                          className="h-3.5 w-3.5 rounded border-input"
                          checked={newStopIsPickupPoint}
                          onChange={(e) =>
                            setNewStopIsPickupPoint(e.target.checked)
                          }
                        />
                        Pickup point
                      </label>
                    </div>
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      className="h-8 text-xs w-full"
                      onClick={addStop}
                    >
                      Add Stop
                    </Button>
                  </div>
                </div>

                <div className="border-t pt-4 border-border/40 space-y-3">
                  <div className="flex justify-between items-center">
                    <Label className="text-sm font-semibold">
                      Fleet Registrations & Drivers
                    </Label>
                    <span className="text-[11px] font-bold text-muted-foreground">
                      {buses.length} configured
                    </span>
                  </div>

                  <div className="space-y-2">
                    {buses.map((bus, idx) => (
                      <div
                        key={idx}
                        className="flex justify-between items-center p-2 rounded bg-muted/30 border border-border/40 text-xs"
                      >
                        <div>
                          <span className="font-bold">{bus.busNumber}</span>
                          {bus.busType && (
                            <Badge
                              variant="outline"
                              className="ml-2 h-4 px-1 text-[9px]"
                            >
                              {bus.busType}
                            </Badge>
                          )}
                          {bus.driverName && (
                            <span className="text-[10px] text-muted-foreground ml-2">
                              ({bus.driverName})
                            </span>
                          )}
                          <p className="text-[10px] text-muted-foreground mt-0.5 capitalize">
                            {bus.driverStatus?.replace("_", " ")}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-primary font-bold">
                            ${bus.monthlyFee}/mo
                          </span>
                          <button
                            type="button"
                            className="text-destructive hover:scale-105"
                            onClick={() =>
                              setBuses(buses.filter((_, i) => i !== idx))
                            }
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="grid gap-2 sm:grid-cols-2 p-3 border rounded-lg bg-muted/10 border-border/30">
                    <Input
                      placeholder="Bus Number (e.g. DL-1P-1234)"
                      className="h-8 text-xs"
                      value={newBusNumber}
                      onChange={(e) => setNewBusNumber(e.target.value)}
                    />
                    <Input
                      placeholder="Bus Label (e.g. Swaraj Mazda 32)"
                      className="h-8 text-xs"
                      value={newBusName}
                      onChange={(e) => setNewBusName(e.target.value)}
                    />
                    <Input
                      placeholder="Bus Type (e.g. AC / Non-AC)"
                      className="h-8 text-xs"
                      value={newBusType}
                      onChange={(e) => setNewBusType(e.target.value)}
                    />
                    <Input
                      placeholder="Bus Model"
                      className="h-8 text-xs"
                      value={newBusModel}
                      onChange={(e) => setNewBusModel(e.target.value)}
                    />
                    <Input
                      type="number"
                      placeholder="Seat Capacity"
                      className="h-8 text-xs"
                      value={newBusSeats}
                      onChange={(e) => setNewBusSeats(e.target.value)}
                    />
                    <Input
                      type="number"
                      placeholder="Monthly Fee ($)"
                      className="h-8 text-xs"
                      value={newBusFee}
                      onChange={(e) => setNewBusFee(e.target.value)}
                    />
                    <Input
                      placeholder="Driver Name"
                      className="h-8 text-xs"
                      value={newBusDriver}
                      onChange={(e) => setNewBusDriver(e.target.value)}
                    />
                    <Input
                      placeholder="Driver Phone"
                      className="h-8 text-xs"
                      value={newBusPhone}
                      onChange={(e) => setNewBusPhone(e.target.value)}
                    />
                    <Select
                      value={newBusDriverStatus}
                      onValueChange={(v) =>
                        setNewBusDriverStatus(
                          v as (typeof DRIVER_STATUS_OPTIONS)[number],
                        )
                      }
                    >
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue placeholder="Driver status" />
                      </SelectTrigger>
                      <SelectContent>
                        {DRIVER_STATUS_OPTIONS.map((status) => (
                          <SelectItem key={status} value={status}>
                            {status.replace("_", " ")}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Textarea
                      placeholder="Payment structure notes"
                      className="text-xs sm:col-span-2 min-h-16"
                      value={newBusPaymentNotes}
                      onChange={(e) => setNewBusPaymentNotes(e.target.value)}
                    />
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      className="sm:col-span-2 h-8 text-xs"
                      onClick={addBus}
                    >
                      Register Bus Fleet
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
                    Configure Route
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Remove Commute Route"
        description={
          deleteTarget
            ? `Are you absolutely sure you want to remove route "${deleteTarget.name}"?`
            : ""
        }
        confirmLabel="Remove"
        variant="destructive"
        loading={isDeleting}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
