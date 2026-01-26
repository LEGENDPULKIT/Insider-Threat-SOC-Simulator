const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
//connect to my database which is localhost1217
mongoose.connect(process.env.MONGODB_URI)
.then(() => console.log(' MongoDB connected successfully Let\'s go!'))
.catch(err => console.error('❌ MongoDB connection error:', err));

// ==================== SCHEMAS & MODELS ====================

// Admin Schema - Separate collection for admins
const adminSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: 'admin' },
  permissions: { type: [String], default: ['all'] },
  createdAt: { type: Date, default: Date.now }
});

const Admin = mongoose.model('Admin', adminSchema);

// Employee Schema - Separate collection for employees
const employeeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: 'employee' },
  trustScore: { type: Number, default: 5.0 },
  createdAt: { type: Date, default: Date.now }
});

const Employee = mongoose.model('Employee', employeeSchema);

// Legacy User model for backward compatibility
const User = Employee;

// Item Schema or the structure of the item data
const itemSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  availableFrom: { type: Date, required: true },
  availableUntil: { type: Date, required: true },
  location: { type: String, required: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  ownerName: { type: String },
  ownerEmail: { type: String },
  available: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

const Item = mongoose.model('Item', itemSchema);

// Request Schema
const requestSchema = new mongoose.Schema({
  item: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: true },
  itemName: { type: String, required: true },
  borrower: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  borrowerName: { type: String },
  borrowerEmail: { type: String },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  ownerName: { type: String },
  ownerEmail: { type: String },
  status: { type: String, enum: ['pending', 'approved', 'rejected', 'completed'], default: 'pending' },
  createdAt: { type: Date, default: Date.now }
});

const Request = mongoose.model('Request', requestSchema);

// Message Schema for one one chat system 
const messageSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  senderEmail: { type: String, required: true },
  senderName: { type: String, required: true },
  receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  receiverEmail: { type: String, required: true },
  receiverName: { type: String, required: true },
  text: { type: String, required: true },
  read: { type: Boolean, default: false },
  timestamp: { type: Date, default: Date.now }
});

// Index for faster conversation queries
messageSchema.index({ sender: 1, receiver: 1 });
messageSchema.index({ timestamp: -1 });

const Message = mongoose.model('Message', messageSchema);

// LoginLog Schema - Track all login attempts with security details
const loginLogSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
  email: { type: String, required: true },
  role: { type: String, enum: ['employee', 'admin', 'unknown'], required: true },
  ipAddress: { type: String, required: true },
  userAgent: { type: String },
  browser: { type: String },
  os: { type: String },
  device: { type: String },
  loginTime: { type: Date, default: Date.now },
  loginDate: { type: String },
  success: { type: Boolean, required: true },
  failureReason: { type: String },
  location: { type: String }
});

// Index for faster queries
loginLogSchema.index({ user: 1, loginTime: -1 });
loginLogSchema.index({ email: 1, loginTime: -1 });

const LoginLog = mongoose.model('LoginLog', loginLogSchema);

// ==================== MIDDLEWARE ====================
// main part
// Auth Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// ==================== AUTH ROUTES ====================

// Quick admin creation endpoint (remove in production)
app.post('/api/auth/create-admin', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({ error: 'Admin email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = new Admin({
      name,
      email,
      password: hashedPassword
    });

    await admin.save();

    res.status(201).json({
      message: 'Admin account created successfully',
      user: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: 'admin'
      }
    });
  } catch (error) {
    console.error('Create admin error:', error);
    res.status(500).json({ error: 'Server error during admin creation' });
  }
});

