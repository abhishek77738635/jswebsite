import { BEGINNER_TOPICS } from './beginnerTopics';
import { INTERMEDIATE_TOPICS } from './intermediateTopics';
import { ADVANCED_TOPICS } from './advancedTopics';
import { getMcqsForTopic } from './mcqs';

const ALL_TOPICS = [...BEGINNER_TOPICS, ...INTERMEDIATE_TOPICS, ...ADVANCED_TOPICS];

export const JS_THEORY_TOPICS = ALL_TOPICS.map((topic) => ({
  ...topic,
  mcqs: getMcqsForTopic(topic.id),
}));

export const LEARN_BRAND = {
  title: 'JS Forge',
  tagline: 'Forge your JavaScript from zero to runtime hero',
};

export { BEGINNER_TOPICS, INTERMEDIATE_TOPICS, ADVANCED_TOPICS, getMcqsForTopic };
