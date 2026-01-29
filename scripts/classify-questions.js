#!/usr/bin/env node

/**
 * Question Classification Script
 * 
 * This script uses Transformers.js to classify Science Bowl questions
 * and add semantic tags for advanced filtering.
 * 
 * Usage:
 *   node scripts/classify-questions.js [options]
 * 
 * Options:
 *   --input <file>     Input JSON file (default: src/ms-questions.json)
 *   --output <file>    Output JSON file (default: src/ms-questions-tagged.json)
 *   --sample <number>  Process only N questions for testing (default: all)
 *   --resume           Resume from last checkpoint
 *   --force            Overwrite existing tags
 * 
 * Examples:
 *   # Test with 10 questions
 *   node scripts/classify-questions.js --sample 10
 * 
 *   # Process MS questions
 *   node scripts/classify-questions.js --input src/ms-questions.json --output src/ms-questions-tagged.json
 * 
 *   # Process HS questions
 *   node scripts/classify-questions.js --input src/hs-questions.json --output src/hs-questions-tagged.json
 */

const fs = require('fs');
const path = require('path');
const { pipeline } = require('@xenova/transformers');

// Parse command line arguments
const args = process.argv.slice(2);
const getArg = (flag, defaultValue) => {
  const index = args.indexOf(flag);
  return index !== -1 && args[index + 1] ? args[index + 1] : defaultValue;
};
const hasFlag = (flag) => args.includes(flag);

const INPUT_FILE = getArg('--input', 'src/ms-questions.json');
const OUTPUT_FILE = getArg('--output', 'src/ms-questions-tagged.json');
const SAMPLE_SIZE = getArg('--sample', null);
const RESUME = hasFlag('--resume');
const FORCE = hasFlag('--force');
const CHECKPOINT_FILE = OUTPUT_FILE.replace('.json', '.checkpoint.json');

// Classification categories and keywords
const CLASSIFICATION_RULES = {
  // Knowledge type
  knowledgeType: {
    factual: ['who', 'what is the name', 'when', 'where', 'which scientist', 'discovered by', 'invented by', 'named after'],
    conceptual: ['explain', 'describe', 'what is the relationship', 'why does', 'how does', 'principle', 'theory'],
    computational: ['calculate', 'compute', 'solve', 'find the value', 'what is the result', 'how many', 'how much'],
    analytical: ['compare', 'analyze', 'evaluate', 'determine', 'identify the pattern', 'predict']
  },
  
  // Cognitive level
  cognitiveLevel: {
    recall: ['what is', 'name the', 'list', 'identify', 'define', 'state'],
    application: ['apply', 'use', 'demonstrate', 'solve', 'calculate'],
    synthesis: ['combine', 'integrate', 'relate', 'connect', 'synthesize']
  },
  
  // Math subtopics
  mathSubtopics: {
    algebra: ['equation', 'variable', 'polynomial', 'factor', 'solve for', 'expression', 'linear', 'quadratic'],
    geometry: ['triangle', 'circle', 'angle', 'area', 'volume', 'perimeter', 'polygon', 'theorem', 'proof'],
    statistics: ['mean', 'median', 'mode', 'average', 'standard deviation', 'probability', 'data', 'sample'],
    probability: ['probability', 'chance', 'odds', 'random', 'expected value', 'combination', 'permutation'],
    calculus: ['derivative', 'integral', 'limit', 'rate of change', 'slope', 'tangent'],
    'number-theory': ['prime', 'factor', 'divisible', 'remainder', 'modulo', 'gcd', 'lcm']
  },
  
  // Science subtopics
  scienceSubtopics: {
    'chemistry-reactions': ['reaction', 'reactant', 'product', 'chemical equation', 'oxidation', 'reduction', 'catalyst'],
    'chemistry-structure': ['atom', 'molecule', 'bond', 'electron', 'orbital', 'valence', 'lewis structure'],
    'physics-mechanics': ['force', 'motion', 'velocity', 'acceleration', 'momentum', 'energy', 'work', 'power'],
    'physics-electricity': ['current', 'voltage', 'resistance', 'circuit', 'charge', 'electric field', 'magnetic'],
    'physics-waves': ['wave', 'frequency', 'wavelength', 'amplitude', 'sound', 'light', 'electromagnetic'],
    'biology-anatomy': ['organ', 'tissue', 'cell', 'system', 'body', 'structure', 'function'],
    'biology-genetics': ['gene', 'dna', 'chromosome', 'heredity', 'mutation', 'allele', 'trait'],
    'biology-ecology': ['ecosystem', 'population', 'species', 'habitat', 'food chain', 'biome'],
    'earth-geology': ['rock', 'mineral', 'plate', 'volcano', 'earthquake', 'sediment', 'fossil'],
    'earth-weather': ['weather', 'climate', 'atmosphere', 'pressure', 'temperature', 'precipitation', 'wind'],
    'astronomy': ['planet', 'star', 'galaxy', 'solar system', 'orbit', 'celestial', 'universe', 'light year']
  }
};

