'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Mail, Phone } from 'lucide-react';

export default function ClientTeamPage() {
  const teamMembers = [
    {
      id: '1',
      name: 'Sarah Chen',
      role: 'Project Manager',
      email: 'pm@agency.com',
      phone: '+1-234-567-8901',
      status: 'active',
    },
    {
      id: '2',
      name: 'James Wilson',
      role: 'Developer',
      email: 'dev1@agency.com',
      phone: '+1-234-567-8904',
      status: 'active',
    },
    {
      id: '3',
      name: 'Emma Rodriguez',
      role: 'Developer',
      email: 'dev2@agency.com',
      phone: '+1-234-567-8905',
      status: 'active',
    },
    {
      id: '4',
      name: 'Maya Patel',
      role: 'Lead Architect',
      email: 'architect@agency.com',
      phone: '+1-234-567-8903',
      status: 'active',
    },
  ];

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Project Team</h1>
        <p className="text-muted-foreground mt-2">
          Your assigned team members
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {teamMembers.map((member) => (
          <Card key={member.id} className="p-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarFallback>
                    {member.name.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-foreground">{member.name}</h3>
                  <Badge className="mt-1 text-xs">{member.role}</Badge>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  <span className="truncate">{member.email}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  <span>{member.phone}</span>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
