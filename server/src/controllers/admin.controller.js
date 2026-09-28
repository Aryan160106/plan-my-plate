import User from '../models/User.js';
import Meal from '../models/Meal.js';
import SupportTicket from '../models/SupportTicket.js';
import MealPlan from '../models/MealPlan.js';

// @route  GET /api/admin/stats
export async function stats(_req, res) {
  const [users, meals, tickets, plans] = await Promise.all([
    User.countDocuments(),
    Meal.countDocuments(),
    SupportTicket.countDocuments(),
    MealPlan.countDocuments(),
  ]);
  const openTickets = await SupportTicket.countDocuments({ status: { $ne: 'Resolved' } });
  res.json({ users, meals, tickets, openTickets, plans });
}

// @route  GET /api/admin/users
export async function listUsers(_req, res) {
  const users = await User.find().sort('-createdAt').lean();
  res.json({ users });
}

// @route  DELETE /api/admin/users/:id
export async function deleteUser(req, res) {
  if (String(req.params.id) === String(req.user._id)) {
    return res.status(400).json({ message: 'You cannot delete your own admin account' });
  }
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: 'User not found' });

  await MealPlan.deleteMany({ user: user._id });
  await user.deleteOne();
  res.json({ message: 'User and their plans deleted' });
}

// @route  POST /api/admin/meals
export async function createMeal(req, res) {
  const meal = await Meal.create({ ...req.body, createdBy: req.user._id });
  res.status(201).json({ meal });
}

// @route  PUT /api/admin/meals/:id
export async function updateMeal(req, res) {
  const meal = await Meal.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!meal) return res.status(404).json({ message: 'Meal not found' });
  res.json({ meal });
}

// @route  DELETE /api/admin/meals/:id
export async function deleteMeal(req, res) {
  const meal = await Meal.findById(req.params.id);
  if (!meal) return res.status(404).json({ message: 'Meal not found' });
  await meal.deleteOne();
  res.json({ message: 'Meal deleted' });
}

// @route  GET /api/admin/tickets
export async function listTickets(_req, res) {
  const tickets = await SupportTicket.find().sort('-createdAt').populate('user', 'name email').lean();
  res.json({ tickets });
}

// @route  PUT /api/admin/tickets/:id
export async function updateTicket(req, res) {
  const { status, adminReply } = req.body;
  const ticket = await SupportTicket.findByIdAndUpdate(
    req.params.id,
    { ...(status && { status }), ...(adminReply !== undefined && { adminReply }) },
    { new: true }
  ).populate('user', 'name email');
  if (!ticket) return res.status(404).json({ message: 'Ticket not found' });
  res.json({ ticket });
}
