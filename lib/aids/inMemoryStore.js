// In-memory store for when Firebase is not available
// This provides persistence during the server lifetime

class InMemoryStore {
  constructor() {
    this.revenues = new Map();
    this.prospects = new Map();
    this.revenueIdCounter = 1;
  }

  // Revenues methods
  async addRevenue(data) {
    const id = `revenue_${Date.now()}_${this.revenueIdCounter++}`;
    const revenue = {
      id,
      ...data,
      createdAt: data.createdAt || new Date().toISOString(),
      updatedAt: data.updatedAt || new Date().toISOString()
    };
    this.revenues.set(id, revenue);
    console.log(`In-memory: Added revenue ${id}`, revenue);
    return id;
  }

  async getRevenue(id) {
    return this.revenues.get(id) || null;
  }

  async updateRevenue(id, data) {
    const revenue = this.revenues.get(id);
    if (!revenue) return false;
    
    const updated = {
      ...revenue,
      ...data,
      updatedAt: new Date().toISOString()
    };
    this.revenues.set(id, updated);
    console.log(`In-memory: Updated revenue ${id}`, updated);
    return true;
  }

  async deleteRevenue(id) {
    const existed = this.revenues.has(id);
    this.revenues.delete(id);
    console.log(`In-memory: Deleted revenue ${id}`);
    return existed;
  }

  async getAllRevenues() {
    const revenues = Array.from(this.revenues.values());
    console.log(`In-memory: Returning ${revenues.length} revenues`);
    return revenues;
  }

  async clearRevenues() {
    const count = this.revenues.size;
    this.revenues.clear();
    console.log(`In-memory: Cleared ${count} revenues`);
    return count;
  }

  // Prospects methods (for reference)
  async updateProspect(orgId, adAccountId, prospectId, data) {
    const key = `${orgId}/${adAccountId}/${prospectId}`;
    const prospect = this.prospects.get(key);
    if (!prospect) return false;
    
    const updated = {
      ...prospect,
      ...data,
      updatedAt: new Date().toISOString()
    };
    this.prospects.set(key, updated);
    return true;
  }

  async getProspect(orgId, adAccountId, prospectId) {
    const key = `${orgId}/${adAccountId}/${prospectId}`;
    return this.prospects.get(key) || null;
  }
}

// Create singleton instance
const store = new InMemoryStore();

export default store;