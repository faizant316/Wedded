/**
 * A spreadsheet of every English text in the app next to its Punjabi, for the
 * family review (DECISIONS.md: Gurmukhi only where verified). Open it in
 * Google Sheets or Excel, fill in the Correction column, and hand it back to
 * Claude Code to apply.
 *
 *   npm run i18n:review -- [--local] [--out=punjabi-review.csv]
 *
 * Rows: events (name, timing, summary), vendor types, vendor type groups,
 * area-code chips, cultures (from the database), then the app's own text
 * (src/i18n/en.json and pa.json). Missing Punjabi comes first in each section.
 * The file has a byte-order mark so Excel reads Gurmukhi correctly.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import type { SupabaseClient } from '@supabase/supabase-js';

import { connect, fail } from './connect';

type Row = { section: string; where: string; english: string; punjabi: string };
type Localized = { en?: string; pa?: string } | null;

const HEADER = ['Section', 'Where', 'English', 'Punjabi now', 'Missing', 'Correction', 'Notes'];

function csvCell(value: string): string {
  return /[",\n]/.test(value) ? `"${value.replaceAll('"', '""')}"` : value;
}

function flatten(tree: Record<string, unknown>, prefix = ''): Map<string, string> {
  const out = new Map<string, string>();
  for (const [key, value] of Object.entries(tree)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === 'object') {
      for (const [k, v] of flatten(value as Record<string, unknown>, path)) out.set(k, v);
    } else out.set(path, String(value));
  }
  return out;
}

async function databaseRows(supabase: SupabaseClient): Promise<Row[]> {
  const read = async <T>(table: string, columns: string, order: string) => {
    const { data, error } = await supabase.from(table).select(columns).order(order);
    if (error) fail(`Could not read ${table}: ${error.message}`);
    return data as T[];
  };
  const [events, categories, groups, areaCodes, cultures] = await Promise.all([
    read<{ slug: string; name: Localized; timing: Localized; summary: Localized }>(
      'events',
      'slug, name, timing, summary',
      'slug',
    ),
    read<{ slug: string; name: Localized }>('categories', 'slug, name', 'slug'),
    read<{ slug: string; name: Localized }>('category_groups', 'slug, name', 'slug'),
    read<{ code: string; label: Localized }>('area_codes', 'code, label', 'sort_order'),
    read<{ slug: string; name: Localized }>('cultures', 'slug, name', 'slug'),
  ]);

  const rows: Row[] = [];
  const add = (section: string, where: string, text: Localized) => {
    if (text?.en) rows.push({ section, where, english: text.en, punjabi: text.pa ?? '' });
  };
  for (const event of events) {
    add('Events', `${event.slug} (name)`, event.name);
    add('Events', `${event.slug} (timing)`, event.timing);
    add('Events', `${event.slug} (summary)`, event.summary);
  }
  for (const category of categories) add('Vendor types', category.slug, category.name);
  for (const group of groups) add('Vendor type groups', group.slug, group.name);
  for (const area of areaCodes) add('Area-code chips', area.code, area.label);
  for (const culture of cultures) add('Cultures', culture.slug, culture.name);
  return rows;
}

function appRows(): Row[] {
  const root = join(__dirname, '..', 'src', 'i18n');
  const en = flatten(JSON.parse(readFileSync(join(root, 'en.json'), 'utf8')));
  const pa = flatten(JSON.parse(readFileSync(join(root, 'pa.json'), 'utf8')));
  return [...en].map(([key, english]) => ({
    section: 'App text',
    where: key,
    english,
    punjabi: pa.get(key) ?? '',
  }));
}

/** Missing Punjabi first within each section, keeping sections in order. */
export function toCsv(rows: Row[]): string {
  const sections = [...new Set(rows.map((row) => row.section))];
  const ordered = sections.flatMap((section) => {
    const inSection = rows.filter((row) => row.section === section);
    return [...inSection.filter((r) => !r.punjabi), ...inSection.filter((r) => r.punjabi)];
  });
  const lines = [
    HEADER,
    ...ordered.map((r) => [
      r.section,
      r.where,
      r.english,
      r.punjabi,
      r.punjabi ? '' : 'yes',
      '',
      '',
    ]),
  ];
  return `﻿${lines.map((line) => line.map(csvCell).join(',')).join('\n')}\n`;
}

async function main() {
  const args = process.argv.slice(2);
  const out =
    args.find((arg) => arg.startsWith('--out='))?.slice('--out='.length) ?? 'punjabi-review.csv';
  const supabase = connect(args.includes('--local'));

  const rows = [...(await databaseRows(supabase)), ...appRows()];
  writeFileSync(out, toCsv(rows));
  const missing = rows.filter((row) => !row.punjabi).length;
  console.log(`Wrote ${out}: ${rows.length} rows, ${missing} without Punjabi.`);
}

if (require.main === module) void main();
