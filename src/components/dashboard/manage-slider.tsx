
"use client";

import { useState, useEffect } from "react";
import { collection, onSnapshot, query, orderBy, doc, deleteDoc } from 'firebase/firestore';
import { ref, deleteObject } from "firebase/storage";
import { db, storage } from '@/lib/firebase';
import type { Slide } from "@/lib/types";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useLanguage } from "@/context/language-context";
import { useToast } from "@/hooks/use-toast";
import { PlusCircle, Edit, Trash, Loader2 } from "lucide-react";
import { AddSliderForm } from "./add-slider-form";
import { EditSliderForm } from "./edit-slider-form";


export function ManageSlider() {
    const { content, language } = useLanguage();
    const { toast } = useToast();
    const [isAddDialogOpen, setAddDialogOpen] = useState(false);
    const [isEditDialogOpen, setEditDialogOpen] = useState(false);
    const [selectedSlide, setSelectedSlide] = useState<Slide | null>(null);
    const [slides, setSlides] = useState<Slide[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDeleting, setIsDeleting] = useState<string | null>(null);

    useEffect(() => {
        const slidesQuery = query(collection(db, 'slides'), orderBy('order', 'asc'), orderBy('createdAt', 'desc'));
        
        const unsubscribe = onSnapshot(slidesQuery, (snapshot) => {
            const slidesData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as Slide));
            setSlides(slidesData);
            setLoading(false);
        }, (error) => {
            if (error.code === 'permission-denied') {
                console.warn('Permission denied fetching slides for dashboard.');
            } else {
                console.error("Error fetching slides:", error);
                toast({ title: "Error", description: "Could not fetch slides.", variant: "destructive" });
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, [toast]);

    const handleEditClick = (slide: Slide) => {
        setSelectedSlide(slide);
        setEditDialogOpen(true);
    };

    const handleDelete = async (slideId: string, imagePath: string | null | undefined) => {
        setIsDeleting(slideId);
        try {
            if (imagePath) {
                const imageRef = ref(storage, imagePath);
                await deleteObject(imageRef);
            }
            await deleteDoc(doc(db, "slides", slideId));
            
            toast({ title: "Success", description: "Slide deleted successfully." });
        } catch (error: any) {
            console.error("Error deleting slide:", error);
            toast({ title: "Error", description: `Failed to delete slide: ${error.message}`, variant: "destructive" });
        } finally {
            setIsDeleting(null);
        }
    };

    return (
        <div>
            <div className="flex items-center justify-between p-4 border-b">
                <h3 className="font-headline text-lg font-semibold">{content.manageSlider}</h3>
                <Dialog open={isAddDialogOpen} onOpenChange={setAddDialogOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <PlusCircle className={`h-4 w-4 ${language === 'ar' ? 'ml-2' : 'mr-2'}`} />
                            Add Slide
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[525px]">
                        <DialogHeader>
                            <DialogTitle>Add New Slide</DialogTitle>
                             <DialogDescription>
                                Add a new slide to the homepage hero section.
                            </DialogDescription>
                        </DialogHeader>
                        <AddSliderForm setDialogOpen={setAddDialogOpen} />
                    </DialogContent>
                </Dialog>
            </div>
            <div className="p-4">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Order</TableHead>
                            <TableHead>Title</TableHead>
                            <TableHead>Published</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                             <TableRow>
                                <TableCell colSpan={4} className="text-center">
                                    <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
                                </TableCell>
                            </TableRow>
                        ) : (
                            slides.map(slide => (
                                <TableRow key={slide.id}>
                                    <TableCell>{slide.order}</TableCell>
                                    <TableCell>{slide.title[language as keyof typeof slide.title]}</TableCell>
                                    <TableCell>{slide.published ? 'Yes' : 'No'}</TableCell>
                                    <TableCell className="text-right">
                                         <Button variant="ghost" size="icon" onClick={() => handleEditClick(slide)}>
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button variant="ghost" size="icon" className="text-destructive" disabled={isDeleting === slide.id}>
                                                    {isDeleting === slide.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash className="h-4 w-4" />}
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        This action cannot be undone. This will permanently delete the slide.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => handleDelete(slide.id, slide.image_path)} className="bg-destructive hover:bg-destructive/90">
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
             {selectedSlide && (
                <Dialog open={isEditDialogOpen} onOpenChange={setEditDialogOpen}>
                    <DialogContent className="sm:max-w-[525px]">
                        <DialogHeader>
                            <DialogTitle>Edit Slide</DialogTitle>
                            <DialogDescription>
                                Make changes to the slide here. Click save when you're done.
                            </DialogDescription>
                        </DialogHeader>
                        <EditSliderForm
                            slide={selectedSlide}
                            setDialogOpen={setEditDialogOpen}
                        />
                    </DialogContent>
                </Dialog>
            )}
        </div>
    )
}
