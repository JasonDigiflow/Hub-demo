// Mock Firebase Admin for Vercel deployment
// This is a simplified version that works without Firebase Admin SDK

class MockFirebaseAdmin {
  constructor() {
    this.collections = new Map();
  }

  collection(name) {
    if (!this.collections.has(name)) {
      this.collections.set(name, new MockCollection(name));
    }
    return this.collections.get(name);
  }

  batch() {
    return new MockBatch();
  }
}

class MockCollection {
  constructor(name) {
    this.name = name;
    this.documents = new Map();
  }

  doc(id) {
    if (!id) {
      // Generate a random ID
      id = 'doc_' + Math.random().toString(36).substr(2, 9);
    }
    return new MockDocument(this, id);
  }

  where(field, operator, value) {
    // Return a mock query
    return new MockQuery(this, field, operator, value);
  }

  async add(data) {
    const id = 'doc_' + Math.random().toString(36).substr(2, 9);
    this.documents.set(id, data);
    return { id };
  }
}

class MockDocument {
  constructor(collection, id) {
    this.collection = collection;
    this.id = id;
  }

  async get() {
    const data = this.collection.documents.get(this.id);
    return {
      exists: !!data,
      data: () => data,
      id: this.id
    };
  }

  async set(data) {
    this.collection.documents.set(this.id, data);
    return this;
  }

  async update(data) {
    const existing = this.collection.documents.get(this.id) || {};
    this.collection.documents.set(this.id, { ...existing, ...data });
    return this;
  }

  async delete() {
    this.collection.documents.delete(this.id);
    return this;
  }
}

class MockQuery {
  constructor(collection, field, operator, value) {
    this.collection = collection;
    this.field = field;
    this.operator = operator;
    this.value = value;
    this.filters = [{ field, operator, value }];
  }

  where(field, operator, value) {
    this.filters.push({ field, operator, value });
    return this;
  }

  orderBy(field, direction = 'asc') {
    this.orderByField = field;
    this.orderByDirection = direction;
    return this;
  }

  limit(n) {
    this.limitValue = n;
    return this;
  }

  async get() {
    // Return empty snapshot for mock
    return {
      empty: true,
      size: 0,
      docs: [],
      forEach: (callback) => {}
    };
  }
}

class MockBatch {
  constructor() {
    this.operations = [];
  }

  set(doc, data) {
    this.operations.push({ type: 'set', doc, data });
    return this;
  }

  update(doc, data) {
    this.operations.push({ type: 'update', doc, data });
    return this;
  }

  delete(doc) {
    this.operations.push({ type: 'delete', doc });
    return this;
  }

  async commit() {
    // Process all operations
    for (const op of this.operations) {
      if (op.type === 'set') {
        await op.doc.set(op.data);
      } else if (op.type === 'update') {
        await op.doc.update(op.data);
      } else if (op.type === 'delete') {
        await op.doc.delete();
      }
    }
    return true;
  }
}

// Export a mock instance
const db = new MockFirebaseAdmin();

export { db };