// Initialize classifier
let classifier = null;

async function initializeClassifier() {
  if (classifier) return classifier;
  
  console.log('Loading zero-shot classification model...');
  console.log('This may take a few minutes on first run...\n');
  
  // Use a zero-shot classification model
  classifier = await pipeline(
    'zero-shot-classification',
    'Xenova/mobilebert-uncased-mnli',
    { quantized: true }
  );
  
  console.log('✓ Model loaded successfully!\n');
  return classifier;
}

/**
 * Classify question using keyword matching (fast, deterministic)
 */
function classifyByKeywords(question) {
  const text = `${question.question} ${question.answer}`.toLowerCase();
  const tags = new Set();
  
  // Check each category
  for (const [category, subtopics] of Object.entries(CLASSIFICATION_RULES)) {
    for (const [tag, keywords] of Object.entries(subtopics)) {
      // Check if any keyword matches
      if (keywords.some(keyword => text.includes(keyword.toLowerCase()))) {
        tags.add(tag);
      }
    }
  }
  
  return Array.from(tags);
}

/**
 * Classify question using AI (slower, more accurate)
 */
async function classifyByAI(question, model) {
  const text = question.question;
  const tags = new Set();
  
  try {
    // Classify knowledge type
    const knowledgeResult = await model(text, ['factual recall', 'conceptual understanding', 'computational problem', 'analytical reasoning']);
    if (knowledgeResult.scores[0] > 0.5) {
      const label = knowledgeResult.labels[0].replace(' ', '-').toLowerCase();
      if (label.includes('factual')) tags.add('factual');
      else if (label.includes('conceptual')) tags.add('conceptual');
      else if (label.includes('computational')) tags.add('computational');
      else if (label.includes('analytical')) tags.add('analytical');
    }
    
    // Classify cognitive level
    const cognitiveResult = await model(text, ['simple recall', 'application of knowledge', 'synthesis of concepts']);
    if (cognitiveResult.scores[0] > 0.5) {
      const label = cognitiveResult.labels[0].toLowerCase();
      if (label.includes('recall')) tags.add('recall');
      else if (label.includes('application')) tags.add('application');
      else if (label.includes('synthesis')) tags.add('synthesis');
    }
    
    // Subject-specific classification
    if (question.subject.includes('MATH')) {
      const mathResult = await model(text, ['algebra', 'geometry', 'statistics', 'probability', 'calculus', 'number theory']);
      if (mathResult.scores[0] > 0.4) {
        tags.add(mathResult.labels[0].replace(' ', '-').toLowerCase());
      }
    } else if (question.subject.includes('SCIENCE') || question.subject.includes('CHEMISTRY') || 
               question.subject.includes('PHYSICS') || question.subject.includes('BIOLOGY') ||
               question.subject.includes('EARTH')) {
      const scienceResult = await model(text, [
        'chemical reactions', 'molecular structure', 'mechanics', 'electricity', 
        'waves', 'anatomy', 'genetics', 'ecology', 'geology', 'weather', 'astronomy'
      ]);
      if (scienceResult.scores[0] > 0.4) {
        const label = scienceResult.labels[0].replace(' ', '-').toLowerCase();
        tags.add(label);
      }
    }
  } catch (error) {
    console.error('AI classification error:', error.message);
  }
  
  return Array.from(tags);
}

/**
 * Classify a single question (hybrid approach)
 */
async function classifyQuestion(question, model, useAI = true) {
  // Start with keyword matching (fast)
  const keywordTags = classifyByKeywords(question);
  
  // If we have good keyword matches, use those
  if (keywordTags.length >= 2 || !useAI) {
    return keywordTags;
  }
  
  // Otherwise, use AI for better accuracy
  const aiTags = await classifyByAI(question, model);
  
  // Combine both approaches
  const allTags = new Set([...keywordTags, ...aiTags]);
  return Array.from(allTags);
}

/**
 * Save checkpoint
 */
function saveCheckpoint(questions, index) {
  fs.writeFileSync(
    CHECKPOINT_FILE,
    JSON.stringify({ questions, lastIndex: index }, null, 2)
  );
}

/**
 * Load checkpoint
 */
