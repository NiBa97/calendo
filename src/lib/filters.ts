export type FilterType = "all" | "tasks" | "notes";
export type FilterStatus = "open" | "closed";
export type FilterSortBy = "created" | "updated" | "title";

// Interface for constructor options
interface FilterOptions {
    itemsPerPage?: number;
    type?: FilterType;
    title?: string;
    tags?: string[];
    pageNumber?: number;
    status?: FilterStatus;
    sortBy?: FilterSortBy;
    sortDirection?: "asc" | "desc";
}

/**
 * Represents the filtering and sorting state for lists.
 */
export class Filter {
    itemsPerPage: number;
    type: FilterType;
    title: string;
    tags: string[]; // Should be tag IDs
    pageNumber: number;
    status: FilterStatus;
    sortBy: FilterSortBy;
    sortDirection: "asc" | "desc";

    constructor(options: FilterOptions = {}) {
        const defaults = {
            itemsPerPage: 30,
            type: "all" as FilterType,
            title: "",
            tags: [] as string[],
            pageNumber: 1,
            status: "open" as FilterStatus,
            sortBy: "created" as FilterSortBy,
            sortDirection: "desc" as "asc" | "desc",
        };

        this.itemsPerPage = options.itemsPerPage !== undefined && options.itemsPerPage > 0
            ? options.itemsPerPage
            : defaults.itemsPerPage;
        this.type = options.type ?? defaults.type;
        this.title = options.title ?? defaults.title;
        this.tags = options.tags ?? defaults.tags;
        this.pageNumber = options.pageNumber !== undefined && options.pageNumber > 0
            ? options.pageNumber
            : defaults.pageNumber;
        this.status = options.status ?? defaults.status;
        this.sortBy = options.sortBy ?? defaults.sortBy;
        this.sortDirection = options.sortDirection ?? defaults.sortDirection;
    }

    /**
     * Creates a Filter instance from URLSearchParams.
     * @param params The URLSearchParams object.
     * @returns A new Filter instance.
     */
    static fromSearchParams(params: URLSearchParams): Filter {
        const itemsPerPage = parseInt(params.get("limit") || "30", 10);
        const type = (params.get("type") as FilterType) || "all";
        const title = params.get("title") || "";
        const tags = params.get("tags") ? params.get("tags")!.split(",") : [];
        const pageNumber = parseInt(params.get("page") || "1", 10);
        const status = (params.get("status") as FilterStatus) || "open";
        const sortBy = (params.get("sortBy") as FilterSortBy) || "created";
        const sortDirection = (params.get("sortDir") as "asc" | "desc") || "desc";

        // Validate and create Filter instance using the constructor with options object
        return new Filter({
            itemsPerPage: isNaN(itemsPerPage) ? undefined : itemsPerPage,
            type: type,
            title: title,
            tags: tags,
            pageNumber: isNaN(pageNumber) ? undefined : pageNumber,
            status: status,
            sortBy: sortBy,
            sortDirection: sortDirection,
        });
    }

    /**
     * Generates the PocketBase filter string based on the current filter state.
     * @returns The PocketBase filter string.
     */
    toPocketbaseFilter(): string {
        let filterParts: string[] = [];

        // Title filter (always uses 'title' field)
        if (this.title) {
            const escapedTitle = this.title.replace(/"/g, '\"');
            filterParts.push(`title ~ "${escapedTitle}"`);
        }

        // Tag filter
        if (this.tags.length > 0) {
            const tagFilters = this.tags.map(id => `tags ~ "${id.replace(/"/g, '\"')}"`);
            filterParts.push(`(${tagFilters.join(" || ")})`);
        }

        // Status filter (Re-added)
        if (this.status === "open") {
            filterParts.push(`status = false`);
        } else if (this.status === "closed") {
            filterParts.push(`status = true`);
        }

        // Type filter
        if (this.type === "tasks") {
            filterParts.push(`type = "task"`);
        } else if (this.type === "notes") {
            filterParts.push(`type = "note"`);
        }
        return filterParts.length > 0 ? filterParts.join(" && ") : "";
    }

    /**
     * Generates the PocketBase sort string based on the current sort state.
     * @returns The PocketBase sort string (e.g., '-created').
     */
    toPocketbaseSort(): string {
        const prefix = this.sortDirection === "desc" ? "-" : "+";
        return `${prefix}${this.sortBy}`;
    }

    /**
     * Generates a URLSearchParams object representing the current filter state.
     * Omits default values to keep the URL cleaner.
     * @returns A new URLSearchParams instance.
     */
    toSearchParams(): URLSearchParams {
        const params = new URLSearchParams();
        const defaults = new Filter();

        if (this.title !== defaults.title) params.set("title", this.title);
        if (this.type !== defaults.type) params.set("type", this.type);
        if (this.status !== defaults.status) params.set("status", this.status);
        if (this.tags.length > 0) params.set("tags", this.tags.join(","));
        if (this.pageNumber !== defaults.pageNumber) params.set("page", this.pageNumber.toString());
        if (this.itemsPerPage !== defaults.itemsPerPage) params.set("limit", this.itemsPerPage.toString());
        if (this.sortBy !== defaults.sortBy) params.set("sortBy", this.sortBy);
        if (this.sortDirection !== defaults.sortDirection) params.set("sortDir", this.sortDirection);
        return params;
    }
} 