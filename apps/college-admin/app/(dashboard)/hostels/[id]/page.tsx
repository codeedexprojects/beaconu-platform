"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2, ArrowLeft, Plus, Trash2, Star } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";

import {
  useCollegeHostels,
  useUpdateCollegeHostel,
  useCreateHostelRoomType,
  useDeleteHostelRoomType,
  useCreateHostelMessPlan,
  useDeleteHostelMessPlan,
  useCreateHostelAddonService,
  useDeleteHostelAddonService,
} from "@/hooks/use-facilities";

const ADDON_SERVICE_TYPES = ["laundry", "gym", "parking", "other"] as const;

export default function HostelDetailPage() {
  const params = useParams();
  const router = useRouter();
  const hostelId = Array.isArray(params.id) ? params.id[0] : params.id;

  const { data: hostels = [], isLoading } = useCollegeHostels();
  const hostel = hostels.find((h) => h.id === hostelId);

  const { mutate: updateHostel, isPending: isSavingProfile } =
    useUpdateCollegeHostel();

  const [description, setDescription] = useState("");
  const [totalBeds, setTotalBeds] = useState("");
  const [coverImageUrl, setCoverImageUrl] = useState("");
  const [wardenName, setWardenName] = useState("");
  const [wardenPhone, setWardenPhone] = useState("");
  const [wardenWhatsapp, setWardenWhatsapp] = useState("");
  const [wardenEmail, setWardenEmail] = useState("");
  const [amenities, setAmenities] = useState<{ name: string; icon?: string }[]>(
    [],
  );
  const [rules, setRules] = useState<{ title: string; description: string }[]>(
    [],
  );
  const [address, setAddress] = useState("");
  const [nearbyEssentials, setNearbyEssentials] = useState<
    { type: string; name: string; distance: string }[]
  >([]);

  useEffect(() => {
    if (!hostel) return;
    setDescription(hostel.description || "");
    setTotalBeds(hostel.totalBeds ? String(hostel.totalBeds) : "");
    setCoverImageUrl(hostel.coverImageUrl || "");
    setWardenName(hostel.wardenInfo?.name || "");
    setWardenPhone(hostel.wardenInfo?.phone || "");
    setWardenWhatsapp(hostel.wardenInfo?.whatsapp || "");
    setWardenEmail(hostel.wardenInfo?.email || "");
    setAmenities(hostel.amenities || []);
    setRules(hostel.rules || []);
    setAddress(hostel.locationInfo?.address || "");
    setNearbyEssentials(hostel.locationInfo?.nearbyEssentials || []);
  }, [hostel?.id]);

  const [newAmenityName, setNewAmenityName] = useState("");
  const [newRuleTitle, setNewRuleTitle] = useState("");
  const [newRuleDesc, setNewRuleDesc] = useState("");
  const [newEssentialType, setNewEssentialType] = useState("");
  const [newEssentialName, setNewEssentialName] = useState("");
  const [newEssentialDistance, setNewEssentialDistance] = useState("");

  // Room types
  const { mutate: createRoomType, isPending: isAddingRoomType } =
    useCreateHostelRoomType();
  const { mutate: deleteRoomType } = useDeleteHostelRoomType();
  const [roomName, setRoomName] = useState("");
  const [roomBeds, setRoomBeds] = useState("");
  const [roomAnnualPrice, setRoomAnnualPrice] = useState("");
  const [roomMonthlyPrice, setRoomMonthlyPrice] = useState("");
  const [roomDeposit, setRoomDeposit] = useState("");

  // Mess plans
  const { mutate: createMessPlan, isPending: isAddingMessPlan } =
    useCreateHostelMessPlan();
  const { mutate: deleteMessPlan } = useDeleteHostelMessPlan();
  const [mealName, setMealName] = useState("");
  const [mealPrice, setMealPrice] = useState("");
  const [mealIncluded, setMealIncluded] = useState("");
  const [mealCompulsory, setMealCompulsory] = useState(false);

  // Addon services
  const { mutate: createAddonService, isPending: isAddingAddon } =
    useCreateHostelAddonService();
  const { mutate: deleteAddonService } = useDeleteHostelAddonService();
  const [addonType, setAddonType] = useState<string>("laundry");
  const [addonName, setAddonName] = useState("");
  const [addonPlanLabel, setAddonPlanLabel] = useState("");
  const [addonPlanPrice, setAddonPlanPrice] = useState("");

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!hostel) {
    return (
      <div className="py-12 text-center text-muted-foreground">
        Hostel not found.
        <div className="mt-4">
          <Button variant="outline" onClick={() => router.push("/hostels")}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Hostels
          </Button>
        </div>
      </div>
    );
  }

  const saveProfile = () => {
    updateHostel(
      {
        id: hostel.id,
        data: {
          description: description || null,
          totalBeds: totalBeds ? Number(totalBeds) : null,
          coverImageUrl: coverImageUrl || null,
          wardenInfo: {
            name: wardenName || undefined,
            phone: wardenPhone || undefined,
            whatsapp: wardenWhatsapp || undefined,
            email: wardenEmail || undefined,
          },
          amenities,
          rules,
          locationInfo: { address: address || undefined, nearbyEssentials },
        },
      },
      {
        onSuccess: () => toast.success("Hostel profile updated"),
      },
    );
  };

  const addAmenity = () => {
    if (!newAmenityName.trim()) return;
    setAmenities([...amenities, { name: newAmenityName.trim() }]);
    setNewAmenityName("");
  };

  const addRule = () => {
    if (!newRuleTitle.trim() || !newRuleDesc.trim()) {
      toast.error("Please fill in rule title and description");
      return;
    }
    setRules([
      ...rules,
      { title: newRuleTitle.trim(), description: newRuleDesc.trim() },
    ]);
    setNewRuleTitle("");
    setNewRuleDesc("");
  };

  const addNearbyEssential = () => {
    if (!newEssentialType.trim() || !newEssentialName.trim()) {
      toast.error("Please fill in essential type and name");
      return;
    }
    setNearbyEssentials([
      ...nearbyEssentials,
      {
        type: newEssentialType.trim(),
        name: newEssentialName.trim(),
        distance: newEssentialDistance.trim(),
      },
    ]);
    setNewEssentialType("");
    setNewEssentialName("");
    setNewEssentialDistance("");
  };

  const addRoomType = () => {
    if (!roomName.trim() || !roomBeds.trim()) {
      toast.error("Please fill in room category name and beds capacity");
      return;
    }
    createRoomType(
      {
        hostelId: hostel.id,
        data: {
          name: roomName.trim(),
          totalBeds: Number(roomBeds),
          annualPlanPrice: roomAnnualPrice ? Number(roomAnnualPrice) : 0,
          monthlyPlanPrice: roomMonthlyPrice ? Number(roomMonthlyPrice) : 0,
          securityDeposit: roomDeposit ? Number(roomDeposit) : 0,
        },
      },
      {
        onSuccess: () => {
          toast.success("Room type added");
          setRoomName("");
          setRoomBeds("");
          setRoomAnnualPrice("");
          setRoomMonthlyPrice("");
          setRoomDeposit("");
        },
      },
    );
  };

  const addMessPlan = () => {
    if (!mealName.trim() || !mealPrice.trim()) {
      toast.error("Please fill in mess plan name and monthly price");
      return;
    }
    createMessPlan(
      {
        hostelId: hostel.id,
        data: {
          name: mealName.trim(),
          priceMonthly: Number(mealPrice),
          mealsIncluded: mealIncluded
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
          isCompulsory: mealCompulsory,
        },
      },
      {
        onSuccess: () => {
          toast.success("Mess plan added");
          setMealName("");
          setMealPrice("");
          setMealIncluded("");
          setMealCompulsory(false);
        },
      },
    );
  };

  const addAddonService = () => {
    if (!addonName.trim() || !addonPlanLabel.trim() || !addonPlanPrice.trim()) {
      toast.error("Please fill in service name and at least one plan");
      return;
    }
    createAddonService(
      {
        hostelId: hostel.id,
        data: {
          serviceType: addonType,
          name: addonName.trim(),
          plans: [
            { label: addonPlanLabel.trim(), price: Number(addonPlanPrice) },
          ],
        },
      },
      {
        onSuccess: () => {
          toast.success("Addon service added");
          setAddonName("");
          setAddonPlanLabel("");
          setAddonPlanPrice("");
        },
      },
    );
  };

  const addonsByType = ADDON_SERVICE_TYPES.map((type) => ({
    type,
    items: (hostel.addonServices || []).filter((a) => a.serviceType === type),
  }));

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-3 border-b border-border pb-5">
        <Button
          variant="outline"
          size="icon"
          onClick={() => router.push("/hostels")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold tracking-tight">{hostel.name}</h1>
          <p className="text-sm text-muted-foreground flex items-center gap-1">
            <Star className="h-3.5 w-3.5 text-amber-500" />
            {Number(hostel.avgRating ?? 0).toFixed(1)} rating &middot;{" "}
            {hostel.reviewCount ?? 0} reviews
          </p>
        </div>
      </div>

      {/* Profile: description, warden, amenities, rules, location */}
      <Card className="border border-border/60 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-bold">Hostel Profile</CardTitle>
          <CardDescription>
            Description, capacity, warden contact, amenities, rules, and
            location.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1 sm:col-span-2">
              <Label>Description</Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Modern rooms with laundry facility..."
              />
            </div>
            <div className="space-y-1">
              <Label>Total Beds</Label>
              <Input
                type="number"
                value={totalBeds}
                onChange={(e) => setTotalBeds(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label>Cover Image URL</Label>
              <Input
                value={coverImageUrl}
                onChange={(e) => setCoverImageUrl(e.target.value)}
                placeholder="https://..."
              />
            </div>
          </div>

          <div className="space-y-2 pt-4 border-t">
            <Label className="font-semibold">Warden Info</Label>
            <div className="grid gap-2 sm:grid-cols-2">
              <Input
                placeholder="Name"
                value={wardenName}
                onChange={(e) => setWardenName(e.target.value)}
              />
              <Input
                placeholder="Phone"
                value={wardenPhone}
                onChange={(e) => setWardenPhone(e.target.value)}
              />
              <Input
                placeholder="WhatsApp"
                value={wardenWhatsapp}
                onChange={(e) => setWardenWhatsapp(e.target.value)}
              />
              <Input
                placeholder="Email"
                value={wardenEmail}
                onChange={(e) => setWardenEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2 pt-4 border-t">
            <Label className="font-semibold">Amenities</Label>
            <div className="flex flex-wrap gap-2">
              {amenities.map((a, idx) => (
                <span
                  key={idx}
                  className="flex items-center gap-1 text-xs bg-muted/40 border rounded-full px-3 py-1"
                >
                  {a.name}
                  <button
                    type="button"
                    onClick={() =>
                      setAmenities(amenities.filter((_, i) => i !== idx))
                    }
                  >
                    <Trash2 className="h-3 w-3 text-destructive" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Amenity name (e.g. High Speed Wi-Fi)"
                value={newAmenityName}
                onChange={(e) => setNewAmenityName(e.target.value)}
              />
              <Button type="button" variant="outline" onClick={addAmenity}>
                <Plus className="h-4 w-4 mr-1" /> Add
              </Button>
            </div>
          </div>

          <div className="space-y-2 pt-4 border-t">
            <Label className="font-semibold">Rules</Label>
            <div className="space-y-2">
              {rules.map((r, idx) => (
                <div
                  key={idx}
                  className="flex items-start justify-between border p-2.5 rounded-lg bg-muted/10 text-xs"
                >
                  <div>
                    <p className="font-bold">{r.title}</p>
                    <p className="text-muted-foreground">{r.description}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setRules(rules.filter((_, i) => i !== idx))}
                  >
                    <Trash2 className="h-3.5 w-3.5 text-destructive" />
                  </button>
                </div>
              ))}
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              <Input
                placeholder="Rule title (e.g. Curfew Time)"
                value={newRuleTitle}
                onChange={(e) => setNewRuleTitle(e.target.value)}
              />
              <Input
                placeholder="Description"
                value={newRuleDesc}
                onChange={(e) => setNewRuleDesc(e.target.value)}
              />
            </div>
            <Button type="button" variant="outline" size="sm" onClick={addRule}>
              <Plus className="h-4 w-4 mr-1" /> Add Rule
            </Button>
          </div>

          <div className="space-y-2 pt-4 border-t">
            <Label className="font-semibold">Location</Label>
            <Input
              placeholder="Address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
            <div className="space-y-2">
              {nearbyEssentials.map((ne, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between border p-2 rounded-lg bg-muted/10 text-xs"
                >
                  <span>
                    {ne.type}: {ne.name} ({ne.distance})
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setNearbyEssentials(
                        nearbyEssentials.filter((_, i) => i !== idx),
                      )
                    }
                  >
                    <Trash2 className="h-3.5 w-3.5 text-destructive" />
                  </button>
                </div>
              ))}
            </div>
            <div className="grid gap-2 sm:grid-cols-3">
              <Input
                placeholder="Type (e.g. Hospital)"
                value={newEssentialType}
                onChange={(e) => setNewEssentialType(e.target.value)}
              />
              <Input
                placeholder="Name"
                value={newEssentialName}
                onChange={(e) => setNewEssentialName(e.target.value)}
              />
              <Input
                placeholder="Distance (e.g. 3.0 km)"
                value={newEssentialDistance}
                onChange={(e) => setNewEssentialDistance(e.target.value)}
              />
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addNearbyEssential}
            >
              <Plus className="h-4 w-4 mr-1" /> Add Nearby Essential
            </Button>
          </div>

          <div className="flex justify-end pt-4 border-t">
            <Button onClick={saveProfile} disabled={isSavingProfile}>
              {isSavingProfile && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Save Profile
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Room types */}
      <Card className="border border-border/60 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-bold">Room Types</CardTitle>
          <CardDescription>
            Bed inventory and pricing per room category.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {(hostel.roomTypes || []).length === 0 ? (
            <p className="text-xs text-muted-foreground italic">
              No room types yet.
            </p>
          ) : (
            <div className="space-y-2">
              {hostel.roomTypes.map((rt) => (
                <div
                  key={rt.id}
                  className="flex items-center justify-between border p-3 rounded-lg bg-muted/10"
                >
                  <div>
                    <p className="text-sm font-semibold">{rt.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {rt.totalBeds} beds &middot; {rt.availableBeds} available
                      &middot; ₹{rt.annualPlanPrice}/yr
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() =>
                      deleteRoomType({ hostelId: hostel.id, id: rt.id })
                    }
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          )}
          <div className="grid gap-2 sm:grid-cols-2 p-3 border rounded-lg bg-muted/5">
            <Input
              placeholder="Category (e.g. 2-Sharing AC)"
              className="sm:col-span-2"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
            />
            <Input
              type="number"
              placeholder="Total Beds"
              value={roomBeds}
              onChange={(e) => setRoomBeds(e.target.value)}
            />
            <Input
              type="number"
              placeholder="Annual Price"
              value={roomAnnualPrice}
              onChange={(e) => setRoomAnnualPrice(e.target.value)}
            />
            <Input
              type="number"
              placeholder="Monthly Price"
              value={roomMonthlyPrice}
              onChange={(e) => setRoomMonthlyPrice(e.target.value)}
            />
            <Input
              type="number"
              placeholder="Security Deposit"
              value={roomDeposit}
              onChange={(e) => setRoomDeposit(e.target.value)}
            />
            <Button
              type="button"
              variant="secondary"
              className="sm:col-span-2"
              onClick={addRoomType}
              disabled={isAddingRoomType}
            >
              <Plus className="h-4 w-4 mr-1" /> Add Room Type
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Mess plans */}
      <Card className="border border-border/60 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-bold">Mess Plans</CardTitle>
          <CardDescription>Meal plans available to residents.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {(hostel.messPlans || []).length === 0 ? (
            <p className="text-xs text-muted-foreground italic">
              No mess plans yet.
            </p>
          ) : (
            <div className="space-y-2">
              {hostel.messPlans!.map((mp) => (
                <div
                  key={mp.id}
                  className="flex items-center justify-between border p-3 rounded-lg bg-muted/10"
                >
                  <div>
                    <p className="text-sm font-semibold">{mp.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {mp.mealsIncluded.join(", ")} &middot; ₹{mp.priceMonthly}
                      /mo
                      {mp.isCompulsory ? " · Compulsory" : ""}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() =>
                      deleteMessPlan({ hostelId: hostel.id, id: mp.id })
                    }
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          )}
          <div className="grid gap-2 sm:grid-cols-2 p-3 border rounded-lg bg-muted/5">
            <Input
              placeholder="Plan name (e.g. Standard Plan)"
              value={mealName}
              onChange={(e) => setMealName(e.target.value)}
            />
            <Input
              type="number"
              placeholder="Monthly Price"
              value={mealPrice}
              onChange={(e) => setMealPrice(e.target.value)}
            />
            <Input
              placeholder="Meals included (comma separated)"
              className="sm:col-span-2"
              value={mealIncluded}
              onChange={(e) => setMealIncluded(e.target.value)}
            />
            <label className="flex items-center gap-2 text-xs sm:col-span-2">
              <input
                type="checkbox"
                checked={mealCompulsory}
                onChange={(e) => setMealCompulsory(e.target.checked)}
              />
              Compulsory for all residents
            </label>
            <Button
              type="button"
              variant="secondary"
              className="sm:col-span-2"
              onClick={addMessPlan}
              disabled={isAddingMessPlan}
            >
              <Plus className="h-4 w-4 mr-1" /> Add Mess Plan
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Addon services */}
      <Card className="border border-border/60 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-bold">Addon Services</CardTitle>
          <CardDescription>
            Laundry, gym, parking, and other optional charges.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {addonsByType.map(
            ({ type, items }) =>
              items.length > 0 && (
                <div key={type} className="space-y-2">
                  <Label className="text-xs uppercase font-bold text-muted-foreground">
                    {type}
                  </Label>
                  {items.map((service) => (
                    <div
                      key={service.id}
                      className="flex items-center justify-between border p-3 rounded-lg bg-muted/10"
                    >
                      <div>
                        <p className="text-sm font-semibold">{service.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {service.plans
                            .map((p) => `${p.label}: ₹${p.price}`)
                            .join(", ")}
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          deleteAddonService({
                            hostelId: hostel.id,
                            id: service.id,
                          })
                        }
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                </div>
              ),
          )}

          <div className="grid gap-2 sm:grid-cols-2 p-3 border rounded-lg bg-muted/5">
            <select
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={addonType}
              onChange={(e) => setAddonType(e.target.value)}
            >
              {ADDON_SERVICE_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
            <Input
              placeholder="Service name (e.g. Laundry Charges)"
              value={addonName}
              onChange={(e) => setAddonName(e.target.value)}
            />
            <Input
              placeholder="Plan label (e.g. Monthly)"
              value={addonPlanLabel}
              onChange={(e) => setAddonPlanLabel(e.target.value)}
            />
            <Input
              type="number"
              placeholder="Price"
              value={addonPlanPrice}
              onChange={(e) => setAddonPlanPrice(e.target.value)}
            />
            <Button
              type="button"
              variant="secondary"
              className="sm:col-span-2"
              onClick={addAddonService}
              disabled={isAddingAddon}
            >
              <Plus className="h-4 w-4 mr-1" /> Add Addon Service
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
