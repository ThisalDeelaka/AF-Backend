// __tests__/unit/notificationController.unit.test.js
const notificationController = require('../../controllers/notificationController');
const Notification = require('../../models/Notification');

// Mock dependencies
jest.mock('../../models/Notification');

describe('Notification Controller - Create Notification', () => {
  it('should create a new notification and return it', async () => {
    const req = {
      body: {
        message: 'You have a new message!',
        type: 'alert',
      },
      user: { id: 'user123' },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    const fakeNotification = {
      _id: '1',
      userId: 'user123',
      message: 'You have a new message!',
      type: 'alert',
      save: jest.fn().mockResolvedValueOnce(true), // Mock save to resolve successfully
    };

    // Mocking Notification constructor to return the fakeNotification instance with save method
    Notification.mockImplementationOnce(() => fakeNotification);

    await notificationController.createNotification(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(fakeNotification);
  });

  it('should return error if message or type is missing', async () => {
    const req = {
      body: {
        message: '', // Empty message
        type: 'alert',
      },
      user: { id: 'user123' },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await notificationController.createNotification(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'Message and type are required' });
  });

  it('should return error if notification creation fails', async () => {
    const req = {
      body: {
        message: 'You have a new message!',
        type: 'alert',
      },
      user: { id: 'user123' },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    const errorMessage = 'Notification creation failed';
    // Mock the save method to reject with an error
    const fakeNotification = {
      save: jest.fn().mockRejectedValueOnce(new Error(errorMessage)),
    };
    Notification.mockImplementationOnce(() => fakeNotification);

    await notificationController.createNotification(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: errorMessage });
  });
});

describe('Notification Controller - Get Notifications', () => {
//   it('should return all notifications for a user', async () => {
//     const req = {
//       user: { id: 'user123' },
//     };
//     const res = {
//       json: jest.fn(),
//     };

//     const fakeNotifications = [
//       { _id: '1', userId: 'user123', message: 'You have a new message!', type: 'alert' },
//       { _id: '2', userId: 'user123', message: 'Your goal is achieved', type: 'reminder' },
//     ];

//     Notification.find.mockResolvedValueOnce(fakeNotifications);

//     await notificationController.getNotifications(req, res);

//     expect(res.json).toHaveBeenCalledWith(fakeNotifications);
//   });

  it('should return error if fetching notifications fails', async () => {
    const req = {
      user: { id: 'user123' },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    const errorMessage = 'Fetching notifications failed';
    Notification.find.mockRejectedValueOnce(new Error(errorMessage));

    await notificationController.getNotifications(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: errorMessage });
  });
});

describe('Notification Controller - Mark as Read', () => {
  it('should mark a notification as read and return it', async () => {
    const req = {
      params: { notificationId: '1' },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    const fakeNotification = {
      _id: '1',
      userId: 'user123',
      message: 'You have a new message!',
      type: 'alert',
      isRead: false,
      save: jest.fn().mockResolvedValueOnce(true), 
    };

    Notification.findById.mockResolvedValueOnce(fakeNotification);

    await notificationController.markAsRead(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(fakeNotification);
    expect(fakeNotification.isRead).toBe(true); 
  });

  it('should return error if notification is not found', async () => {
    const req = {
      params: { notificationId: 'nonexistent' },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    Notification.findById.mockResolvedValueOnce(null); 

    await notificationController.markAsRead(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'Notification not found' });
  });

  it('should handle errors during marking as read', async () => {
    const req = {
      params: { notificationId: '1' },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    Notification.findById.mockRejectedValueOnce(new Error('Error fetching notification'));

    await notificationController.markAsRead(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: 'Error fetching notification' });
  });
});

describe('Notification Controller - Delete Notification', () => {
  it('should delete a notification and return a success message', async () => {
    const req = {
      params: { notificationId: '1' },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    const fakeNotification = {
      _id: '1',
      userId: 'user123',
      message: 'You have a new message!',
      type: 'alert',
    };

    Notification.findByIdAndDelete.mockResolvedValueOnce(fakeNotification);

    await notificationController.deleteNotification(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: 'Notification deleted' });
  });

  it('should return error if notification is not found for deletion', async () => {
    const req = {
      params: { notificationId: 'nonexistent' },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    Notification.findByIdAndDelete.mockResolvedValueOnce(null); 

    await notificationController.deleteNotification(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'Notification not found' });
  });

  it('should handle errors during deletion', async () => {
    const req = {
      params: { notificationId: '1' },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    Notification.findByIdAndDelete.mockRejectedValueOnce(new Error('Error deleting notification'));

    await notificationController.deleteNotification(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: 'Error deleting notification' });
  });
});
