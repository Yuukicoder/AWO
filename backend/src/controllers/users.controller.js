import {register} from "../service/auth.service.js"
import workloadService from "../service/workload.service.js";
import User from "../models/users.model.js";

export const  registerController = async (req, res) =>{
    const {name,email, password, role} = req.body;
    
    try {
       
      const user = await register({name,email, password, role});
      res.status(200).json({message: "Register Success!",data: user})
    } catch (error) {
        res.status(400).json({message: error.message});
    }
}

/**
 * Get all users
 * GET /api/users
 */
export const getAllUsersController = async (req, res) => {
    try {
        const users = await User.find(
            { isDeleted: false },
            { password: 0, refreshToken: 0 }
        ).sort({ createdAt: -1 });
        
        res.status(200).json({
            success: true,
            data: users
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to get users",
            error: error.message
        });
    }
};

/**
 * Get user by ID
 * GET /api/users/:id
 */
export const getUserByIdController = async (req, res) => {
    const { id } = req.params;
    
    try {
        const user = await User.findById(id, { password: 0, refreshToken: 0 });
        
        if (!user || user.isDeleted) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }
        
        res.status(200).json({
            success: true,
            data: user
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to get user",
            error: error.message
        });
    }
};

/**
 * Get user workload metrics
 * GET /api/users/:id/workload
 */
export const getWorkloadController = async (req, res) => {
    const { id: userId } = req.params;
    
    try {
        const workload = await workloadService.calculateUserWorkload(userId);
        res.status(200).json({
            message: "Workload calculated successfully",
            data: workload
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to calculate workload",
            error: error.message
        });
    }
};

/**
 * Get team workload overview
 * POST /api/users/team/workload
 * Body: { teamMemberIds: [...] }
 */
export const getTeamWorkloadController = async (req, res) => {
    const { teamMemberIds } = req.body;
    
    if (!Array.isArray(teamMemberIds) || teamMemberIds.length === 0) {
        return res.status(400).json({
            message: "teamMemberIds must be a non-empty array"
        });
    }
    
    try {
        const teamWorkload = await workloadService.getTeamWorkload(teamMemberIds);
        res.status(200).json({
            message: "Team workload calculated successfully",
            data: teamWorkload
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to calculate team workload",
            error: error.message
        });
    }
};