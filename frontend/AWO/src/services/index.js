/**
 * Services Index
 * Export tất cả các services để dễ dàng import
 */

export { authService } from './auth.service';
export { userService } from './user.service';

// Export default object chứa tất cả services
export default {
    auth: require('./auth.service').authService,
    user: require('./user.service').userService
};
