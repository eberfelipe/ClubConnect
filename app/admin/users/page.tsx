"use client"

import { useState } from "react"
import Link from 'next/link'
import Image from 'next/image'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Users, ClipboardList, Calendar, Bell, LogOut, Trash2, Save, UserPlus } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface User {
  id: number
  name: string
  studentId: string
  email: string
  role: 'student' | 'sub-admin'
  club: string
}

const clubs = [
  "NCT Coding Club",
  "NCT Robotics Club",
  "NCT E-Sports Club",
  "NCT Boardgames Club",
  "NCT Book Club",
  "NCT Cricket Club",
  "Basketball Club",
  "Volleyball Club",
  "Badminton Club",
  "Soccer Club"
]

export default function AdminUserManagement() {
  const [users, setUsers] = useState<User[]>([
    { id: 1, name: "Arpine", studentId: "1234567", email: "arpine@nctorontostudents.ca", role: "student", club: "NCT Coding Club" },
    { id: 2, name: "Om patel", studentId: "2345678", email: "om@nctorontostudents.ca", role: "student", club: "NCT Robotics Club" },
    { id: 3, name: "Yadhu", studentId: "3456789", email: "yadhu@nctorontostudents.ca", role: "student", club: "NCT E-Sports Club" },
    { id: 4, name: "Eber", studentId: "4567890", email: "eber@nctorontostudents.ca", role: "student", club: "NCT Boardgames Club" },
    { id: 5, name: "Shiva", studentId: "5678901", email: "shiva@nctorontostudents.ca", role: "student", club: "Soccer Club" }
  ])
  const [filter, setFilter] = useState("")
  const [changedRoles, setChangedRoles] = useState<{[key: number]: 'student' | 'sub-admin'}>({})
  const [userToDelete, setUserToDelete] = useState<User | null>(null)
  const [subAdminToAssign, setSubAdminToAssign] = useState<User | null>(null)
  const [selectedClub, setSelectedClub] = useState<string>("")

  const handleRoleChange = (userId: number, newRole: 'student' | 'sub-admin') => {
    if (newRole === 'sub-admin') {
      const user = users.find(u => u.id === userId)
      if (user) {
        setSubAdminToAssign(user)
      }
    } else {
      setChangedRoles(prev => ({ ...prev, [userId]: newRole }))
    }
  }

  const handleSaveChanges = () => {
    setUsers(users.map(user => 
      changedRoles[user.id] ? { ...user, role: changedRoles[user.id] } : user
    ))
    setChangedRoles({})
    toast({
      title: "Changes Saved",
      description: "User roles have been updated successfully.",
    })
  }

  const handleDeleteUser = (user: User) => {
    setUserToDelete(user)
  }

  const confirmDeleteUser = () => {
    if (userToDelete) {
      setUsers(users.filter(user => user.id !== userToDelete.id))
      toast({
        title: "User Deleted",
        description: "The user has been removed successfully.",
      })
      setUserToDelete(null)
    }
  }

  const handleAssignClub = () => {
    if (subAdminToAssign && selectedClub) {
      setUsers(users.map(user => 
        user.id === subAdminToAssign.id ? { ...user, role: 'sub-admin', club: selectedClub } : user
      ))
      setChangedRoles(prev => ({ ...prev, [subAdminToAssign.id]: 'sub-admin' }))
      setSubAdminToAssign(null)
      setSelectedClub("")
      toast({
        title: "Sub-Admin Assigned",
        description: `${subAdminToAssign.name} has been assigned as sub-admin to ${selectedClub}.`,
      })
    }
  }

  const filteredUsers = users.filter(user => 
    user.studentId.includes(filter) || user.name.toLowerCase().includes(filter.toLowerCase())
  )

  const subAdmins = users.filter(user => user.role === 'sub-admin')

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md flex flex-col">
        <div className="p-4 flex justify-between items-center border-b">
          <h1 className="text-xl font-bold">ClubConnect</h1>
          <Image
            src="/images/logo/favIcon.svg"
            alt="ClubConnect Logo"
            width={40}
            height={40}
            className="rounded-full"
          />
        </div>
        <div className="p-4 flex-grow">
          <Link href="/admin/profile" className="flex items-center space-x-4 mb-6 hover:bg-gray-100 rounded p-2">
            <Avatar>
              <AvatarImage src="/placeholder.svg" alt="Admin" />
              <AvatarFallback>AK</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-lg font-semibold">Aaryan Khatri</h2>
              <p className="text-sm text-gray-500">Admin</p>
            </div>
          </Link>
          <nav className="space-y-2">
            <Link href="/admin/dashboard" className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded">
              <Users size={20} />
              <span>Dashboard</span>
            </Link>
            <Link href="/admin/users" className="flex items-center space-x-2 p-2 bg-gray-100 rounded">
              <UserPlus size={20} />
              <span>User Management</span>
            </Link>
            <Link href="/admin/clubs" className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded">
              <ClipboardList size={20} />
              <span>Club Management</span>
            </Link>
            <Link href="/admin/events" className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded">
              <Calendar size={20} />
              <span>Event Management</span>
            </Link>
            <Link href="/admin/announcements" className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded">
              <Bell size={20} />
              <span>Announcements</span>
            </Link>
            <Link href="/auth/signin" className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded">
              <LogOut size={20} />
              <span>Logout</span>
            </Link>
          </nav>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-8 overflow-y-auto">
        <h1 className="text-3xl font-bold mb-6">User Management</h1>
        
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-semibold mb-4">Filter Users</h2>
          <div className="flex space-x-4">
            <Input
              placeholder="Filter by Student ID or Name"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">All Users</h2>
            <Button onClick={handleSaveChanges} disabled={Object.keys(changedRoles).length === 0}>
              <Save className="mr-2 h-4 w-4" /> Save Changes
            </Button>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Student ID</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Club</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.studentId}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Select
                      value={changedRoles[user.id] || user.role}
                      onValueChange={(value: 'student' | 'sub-admin') => handleRoleChange(user.id, value)}
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="student">Student</SelectItem>
                        <SelectItem value="sub-admin">Sub-Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>{user.club}</TableCell>
                  <TableCell>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteUser(user)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Sub-Admins</h2>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Club</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {subAdmins.map((subAdmin) => (
                <TableRow key={subAdmin.id}>
                  <TableCell>{subAdmin.name}</TableCell>
                  <TableCell>{subAdmin.email}</TableCell>
                  <TableCell>
                    <span className="bg-blue-100 text-blue-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded">
                      {subAdmin.club}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </main>

      <AlertDialog open={!!userToDelete} onOpenChange={() => setUserToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this user?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the user
              account and remove all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteUser}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={!!subAdminToAssign} onOpenChange={() => setSubAdminToAssign(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Club to Sub-Admin</DialogTitle>
            <DialogDescription>
              Please select a club to assign to {subAdminToAssign?.name} as a sub-admin.
            </DialogDescription>
          </DialogHeader>
          <Select value={selectedClub} onValueChange={setSelectedClub}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a club" />
            </SelectTrigger>
            <SelectContent>
              {clubs.map((club) => (
                <SelectItem key={club} value={club}>{club}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <DialogFooter>
            <Button onClick={() => setSubAdminToAssign(null)}>Cancel</Button>
            <Button onClick={handleAssignClub} disabled={!selectedClub}>Assign Club</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Toaster />
    </div>
  )
}