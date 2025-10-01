
"use client";

import { useState, useEffect } from "react";
import { collection, onSnapshot, query, orderBy, doc, deleteDoc } from 'firebase/firestore';
import { ref, deleteObject } from "firebase/storage";
import { db, storage } from '@/lib/firebase';
import type { Activity } from "@/lib/types";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useLanguage } from "@/context/language-context";
import { useToast } from "@/hooks/use-toast";
import { PlusCircle, Edit, Trash, Loader2 } from "lucide-react";
import { AddActivityForm } from "./add-activity-form";
import { EditActivityForm } from "./edit-activity-form";


export function ManageActivities() {
    const { content, language } = useLanguage();
    const { toast } = useToast();
    const [isAddDialogOpen, setAddDialogOpen] = useState(false);
    const [isEditDialogOpen, setEditDialogOpen] = useState(false);
    const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
    const [activities, setActivities] = useState<Activity[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDeleting, setIsDeleting] = useState<string | null>(null);

    useEffect(() => {
        const activitiesQuery = query(collection(db, 'activities'), orderBy('created_at', 'desc'));
        
        const unsubscribe = onSnapshot(activitiesQuery, (snapshot) => {
            const activitiesData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as Activity));
            setActivities(activitiesData);
            setLoading(false);
        }, (error) => {
            if (error.code === 'permission-denied') {
                console.warn('Permission denied fetching activities for dashboard.');
            } else {
                console.error("Error fetching activities:", error);
                toast({ title: "Error", description: "Could not fetch activities.", variant: "destructive" });
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, [toast]);

    const handleEditClick = (activity: Activity) => {
        setSelectedActivity(activity);
        setEditDialogOpen(true);
    };

    const handleDelete = async (activityId: string, imagePath: string | null | undefined) => {
        setIsDeleting(activityId);
        try {
            // Delete image from Storage if it exists
            if (imagePath) {
                const imageRef = ref(storage, imagePath);
                await deleteObject(imageRef);
            }
            // Delete document from Firestore
            await deleteDoc(doc(db, "activities", activityId));
            
            toast({ title: "Success", description: "Activity deleted successfully." });
        } catch (error: any) {
            console.error("Error deleting activity:", error);
            toast({ title: "Error", description: `Failed to delete activity: ${error.message}`, variant: "destructive" });
        } finally {
            setIsDeleting(null);
        }
    };

    return (
        <div>
            <div className="flex items-center justify-between p-4 border-b">
                <h3 className="font-headline text-lg font-semibold">{content.manageActivities}</h3>
                <Dialog open={isAddDialogOpen} onOpenChange={setAddDialogOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <PlusCircle className={`h-4 w-4 ${language === 'ar' ? 'ml-2' : 'mr-2'}`} />
                            {content.addActivity}
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[525px]">
                        <DialogHeader>
                            <DialogTitle>{content.addActivity}</DialogTitle>
                             <DialogDescription>
                                Add a new activity to the list. Fill in the details below.
                            </DialogDescription>
                        </DialogHeader>
                        <AddActivityForm setDialogOpen={setAddDialogOpen} />
                    </DialogContent>
                </Dialog>
            </div>
            <div className="p-4">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Title</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                             <TableRow>
                                <TableCell colSpan={3} className="text-center">
                                    <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
                                </TableCell>
                            </TableRow>
                        ) : (
                            activities.map(activity => (
                                <TableRow key={activity.id}>
                                    <TableCell>{activity.title[language as keyof typeof activity.title]}</TableCell>
                                    <TableCell>{activity.type}</TableCell>
                                    <TableCell className="text-right">
                                         <Button variant="ghost" size="icon" onClick={() => handleEditClick(activity)}>
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button variant="ghost" size="icon" className="text-destructive" disabled={isDeleting === activity.id}>
                                                    {isDeleting === activity.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash className="h-4 w-4" />}
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        This action cannot be undone. This will permanently delete the activity and its associated image.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => handleDelete(activity.id, activity.image_path)} className="bg-destructive hover:bg-destructive/90">
                                                        Delete
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
             {selectedActivity && (
                <Dialog open={isEditDialogOpen} onOpenChange={setEditDialogOpen}>
                    <DialogContent className="sm:max-w-[525px]">
                        <DialogHeader>
                            <DialogTitle>Edit Activity</DialogTitle>
                            <DialogDescription>
                                Make changes to your activity here. Click save when you're done.
                            </DialogDescription>
                        </DialogHeader>
                        <EditActivityForm
                            activity={selectedActivity}
                            setDialogOpen={setEditDialogOpen}
                        />
                    </DialogContent>
                </Dialog>
            )}
        </div>
    )
}
