// In-memory data store (replace with database in production)
let dataStore = [
  { id: '1', name: 'Sample Data 1', value: 100, description: 'First sample', createdAt: new Date() },
  { id: '2', name: 'Sample Data 2', value: 200, description: 'Second sample', createdAt: new Date() }
];

class DataModel {
  static async findAll() {
    return dataStore;
  }

  static async findById(id) {
    return dataStore.find(item => item.id === id);
  }

  static async create(data) {
    const newItem = {
      id: String(Date.now()),
      ...data,
      createdAt: new Date()
    };
    dataStore.push(newItem);
    return newItem;
  }

  static async update(id, updates) {
    const index = dataStore.findIndex(item => item.id === id);
    if (index === -1) return null;

    dataStore[index] = {
      ...dataStore[index],
      ...updates,
      updatedAt: new Date()
    };
    return dataStore[index];
  }

  static async delete(id) {
    const index = dataStore.findIndex(item => item.id === id);
    if (index === -1) return false;

    dataStore.splice(index, 1);
    return true;
  }
}

module.exports = DataModel;