function loadCheckpoint() {
  if (!fs.existsSync(CHECKPOINT_FILE)) {
    return null;
  }
  
  try {
    const data = fs.readFileSync(CHECKPOINT_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error loading checkpoint:', error.message);
    return null;
  }
}

/**
 * Main classification function
 */
async function classifyQuestions() {
  console.log('='.repeat(60));
  console.log('Question Classification Script');
  console.log('='.repeat(60));
  console.log(`Input:  ${INPUT_FILE}`);
  console.log(`Output: ${OUTPUT_FILE}`);
  if (SAMPLE_SIZE) console.log(`Sample: ${SAMPLE_SIZE} questions`);
  if (RESUME) console.log('Mode:   Resume from checkpoint');
  console.log('='.repeat(60));
  console.log();
  
  // Load questions
  console.log('Loading questions...');
  let questions;
  let startIndex = 0;
  
  if (RESUME) {
    const checkpoint = loadCheckpoint();
    if (checkpoint) {
      questions = checkpoint.questions;
      startIndex = checkpoint.lastIndex + 1;
      console.log(`✓ Resumed from checkpoint (question ${startIndex + 1})\n`);
    } else {
      console.log('⚠ No checkpoint found, starting from beginning\n');
      questions = JSON.parse(fs.readFileSync(INPUT_FILE, 'utf8'));
    }
  } else {
    questions = JSON.parse(fs.readFileSync(INPUT_FILE, 'utf8'));
  }
  
  const totalQuestions = SAMPLE_SIZE ? Math.min(parseInt(SAMPLE_SIZE), questions.length) : questions.length;
  console.log(`✓ Loaded ${questions.length} questions`);
  console.log(`  Processing ${totalQuestions} questions\n`);
  
  // Initialize classifier
  const model = await initializeClassifier();
  
  // Process questions
  console.log('Classifying questions...');
  console.log('This will take a while. Progress is saved every 10 questions.\n');
  
  const startTime = Date.now();
  let processed = startIndex;
  
  for (let i = startIndex; i < totalQuestions; i++) {
    const question = questions[i];
    
    // Skip if already tagged and not forcing
    if (question.tags && question.tags.length > 0 && !FORCE) {
      processed++;
      continue;
    }
    
    // Classify
    const tags = await classifyQuestion(question, model, true);
    question.tags = tags;
    
    processed++;
    
    // Progress update
    if (processed % 10 === 0) {
      const elapsed = (Date.now() - startTime) / 1000;
      const rate = processed / elapsed;
      const remaining = (totalQuestions - processed) / rate;
      
      console.log(`Progress: ${processed}/${totalQuestions} (${((processed/totalQuestions)*100).toFixed(1)}%)`);
      console.log(`  Rate: ${rate.toFixed(2)} questions/sec`);
      console.log(`  Estimated time remaining: ${Math.ceil(remaining / 60)} minutes`);
      console.log(`  Last tags: [${tags.join(', ')}]\n`);
      
      // Save checkpoint
      saveCheckpoint(questions, i);
    }
  }
  
  // Save final output
  console.log('\nSaving classified questions...');
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(questions, null, 2));
  console.log(`✓ Saved to ${OUTPUT_FILE}\n`);
  
  // Clean up checkpoint
  if (fs.existsSync(CHECKPOINT_FILE)) {
    fs.unlinkSync(CHECKPOINT_FILE);
    console.log('✓ Checkpoint cleaned up\n');
  }
  
  // Statistics
  const totalTime = (Date.now() - startTime) / 1000;
  const tagCounts = {};
  let questionsWithTags = 0;
  
  questions.slice(0, totalQuestions).forEach(q => {
    if (q.tags && q.tags.length > 0) {
      questionsWithTags++;
      q.tags.forEach(tag => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    }
  });
  
  console.log('='.repeat(60));
  console.log('Classification Complete!');
  console.log('='.repeat(60));
  console.log(`Total time: ${Math.ceil(totalTime / 60)} minutes`);
  console.log(`Questions processed: ${processed}`);
  console.log(`Questions with tags: ${questionsWithTags} (${((questionsWithTags/processed)*100).toFixed(1)}%)`);
  console.log(`Average tags per question: ${(Object.values(tagCounts).reduce((a,b) => a+b, 0) / questionsWithTags).toFixed(2)}`);
  console.log('\nTop tags:');
  
  Object.entries(tagCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15)
    .forEach(([tag, count]) => {
      console.log(`  ${tag.padEnd(25)} ${count.toString().padStart(5)} (${((count/questionsWithTags)*100).toFixed(1)}%)`);
    });
  
  console.log('\n✓ Done! You can now use the tagged questions in your app.');
  console.log('\nNext steps:');
  console.log('  1. Review the output file to verify tags');
  console.log('  2. Run for HS questions: node scripts/classify-questions.js --input src/hs-questions.json --output src/hs-questions-tagged.json');
  console.log('  3. Update your app to use the tagged files');
  console.log('='.repeat(60));
}

// Run the script
classifyQuestions().catch(error => {
  console.error('\n❌ Error:', error.message);
  console.error(error.stack);
  process.exit(1);
});
