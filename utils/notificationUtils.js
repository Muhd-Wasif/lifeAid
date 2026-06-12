export const isNotificationVisibleForUser = (notification, userProfile = {}) => {
  if (!notification?.message?.trim()) {
    return false;
  }

  if (userProfile?.isAdmin) {
    return true;
  }

  const userUid = userProfile?.uid;
  const userBloodGroup = userProfile?.bloodGroup;

  if (notification.donorUid && userUid && notification.donorUid === userUid) {
    return true;
  }

  if (notification.bloodGroup) {
    return Boolean(userBloodGroup && notification.bloodGroup === userBloodGroup);
  }

  return true;
};

export const sortNotifications = (notifications) => (
  [...notifications].sort((a, b) => {
    if (a.requestId && !b.requestId) return -1;
    if (!a.requestId && b.requestId) return 1;
    return (b.timestamp || 0) - (a.timestamp || 0);
  })
);
