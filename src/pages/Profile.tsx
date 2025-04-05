
import React from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { ProfileDocuments } from "@/components/profile/ProfileDocuments";
import { ProfileInfo } from "@/components/profile/ProfileInfo";
import { useProfile } from "@/hooks/useProfile";

const Profile = () => {
  const { profile, userEmail, isLoading } = useProfile();

  return (
    <DashboardLayout>
      <div className="container">
        <h1 className="text-2xl font-bold mb-6">Meu Perfil</h1>
        
        <div className="grid gap-6 md:grid-cols-7">
          <div className="col-span-3">
            {isLoading ? (
              <div className="text-center py-8">Carregando perfil...</div>
            ) : (
              <ProfileInfo 
                profile={profile} 
                userEmail={userEmail} 
                isLoading={isLoading} 
              />
            )}
          </div>
          
          <div className="md:col-span-4">
            <ProfileDocuments />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Profile;
