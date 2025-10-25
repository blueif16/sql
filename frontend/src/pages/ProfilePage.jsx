import React from 'react';
import ProfilePageComponent from '../components/ProfilePage';

const ProfilePage = ({ user }) => { // Profile page wrapper
  return <ProfilePageComponent user={user} />;
};

export default ProfilePage;

