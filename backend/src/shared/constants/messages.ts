// src/shared/constants/messages.ts
export const Messages = {
  // Auth
  AUTH: {
    LOGIN_SUCCESS: 'Login successful',
    LOGOUT_SUCCESS: 'Logout successful',
    REGISTER_SUCCESS: 'Registration successful',
    OTP_SENT: 'OTP sent successfully',
    OTP_VERIFIED: 'OTP verified successfully',
    TOKEN_REFRESHED: 'Token refreshed successfully',
    PASSWORD_RESET: 'Password reset successful',
    INVALID_CREDENTIALS: 'Invalid email/phone or password',
    INVALID_OTP: 'Invalid or expired OTP',
    UNAUTHORIZED: 'Please authenticate to access this resource',
    FORBIDDEN: 'You do not have permission to perform this action',
    ACCOUNT_DISABLED: 'Your account has been disabled',
    TOKEN_EXPIRED: 'Token has expired',
    TOKEN_INVALID: 'Invalid token',
  },

  // Users
  USERS: {
    CREATED: 'User created successfully',
    UPDATED: 'User updated successfully',
    DELETED: 'User deleted successfully',
    NOT_FOUND: 'User not found',
    ALREADY_EXISTS: 'User already exists with this email or phone',
    PROFILE_UPDATED: 'Profile updated successfully',
    ADDRESS_ADDED: 'Address added successfully',
    ADDRESS_UPDATED: 'Address updated successfully',
    ADDRESS_DELETED: 'Address deleted successfully',
  },

  // Products
  PRODUCTS: {
    CREATED: 'Product created successfully',
    UPDATED: 'Product updated successfully',
    DELETED: 'Product deleted successfully',
    NOT_FOUND: 'Product not found',
    OUT_OF_STOCK: 'Product is out of stock',
  },

  // Cart
  CART: {
    ITEM_ADDED: 'Item added to cart',
    ITEM_REMOVED: 'Item removed from cart',
    ITEM_UPDATED: 'Cart item updated',
    CART_CLEARED: 'Cart cleared',
    CART_MERGED: 'Cart merged successfully',
  },

  // Orders
  ORDERS: {
    CREATED: 'Order placed successfully',
    UPDATED: 'Order updated successfully',
    CANCELLED: 'Order cancelled successfully',
    NOT_FOUND: 'Order not found',
    PAYMENT_FAILED: 'Payment failed',
    INVALID_STATUS: 'Invalid order status transition',
  },

  // Reviews
  REVIEWS: {
    CREATED: 'Review submitted successfully',
    UPDATED: 'Review updated successfully',
    DELETED: 'Review deleted successfully',
    NOT_FOUND: 'Review not found',
  },

  // Generic
  GENERIC: {
    SUCCESS: 'Success',
    ERROR: 'An error occurred',
    NOT_FOUND: 'Resource not found',
    VALIDATION_ERROR: 'Validation failed',
    INTERNAL_ERROR: 'Internal server error',
    TOO_MANY_REQUESTS: 'Too many requests, please try again later',
  },
};