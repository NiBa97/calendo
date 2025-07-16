const DEFAULT_STATUS = false;
const DEFAULT_SORT_FIELD: TaskSortField = "startDate";
const DEFAULT_SORT_DIRECTION: SortDirection = "asc";
const DEFAULT_PAGE = 1;

export const DEFAULT_TASK_FILTER = {
  search: "",
  status: DEFAULT_STATUS as boolean | undefined,
  tags: [] as string[],
  sortField: DEFAULT_SORT_FIELD as TaskSortField,
  sortDirection: DEFAULT_SORT_DIRECTION as SortDirection,
  page: DEFAULT_PAGE as number,
};

export type TaskFilter = typeof DEFAULT_TASK_FILTER;
export type TaskSortField = "startDate" | "endDate" | "created" | "title";
export type SortDirection = "asc" | "desc";

export const getSortFieldLabel = (field: TaskSortField): string => {
  switch (field) {
    case "startDate":
      return "Start Date";
    case "endDate":
      return "End Date";
    case "created":
      return "Created";
    case "title":
      return "Title";
    default:
      return field;
  }
};

export function taskFilterFromUrlParams(
  searchParams: URLSearchParams
): TaskFilter {
  const filter: TaskFilter = { ...DEFAULT_TASK_FILTER };

  const search = searchParams.get("search");
  if (search) filter.search = search;

  const status = searchParams.get("status");
  if (status === "true") filter.status = true;
  else if (status === "false") filter.status = false;

  const tags = searchParams.get("tags");
  if (tags) filter.tags = tags.split(",").filter(Boolean);

  const sortField = searchParams.get("sortField");
  if (
    sortField &&
    ["startDate", "endDate", "created", "title", "status"].includes(sortField)
  ) {
    filter.sortField = sortField as TaskSortField;
  }

  const sortDirection = searchParams.get("sortDirection");
  if (sortDirection && ["asc", "desc"].includes(sortDirection)) {
    filter.sortDirection = sortDirection as SortDirection;
  }

  const page = searchParams.get("page");
  if (page) filter.page = parseInt(page, 10);

  return filter;
}

export function taskFilterToUrlParams(filter: TaskFilter): URLSearchParams {
  const searchParams = new URLSearchParams();

  if (filter.search !== "") searchParams.set("search", filter.search);
  if (filter.status !== DEFAULT_STATUS)
    searchParams.set("status", String(filter.status));
  if (filter.tags && filter.tags.length > 0)
    searchParams.set("tags", filter.tags.join(","));
  if (filter.sortField !== DEFAULT_SORT_FIELD)
    searchParams.set("sortField", filter.sortField);
  if (filter.sortDirection !== DEFAULT_SORT_DIRECTION)
    searchParams.set("sortDirection", filter.sortDirection);
  if (filter.page !== DEFAULT_PAGE)
    searchParams.set("page", String(filter.page));

  return searchParams;
}
