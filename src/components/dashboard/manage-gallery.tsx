
"use client";

import { useState, useEffect } from "react";
import { collection, onSnapshot, query, orderBy, doc, deleteDoc } from 'firebase/firestore';
import { ref, deleteObject } from "firebase/storage";
import { db, storage } from '@/lib/firebase';
import type { Album } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useLanguage } from "@/context/language-context";
import { useToast } from "@/hooks/use-toast";
import { PlusCircle, Edit, Trash, Loader2 } from "lucide-react";
import { AddAlbumForm } from "./add-album-form";
import { EditAlbumForm } from "./edit-album-form";


export function ManageGallery() {
    const { content, language } = useLanguage();
    const { toast } = useToast();
    const [isAddDialogOpen, setAddDialogOpen] = useState(false);
    const [isEditDialogOpen, setEditDialogOpen] = useState(false);
    const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null);
    const [albums, setAlbums] = useState<Album[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDeleting, setIsDeleting] = useState<string | null>(null);

    useEffect(() => {
        const albumsQuery = query(collection(db, 'albums'), orderBy('created_at', 'desc'));
        
        const unsubscribe = onSnapshot(albumsQuery, (snapshot) => {
            const albumsData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as Album));
            setAlbums(albumsData);
            setLoading(false);
        }, (error) => {
            if (error.code === 'permission-denied') {
                console.warn('Permission denied fetching albums for dashboard.');
            } else {
                console.error("Error fetching albums:", error);
                toast({ title: "Error", description: "Could not fetch albums.", variant: "destructive" });
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, [toast]);

    const handleEditClick = (album: Album) => {
        setSelectedAlbum(album);
        setEditDialogOpen(true);
    };

    const handleDelete = async (album: Album) => {
        setIsDeleting(album.id);
        try {
            // Delete all images from Storage
            const deletePromises = album.imageUrls.map(url => {
                const imageRef = ref(storage, url);
                return deleteObject(imageRef);
            });
            await Promise.all(deletePromises);

            // Delete document from Firestore
            await deleteDoc(doc(db, "albums", album.id));
            
            toast({ title: "Success", description: "Album deleted successfully." });
        } catch (error: any) {
            console.error("Error deleting album:", error);
            // Check if error is because some files didn't exist (which is fine)
            if (error.code === 'storage/object-not-found') {
                 await deleteDoc(doc(db, "albums", album.id));
                 toast({ title: "Success", description: "Album deleted. Some images were already removed." });
            } else {
                toast({ title: "Error", description: `Failed to delete album: ${error.message}`, variant: "destructive" });
            }
        } finally {
            setIsDeleting(null);
        }
    };

    return (
        <div>
            <div className="flex items-center justify-between p-4 border-b">
                <h3 className="font-headline text-lg font-semibold">{content.manageGallery}</h3>
                <Dialog open={isAddDialogOpen} onOpenChange={setAddDialogOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <PlusCircle className={`h-4 w-4 ${language === 'ar' ? 'ml-2' : 'mr-2'}`} />
                            {content.addAlbum}
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[525px]">
                        <DialogHeader>
                            <DialogTitle>{content.addAlbum}</DialogTitle>
                             <DialogDescription>
                                Add a new album to the gallery. Fill in the details below.
                            </DialogDescription>
                        </DialogHeader>
                        <AddAlbumForm setDialogOpen={setAddDialogOpen} />
                    </DialogContent>
                </Dialog>
            </div>
            <div className="p-4">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Title</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Images</TableHead>
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
                            albums.map(album => (
                                <TableRow key={album.id}>
                                    <TableCell>{album.title[language as keyof typeof album.title]}</TableCell>
                                    <TableCell>{album.date}</TableCell>
                                    <TableCell>{album.imageUrls?.length || 0}</TableCell>
                                    <TableCell className="text-right">
                                         <Button variant="ghost" size="icon" onClick={() => handleEditClick(album)}>
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button variant="ghost" size="icon" className="text-destructive" disabled={isDeleting === album.id}>
                                                    {isDeleting === album.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash className="h-4 w-4" />}
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        This action cannot be undone. This will permanently delete the album and all its images.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => handleDelete(album)} className="bg-destructive hover:bg-destructive/90">
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
             {selectedAlbum && (
                <Dialog open={isEditDialogOpen} onOpenChange={setEditDialogOpen}>
                    <DialogContent className="sm:max-w-[525px]">
                        <DialogHeader>
                            <DialogTitle>Edit Album</DialogTitle>
                            <DialogDescription>
                                Make changes to your album here. Click save when you're done.
                            </DialogDescription>
                        </DialogHeader>
                        <EditAlbumForm
                            album={selectedAlbum}
                            setDialogOpen={setEditDialogOpen}
                        />
                    </DialogContent>
                </Dialog>
            )}
        </div>
    )
}