// Register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const userRole = role || 'employee';
    
    // Check in appropriate collection based on role
    if (userRole === 'admin') {
      const existingAdmin = await Admin.findOne({ email });
      if (existingAdmin) {
        return res.status(400).json({ error: 'Email already registered' });
      }
    } else {
      const existingEmployee = await Employee.findOne({ email });
      if (existingEmployee) {
        return res.status(400).json({ error: 'Email already registered' });
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    let user;
    if (userRole === 'admin') {
      user = new Admin({
        name,
        email,
        password: hashedPassword
      });
    } else {
      user = new Employee({
        name,
        email,
        password: hashedPassword
      });
    }

    await user.save();

    const token = jwt.sign(
      { id: user._id, email: user.email, role: userRole },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: userRole,
        trustScore: user.trustScore || 0
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Server error during registration' });
  }
});

// Login with explicit role (admin or employee)
app.post('/api/auth/login', async (req, res) => {
  const ipAddress = req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for'] || 'unknown';
  const userAgent = req.headers['user-agent'] || 'unknown';
  
  try {
    const { email, password, role } = req.body;

    if (!email || !password || !role) {
      return res.status(400).json({ error: 'Email, password, and role are required' });
    }

    // Find user in the collection matching the provided role
    let user;
    if (role === 'admin') {
      user = await Admin.findOne({ email });
    } else {
      user = await Employee.findOne({ email });
    }

    if (!user) {
      // Log failed login attempt
      await LoginLog.create({
        user: undefined,
        email,
        role,
        ipAddress,
        userAgent,
        loginTime: new Date(),
        loginDate: new Date().toLocaleDateString(),
        success: false,
        failureReason: 'Account not found'
      }).catch(err => console.error('Failed to log login attempt:', err));
      
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      // Log failed login attempt - wrong password
      await LoginLog.create({
        user: user._id,
        email,
        role,
        ipAddress,
        userAgent,
        loginTime: new Date(),
        loginDate: new Date().toLocaleDateString(),
        success: false,
        failureReason: 'Invalid password'
      }).catch(err => console.error('Failed to log login attempt:', err));
      
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Parse user agent for more details
    const browser = userAgent.includes('Chrome') ? 'Chrome' : 
                   userAgent.includes('Firefox') ? 'Firefox' : 
                   userAgent.includes('Safari') ? 'Safari' : 
                   userAgent.includes('Edge') ? 'Edge' : 'Unknown';
    
    const os = userAgent.includes('Windows') ? 'Windows' : 
              userAgent.includes('Mac') ? 'MacOS' : 
              userAgent.includes('Linux') ? 'Linux' : 
              userAgent.includes('Android') ? 'Android' : 
              userAgent.includes('iOS') ? 'iOS' : 'Unknown';
    
    const device = userAgent.includes('Mobile') ? 'Mobile' : 'Desktop';

    // Log successful login
    await LoginLog.create({
      user: user._id,
      email,
      role,
      ipAddress,
      userAgent,
      browser,
      os,
      device,
      loginTime: new Date(),
      loginDate: new Date().toLocaleDateString(),
      success: true
    }).catch(err => console.error('Failed to log login attempt:', err));

    const token = jwt.sign(
      { id: user._id, email: user.email, role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role,
        trustScore: user.trustScore || 0
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    
    // Log system error
    await LoginLog.create({
      user: undefined,
      email: req.body.email || 'unknown',
      role: req.body.role || 'unknown',
      ipAddress,
      userAgent,
      loginTime: new Date(),
      loginDate: new Date().toLocaleDateString(),
      success: false,
      failureReason: 'Server error: ' + error.message
    }).catch(err => console.error('Failed to log login attempt:', err));
    
    res.status(500).json({ error: 'Server error during login' });
  }
});

// ==================== ITEM ROUTES ====================

// Get all items
app.get('/api/items', authenticateToken, async (req, res) => {
  try {
    const items = await Item.find()
      .populate('owner', 'name email')
      .sort({ createdAt: -1 });

    const formattedItems = items.map(item => ({
      id: item._id,
      title: item.title,
      description: item.description,
      category: item.category,
      availableFrom: item.availableFrom,
      availableUntil: item.availableUntil,
      location: item.location,
      owner: item.owner.name,
      ownerEmail: item.owner.email,
      ownerId: item.owner._id,
      available: item.available
    }));

    res.json(formattedItems);
  } catch (error) {
    console.error('Get items error:', error);
    res.status(500).json({ error: 'Failed to fetch items' });
  }
});

// Get user's own listings
app.get('/api/items/my-listings', authenticateToken, async (req, res) => {
  try {
    const items = await Item.find({ owner: req.user.id }).sort({ createdAt: -1 });

    const formattedItems = items.map(item => ({
      id: item._id,
      title: item.title,
      description: item.description,
      category: item.category,
      availableFrom: item.availableFrom,
      availableUntil: item.availableUntil,
      location: item.location,
      available: item.available
    }));

    res.json(formattedItems);
  } catch (error) {
    console.error('Get my listings error:', error);
    res.status(500).json({ error: 'Failed to fetch your listings' });
  }
});

// Create item
app.post('/api/items', authenticateToken, async (req, res) => {
  try {
    const { title, description, category, availableFrom, availableUntil, location } = req.body;

    if (!title || !description || !category || !availableFrom || !availableUntil || !location) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const user = await User.findById(req.user.id);

    const item = new Item({
      title,
      description,
      category,
      availableFrom,
      availableUntil,
      location,
      owner: req.user.id,
      ownerName: user.name,
      ownerEmail: user.email
    });

    await item.save();

    res.status(201).json({
      id: item._id,
      title: item.title,
      description: item.description,
      category: item.category,
      availableFrom: item.availableFrom,
      availableUntil: item.availableUntil,
      location: item.location,
      available: item.available
    });
  } catch (error) {
    console.error('Create item error:', error);
    res.status(500).json({ error: 'Failed to create item' });
  }
});

// Update item
app.put('/api/items/:id', authenticateToken, async (req, res) => {
  try {
    const item = await Item.findOne({ _id: req.params.id, owner: req.user.id });

    if (!item) {
      return res.status(404).json({ error: 'Item not found or unauthorized' });
    }

    const updates = req.body;
    Object.keys(updates).forEach(key => {
      item[key] = updates[key];
    });

    await item.save();

    res.json({
      id: item._id,
      title: item.title,
      description: item.description,
      category: item.category,
      available: item.available
    });
  } catch (error) {
    console.error('Update item error:', error);
    res.status(500).json({ error: 'Failed to update item' });
  }
});

// Delete item
app.delete('/api/items/:id', authenticateToken, async (req, res) => {
  try {
    const item = await Item.findOneAndDelete({ _id: req.params.id, owner: req.user.id });

    if (!item) {
      return res.status(404).json({ error: 'Item not found or unauthorized' });
    }

    res.json({ message: 'Item deleted successfully' });
  } catch (error) {
    console.error('Delete item error:', error);
    res.status(500).json({ error: 'Failed to delete item' });
  }
});

// ==================== REQUEST ROUTES ====================

// Get all requests
app.get('/api/requests', authenticateToken, async (req, res) => {
  try {
    const outgoing = await Request.find({ borrower: req.user.id })
      .populate('item')
      .populate('owner', 'name email')
      .sort({ createdAt: -1 });

    const incoming = await Request.find({ owner: req.user.id })
      .populate('item')
      .populate('borrower', 'name email')
      .sort({ createdAt: -1 });

    const formattedOutgoing = outgoing.map(req => ({
      id: req._id,
      itemName: req.itemName,
      itemId: req.item._id,
      status: req.status,
      owner: req.ownerName,
      ownerEmail: req.ownerEmail,
      ownerId: req.owner._id
    }));

    const formattedIncoming = incoming.map(req => ({
      id: req._id,
      itemName: req.itemName,
      itemId: req.item._id,
      status: req.status,
      borrower: req.borrowerName,
      borrowerEmail: req.borrowerEmail,
      borrowerId: req.borrower._id
    }));

    res.json({
      outgoing: formattedOutgoing,
      incoming: formattedIncoming
    });
  } catch (error) {
    console.error('Get requests error:', error);
    res.status(500).json({ error: 'Failed to fetch requests' });
  }
});

// Create request
app.post('/api/requests', authenticateToken, async (req, res) => {
  try {
    const { itemId } = req.body;

    const item = await Item.findById(itemId);
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }

    if (!item.available) {
      return res.status(400).json({ error: 'Item is not available' });
    }

    if (item.owner.toString() === req.user.id) {
      return res.status(400).json({ error: 'Cannot borrow your own item' });
    }

    const borrower = await User.findById(req.user.id);
    const owner = await User.findById(item.owner);

    const request = new Request({
      item: itemId,
      itemName: item.title,
      borrower: req.user.id,
      borrowerName: borrower.name,
      borrowerEmail: borrower.email,
      owner: item.owner,
      ownerName: owner.name,
      ownerEmail: owner.email
    });

    await request.save();

    res.status(201).json({
      id: request._id,
      itemName: request.itemName,
      status: request.status
    });
  } catch (error) {
    console.error('Create request error:', error);
    res.status(500).json({ error: 'Failed to create request' });
  }
});

// Update request
app.put('/api/requests/:id', authenticateToken, async (req, res) => {
  try {
    const { status } = req.body;

    if (!['approved', 'rejected', 'completed'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const request = await Request.findOne({ _id: req.params.id, owner: req.user.id });

    if (!request) {
      return res.status(404).json({ error: 'Request not found or unauthorized' });
    }

    request.status = status;

    if (status === 'approved') {
      await Item.findByIdAndUpdate(request.item, { available: false });
    } else if (status === 'rejected' || status === 'completed') {
      await Item.findByIdAndUpdate(request.item, { available: true });
    }

    await request.save();

    res.json({
      id: request._id,
      status: request.status
    });
  } catch (error) {
    console.error('Update request error:', error);
    res.status(500).json({ error: 'Failed to update request' });
  }
});

// ==================== MESSAGE ROUTES (ONE-ON-ONE CHAT) ====================

// Get list of conversations (unique users you've chatted with)
app.get('/api/messages/conversations', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    // Get all messages where user is sender or receiver
    const messages = await Message.find({
      $or: [{ sender: userId }, { receiver: userId }]
    })
    .populate('sender', 'name email')
    .populate('receiver', 'name email')
    .sort({ timestamp: -1 });

    // Create a map of unique conversations
    const conversationsMap = new Map();

    messages.forEach(msg => {
      const otherUser = msg.sender._id.toString() === userId 
        ? msg.receiver 
        : msg.sender;
      
      const otherUserId = otherUser._id.toString();

      if (!conversationsMap.has(otherUserId)) {
        conversationsMap.set(otherUserId, {
          userId: otherUser._id,
          name: otherUser.name,
          email: otherUser.email,
          lastMessage: msg.text,
          lastMessageTime: msg.timestamp,
          unread: !msg.read && msg.receiver._id.toString() === userId
        });
      }
    });

    const conversations = Array.from(conversationsMap.values());

    res.json(conversations);
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ error: 'Failed to fetch conversations' });
  }
});

