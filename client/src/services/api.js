import { auth } from '../config/firebase';
import { getApiBaseUrl } from '../config/apiBase';

const BASE_URL = getApiBaseUrl();

class ApiService {
  async request(endpoint, options = {}) {
    const url = `${BASE_URL}${endpoint}`;
    
    let token = null;
    if (auth.currentUser) {
      token = await auth.currentUser.getIdToken();
    }

    const config = {
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const contentType = response.headers.get('content-type') || '';
      const rawBody = await response.text();
      const isJson = contentType.includes('application/json');

      let data = null;
      if (rawBody) {
        if (isJson) {
          data = JSON.parse(rawBody);
        } else {
          try {
            data = JSON.parse(rawBody);
          } catch (_error) {
            data = null;
          }
        }
      }
      
      if (!response.ok) {
        const fallbackMessage = rawBody
          ? rawBody.slice(0, 140)
          : `${response.status} ${response.statusText}`;
        throw new Error(data?.message || fallbackMessage || 'Something went wrong');
      }

      if (!isJson && data == null) {
        throw new Error(
          `API returned non-JSON response from ${url}. Check API base URL or deployment routing.`,
        );
      }
      
      return data;
    } catch (error) {
      console.error(`API Error (${endpoint}):`, error);
      throw error;
    }
  }

  // Questions API
  async getQuestions(params = {}) {
    const searchParams = new URLSearchParams();
    
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
        searchParams.append(key, params[key]);
      }
    });

    const queryString = searchParams.toString();
    const endpoint = `/questions${queryString ? `?${queryString}` : ''}`;
    
    return this.request(endpoint);
  }

  async getQuestion(id) {
    return this.request(`/questions/${id}`);
  }

  async createQuestion(questionData) {
    return this.request('/questions', {
      method: 'POST',
      body: JSON.stringify(questionData),
    });
  }

  async updateQuestion(id, questionData) {
    return this.request(`/questions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(questionData),
    });
  }

  async deleteQuestion(id) {
    return this.request(`/questions/${id}`, {
      method: 'DELETE',
    });
  }

  async getQuestionStats() {
    return this.request('/questions/stats/summary');
  }

  // Categories API
  async getCategories() {
    return this.request('/categories');
  }

  async getCategoryList() {
    return this.request('/categories/list');
  }

  async getDifficulties() {
    return this.request('/categories/difficulties');
  }

  async createCategory(categoryData) {
    return this.request('/categories', {
      method: 'POST',
      body: JSON.stringify(categoryData),
    });
  }

  // Seed API (for development)
  async seedDatabase() {
    return this.request('/seed/all', {
      method: 'POST',
    });
  }

  async getDatabaseStatus() {
    return this.request('/seed/status');
  }

  /** Admin: merge packaged bulk JSON (Firestore) — requires signed-in admin user. */
  async mergePackagedBulkQuestions(payload = {}) {
    return this.request('/seed/merge-packaged-bulk', {
      method: 'POST',
      body: JSON.stringify(payload || {}),
    });
  }

  // Payment API
  async createPaymentOrder() {
    return this.request('/payment/create-order', { method: 'POST' });
  }

  async verifyPayment(order_id) {
    return this.request('/payment/verify', { 
      method: 'POST',
      body: JSON.stringify({ order_id })
    });
  }

  async getUserAccess() {
    return this.request('/user/access');
  }

  async getUserProfile() {
    return this.request('/user/profile');
  }

  async updateUserProfile(payload = {}) {
    return this.request('/user/profile', {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  }

  // User progress/bookmarks/daily challenge
  async getQuestionStates(questionIds = []) {
    const ids = Array.isArray(questionIds) ? questionIds.filter((id) => id != null) : [];
    const endpoint = ids.length ? `/user/states?ids=${ids.join(',')}` : '/user/states';
    return this.request(endpoint);
  }

  async updateQuestionState(questionId, payload = {}) {
    return this.request(`/user/questions/${questionId}/state`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  }

  async getBookmarks() {
    return this.request('/user/bookmarks');
  }

  async getProgressDashboard() {
    return this.request('/user/dashboard');
  }

  async getDailyChallenge() {
    return this.request('/user/daily-challenge');
  }

  async submitDailyChallenge(questionId) {
    return this.request('/user/daily-challenge/submit', {
      method: 'POST',
      body: JSON.stringify({ questionId }),
    });
  }
}

// Create singleton instance
const apiService = new ApiService();

export default apiService;

// Export individual methods for convenience
export const {
  getQuestions,
  getQuestion,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  getQuestionStats,
  getCategories,
  getCategoryList,
  getDifficulties,
  createCategory,
  seedDatabase,
  getDatabaseStatus,
  mergePackagedBulkQuestions,
  createPaymentOrder,
  verifyPayment,
  getQuestionStates,
  updateQuestionState,
  getBookmarks,
  getProgressDashboard,
  getDailyChallenge,
  submitDailyChallenge,
} = apiService;