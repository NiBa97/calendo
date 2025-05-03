import { describe, it, expect } from 'vitest';
import { Filter, FilterType, FilterStatus, FilterSortBy } from './filters';

describe('Filter Class', () => {
    // --- Constructor Tests ---
    it('should initialize with default values', () => {
        const filter = new Filter();
        expect(filter.itemsPerPage).toBe(30);
        expect(filter.type).toBe('all');
        expect(filter.title).toBe('');
        expect(filter.tags).toEqual([]);
        expect(filter.pageNumber).toBe(1);
        expect(filter.status).toBe('open');
        expect(filter.sortBy).toBe('created');
        expect(filter.sortDirection).toBe('desc');
    });

    it('should accept custom values in constructor using options object', () => {
        const options = {
            itemsPerPage: 10,
            type: 'tasks' as FilterType,
            title: 'search text',
            tags: ['tag1'],
            pageNumber: 2,
            status: 'closed' as FilterStatus,
            sortBy: 'updated' as FilterSortBy,
            sortDirection: 'asc' as 'asc' | 'desc',
        };
        const filter = new Filter(options);
        expect(filter.itemsPerPage).toBe(10);
        expect(filter.type).toBe('tasks');
        expect(filter.title).toBe('search text');
        expect(filter.tags).toEqual(['tag1']);
        expect(filter.pageNumber).toBe(2);
        expect(filter.status).toBe('closed');
        expect(filter.sortBy).toBe('updated');
        expect(filter.sortDirection).toBe('asc');
    });

    it('should handle invalid numeric constructor values gracefully (using defaults)', () => {
        const filter = new Filter({
            itemsPerPage: 0,
            pageNumber: -5,
            type: 'invalid' as any,
            status: 'pending' as any,
            sortBy: 'invalidField' as any,
            sortDirection: 'none' as any,
        });
        expect(filter.itemsPerPage).toBe(30);
        expect(filter.pageNumber).toBe(1);
        expect(filter.type).toBe('invalid');
        expect(filter.status).toBe('pending');
        expect(filter.sortBy).toBe('invalidField');
        expect(filter.sortDirection).toBe('none');
    });

    // --- fromSearchParams Tests ---
    it('should create filter from empty URLSearchParams with defaults', () => {
        const params = new URLSearchParams();
        const filter = Filter.fromSearchParams(params);
        expect(filter.itemsPerPage).toBe(30);
        expect(filter.type).toBe('all');
        expect(filter.title).toBe('');
        expect(filter.tags).toEqual([]);
        expect(filter.pageNumber).toBe(1);
        expect(filter.status).toBe('open');
        expect(filter.sortBy).toBe('created');
        expect(filter.sortDirection).toBe('desc');
    });

    it('should create filter from URLSearchParams with all valid values', () => {
        const params = new URLSearchParams(
            'limit=15&type=notes&title=MyNote&tags=urgent,projectA&page=3&status=closed&sortBy=title&sortDir=asc'
        );
        const filter = Filter.fromSearchParams(params);
        expect(filter.itemsPerPage).toBe(15);
        expect(filter.type).toBe('notes');
        expect(filter.title).toBe('MyNote');
        expect(filter.tags).toEqual(['urgent', 'projectA']);
        expect(filter.pageNumber).toBe(3);
        expect(filter.status).toBe('closed');
        expect(filter.sortBy).toBe('title');
        expect(filter.sortDirection).toBe('asc');
    });

    it('should handle invalid values in URLSearchParams', () => {
        const params = new URLSearchParams(
            'limit=abc&type=invalid&page=0&status=pending&sortBy=invalidField&sortDir=none'
        );
        const filter = Filter.fromSearchParams(params);
        expect(filter.itemsPerPage).toBe(30);
        expect(filter.pageNumber).toBe(1);
        expect(filter.type).toBe('invalid');
        expect(filter.status).toBe('pending');
        expect(filter.sortBy).toBe('invalidField');
        expect(filter.sortDirection).toBe('none');
    });

    // --- toPocketbaseFilter Tests ---
    it('toPocketbaseFilter: should return status filter for default filter', () => {
        const filter = new Filter();
        expect(filter.toPocketbaseFilter()).toBe('status = false');
    });

    it('toPocketbaseFilter: should generate filter for title search', () => {
        const filter = new Filter({ title: 'hello world' });
        expect(filter.toPocketbaseFilter()).toBe('title ~ "hello world" && status = false');
    });

    it('toPocketbaseFilter: should generate filter for tags', () => {
        const filter = new Filter({ tags: ['tag1', 'tag"2'] });
        expect(filter.toPocketbaseFilter()).toBe('(tags ~ "tag1" || tags ~ "tag\"2") && status = false');
    });

    it('toPocketbaseFilter: should generate filter for status (open)', () => {
        const filter = new Filter({ status: 'open' });
        expect(filter.toPocketbaseFilter()).toBe('status = false');
    });

    it('toPocketbaseFilter: should generate filter for status (closed)', () => {
        const filter = new Filter({ status: 'closed' });
        expect(filter.toPocketbaseFilter()).toBe('status = true');
    });

    it('toPocketbaseFilter: should combine title, tags, and status filters', () => {
        const filter = new Filter({ title: 'search', tags: ['t1'], status: 'closed' });
        const expected = 'title ~ "search" && (tags ~ "t1") && status = true';
        expect(filter.toPocketbaseFilter()).toBe(expected);
    });

    it('toPocketbaseFilter: should escape double quotes in title search', () => {
        const filter = new Filter({ title: 'text with "quotes"' });
        expect(filter.toPocketbaseFilter()).toBe('title ~ "text with \"quotes\"" && status = false');
    });

    // --- toPocketbaseSort Tests ---
    it('toPocketbaseSort: should generate default sort string (-created)', () => {
        const filter = new Filter();
        expect(filter.toPocketbaseSort()).toBe('-created');
    });

    it('toPocketbaseSort: should generate sort string for ascending order', () => {
        const filter = new Filter({ sortBy: 'updated', sortDirection: 'asc' });
        expect(filter.toPocketbaseSort()).toBe('+updated');
    });

    it('toPocketbaseSort: should generate sort string for title', () => {
        const filter = new Filter({ sortBy: 'title', sortDirection: 'desc' });
        expect(filter.toPocketbaseSort()).toBe('-title');
    });

    // --- toSearchParams Tests ---
    it('toSearchParams: should return empty params for default filter', () => {
        const filter = new Filter();
        const params = filter.toSearchParams();
        expect(params.toString()).toBe('');
    });

    it('toSearchParams: should include non-default values in params', () => {
        const filter = new Filter({ itemsPerPage: 10, type: 'tasks', title: 'search', tags: ['t1', 't2'], pageNumber: 2, status: 'closed', sortBy: 'title', sortDirection: 'asc' });
        const expectedParams = new URLSearchParams({
            title: 'search',
            type: 'tasks',
            status: 'closed',
            tags: 't1,t2',
            page: '2',
            limit: '10',
            sortBy: 'title',
            sortDir: 'asc',
        });
        const generatedParams = filter.toSearchParams();
        expect(generatedParams.get('title')).toBe('search');
        expect(generatedParams.get('type')).toBe('tasks');
        expect(generatedParams.get('status')).toBe('closed');
        expect(generatedParams.get('tags')).toBe('t1,t2');
        expect(generatedParams.get('page')).toBe('2');
        expect(generatedParams.get('limit')).toBe('10');
        expect(generatedParams.get('sortBy')).toBe('title');
        expect(generatedParams.get('sortDir')).toBe('asc');
        expect(generatedParams.toString()).toEqual(expectedParams.toString());
    });

    it('toSearchParams: should omit default values', () => {
        const filter = new Filter();
        const params = filter.toSearchParams();
        expect(params.toString()).toBe('');

        const filterWithOneChange = new Filter({ title: 'non-default' });
        const params2 = filterWithOneChange.toSearchParams();
        expect(params2.toString()).toBe('title=non-default');
    });
}); 