// Get messages with a specific user
app.get('/api/messages/:userEmail', authenticateToken, async (req, res) => {
  try {
    const currentUserId = req.user.id;
    const otherUserEmail = req.params.userEmail;

    // Find the other user
    const otherUser = await User.findOne({ email: otherUserEmail });
    if (!otherUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get all messages between these two users
    const messages = await Message.find({
      $or: [
        { sender: currentUserId, receiver: otherUser._id },
        { sender: otherUser._id, receiver: currentUserId }
      ]
    })
    .sort({ timestamp: 1 });

    // Mark messages as read
    await Message.updateMany(
      { sender: otherUser._id, receiver: currentUserId, read: false },
      { read: true }
    );

    const formattedMessages = messages.map(msg => ({
      id: msg._id,
      text: msg.text,
      sender: msg.sender.toString() === currentUserId ? 'You' : msg.senderName,
      senderEmail: msg.senderEmail,
      timestamp: new Date(msg.timestamp).toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
      }),
      isMine: msg.sender.toString() === currentUserId
    }));

    res.json({
      otherUser: {
        id: otherUser._id,
        name: otherUser.name,
        email: otherUser.email
      },
      messages: formattedMessages
    });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// Send message
app.post('/api/messages', authenticateToken, async (req, res) => {
  try {
    const { receiverEmail, text } = req.body;

    if (!receiverEmail || !text) {
      return res.status(400).json({ error: 'Receiver email and message text are required' });
    }

    const sender = await User.findById(req.user.id);
    const receiver = await User.findOne({ email: receiverEmail });

    if (!receiver) {
      return res.status(404).json({ error: 'Receiver not found' });
    }

    if (receiver._id.toString() === req.user.id) {
      return res.status(400).json({ error: 'Cannot send message to yourself' });
    }

    const message = new Message({
      sender: req.user.id,
      senderEmail: sender.email,
      senderName: sender.name,
      receiver: receiver._id,
      receiverEmail: receiver.email,
      receiverName: receiver.name,
      text
    });

    await message.save();

    res.status(201).json({
      id: message._id,
      text: message.text,
      sender: 'You',
      timestamp: new Date(message.timestamp).toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
      }),
      isMine: true
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// Search users by email (for starting new conversations)
app.get('/api/users/search', authenticateToken, async (req, res) => {
  try {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({ error: 'Email query parameter is required' });
    }

    const users = await User.find({
      email: { $regex: email, $options: 'i' },
      _id: { $ne: req.user.id } // Exclude current user
    })
    .select('name email')
    .limit(10);

    res.json(users);
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({ error: 'Failed to search users' });
  }
});

// ==================== USER ROUTES ====================

// Get user profile
app.get('/api/users/:id', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      trustScore: user.trustScore
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// Update user profile
app.put('/api/users/:id', authenticateToken, async (req, res) => {
  try {
    if (req.params.id !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized to update this profile' });
    }

    const { name, email, password } = req.body;
    const user = await User.findById(req.user.id);

    if (name) user.name = name;
    if (email) user.email = email;
    if (password) {
      user.password = await bcrypt.hash(password, 10);
    }

    await user.save();

    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      trustScore: user.trustScore
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});
// ==================== STATS ROUTE ====================

// Get dashboard statistics
app.get('/api/stats', authenticateToken, async (req, res) => {
  try {
    // Count active items (available = true)
    const activeItems = await Item.countDocuments({ available: true });

    // Count total unique users (active users)
    const activeUsers = await User.countDocuments();

    // Count successful shares (completed requests)
    const successfulShares = await Request.countDocuments({ status: 'completed' });

    res.json({
      activeItems,
      activeUsers,
      successfulShares
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

// ==================== LOGIN LOGS ROUTE ====================

// Get login logs for a user (for security monitoring)
app.get('/api/login-logs', authenticateToken, async (req, res) => {
  try {
    const logs = await LoginLog.find({ user: req.user.id })
      .sort({ loginTime: -1 })
      .limit(50);

    res.json(logs);
  } catch (error) {
    console.error('Get login logs error:', error);
    res.status(500).json({ error: 'Failed to fetch login logs' });
  }
});

// Get all login logs (admin only - to be implemented with role check)
app.get('/api/login-logs/all', authenticateToken, async (req, res) => {
  try {
    // Check if user is admin
    const user = await User.findById(req.user.id);
    if (user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { page = 1, limit = 50 } = req.query;
    const logs = await LoginLog.find()
      .sort({ loginTime: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await LoginLog.countDocuments();

    res.json({
      logs,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count
    });
  } catch (error) {
    console.error('Get all login logs error:', error);
    res.status(500).json({ error: 'Failed to fetch login logs' });
  }
});

// ==================== HEALTH CHECK ====================

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📡 API endpoints available at http://localhost:${PORT}/api`);
  console.log(`💬 One-on-one chat system enabled`);
});