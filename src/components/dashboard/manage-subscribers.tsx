
"use client";

import { useEffect, useMemo, useState } from "react";
import {
  collection, onSnapshot, orderBy, query, deleteDoc, doc,
} from "firebase/firestore";
import { httpsCallable } from "firebase/functions";
import { db, functions as fbFunctions } from "@/lib/firebase";
import type { Subscriber } from "@/lib/types";
import { useLanguage } from "@/context/language-context";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Loader2, Mail, Trash2 } from "lucide-react";
import { Badge } from "../ui/badge";

const sendAdminEmail = httpsCallable(fbFunctions, "sendAdminEmail");

export function ManageSubscribers() {
  const { toast } = useToast();
  const [rows, setRows] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [qText, setQText] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | "activity" | "trip" | "event">("all");
  const [selected, setSelected] = useState<Record<string, boolean>>({});

  const [isDeleting, setIsDeleting] = useState(false);
  const [isSending, setIsSending] = useState(false);

  // Email Dialog State
  const [emailOpen, setEmailOpen] = useState(false);
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");
  const [emailRecipients, setEmailRecipients] = useState<string[]>([]);

  useEffect(() => {
    setLoading(true);
    const q = query(collection(db, "subscriptions"), orderBy("subscribedAt", "desc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const subs = snapshot.docs.map(d => {
        const data = d.data();
        return {
          id: d.id,
          path: d.ref.path,
          itemType: data.itemType,
          itemTitle: data.itemTitle,
          className: data.className,
          studentName: data.studentName,
          userEmail: data.userEmail || "",
          userId: data.userId,
          subscribedAt: data.subscribedAt?.toDate(),
          phoneNumber: data.phoneNumber,
        } as Subscriber;
      });
      setRows(subs);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching subscribers:", error);
      toast({ title: "Error", description: "Could not fetch subscribers.", variant: "destructive" });
      setLoading(false);
    });

    return () => unsubscribe();
  }, [toast]);

  const filtered = useMemo(() => {
    let out = rows;
    if (typeFilter !== "all") {
        out = out.filter(r => r.itemType === typeFilter);
    }

    if (qText.trim()) {
      const ql = qText.toLowerCase();
      out = out.filter(r =>
        (r.userEmail || "").toLowerCase().includes(ql) ||
        (r.studentName || "").toLowerCase().includes(ql) ||
        (r.itemTitle || "").toLowerCase().includes(ql) ||
        (r.phoneNumber || "").toLowerCase().includes(ql)
      );
    }
    return out;
  }, [rows, typeFilter, qText]);

  const allChecked = useMemo(() => filtered.length > 0 && filtered.every(r => selected[r.id]), [filtered, selected]);
  
  const toggleAll = (checked: boolean) => {
    const newSelected: Record<string, boolean> = {};
    if (checked) {
      filtered.forEach(r => newSelected[r.id] = true);
    }
    setSelected(newSelected);
  };
  
  const selectedCount = useMemo(() => Object.keys(selected).filter(id => selected[id]).length, [selected]);

  async function deleteOne(path: string) {
    if (!confirm("Are you sure you want to delete this subscription?")) return;
    setIsDeleting(true);
    try {
      await deleteDoc(doc(db, path));
      setRows(prev => prev.filter(r => r.path !== path));
      toast({ title: "Success", description: "Subscription deleted." });
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setIsDeleting(false);
    }
  }

  async function deleteSelected() {
    if (selectedCount === 0) return;
    if (!confirm(`Are you sure you want to delete ${selectedCount} subscriptions?`)) return;
    
    setIsDeleting(true);
    const targets = Object.keys(selected).filter(id => selected[id]);
    const targetRows = rows.filter(r => targets.includes(r.id));
    
    try {
      await Promise.all(targetRows.map(r => deleteDoc(doc(db, r.path))));
      setRows(prev => prev.filter(r => !targets.includes(r.id)));
      setSelected({});
      toast({ title: "Success", description: `${selectedCount} subscriptions deleted.` });
    } catch (e: any) {
       toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setIsDeleting(false);
    }
  }

  const handleOpenEmailDialog = (recipients: string[]) => {
    if (recipients.length === 0) {
        toast({ title: "No recipients", description: "No users selected or they don't have emails.", variant: "destructive" });
        return;
    }
    setEmailRecipients([...new Set(recipients)]);
    setEmailOpen(true);
  }
  
  const handleBulkEmail = () => {
     const emails = filtered.filter(r => selected[r.id]).map(r => r.userEmail).filter(Boolean);
     handleOpenEmailDialog(emails);
  }

  async function handleSendEmail() {
    if (!emailSubject || !emailBody || emailRecipients.length === 0) {
        toast({ title: "Missing fields", description: "Subject and body are required.", variant: "destructive" });
        return;
    }
    setIsSending(true);
    try {
      await sendAdminEmail({ to: emailRecipients, subject: emailSubject, html: emailBody });
      toast({ title: "Success", description: "Email sent successfully." });
      setEmailOpen(false);
      setEmailSubject("");
      setEmailBody("");
    } catch (error: any) {
      console.error("Failed to send email", error);
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsSending(false);
    }
  }

  return (
    <>
      <div className="p-4">
        {/* Filters and Actions */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-4 gap-2 flex-wrap">
           <Input
            placeholder="Search by name, email, item..."
            className="w-full md:max-w-sm"
            value={qText}
            onChange={e => setQText(e.target.value)}
          />
          <div className="flex gap-2 w-full md:w-auto">
            <Select value={typeFilter} onValueChange={(v: any) => setTypeFilter(v)}>
                <SelectTrigger className="w-full md:w-[180px]">
                    <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="activity">Activities</SelectItem>
                    <SelectItem value="trip">Trips</SelectItem>
                    <SelectItem value="event">Events</SelectItem>
                </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center justify-between mb-4 gap-2 flex-wrap">
            <div className="flex items-center gap-2">
                <Checkbox id="select-all" checked={allChecked} onCheckedChange={toggleAll} />
                <label htmlFor="select-all" className="text-sm font-medium">{selectedCount} selected</label>
            </div>
             <div className="flex gap-2">
              <Button onClick={handleBulkEmail} disabled={selectedCount === 0 || isSending} variant="outline">
                <Mail className="mr-2 h-4 w-4" /> Email Selected ({selectedCount})
              </Button>
              <Button onClick={deleteSelected} disabled={selectedCount === 0 || isDeleting} variant="destructive">
                {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
                 Delete Selected
              </Button>
            </div>
        </div>

        {/* Table */}
        <div className="overflow-auto border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead></TableHead>
                <TableHead>Student Name</TableHead>
                <TableHead>Class</TableHead>
                <TableHead>Item</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>User Email</TableHead>
                <TableHead>Subscribed At</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={8} className="h-24 text-center"><Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" /></TableCell></TableRow>
              ) : filtered.length === 0 ? (
                <TableRow><TableCell colSpan={8} className="h-24 text-center">No subscribers found.</TableCell></TableRow>
              ) : (
                filtered.map(r => (
                  <TableRow key={r.id}>
                    <TableCell className="p-2 text-center">
                      <Checkbox checked={!!selected[r.id]} onCheckedChange={checked => setSelected(s => ({ ...s, [r.id]: !!checked }))} />
                    </TableCell>
                    <TableCell>{r.studentName || "-"}</TableCell>
                    <TableCell>{r.className || "-"}</TableCell>
                    <TableCell>{r.itemTitle || "-"}</TableCell>
                    <TableCell>
                      <Badge variant={r.itemType === 'activity' ? 'default' : r.itemType === 'trip' ? 'secondary' : 'outline' } className="capitalize">{r.itemType}</Badge>
                    </TableCell>
                    <TableCell>{r.userEmail}</TableCell>
                    <TableCell>{r.subscribedAt?.toLocaleDateString() ?? "-"}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => handleOpenEmailDialog([r.userEmail].filter(Boolean))} disabled={!r.userEmail}>
                        <Mail className="h-4 w-4"/>
                      </Button>
                       <Button variant="ghost" size="icon" onClick={() => deleteOne(r.path)} className="text-destructive hover:text-destructive">
                        <Trash2 className="h-4 w-4"/>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
      
      {/* Email Dialog */}
      <Dialog open={emailOpen} onOpenChange={setEmailOpen}>
        <DialogContent className="sm:max-w-[625px]">
            <DialogHeader>
                <DialogTitle>Send Email</DialogTitle>
                <DialogDescription>
                    Sending to {emailRecipients.length} unique recipient(s).
                </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
                <Input placeholder="Subject" value={emailSubject} onChange={e => setEmailSubject(e.target.value)} />
                <Textarea placeholder="Email body (HTML is supported)" value={emailBody} onChange={e => setEmailBody(e.target.value)} className="h-48" />
            </div>
            <DialogFooter>
                <Button variant="outline" onClick={() => setEmailOpen(false)}>Cancel</Button>
                <Button onClick={handleSendEmail} disabled={isSending || !emailSubject || !emailBody}>
                    {isSending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Send Email
                </Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
