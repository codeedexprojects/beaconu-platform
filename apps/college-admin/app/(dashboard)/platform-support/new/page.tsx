"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, Loader2, MessageCircleQuestion, Phone } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { getErrorMessage } from "@/lib/api";
import { useCreatePlatformTicket } from "@/hooks/use-platform-tickets";
import { TicketAttachmentsInput } from "@/components/ticket-attachments-input";
import type {
  PlatformTicketAttachmentItem,
  PlatformTicketType,
} from "@beaconu/types";

const TYPE_OPTIONS: {
  value: PlatformTicketType;
  label: string;
  description: string;
  icon: typeof MessageCircleQuestion;
}[] = [
  {
    value: "query",
    label: "Ask a Query",
    description: "Write in and we'll reply here",
    icon: MessageCircleQuestion,
  },
  {
    value: "call_request",
    label: "Request a Call Back",
    description: "We'll ring you at a time that works",
    icon: Phone,
  },
];

export default function NewPlatformTicketPage() {
  const router = useRouter();
  const { mutate: create, isPending } = useCreatePlatformTicket();

  const [type, setType] = useState<PlatformTicketType>("query");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [preferredTime, setPreferredTime] = useState("");
  const [attachments, setAttachments] = useState<
    PlatformTicketAttachmentItem[]
  >([]);

  const isCallRequest = type === "call_request";

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!subject.trim() || !description.trim()) {
      toast.error("Subject and description are required");
      return;
    }

    create(
      {
        type,
        subject: subject.trim(),
        description: description.trim(),
        phone_number: phoneNumber.trim() || undefined,
        preferred_time: preferredTime.trim() || undefined,
        attachments: attachments.length > 0 ? attachments : undefined,
      },
      {
        onSuccess: (ticket) => {
          toast.success(
            isCallRequest ? "Call request submitted" : "Query submitted",
          );
          router.push(`/platform-support/${ticket.id}`);
        },
        onError: (error) => {
          toast.error(getErrorMessage(error));
        },
      },
    );
  }

  return (
    <div className="max-w-xl space-y-6">
      <div className="flex items-center gap-3 border-b border-border pb-5">
        <Button
          variant="outline"
          size="icon"
          onClick={() => router.push("/platform-support")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-xl font-bold tracking-tight">
            Contact BeaconU Support
          </h1>
          <p className="text-sm text-muted-foreground">
            Reach the BeaconU platform support team.
          </p>
        </div>
      </div>

      <form onSubmit={onSubmit} className="space-y-5">
        <div className="space-y-2">
          <Label>What do you need?</Label>
          <div className="grid grid-cols-2 gap-3">
            {TYPE_OPTIONS.map((opt) => {
              const Icon = opt.icon;
              const isSelected = type === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setType(opt.value)}
                  className={cn(
                    "flex flex-col items-start gap-2 rounded-lg border-2 p-4 text-left transition-colors",
                    isSelected
                      ? opt.value === "call_request"
                        ? "border-emerald-500 bg-emerald-50"
                        : "border-primary bg-primary/5"
                      : "border-border hover:border-muted-foreground/30",
                  )}
                >
                  <div
                    className={cn(
                      "flex h-9 w-9 items-center justify-center rounded-full",
                      isSelected && opt.value === "call_request"
                        ? "bg-emerald-600 text-white"
                        : isSelected
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground",
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{opt.label}</p>
                    <p className="text-xs text-muted-foreground">
                      {opt.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="subject">
            {isCallRequest ? "What's it about?" : "Subject"}
          </Label>
          <Input
            id="subject"
            placeholder="e.g. Issue with fee collection report"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">
            {isCallRequest
              ? "Anything we should know before calling?"
              : "Description"}
          </Label>
          <Textarea
            id="description"
            placeholder="Describe what you need help with"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={5}
            required
          />
        </div>

        <div className="space-y-2">
          <Label>Supporting Document (optional)</Label>
          <TicketAttachmentsInput
            value={attachments}
            onChange={setAttachments}
            context="platform-tickets"
          />
        </div>

        {isCallRequest && (
          <Card className="border-none shadow-sm bg-gradient-to-br from-emerald-50 to-teal-50">
            <CardContent className="p-4 space-y-4">
              <div className="flex items-center gap-2 text-emerald-800">
                <Phone className="h-4 w-4" />
                <p className="text-sm font-semibold">Call Back Details</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone_number">Phone Number</Label>
                <Input
                  id="phone_number"
                  placeholder="Leave blank to use your profile phone number"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="bg-background"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="preferred_time">
                  Preferred Time (optional)
                </Label>
                <Input
                  id="preferred_time"
                  placeholder="e.g. Weekdays after 3pm"
                  value={preferredTime}
                  onChange={(e) => setPreferredTime(e.target.value)}
                  className="bg-background"
                />
              </div>
            </CardContent>
          </Card>
        )}

        <Button
          type="submit"
          disabled={isPending}
          className={cn(
            "w-full gap-2",
            isCallRequest && "bg-emerald-600 hover:bg-emerald-700",
          )}
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : isCallRequest ? (
            <Phone className="h-4 w-4" />
          ) : null}
          {isPending
            ? "Submitting…"
            : isCallRequest
              ? "Request Call Back"
              : "Submit Query"}
        </Button>
      </form>
    </div>
  );
}
