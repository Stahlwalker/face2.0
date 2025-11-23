// Simple database utility for storing user data
// For production, replace this with a real database like PostgreSQL (Supabase/Neon)

const users = new Map();

const db = {
  // Find user by email
  getUserByEmail: (email) => {
    for (let user of users.values()) {
      if (user.email === email) {
        return user;
      }
    }
    return null;
  },

  // Find user by ID
  getUserById: (id) => {
    return users.get(id) || null;
  },

  // Create new user
  createUser: (email, name, hashedPassword) => {
    const id = Date.now().toString();
    const user = {
      id,
      email,
      name,
      password: hashedPassword,
      entries: 0,
      joined: new Date().toISOString()
    };
    users.set(id, user);
    return user;
  },

  // Update user entries count
  incrementEntries: (id) => {
    const user = users.get(id);
    if (user) {
      user.entries += 1;
      return user.entries;
    }
    return null;
  }
};

module.exports = db;
