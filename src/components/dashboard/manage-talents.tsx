
"use client";

import { useState, useEffect } from "react";
import { collection, onSnapshot, query, orderBy, doc, deleteDoc } from 'firebase/firestore';
import { ref, deleteObject } from "firebase/storage";
import { db, storage } from '@/lib/firebase';
import type { Talent } from "@/lib/types";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useLanguage } from "@/context/language-context";
import { useToast } from "@/hooks/use-toast";
import { PlusCircle, Edit, Trash, Loader2 } from "lucide-react";
import { AddTalentForm } from "./add-talent-form";
import { EditTalentForm } from "./edit-talent-form";

export function ManageTalents() {
    const { content, language } = useLanguage();
    const { toast } = useToast();
    const [isAddDialogOpen, setAddDialogOpen] = useState(false);
    const [isEditDialogOpen, setEditDialogOpen] = useState(false);
    const [selectedTalent, setSelectedTalent] = useState<Talent | null>(null);
    const [talents, setTalents] = useState<Talent[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDeleting, setIsDeleting] = useState<string | null>(null);

    useEffect(() => {
        const talentsQuery = query(collection(db, 'talents'), orderBy('created_at', 'desc'));
        
        const unsubscribe = onSnapshot(talentsQuery, (snapshot) => {
            const talentsData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as Talent));
            setTalents(talentsData);
            setLoading(false);
        }, (error) => {
            if (error.code === 'permission-denied') {
                console.warn('Permission denied fetching talents for dashboard.');
            } else {
                console.error("Error fetching talents:", error);
                toast({ title: "Error", description: "Could not fetch talents.", variant: "destructive" });
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, [toast]);
    
    const handleEditClick = (talent: Talent) => {
        setSelectedTalent(talent);
        setEditDialogOpen(true);
    };

    const handleDelete = async (talentId: string, imagePath: string | null | undefined) => {
        setIsDeleting(talentId);
        try {
            if (imagePath) {
                const imageRef = ref(storage, imagePath);
                await deleteObject(imageRef);
            }
            await deleteDoc(doc(db, "talents", talentId));
            
            toast({ title: "Success", description: "Talent deleted successfully." });
        } catch (error: any) {
            console.error("Error deleting talent:", error);
            toast({ title: "Error", description: `Failed to delete talent: ${error.message}`, variant: "destructive" });
        } finally {
            setIsDeleting(null);
        }
    };

    return (
        <div>
            <div className="flex items-center justify-between p-4 border-b">
                <h3 className="font-headline text-lg font-semibold">{content.manageTalents}</h3>
                <Dialog open={isAddDialogOpen} onOpenChange={setAddDialogOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <PlusCircle className={`h-4 w-4 ${language === 'ar' ? 'ml-2' : 'mr-2'}`} />
                            {content.addTalent}
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[525px]">
                        <DialogHeader>
                            <DialogTitle>{content.addTalent}</DialogTitle>
                             <DialogDescription>
                                Add a new talent to the list. Fill in the details below.
                            </DialogDescription>
                        </DialogHeader>
                        <AddTalentForm setDialogOpen={setAddDialogOpen} />
                    </DialogContent>
                </Dialog>
            </div>
            <div className="p-4">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Stage</TableHead>
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
                            talents.map(talent => (
                                <TableRow key={talent.id}>
                                    <TableCell>{talent.name[language as keyof typeof talent.name]}</TableCell>
                                    <TableCell>{talent.stage[language as keyof typeof talent.stage]}</TableCell>
                                    <TableCell className="text-right">
                                         <Button variant="ghost" size="icon" onClick={() => handleEditClick(talent)}>
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button variant="ghost" size="icon" className="text-destructive" disabled={isDeleting === talent.id}>
                                                    {isDeleting === talent.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash className="h-4 w-4" />}
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        This action cannot be undone. This will permanently delete the talent's information.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => handleDelete(talent.id, talent.image_path)} className="bg-destructive hover:bg-destructive/90">
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
             {selectedTalent && (
                <Dialog open={isEditDialogOpen} onOpenChange={setEditDialogOpen}>
                    <DialogContent className="sm:max-w-[525px]">
                        <DialogHeader>
                            <DialogTitle>Edit Talent</DialogTitle>
                            <DialogDescription>
                                Make changes to the talent's information here. Click save when you're done.
                            </DialogDescription>
                        </DialogHeader>
                        <EditTalentForm
                            talent={selectedTalent}
                            setDialogOpen={setEditDialogOpen}
                        />
                    </DialogContent>
                </Dialog>
            )}
        </div>
    )
}
