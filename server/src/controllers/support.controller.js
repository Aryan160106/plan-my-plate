import SupportTicket from '../models/SupportTicket.js';

// @route  GET /api/support/my
export async function myTickets(req, res) {
  const tickets = await SupportTicket.find({ user: req.user._id }).sort('-createdAt').lean();
  res.json({ tickets });
}

// @route  POST /api/support
export async function createTicket(req, res) {
  const { type, subject, message } = req.body;

  if (!type || !subject || !message) {
    return res.status(400).json({ message: 'type, subject and message are required' });
  }

  const ticket = await SupportTicket.create({ user: req.user._id, type, subject, message });
  res.status(201).json({ ticket });
}
