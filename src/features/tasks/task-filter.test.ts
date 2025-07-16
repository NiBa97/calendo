import { describe, it, expect } from 'vitest';
import { taskFilterFromUrlParams, taskFilterToUrlParams, TaskFilter, DEFAULT_TASK_FILTER } from './task-filter';

describe('taskFilterFromUrlParams', () => {
  it('should return default filter when no params are provided', () => {
    const searchParams = new URLSearchParams();
    const result = taskFilterFromUrlParams(searchParams);
    expect(result).toEqual(DEFAULT_TASK_FILTER);
  });
  it('should parse search parameter correctly', () => {
    const searchParams = new URLSearchParams('search=test%20query');
    const result = taskFilterFromUrlParams(searchParams);
    expect(result).toEqual({ ...DEFAULT_TASK_FILTER, search: 'test query' });
  });

  it('should handle URL encoded characters in search', () => {
    const searchParams = new URLSearchParams('search=test%20with%20spaces%26special%3Dchars');
    const result = taskFilterFromUrlParams(searchParams);
    expect(result).toEqual({ ...DEFAULT_TASK_FILTER, search: 'test with spaces&special=chars' });
  });

  it('should parse status parameter correctly', () => {
    const searchParams1 = new URLSearchParams('status=true');
    const result1 = taskFilterFromUrlParams(searchParams1);
    expect(result1).toEqual({ ...DEFAULT_TASK_FILTER, status: true });

    const searchParams2 = new URLSearchParams('status=false');
    const result2 = taskFilterFromUrlParams(searchParams2);
    expect(result2).toEqual({ ...DEFAULT_TASK_FILTER, status: false });

    const searchParams3 = new URLSearchParams('status=invalid');
    const result3 = taskFilterFromUrlParams(searchParams3);
    expect(result3).toEqual(DEFAULT_TASK_FILTER);
  });

  it('should parse tags parameter correctly', () => {
    const searchParams = new URLSearchParams('tags=tag1,tag2,tag3');
    const result = taskFilterFromUrlParams(searchParams);
    expect(result).toEqual({ ...DEFAULT_TASK_FILTER, tags: ['tag1', 'tag2', 'tag3'] });
  });

  it('should handle URL encoded characters in tags', () => {
    const searchParams = new URLSearchParams('tags=tag%20with%20space,urgent%26important');
    const result = taskFilterFromUrlParams(searchParams);
    expect(result).toEqual({ ...DEFAULT_TASK_FILTER, tags: ['tag with space', 'urgent&important'] });
  });

  it('should filter out empty tags', () => {
    const searchParams = new URLSearchParams('tags=tag1,,tag3,');
    const result = taskFilterFromUrlParams(searchParams);
    expect(result).toEqual({ ...DEFAULT_TASK_FILTER, tags: ['tag1', 'tag3'] });
  });

  it('should parse sortField parameter correctly', () => {
    const searchParams = new URLSearchParams('sortField=endDate');
    const result = taskFilterFromUrlParams(searchParams);
    expect(result).toEqual({ ...DEFAULT_TASK_FILTER, sortField: 'endDate' });
  });

  it('should ignore invalid sortField values', () => {
    const searchParams = new URLSearchParams('sortField=invalid');
    const result = taskFilterFromUrlParams(searchParams);
    expect(result).toEqual(DEFAULT_TASK_FILTER);
  });

  it('should parse sortDirection parameter correctly', () => {
    const searchParams = new URLSearchParams('sortDirection=desc');
    const result = taskFilterFromUrlParams(searchParams);
    expect(result).toEqual({ ...DEFAULT_TASK_FILTER, sortDirection: 'desc' });
  });

  it('should ignore invalid sortDirection values', () => {
    const searchParams = new URLSearchParams('sortDirection=invalid');
    const result = taskFilterFromUrlParams(searchParams);
    expect(result).toEqual(DEFAULT_TASK_FILTER);
  });

  it('should parse page parameter correctly', () => {
    const searchParams = new URLSearchParams('page=5');
    const result = taskFilterFromUrlParams(searchParams);
    expect(result).toEqual({ ...DEFAULT_TASK_FILTER, page: 5 });
  });


  it('should parse multiple parameters correctly', () => {
    const searchParams = new URLSearchParams('search=test&status=true&tags=tag1,tag2&sortField=title&sortDirection=asc&page=2');
    const result = taskFilterFromUrlParams(searchParams);
    expect(result).toEqual({
      ...DEFAULT_TASK_FILTER,
      search: 'test',
      status: true,
      tags: ['tag1', 'tag2'],
      sortField: 'title',
      sortDirection: 'asc',
      page: 2
    });
  });
});

