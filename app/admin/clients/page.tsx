"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Mail, Phone, MapPin } from "lucide-react";
import { apiService } from "@/lib/api-service";

interface Client {
  _id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  joinDate: Date;
  clientId?: string;
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const loadClients = async () => {
      const users = await apiService.getUsers(); // Load all users
      const allUsers = [
        await apiService.getUserById("client-001"),
        await apiService.getUserById("client-002"),
        await apiService.getUserById("client-003"),
        await apiService.getUserById("client-004"),
      ].filter(Boolean) as Client[];

      setClients(allUsers);
      setFilteredClients(allUsers);
    };
    loadClients();
  }, []);

  useEffect(() => {
    const filtered = clients.filter(
      (c) =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.email.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredClients(filtered);
  }, [searchQuery, clients]);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Clients</h1>
        <p className="text-muted-foreground mt-2">
          Manage client relationships and projects
        </p>
      </div>

      <div className="flex gap-4">
        <Input
          placeholder="Search clients..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-xs"
        />
      </div>

      {/* Clients Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {filteredClients.length > 0 ? (
          filteredClients.map((client) => (
            <Card key={client._id} className="p-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage
                      src={client.avatar || "/placeholder.svg"}
                      alt={client.name}
                    />
                    <AvatarFallback>{getInitials(client.name)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold text-foreground">
                      {client.name}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Joined {new Date(client.joinDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    <span className="truncate">{client.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="h-4 w-4" />
                    <span>{client.phone}</span>
                  </div>
                </div>

                <div className="flex gap-2 pt-2 border-t border-border">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 gap-2 bg-transparent"
                  >
                    <MessageSquare className="h-3 w-3" />
                    Message
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 bg-transparent"
                  >
                    View Projects
                  </Button>
                </div>
              </div>
            </Card>
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <p className="text-muted-foreground">No clients found</p>
          </div>
        )}
      </div>
    </div>
  );
}
