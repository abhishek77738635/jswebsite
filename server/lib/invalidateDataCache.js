const { invalidateQuestions } = require('../data/questionsCache');
const { invalidateCategories } = require('../data/categoriesCache');

async function invalidateAfterQuestionsWrite() {
  await invalidateQuestions();
}

async function invalidateAfterCategoriesWrite() {
  await invalidateCategories();
}

async function invalidateAfterBulkSeed() {
  await invalidateQuestions();
  await invalidateCategories();
}

module.exports = {
  invalidateAfterQuestionsWrite,
  invalidateAfterCategoriesWrite,
  invalidateAfterBulkSeed,
};