describe('taskFilterToUrlParams', () => {
  it('should return empty URLSearchParams when filter is empty', () => {
    const filter: TaskFilter = DEFAULT_TASK_FILTER;
    const result = taskFilterToUrlParams(filter);
    expect(result.toString()).toBe('');
  });

  it('should set search parameter correctly', () => {
    const filter: TaskFilter = { ...DEFAULT_TASK_FILTER, search: 'test query' };
    const result = taskFilterToUrlParams(filter);
    expect(result.get('search')).toBe('test query');
  });

  it('should properly encode special characters in search', () => {
    const filter: TaskFilter = { ...DEFAULT_TASK_FILTER, search: 'test with spaces&special=chars' };
    const result = taskFilterToUrlParams(filter);
    expect(result.get('search')).toBe('test with spaces&special=chars');
    expect(result.toString()).toBe('search=test+with+spaces%26special%3Dchars');
  });

  it('should set status parameter correctly', () => {
    const filter1: TaskFilter = { ...DEFAULT_TASK_FILTER, status: false };
    const result1 = taskFilterToUrlParams(filter1);
    expect(result1.get('status')).toBe('false');

    const filter2: TaskFilter = { ...DEFAULT_TASK_FILTER, status: true };
    const result2 = taskFilterToUrlParams(filter2);
    expect(result2.has('status')).toBe(false); // true is default, so it shouldn't be in URL
  });

  it('should set tags parameter correctly', () => {
    const filter: TaskFilter = { ...DEFAULT_TASK_FILTER, tags: ['tag1', 'tag2', 'tag3'] };
    const result = taskFilterToUrlParams(filter);
    expect(result.get('tags')).toBe('tag1,tag2,tag3');
  });

  it('should properly encode special characters in tags', () => {
    const filter: TaskFilter = { ...DEFAULT_TASK_FILTER, tags: ['tag with space', 'urgent&important'] };
    const result = taskFilterToUrlParams(filter);
    expect(result.get('tags')).toBe('tag with space,urgent&important');
    expect(result.toString()).toBe('tags=tag+with+space%2Curgent%26important');
  });

  it('should not set tags parameter when array is empty', () => {
    const filter: TaskFilter = { ...DEFAULT_TASK_FILTER, tags: [] };
    const result = taskFilterToUrlParams(filter);
    expect(result.has('tags')).toBe(false);
  });

  it('should set sortField parameter correctly', () => {
    const filter: TaskFilter = { ...DEFAULT_TASK_FILTER, sortField: 'endDate' };
    const result = taskFilterToUrlParams(filter);
    expect(result.get('sortField')).toBe('endDate');
  });

  it('should set sortDirection parameter correctly', () => {
    const filter: TaskFilter = { ...DEFAULT_TASK_FILTER, sortDirection: 'desc' };
    const result = taskFilterToUrlParams(filter);
    expect(result.get('sortDirection')).toBe('desc');
  });

  it('should set page parameter correctly', () => {
    const filter: TaskFilter = { ...DEFAULT_TASK_FILTER, page: 3 };
    const result = taskFilterToUrlParams(filter);
    expect(result.get('page')).toBe('3');
  });


  it('should set multiple parameters correctly', () => {
    const filter: TaskFilter = {
      search: 'test',
      status: false,
      tags: ['tag1', 'tag2'],
      sortField: 'created',
      sortDirection: 'desc',
      page: 2
    };
    const result = taskFilterToUrlParams(filter);
    
    expect(result.get('search')).toBe('test');
    expect(result.get('status')).toBe('false');
    expect(result.get('tags')).toBe('tag1,tag2');
    expect(result.get('sortField')).toBe('created');
    expect(result.get('sortDirection')).toBe('desc');
    expect(result.get('page')).toBe('2');
  });

});

describe('roundtrip conversion', () => {
  it('should maintain data integrity when converting back and forth', () => {
    const originalFilter: TaskFilter = {
      search: 'test query',
      status: false,
      tags: ['important', 'urgent'],
      sortField: 'endDate',
      sortDirection: 'desc',
      page: 2
    };
    
    const urlParams = taskFilterToUrlParams(originalFilter);
    const reconstructedFilter = taskFilterFromUrlParams(urlParams);
    
    expect(reconstructedFilter).toEqual(originalFilter);
  });

  it('should handle empty filter roundtrip', () => {
    const originalFilter: TaskFilter = DEFAULT_TASK_FILTER;
    const urlParams = taskFilterToUrlParams(originalFilter);
    const reconstructedFilter = taskFilterFromUrlParams(urlParams);
    
    expect(reconstructedFilter).toEqual(originalFilter);
  });

  it('should maintain data integrity with special characters in roundtrip', () => {
    const originalFilter: TaskFilter = {
      ...DEFAULT_TASK_FILTER,
      search: 'test query with spaces&special=chars',
      tags: ['tag with space', 'urgent&important', 'category:work']
    };
    
    const urlParams = taskFilterToUrlParams(originalFilter);
    const reconstructedFilter = taskFilterFromUrlParams(urlParams);
    
    expect(reconstructedFilter).toEqual(originalFilter);
  });
});