"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { UserPlus, Key, Trash2, UsersIcon } from "lucide-react"

// Mock users data
const mockUsers = [
    {
        id: "user-1",
        name: "John Admin",
        email: "admin@company.com",
        role: "Admin",
        status: "Active",
        lastLogin: "2024-01-16 09:00:00",
        createdAt: "2024-01-01 10:00:00",
        initials: "JA",
    },
    {
        id: "user-2",
        name: "Sarah User",
        email: "user@company.com",
        role: "User",
        status: "Active",
        lastLogin: "2024-01-16 11:45:12",
        createdAt: "2024-01-05 14:30:00",
        initials: "SU",
    },
    {
        id: "user-3",
        name: "Mike Johnson",
        email: "mike@company.com",
        role: "User",
        status: "Active",
        lastLogin: "2024-01-15 16:20:00",
        createdAt: "2024-01-10 09:15:00",
        initials: "MJ",
    },
    {
        id: "user-4",
        name: "Lisa Chen",
        email: "lisa@company.com",
        role: "User",
        status: "Inactive",
        lastLogin: "2024-01-10 13:45:00",
        createdAt: "2024-01-08 11:00:00",
        initials: "LC",
    },
]

export default function UsersTab() {
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
    const [isResetPasswordDialogOpen, setIsResetPasswordDialogOpen] = useState(false)
    const [selectedUser, setSelectedUser] = useState<string | null>(null)
    const [newUser, setNewUser] = useState({
        name: "",
        email: "",
        role: "User",
    })

    const handleCreateUser = () => {
        console.log("Creating user:", newUser)
        setIsCreateDialogOpen(false)
        setNewUser({ name: "", email: "", role: "User" })
    }

    const handleResetPassword = () => {
        console.log("Resetting password for user:", selectedUser)
        setIsResetPasswordDialogOpen(false)
        setSelectedUser(null)
    }

    const handleDeleteUser = (userId: string) => {
        console.log("Deleting user:", userId)
    }

    const getRoleBadge = (role: string) => {
        return role === "Admin" ? <Badge className="bg-purple-600">Admin</Badge> : <Badge variant="secondary">User</Badge>
    }

    const getStatusBadge = (status: string) => {
        return status === "Active" ? (
            <Badge className="bg-green-600">Active</Badge>
        ) : (
            <Badge variant="destructive">Inactive</Badge>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 justify-between items-start sm:flex-row sm:items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
                    <p className="text-gray-600">Manage system users and their permissions</p>
                </div>

                <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-blue-600 hover:bg-blue-700">
                            <UserPlus className="mr-2 w-4 h-4" />
                            Add User
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>Create New User</DialogTitle>
                            <DialogDescription>Add a new user to the system with appropriate permissions.</DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 gap-4 items-center">
                                <Label htmlFor="name" className="text-right">
                                    Name
                                </Label>
                                <Input
                                    id="name"
                                    value={newUser.name}
                                    onChange={(e) => setNewUser((prev) => ({ ...prev, name: e.target.value }))}
                                    className="col-span-3"
                                    placeholder="John Doe"
                                />
                            </div>
                            <div className="grid grid-cols-4 gap-4 items-center">
                                <Label htmlFor="email" className="text-right">
                                    Email
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={newUser.email}
                                    onChange={(e) => setNewUser((prev) => ({ ...prev, email: e.target.value }))}
                                    className="col-span-3"
                                    placeholder="john@company.com"
                                />
                            </div>
                            <div className="grid grid-cols-4 gap-4 items-center">
                                <Label htmlFor="role" className="text-right">
                                    Role
                                </Label>
                                <Select
                                    value={newUser.role}
                                    onValueChange={(value) => setNewUser((prev) => ({ ...prev, role: value }))}
                                >
                                    <SelectTrigger className="col-span-3">
                                        <SelectValue placeholder="Select role" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="User">User</SelectItem>
                                        <SelectItem value="Admin">Admin</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="submit" onClick={handleCreateUser}>
                                Create User
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row justify-between items-center pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                        <UsersIcon className="w-4 h-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{mockUsers.length}</div>
                        <p className="text-xs text-muted-foreground">All system users</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row justify-between items-center pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                        <UsersIcon className="w-4 h-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">
                            {mockUsers.filter((u) => u.status === "Active").length}
                        </div>
                        <p className="text-xs text-muted-foreground">Currently active</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row justify-between items-center pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium">Admins</CardTitle>
                        <UsersIcon className="w-4 h-4 text-purple-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-purple-600">
                            {mockUsers.filter((u) => u.role === "Admin").length}
                        </div>
                        <p className="text-xs text-muted-foreground">Administrator accounts</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row justify-between items-center pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium">Regular Users</CardTitle>
                        <UsersIcon className="w-4 h-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-600">{mockUsers.filter((u) => u.role === "User").length}</div>
                        <p className="text-xs text-muted-foreground">Standard user accounts</p>
                    </CardContent>
                </Card>
            </div>

            {/* Users Table */}
            <Card>
                <CardHeader>
                    <CardTitle>System Users</CardTitle>
                    <CardDescription>Manage user accounts, roles, and permissions</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>User</TableHead>
                                    <TableHead>Role</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="hidden md:table-cell">Last Login</TableHead>
                                    <TableHead className="hidden lg:table-cell">Created</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {mockUsers.map((user) => (
                                    <TableRow key={user.id}>
                                        <TableCell>
                                            <div className="flex items-center space-x-3">
                                                <Avatar className="w-8 h-8">
                                                    <AvatarFallback className="text-xs text-white bg-blue-600">{user.initials}</AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <div className="font-medium">{user.name}</div>
                                                    <div className="text-sm text-gray-500">{user.email}</div>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>{getRoleBadge(user.role)}</TableCell>
                                        <TableCell>{getStatusBadge(user.status)}</TableCell>
                                        <TableCell className="hidden text-sm md:table-cell">{user.lastLogin}</TableCell>
                                        <TableCell className="hidden text-sm lg:table-cell">{user.createdAt}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center space-x-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => {
                                                        setSelectedUser(user.id)
                                                        setIsResetPasswordDialogOpen(true)
                                                    }}
                                                >
                                                    <Key className="w-3 h-3" />
                                                    <span className="hidden ml-1 sm:inline">Reset</span>
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleDeleteUser(user.id)}
                                                    className="text-red-600 hover:text-red-700"
                                                >
                                                    <Trash2 className="w-3 h-3" />
                                                    <span className="hidden ml-1 sm:inline">Delete</span>
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            {/* Reset Password Dialog */}
            <Dialog open={isResetPasswordDialogOpen} onOpenChange={setIsResetPasswordDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Reset Password</DialogTitle>
                        <DialogDescription>This will send a password reset email to the user.</DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <p className="text-sm text-gray-600">
                            Are you sure you want to reset the password for this user? They will receive an email with instructions to
                            set a new password.
                        </p>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsResetPasswordDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleResetPassword}>Send Reset Email</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
