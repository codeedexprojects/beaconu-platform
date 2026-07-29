import { api } from "../api";
import type { IconItem } from "@beaconu/types";

export type { IconItem };

export const iconsService = {
  getActive: (search?: string): Promise<IconItem[]> => {
    const query = new URLSearchParams();
    if (search) query.set("search", search);
    const qs = query.toString();
    return api.get<IconItem[]>(
      `/api/v1/college-admin/icons${qs ? `?${qs}` : ""}`,
    );
  },
};
