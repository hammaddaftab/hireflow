const section_import = require("./sections");
const fs = require('fs');
const path = require('path');

const sections = section_import.sections;

/**
 * Extracts raw textual content from a message object.
 */
function extractMessageText(message) {
  if (!message) return '';
  if (typeof message.text === 'string' && message.text.trim()) {
    return message.text.trim();
  }
  if (Array.isArray(message.content)) {
    const textParts = message.content
      .filter((c) => c.type === 'text' && typeof c.text === 'string')
      .map((c) => c.text.trim())
      .filter(Boolean);
    if (textParts.length > 0) {
      return textParts.join('\n\n');
    }
  }
  return '';
}

/**
 * Main generator function.
 */
function generateDocumentation(jsonFilePath, outputDir = './output') {
  if (!fs.existsSync(jsonFilePath)) {
    console.error(`Input file not found: ${jsonFilePath}`);
    process.exit(1);
  }

  const rawData = fs.readFileSync(jsonFilePath, 'utf8');
  const session = JSON.parse(rawData);
  const messages = session.chat_messages || [];

  // Build index lookup maps
  const indexMap = new Map();
  const uuidMap = new Map();

  for (const msg of messages) {
    if (typeof msg.index === 'number') {
      indexMap.set(msg.index, msg);
    }
    if (msg.uuid) {
      uuidMap.set(msg.uuid, msg);
    }
  }

  const interactionsDir = path.join(outputDir, 'interactions');
  fs.mkdirSync(interactionsDir, { recursive: true });

  const seenIndices = new Set();
  const indexUsageCount = new Map();

  // First pass: count index frequencies to track repetitions
  for (const SECTION_CONFIG of sections) {
    for (const sub of SECTION_CONFIG.subsections) {
      for (const item of sub.items) {
        if (item.assistantIndices) {
          for (const idx of item.assistantIndices) {
            indexUsageCount.set(idx, (indexUsageCount.get(idx) || 0) + 1);
          }
        }
      }
    }
  }

  // Pre-generate sibling files
  for (const SECTION_CONFIG of sections) {
    for (const sub of SECTION_CONFIG.subsections) {
      for (const item of sub.items) {
        if (!item.assistantIndices) continue;

        for (const aIdx of item.assistantIndices) {
          const siblingPath = path.join(interactionsDir, `interaction_${aIdx}.md`);
          if (fs.existsSync(siblingPath)) continue; // avoid redundant writes

          const assistantMsg = indexMap.get(aIdx);
          let userMsg = null;

          if (assistantMsg && assistantMsg.parent_message_uuid) {
            userMsg = uuidMap.get(assistantMsg.parent_message_uuid);
          }
          if (!userMsg) {
            userMsg = indexMap.get(aIdx - 1);
          }

          const queryText = extractMessageText(userMsg) || '_[Query text missing]_';
          const responseText = extractMessageText(assistantMsg) || '_[Response text missing]_';

          const siblingContent = [
            `# Interaction Record — Index ${aIdx}`,
            '',
            `**Originating Role**: \`${assistantMsg?.sender || 'assistant'}\``,
            `**Referenced User Query Index**: \`${userMsg?.index ?? 'N/A'}\``,
            '',
            '---',
            '',
            '## User Query',
            '````',
            queryText,
            '````',
            '---',
            '',
            '## Claude Response (Raw Markdown)',
            '',
            responseText,
            ''
          ].join('\n');

          fs.writeFileSync(siblingPath, siblingContent, 'utf8');
        }
      }
    }
  }
  const readmeLines = []

  for (const SECTION_CONFIG of sections) {
  // Generate main README.md
    readmeLines.push(...[
      `# ${SECTION_CONFIG.heading}`,
      ''
    ]);

    for (const sub of SECTION_CONFIG.subsections) {
      readmeLines.push(`## ${sub.subheading}`, '');

      for (const item of sub.items) {
        if (item.isNote) {
          // readmeLines.push(`> ${item.statement}`, '');
          continue;
        }

        for (const aIdx of item.assistantIndices) {
          const isRepeated = seenIndices.has(aIdx);
          seenIndices.add(aIdx);

          if (isRepeated) {
            continue;
          }

          readmeLines.push(`**Target Interaction**: Index \`${aIdx}\``);
          readmeLines.push(`### ${item.statement}`, '');
          const assistantMsg = indexMap.get(aIdx);
          let userMsg = null;

          if (assistantMsg && assistantMsg.parent_message_uuid) {
            userMsg = uuidMap.get(assistantMsg.parent_message_uuid);
          }
          if (!userMsg) {
            userMsg = indexMap.get(aIdx - 1);
          }

          const queryText = extractMessageText(userMsg);
          const querySnippet = queryText.length > 200 
            ? queryText.slice(0, 200).replace(/\n+/g, ' ') + '...' 
            : queryText.replace(/\n+/g, ' ');

          const relativeLink = `./interactions/interaction_${aIdx}.md`;

          readmeLines.push(`query: "${querySnippet}"`);
          readmeLines.push(`link_to_sibling_file: [interaction_${aIdx}.md](${relativeLink})`);
          readmeLines.push('');
        }
      }
    }
  }
  const readmePath = path.join(outputDir, 'README.md');
  fs.writeFileSync(readmePath, readmeLines.join('\n'), 'utf8');

  console.log(`Generated:`);
  console.log(`- Main file: ${readmePath}`);
  console.log(`- Sibling records: ${interactionsDir}/`);
}

// Execution via CLI argument: node script.js <path_to_json>
const inputFile = process.argv[2] || 'd3cebac6-3861-4ff3-8533-9ca4804abaa3-local.json';
generateDocumentation(inputFile);

