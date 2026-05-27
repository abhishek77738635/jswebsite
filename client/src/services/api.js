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
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong');
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
} = apiService;