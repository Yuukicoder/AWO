/**
 * Services Index
 * Export tất cả các services để dễ dàng import
 */

export { authService } from './auth.service';
export { userService } from './user.service';

// Export default object chứa tất cả services
import { authService } from './auth.service';
import { userService } from './user.service';

export default {
    auth: authService,
    user: userService
};
