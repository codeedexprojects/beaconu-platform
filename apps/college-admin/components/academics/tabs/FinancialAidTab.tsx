"use client";

import { Plus, Trash2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function FinancialAidTab({
  payload,
  onChange,
}: {
  payload: any;
  onChange: (updates: any) => void;
}) {
  const getActiveTabPayload = () => payload;
  const updateActiveTabPayload = (updates: any) => onChange(updates);

  const getMeritScholarship = (): any =>
    getActiveTabPayload().merit_scholarship || {};

  const updateMeritScholarship = (patch: any) =>
    updateActiveTabPayload({
      merit_scholarship: { ...getMeritScholarship(), ...patch },
    });

  const getPortEntries = (): any[] => getMeritScholarship().port_entries || [];

  const updatePortEntries = (next: any[]) =>
    updateMeritScholarship({ port_entries: next });

  const addPortEntry = () =>
    updatePortEntries([
      ...getPortEntries(),
      { id: "", name: "", terms_and_conditions: [], score_ranges: [] },
    ]);

  const removePortEntry = (idx: number) =>
    updatePortEntries(getPortEntries().filter((_, i) => i !== idx));

  const updatePortEntry = (idx: number, patch: any) => {
    const next = [...getPortEntries()];
    next[idx] = { ...next[idx], ...patch };
    updatePortEntries(next);
  };

  const addScoreRange = (portIdx: number) => {
    const entries = [...getPortEntries()];
    entries[portIdx] = {
      ...entries[portIdx],
      score_ranges: [
        ...(entries[portIdx].score_ranges || []),
        {
          id: "",
          range_label: "",
          discount_type: "percentage",
          discount_value: "",
          max_scholarship_amount: "",
          net_payable_amount: "",
        },
      ],
    };
    updatePortEntries(entries);
  };

  const removeScoreRange = (portIdx: number, rangeIdx: number) => {
    const entries = [...getPortEntries()];
    entries[portIdx] = {
      ...entries[portIdx],
      score_ranges: (entries[portIdx].score_ranges || []).filter(
        (_: any, i: number) => i !== rangeIdx,
      ),
    };
    updatePortEntries(entries);
  };

  const updateScoreRange = (portIdx: number, rangeIdx: number, patch: any) => {
    const entries = [...getPortEntries()];
    const ranges = [...(entries[portIdx].score_ranges || [])];
    ranges[rangeIdx] = { ...ranges[rangeIdx], ...patch };
    entries[portIdx] = { ...entries[portIdx], score_ranges: ranges };
    updatePortEntries(entries);
  };

  const getConcessionItems = (): any[] =>
    getActiveTabPayload().financial_concessions?.items || [];

  const updateConcessionItems = (next: any[]) =>
    updateActiveTabPayload({
      financial_concessions: {
        ...(getActiveTabPayload().financial_concessions || {}),
        items: next,
        total_types: next.length,
        total_types_label: `${next.length} TYPES`,
      },
    });

  const updateConcessionItem = (idx: number, patch: any) => {
    const next = [...getConcessionItems()];
    next[idx] = { ...next[idx], ...patch };
    updateConcessionItems(next);
  };

  const addConcessionItem = () => {
    updateConcessionItems([
      ...getConcessionItems(),
      {
        name: "",
        discount_percent: 0,
        discount_label: "0% OFF",
        accent_color: "black",
        expanded: true,
        details_cta: {
          label: "SHOW LESS",
          icon: "https://cdn.iconsdb.example.com/icons/chevron-up-gray.png",
        },
        details: {
          eligibility_criteria: [],
          scholarship_amount: "",
          net_payable: "",
        },
      },
    ]);
  };

  const removeConcessionItem = (idx: number) => {
    updateConcessionItems(getConcessionItems().filter((_, i) => i !== idx));
  };

  const updateConcessionDetails = (idx: number, patch: any) => {
    const item = getConcessionItems()[idx];
    updateConcessionItem(idx, {
      details: { ...(item?.details || {}), ...patch },
    });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4 rounded-md border p-4">
        <Label className="font-bold">Merit Scholarship</Label>
        <div className="space-y-1">
          <Label>Title</Label>
          <Input
            placeholder="Merit Scholarship"
            value={getMeritScholarship().title || ""}
            onChange={(e) =>
              updateMeritScholarship({
                title: e.target.value,
              })
            }
          />
        </div>

        <div className="space-y-3 pt-2 border-t">
          <div className="flex items-center justify-between">
            <Label className="font-bold">Port Entries</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addPortEntry}
            >
              <Plus className="h-4 w-4 mr-1" /> Add Port Entry
            </Button>
          </div>

          {getPortEntries().length === 0 ? (
            <p className="text-xs text-muted-foreground italic">
              No port entries added yet.
            </p>
          ) : (
            getPortEntries().map((entry: any, portIdx: number) => (
              <div
                key={portIdx}
                className="space-y-3 rounded-md border p-3 bg-muted/5"
              >
                <div className="flex items-center justify-between gap-2">
                  <Input
                    placeholder="e.g. JEE Main"
                    value={entry.name || ""}
                    onChange={(e) =>
                      updatePortEntry(portIdx, {
                        name: e.target.value,
                      })
                    }
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removePortEntry(portIdx)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>

                <div className="space-y-2 pl-2 border-l-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-semibold">
                      Terms &amp; Conditions
                    </Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        updatePortEntry(portIdx, {
                          terms_and_conditions: [
                            ...(entry.terms_and_conditions || []),
                            "",
                          ],
                        })
                      }
                    >
                      <Plus className="h-4 w-4 mr-1" /> Add
                    </Button>
                  </div>
                  {(entry.terms_and_conditions || []).map(
                    (term: string, tIdx: number) => (
                      <div key={tIdx} className="flex gap-2 items-center">
                        <Input
                          placeholder="e.g. Offered on first-come, first-serve basis"
                          value={term}
                          onChange={(e) => {
                            const next = [
                              ...(entry.terms_and_conditions || []),
                            ];
                            next[tIdx] = e.target.value;
                            updatePortEntry(portIdx, {
                              terms_and_conditions: next,
                            });
                          }}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            updatePortEntry(portIdx, {
                              terms_and_conditions: (
                                entry.terms_and_conditions || []
                              ).filter((_: string, i: number) => i !== tIdx),
                            })
                          }
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    ),
                  )}
                </div>

                <div className="space-y-2 pl-2 border-l-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-semibold">
                      Score Ranges
                    </Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => addScoreRange(portIdx)}
                    >
                      <Plus className="h-4 w-4 mr-1" /> Add Score Range
                    </Button>
                  </div>
                  {(entry.score_ranges || []).map(
                    (range: any, rangeIdx: number) => (
                      <div
                        key={rangeIdx}
                        className="grid gap-2 md:grid-cols-2 border rounded-md p-2"
                      >
                        <Input
                          placeholder="Range Label (e.g. 1 - 1000)"
                          value={range.range_label || ""}
                          onChange={(e) =>
                            updateScoreRange(portIdx, rangeIdx, {
                              range_label: e.target.value,
                            })
                          }
                        />
                        <Select
                          value={range.discount_type || "percentage"}
                          onValueChange={(value) =>
                            updateScoreRange(portIdx, rangeIdx, {
                              discount_type: value,
                            })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Discount Type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="percentage">
                              Percentage
                            </SelectItem>
                            <SelectItem value="amount">Amount</SelectItem>
                          </SelectContent>
                        </Select>
                        <Input
                          type="number"
                          placeholder={
                            range.discount_type === "amount"
                              ? "Discount Amount (e.g. 10000)"
                              : "Discount Percentage (e.g. 25)"
                          }
                          value={range.discount_value ?? ""}
                          onChange={(e) =>
                            updateScoreRange(portIdx, rangeIdx, {
                              discount_value: e.target.value,
                            })
                          }
                        />
                        <Input
                          placeholder="Max Scholarship Amount (e.g. Rs 75,000)"
                          value={range.max_scholarship_amount || ""}
                          onChange={(e) =>
                            updateScoreRange(portIdx, rangeIdx, {
                              max_scholarship_amount: e.target.value,
                            })
                          }
                        />
                        <Input
                          placeholder="Net Payable Amount (e.g. Rs 3,20,000)"
                          value={range.net_payable_amount || ""}
                          onChange={(e) =>
                            updateScoreRange(portIdx, rangeIdx, {
                              net_payable_amount: e.target.value,
                            })
                          }
                        />
                        <div className="flex items-end">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeScoreRange(portIdx, rangeIdx)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    ),
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="font-bold">Financial Concessions</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addConcessionItem}
          >
            <Plus className="h-4 w-4 mr-1" /> Add Concession
          </Button>
        </div>

        {getConcessionItems().map((item, idx) => (
          <div key={idx} className="space-y-3 rounded-md border p-4">
            <div className="flex items-center justify-between">
              <Label className="font-bold">Concession #{idx + 1}</Label>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeConcessionItem(idx)}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-1">
                <Label>Name</Label>
                <Input
                  placeholder="e.g. Alumni"
                  value={item.name || ""}
                  onChange={(e) =>
                    updateConcessionItem(idx, {
                      name: e.target.value,
                    })
                  }
                />
              </div>
              <div className="space-y-1">
                <Label>Discount Percent</Label>
                <Input
                  type="number"
                  placeholder="e.g. 15"
                  value={item.discount_percent ?? ""}
                  onChange={(e) =>
                    updateConcessionItem(idx, {
                      discount_percent: e.target.value,
                    })
                  }
                />
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-1">
                <Label>Scholarship Amount</Label>
                <Input
                  placeholder="e.g. Rs75,000"
                  value={item.details?.scholarship_amount || ""}
                  onChange={(e) =>
                    updateConcessionDetails(idx, {
                      scholarship_amount: e.target.value,
                    })
                  }
                />
              </div>
              <div className="space-y-1">
                <Label>Net Payable</Label>
                <Input
                  placeholder="e.g. Rs3,20,000"
                  value={item.details?.net_payable || ""}
                  onChange={(e) =>
                    updateConcessionDetails(idx, {
                      net_payable: e.target.value,
                    })
                  }
                />
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t">
              <div className="flex items-center justify-between">
                <Label className="font-bold">Eligibility Criteria</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    updateConcessionDetails(idx, {
                      eligibility_criteria: [
                        ...(item.details?.eligibility_criteria || []),
                        "",
                      ],
                    })
                  }
                >
                  <Plus className="h-4 w-4 mr-1" /> Add
                </Button>
              </div>
              {(item.details?.eligibility_criteria || []).map(
                (criterion: string, cIdx: number) => (
                  <div key={cIdx} className="flex gap-2 items-center">
                    <Input
                      placeholder="e.g. Must have completed a full-time degree program."
                      value={criterion}
                      onChange={(e) => {
                        const next = [
                          ...(item.details?.eligibility_criteria || []),
                        ];
                        next[cIdx] = e.target.value;
                        updateConcessionDetails(idx, {
                          eligibility_criteria: next,
                        });
                      }}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        const next = (
                          item.details?.eligibility_criteria || []
                        ).filter((_: string, i: number) => i !== cIdx);
                        updateConcessionDetails(idx, {
                          eligibility_criteria: next,
                        });
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ),
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
