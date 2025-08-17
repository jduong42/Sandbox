#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Extract vocabulary from the trained model's tokenizer.json file
 * and create a TypeScript vocabulary file for use in React Native
 */

const TOKENIZER_PATH = path.join(
  __dirname,
  '..',
  'qwen-sports-science-merged',
  'tokenizer.json',
);
const OUTPUT_PATH = path.join(
  __dirname,
  '..',
  'src',
  'services',
  'extractedVocabulary.ts',
);

function extractVocabulary() {
  console.log('📖 Reading tokenizer.json from trained model...');

  try {
    // Read the tokenizer.json file
    const tokenizerData = JSON.parse(fs.readFileSync(TOKENIZER_PATH, 'utf8'));

    // Extract vocabulary from model.vocab
    const vocab = tokenizerData.model.vocab;
    const vocabSize = Object.keys(vocab).length;

    console.log(`✅ Found vocabulary with ${vocabSize} tokens`);

    // Create the reverse mapping (token_id -> token_string)
    const idToToken = {};
    for (const [token, id] of Object.entries(vocab)) {
      idToToken[id] = token;
    }

    // Also extract special tokens
    const specialTokens = {};
    if (tokenizerData.added_tokens) {
      for (const token of tokenizerData.added_tokens) {
        specialTokens[token.id] = token.content;
        idToToken[token.id] = token.content;
      }
    }

    console.log(`🔧 Found ${Object.keys(specialTokens).length} special tokens`);

    // Generate TypeScript file
    const tsContent = `// Auto-generated vocabulary from trained model tokenizer.json
// Generated on: ${new Date().toISOString()}
// Vocabulary size: ${vocabSize} tokens

export interface VocabularyInfo {
  vocabSize: number;
  specialTokensCount: number;
  extractedAt: string;
}

export const VOCABULARY_INFO: VocabularyInfo = {
  vocabSize: ${vocabSize},
  specialTokensCount: ${Object.keys(specialTokens).length},
  extractedAt: '${new Date().toISOString()}'
};

// Mapping from token ID to token string
export const ID_TO_TOKEN: Record<number, string> = ${JSON.stringify(
      idToToken,
      null,
      2,
    )};

// Special tokens for reference
export const SPECIAL_TOKENS: Record<number, string> = ${JSON.stringify(
      specialTokens,
      null,
      2,
    )};

// Quick lookup function
export function decodeTokenId(tokenId: number): string | undefined {
  return ID_TO_TOKEN[tokenId];
}

// Decode multiple token IDs to text
export function decodeTokenIds(tokenIds: number[]): string {
  return tokenIds
    .map(id => ID_TO_TOKEN[id] || '[UNK]')
    .join('')
    .replace(/Ġ/g, ' ') // Replace BPE space markers with actual spaces
    .trim();
}

// Check if token is special
export function isSpecialToken(tokenId: number): boolean {
  return tokenId in SPECIAL_TOKENS;
}
`;

    // Write the TypeScript file
    fs.writeFileSync(OUTPUT_PATH, tsContent);

    console.log(`✅ Vocabulary extracted to: ${OUTPUT_PATH}`);
    console.log(`📊 Stats:`);
    console.log(`   - Total tokens: ${vocabSize}`);
    console.log(`   - Special tokens: ${Object.keys(specialTokens).length}`);
    console.log(
      `   - Regular tokens: ${vocabSize - Object.keys(specialTokens).length}`,
    );

    // Test with the tokens we've been seeing
    const testTokens = [198, 1482, 6534, 384, 279, 5537, 374];
    console.log(
      `\n🧪 Testing with our generated tokens: [${testTokens.join(', ')}]`,
    );
    const decodedText = testTokens
      .map(id => idToToken[id] || '[UNK]')
      .join('')
      .replace(/Ġ/g, ' ')
      .trim();
    console.log(`   Decoded text: "${decodedText}"`);

    return true;
  } catch (error) {
    console.error('❌ Error extracting vocabulary:', error.message);
    return false;
  }
}

// Run the extraction
if (require.main === module) {
  const success = extractVocabulary();
  process.exit(success ? 0 : 1);
}

module.exports = { extractVocabulary };
