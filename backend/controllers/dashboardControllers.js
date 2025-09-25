// controllers/dashboardController.js
import Campaign from '../models/campaignModel.js';
import Application from '../models/applicationModel.js';

// @desc    Get statistics for the logged-in user's dashboard
// @route   GET /api/dashboard/stats
// @access  Private
export const getDashboardStats = async (req, res) => {
    try {
        const userId = req.user._id;
        const userRole = req.user.role;

        let stats = {};

        // Logic for Ad Agents
        if (userRole === 'AD_AGENT') {
            const activeCampaigns = await Campaign.countDocuments({ createdBy: userId, status: 'Ativa' });
            const campaignIds = await Campaign.find({ createdBy: userId }).distinct('_id');
            const totalApplications = await Application.countDocuments({ campaign: { $in: campaignIds } });
            
            stats = {
                stat1: activeCampaigns,
                stat2: "R$ 431k", // Placeholder for total sales
                stat3: totalApplications,
                stat4: "1.32M"   // Placeholder for click conversion
            };
        }
        // You can add 'else if' blocks here for other roles (INFLUENCER, etc.)

        res.status(200).json(stats);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching dashboard stats', error: error.message });
    }
};