import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/layout/admin-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { sanitizeString, isValidEmail, validateRequired } from "@/utils/security";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Search, Plus, MoreHorizontal, Edit, Trash2, Shield, Mail, Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Loading } from "@/components/ui/loading";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

const AdminManagement = () => {
  const [admins, setAdmins] = useState<any[]>([]);
  const [filteredAdmins, setFilteredAdmins] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<any>(null);
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    role: "admin",
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchAdmins();
  }, []);

  useEffect(() => {
    filterAdmins();
  }, [searchTerm, roleFilter, statusFilter, admins]);

  const fetchAdmins = async () => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select(`
          *,
          user_roles (
            id,
            name,
            description,
            permissions
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAdmins(data || []);
    } catch (error) {
      console.error('Error fetching admins:', error);
      toast({
        title: "Error",
        description: "Failed to load admin users",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filterAdmins = () => {
    let filtered = admins;

    if (searchTerm) {
      filtered = filtered.filter(admin =>
        admin.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        admin.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (roleFilter !== "all" && roleFilter) {
      filtered = filtered.filter(admin => admin.user_roles?.name === roleFilter);
    }

    if (statusFilter !== "all") {
      const isActive = statusFilter === "active";
      filtered = filtered.filter(admin => admin.is_active === isActive);
    }

    setFilteredAdmins(filtered);
  };

  const handleCreateAdmin = async () => {
    try {
      // Validate required fields
      const validation = validateRequired({
        'Full Name': formData.full_name,
        'Email': formData.email,
        'Role': formData.role
      });

      if (!validation.isValid) {
        toast({
          title: "Validation Error",
          description: validation.errors.join(', '),
          variant: "destructive",
        });
        return;
      }

      // Validate email format
      if (!isValidEmail(formData.email)) {
        toast({
          title: "Validation Error",
          description: "Please enter a valid email address",
          variant: "destructive",
        });
        return;
      }

      // Sanitize inputs
      const sanitizedData = {
        full_name: sanitizeString(formData.full_name),
        email: sanitizeString(formData.email.toLowerCase()),
        role: formData.role
      };

      const { error } = await supabase.rpc('create_admin_user', {
        user_email: sanitizedData.email,
        user_role: sanitizedData.role
      });

      if (error) throw error;

      // Update the profile name after creation
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({ full_name: sanitizedData.full_name })
        .eq('email', sanitizedData.email);

      if (updateError) throw updateError;

      toast({
        title: "Success",
        description: "Admin user created successfully",
      });

      setIsCreateDialogOpen(false);
      resetForm();
      fetchAdmins();
    } catch (error: any) {
      console.error('Error creating admin:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create admin user",
        variant: "destructive",
      });
    }
  };

  const handleToggleStatus = async (adminId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ is_active: !currentStatus })
        .eq('id', adminId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Admin ${!currentStatus ? 'activated' : 'deactivated'} successfully`,
      });

      fetchAdmins();
    } catch (error: any) {
      console.error('Error updating admin status:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update admin status",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      full_name: "",
      email: "",
      role: "admin",
    });
  };

  if (loading) {
    return (
      <AdminLayout title="Admin Management">
        <div className="flex justify-center items-center h-64">
          <Loading size="lg" />
        </div>
      </AdminLayout>
    );
  }

  const roles = [
    { 
      value: "superadmin", 
      label: "Super Admin", 
      description: "Full system access and control",
      color: "bg-red-500"
    },
    { 
      value: "admin", 
      label: "Admin", 
      description: "Complete management access",
      color: "bg-blue-500"
    },
    { 
      value: "management_admin", 
      label: "Management Admin", 
      description: "Event and financial management",
      color: "bg-green-500"
    },
    { 
      value: "view_only_admin", 
      label: "View Only", 
      description: "Read-only access to all sections",
      color: "bg-gray-500"
    }
  ];

  const getStatusBadge = (isActive: boolean) => {
    return isActive ? (
      <Badge variant="default">Active</Badge>
    ) : (
      <Badge variant="secondary">Inactive</Badge>
    );
  };

  const getRoleBadge = (role: string) => {
    const roleInfo = roles.find(r => r.value === role);
    if (!roleInfo) return <Badge variant="outline">{role}</Badge>;
    
    return (
      <Badge variant="outline" className="flex items-center gap-1">
        <div className={`w-2 h-2 rounded-full ${roleInfo.color}`} />
        {roleInfo.label}
      </Badge>
    );
  };

  return (
    <AdminLayout title="Admin Management">
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold">Admin Management</h2>
            <p className="text-muted-foreground">Manage administrative users and their permissions</p>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Admin
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add New Administrator</DialogTitle>
                <DialogDescription>
                  Create a new administrative account with specific permissions.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="admin-name" className="text-right">
                    Name
                  </Label>
                  <Input
                    id="admin-name"
                    className="col-span-3"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="admin-email" className="text-right">
                    Email
                  </Label>
                  <Input
                    id="admin-email"
                    type="email"
                    className="col-span-3"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="admin-role" className="text-right">
                    Role
                  </Label>
                  <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.map((role) => (
                        <SelectItem key={role.value} value={role.value}>
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${role.color}`} />
                            <div>
                              <div className="font-medium">{role.label}</div>
                              <div className="text-xs text-muted-foreground">{role.description}</div>
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleCreateAdmin}>Create Admin Account</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Role Information Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {roles.map((role) => (
            <Card key={role.value} className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-3 h-3 rounded-full ${role.color}`} />
                <h4 className="font-medium">{role.label}</h4>
              </div>
              <p className="text-sm text-muted-foreground mb-3">{role.description}</p>
              <div className="text-xs text-muted-foreground">
                {admins.filter(admin => admin.user_roles?.name === role.value).length} users
              </div>
            </Card>
          ))}
        </div>

        {/* Filters and Search */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search administrators by name or email..."
                    className="pl-9"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  {roles.map((role) => (
                    <SelectItem key={role.value} value={role.value}>
                      {role.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Admins Table */}
        <Card>
          <CardHeader>
            <CardTitle>Administrators ({filteredAdmins.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Admin</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Login</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAdmins.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                      No administrators found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAdmins.map((admin) => (
                    <TableRow key={admin.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{admin.full_name}</div>
                          <div className="text-sm text-muted-foreground flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {admin.email}
                          </div>
                          <div className="text-xs text-muted-foreground">{admin.id}</div>
                        </div>
                      </TableCell>
                      <TableCell>{getRoleBadge(admin.user_roles?.name || "")}</TableCell>
                      <TableCell>{getStatusBadge(admin.is_active)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <Calendar className="h-3 w-3" />
                          {admin.last_login ? format(new Date(admin.last_login), 'MMM dd, yyyy hh:mm a') : 'Never'}
                        </div>
                      </TableCell>
                      <TableCell>{format(new Date(admin.created_at), 'MMM dd, yyyy')}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => handleToggleStatus(admin.id, admin.is_active)}>
                              {admin.is_active ? (
                                <>
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Deactivate Admin
                                </>
                              ) : (
                                <>
                                  <Shield className="mr-2 h-4 w-4" />
                                  Activate Admin
                                </>
                              )}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminManagement;