'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  UserGroupIcon, 
  TrophyIcon, 
  CheckIcon,
  XMarkIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';
import { leaderboardGroupsStorage, leaderboardMembersStorage } from '@/lib/leaderboards';
import { LeaderboardGroup } from '@/lib/types';

interface JoinInvitePageProps {
  params: Promise<{
    token: string;
  }>;
}

export default function JoinInvitePage({ params }: JoinInvitePageProps) {
  const router = useRouter();
  const token = (params as any).token; // TODO: Next.js 15 params Promise handling
  const [group, setGroup] = useState<LeaderboardGroup | null>(null);
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState('');
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    loadGroupData();
  }, [token]);

  const loadGroupData = () => {
    const groupData = leaderboardGroupsStorage.getByInviteToken(token);
    if (!groupData) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    setGroup(groupData);
    setLoading(false);
  };

  const handleAcceptInvite = () => {
    if (!username.trim()) {
      setError('Username is required');
      return;
    }

    if (username.length < 3) {
      setError('Username must be at least 3 characters');
      return;
    }

    if (!group) return;

    setIsJoining(true);
    setError('');

    try {
      // Add member to group
      leaderboardMembersStorage.addMember(group.id, `user-${Date.now()}`, username.trim());
      
      // Redirect to group dashboard
      router.push(`/leaderboards/${group.id}`);
    } catch (error) {
      setError('Failed to join group');
      setIsJoining(false);
    }
  };

  const handleDeclineInvite = () => {
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-cpn-dark flex items-center justify-center">
        <div className="animate-fade-in text-center">
          <div className="w-8 h-8 border-2 border-cpn-yellow border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-cpn-gray">Loading invitation...</p>
        </div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-cpn-dark flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <div className="text-4xl mb-4">❌</div>
          <h1 className="text-2xl font-heading text-cpn-white mb-2">Invitation Not Found</h1>
          <p className="text-cpn-gray mb-6 max-w-md">
            This invitation link is invalid or has expired. Please ask your friend for a new invite link.
          </p>
          <button
            onClick={() => router.push('/')}
            className="btn-cpn"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  if (!group) return null;

  return (
    <div className="min-h-screen bg-cpn-dark">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center animate-fade-in">
          {/* Header */}
          <div className="mb-8">
            <TrophyIcon className="w-16 h-16 text-cpn-yellow mx-auto mb-4" />
            <h1 className="text-3xl font-heading text-cpn-white mb-2">
              You've Been Invited!
            </h1>
            <p className="text-xl text-cpn-gray">
              Join <span className="text-cpn-yellow font-bold">"{group.name}"</span> leaderboard
            </p>
          </div>

          {/* App Introduction */}
          <div className="card-cpn mb-8 text-left">
            <div className="flex items-start gap-4 mb-6">
              <div className="bg-cpn-yellow text-cpn-dark rounded-full p-2">
                <UserGroupIcon className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-heading text-cpn-white mb-2">About CPN</h2>
                <p className="text-cpn-gray">
                  CPN tracks your dating efficiency and cost per nut metrics. 
                  Compare your performance with friends in private groups and see who's the most efficient dater.
                </p>
              </div>
            </div>

            {/* Benefits */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <CheckIcon className="w-5 h-5 text-green-400" />
                <span className="text-cpn-white text-sm">Track dating expenses</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckIcon className="w-5 h-5 text-green-400" />
                <span className="text-cpn-white text-sm">Compare efficiency metrics</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckIcon className="w-5 h-5 text-green-400" />
                <span className="text-cpn-white text-sm">Private group competitions</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckIcon className="w-5 h-5 text-green-400" />
                <span className="text-cpn-white text-sm">Anonymous usernames</span>
              </div>
            </div>
          </div>

          {/* Join Form */}
          <div className="card-cpn">
            <h3 className="text-xl font-heading text-cpn-white mb-6">Join the Group</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-cpn-white mb-2 text-left">
                  Choose Your Username
                </label>
                <input
                  type="text"
                  placeholder="Enter a username..."
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="input-cpn"
                  onKeyPress={(e) => e.key === 'Enter' && handleAcceptInvite()}
                  autoFocus
                />
                {error && (
                  <p className="text-red-400 text-sm mt-1 text-left">{error}</p>
                )}
                <p className="text-xs text-cpn-gray mt-1 text-left">
                  This will be your display name in the group (anonymous)
                </p>
              </div>

              <div className="bg-cpn-dark2/50 rounded-lg p-3">
                <p className="text-sm text-cpn-gray">
                  <strong>Privacy:</strong> Your real identity stays private. 
                  Only your username will be visible to other group members.
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleDeclineInvite}
                  className="flex-1 py-3 px-4 text-cpn-gray border border-cpn-gray/30 rounded-lg hover:text-cpn-white hover:border-cpn-gray transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <XMarkIcon className="w-4 h-4" />
                  Decline
                </button>
                <button
                  onClick={handleAcceptInvite}
                  disabled={isJoining}
                  className="flex-1 btn-cpn disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isJoining ? (
                    <>
                      <div className="w-4 h-4 border-2 border-cpn-dark border-t-transparent rounded-full animate-spin"></div>
                      Joining...
                    </>
                  ) : (
                    <>
                      <ArrowRightIcon className="w-4 h-4" />
                      Accept & Join Group
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Next Steps */}
          <div className="mt-8 text-sm text-cpn-gray">
            <p>
              After joining, you'll be taken to the group dashboard where you can see rankings 
              and start tracking your dating metrics to compete with friends.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}