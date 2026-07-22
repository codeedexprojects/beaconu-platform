export function createTabListHelpers(
  getActiveTabPayload: () => any,
  updateActiveTabPayload: (updates: any) => void,
) {
  const getTabList = (field: string): any[] => {
    const tabPayload = getActiveTabPayload();
    if (field.includes(".")) {
      const [parent, child] = field.split(".");
      return tabPayload[parent]?.[child] || [];
    }
    return tabPayload[field] || [];
  };

  const updateTabList = (field: string, next: any[]) => {
    if (field.includes(".")) {
      const [parent, child] = field.split(".");
      const parentObj = getActiveTabPayload()[parent] || {};
      updateActiveTabPayload({
        [parent]: {
          ...parentObj,
          [child]: next,
        },
      });
    } else {
      updateActiveTabPayload({ [field]: next });
    }
  };

  const addTabListItem = (field: string, emptyItem: any) => {
    updateTabList(field, [...getTabList(field), emptyItem]);
  };

  const removeTabListItem = (field: string, idx: number) => {
    updateTabList(
      field,
      getTabList(field).filter((_, i) => i !== idx),
    );
  };

  const updateTabListItem = (field: string, idx: number, patch: any) => {
    const list = [...getTabList(field)];
    list[idx] = { ...list[idx], ...patch };
    updateTabList(field, list);
  };

  return {
    getTabList,
    updateTabList,
    addTabListItem,
    removeTabListItem,
    updateTabListItem,
  };
}
