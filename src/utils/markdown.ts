import type { ComponentIdentification } from '@/types';

/** Plain markdown version of a structured identification, used for copy/export and history previews. */
export function identificationToMarkdown(c: ComponentIdentification): string {
  const list = (items: string[]) => items.map((i) => `- ${i}`).join('\n');
  return [
    '## Component Identification',
    `**${c.name}**`,
    c.summary,
    `### Component Type\n${c.type}`,
    `### Main Function\n${c.mainFunction}`,
    `### How It Works\n${c.howItWorks}`,
    `### Common Uses\n${list(c.commonApplications)}`,
    `### Compatible Platforms\n${list(c.compatiblePlatforms)}`,
    `### Projects You Can Build\n${c.suggestedProjects.map((p, i) => `${i + 1}. ${p.title}`).join('\n')}`,
    `### Safety Considerations\n${list(c.safetyNotes)}`,
  ].join('\n\n');
}

export type MdBlock =
  | { kind: 'h2'; text: string }
  | { kind: 'h3'; text: string }
  | { kind: 'p'; text: string }
  | { kind: 'ul'; items: string[] }
  | { kind: 'ol'; items: string[] };

/** Small block parser: headings, bullet lists, numbered lists, paragraphs. */
export function parseMarkdown(src: string): MdBlock[] {
  const blocks: MdBlock[] = [];
  let para: string[] = [];
  const flush = () => {
    if (para.length) blocks.push({ kind: 'p', text: para.join(' ') });
    para = [];
  };
  for (const raw of src.split('\n')) {
    const line = raw.trim();
    let m: RegExpMatchArray | null;
    if (!line) flush();
    else if ((m = line.match(/^#{1,2}\s+(.*)$/))) { flush(); blocks.push({ kind: 'h2', text: m[1] }); }
    else if ((m = line.match(/^#{3,6}\s+(.*)$/))) { flush(); blocks.push({ kind: 'h3', text: m[1] }); }
    else if ((m = line.match(/^[-*•]\s+(.*)$/))) {
      flush();
      const last = blocks[blocks.length - 1];
      if (last?.kind === 'ul') last.items.push(m[1]);
      else blocks.push({ kind: 'ul', items: [m[1]] });
    } else if ((m = line.match(/^\d+[.)]\s+(.*)$/))) {
      flush();
      const last = blocks[blocks.length - 1];
      if (last?.kind === 'ol') last.items.push(m[1]);
      else blocks.push({ kind: 'ol', items: [m[1]] });
    } else para.push(line);
  }
  flush();
  return blocks;
}

export type Inline = { text: string; bold?: boolean; code?: boolean };

export function parseInline(src: string): Inline[] {
  const out: Inline[] = [];
  const re = /(\*\*[^*]+\*\*|`[^`]+`)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(src))) {
    if (m.index > last) out.push({ text: src.slice(last, m.index) });
    const tok = m[0];
    if (tok.startsWith('**')) out.push({ text: tok.slice(2, -2), bold: true });
    else out.push({ text: tok.slice(1, -1), code: true });
    last = m.index + tok.length;
  }
  if (last < src.length) out.push({ text: src.slice(last) });
  return out;
}
