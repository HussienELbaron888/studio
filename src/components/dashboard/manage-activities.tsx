
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useLanguage } from "@/context/language-context";
import { PlusCircle, Edit, Trash, Loader2 } from "lucide-react";
import { AddActivityForm } from "./add-activity-form";
import { useActivities } from "@/hooks/use-activities";

export function ManageActivities() {
    const { content, language } = useLanguage();
    const [isDialogOpen, setDialogOpen] = useState(false);
    const { activities, loading } = useActivities();

    return (
        <div>
            <div className="flex items-center justify-between p-4 border-b">
                <h3 className="font-headline text-lg font-semibold">{content.manageActivities}</h3>
                <Dialog open={isDialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <PlusCircle className={`h-4 w-4 ${language === 'ar' ? 'ml-2' : 'mr-2'}`} />
                            {content.addActivity}
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[525px]">
                        <DialogHeader>
                            <DialogTitle>{content.addActivity}</DialogTitle>
                        </DialogHeader>
                        <AddActivityForm setDialogOpen={setDialogOpen} />
                    </DialogContent>
                </Dialog>
            </div>
            <div className="p-4">
                 {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                 ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Title</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Price</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {activities.map(activity => (
                                <TableRow key={activity.id}>
                                    <TableCell>{activity.title[language]}</TableCell>
                                    <TableCell>{activity.type}</TableCell>
                                    <TableCell>{activity.price > 0 ? `${activity.price} ${content.currency}`: content.free}</TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="icon">
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="text-destructive">
                                            <Trash className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                 )}
            </div>
        </div>
    )
}
