
"use client";

import { useEffect, useMemo, useState } from "react";
import {
  collection, onSnapshot, query, where, orderBy, getDocs, Timestamp
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useLanguage } from "@/context/language-context";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Loader2, Mail, Trash } from "lucide-react";
import { adminDeleteSubscription, sendCustomEmailBulk, sendCustomEmailToSubscription } from "@/lib/admin";
import type { Subscription } from "@/lib/types";

type ItemType = "all" | "activity" | "trip" | "event";

type SubscriptionDoc = Subscription & {
  studentName: string;
  className: string;
  phoneNumber: string;
  activityId?: string;
  tripId?: string;
  eventId?: string;
};

export function ManageSubscribers() {
  const { content, language } = useLanguage();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [subs, setSubs] = useState<SubscriptionDoc[]>([]);
  const [typeFilter, setTypeFilter] = useState<ItemType>("all");
  const [itemFilter, setItemFilter] = useState<string>("all");
  const [search, setSearch] = useState("");

  const [itemsMap, setItemsMap] = useState<Record<string, { id: string; title: string }[]>>({
    activity: [], trip: [], event: [],
  });

  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [emailTargetIds, setEmailTargetIds] = useState<string[]>([]);
  const [subject, setSubject] = useState("");
  const [html, setHtml] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    // حمّل قوائم العناصر لاستخدامها في فلتر "العنصر"
    async function loadTitles() {
      const coll = async (name: "activities"|"trips"|"events") => {
        const q = query(collection(db, name), orderBy("created_at", "desc"));
        const snap = await getDocs(q);
        return snap.docs.map(d => ({ id: d.id, title: (d.data() as any).title?.en || (d.data() as any).name?.en || d.id }));
      };
      const [acts, trips, events] = await Promise.all([coll("activities"), coll("trips"), coll("events")]);
      setItemsMap({ activity: acts, trip: trips, event: events });
    }
    loadTitles().catch(()=>{});
  }, []);

  useEffect(() => {
    setLoading(true);
    const base = collection(db, "subscriptions");
    let q: any = base;
    if (typeFilter !== "all") {
      q = query(base, where("itemType", "==", typeFilter), orderBy("subscribedAt","desc"));
    } else {
      q = query(base, orderBy("subscribedAt","desc"));
    }
    const unsub = onSnapshot(q, (snap) => {
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() })) as SubscriptionDoc[];
      setSubs(list);
      setLoading(false);
    }, (err) => {
      console.error(err);
      toast({ title: content.error, description: String(err), variant: "destructive" });
      setLoading(false);
    });
    return () => unsub();
  }, [typeFilter, toast, content.error]);

  // فلترة حسب عنصر محدد + بحث نصي
  const filtered = useMemo(() => {
    let r = subs;
    if (typeFilter !== "all" && itemFilter !== "all") {
      const key = typeFilter === "activity" ? "activityId" : typeFilter === "trip" ? "tripId" : "eventId";
      r = r.filter(x => (x as any)[key] === itemFilter);
    }
    const s = search.trim().toLowerCase();
    if (s) {
      r = r.filter(x =>
        (x.studentName||"").toLowerCase().includes(s) ||
        (x.className||"").toLowerCase().includes(s) ||
        (x.phoneNumber||"").toLowerCase().includes(s) ||
        (x.itemTitle||"").toLowerCase().includes(s)
      );
    }
    return r;
  }, [subs, typeFilter, itemFilter, search]);

  const allVisibleIds = filtered.map(x => x.id);
  const selectedIds = Object.entries(selected).filter(([id, on]) => on && allVisibleIds.includes(id)).map(([id]) => id);
  const allSelectedOnPage = selectedIds.length === allVisibleIds.length && allVisibleIds.length > 0;

  const toggleSelectAll = (on: boolean) => {
    const next = { ...selected };
    allVisibleIds.forEach(id => { next[id] = on; });
    setSelected(next);
  };

  async function handleDelete(subId: string) {
    try {
      await adminDeleteSubscription(subId);
      toast({ title: content.deleteSuccessTitle, description: content.deleteSuccessMessage });
    } catch (e: any) {
      toast({ title: content.error, description: e?.message || String(e), variant: "destructive" });
    }
  }

  const openEmailDialog = (ids: string[]) => {
    setEmailTargetIds(ids);
    setSubject("");
    setHtml("");
    setEmailDialogOpen(true);
  };

  async function sendEmail() {
    if (!emailTargetIds.length || !subject.trim() || !html.trim()) {
      toast({ title: content.error, description: content.fillAllFields, variant: "destructive" });
      return;
    }
    setSending(true);
    try {
      if (emailTargetIds.length === 1) {
        await sendCustomEmailToSubscription({ subId: emailTargetIds[0], subject, html });
      } else {
        await sendCustomEmailBulk({ subIds: emailTargetIds, subject, html });
      }
      toast({ title: content.emailSentTitle, description: content.emailSentMessage });
      setEmailDialogOpen(false);
      setEmailTargetIds([]);
    } catch (e: any) {
      toast({ title: content.error, description: e?.message || String(e), variant: "destructive" });
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="space-y-4">
      {/* فلاتر */}
      <div className="flex flex-wrap items-center gap-3 p-4">
        <select className="border rounded-md px-3 py-2 bg-background" value={typeFilter} onChange={e => { setTypeFilter(e.target.value as ItemType); setItemFilter("all"); }}>
          <option value="all">{content.allTypes}</option>
          <option value="activity">{content.navActivities}</option>
          <option value="trip">{content.navTrips}</option>
          <option value="event">{content.navEvents}</option>
        </select>

        <select className="border rounded-md px-3 py-2 bg-background" disabled={typeFilter==="all"} value={itemFilter} onChange={e => setItemFilter(e.target.value)}>
          <option value="all">{content.allItems}</option>
          {typeFilter!=="all" && itemsMap[typeFilter].map(it => (
            <option key={it.id} value={it.id}>{it.title}</option>
          ))}
        </select>

        <Input placeholder={content.searchPlaceholder}
               value={search} onChange={e => setSearch(e.target.value)} className="max-w-sm" />
        
        {selectedIds.length > 0 && (
          <Button onClick={() => openEmailDialog(selectedIds)}>
            <Mail className="h-4 w-4 mr-2" />
            {content.sendBulk.replace('{count}', String(selectedIds.length))}
          </Button>
        )}
      </div>

      {/* جدول */}
      <div className="border-t rounded-lg overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <Checkbox checked={allSelectedOnPage} onCheckedChange={(v) => toggleSelectAll(Boolean(v))} />
              </TableHead>
              <TableHead>{content.studentNameLabel}</TableHead>
              <TableHead>{content.classLabel}</TableHead>
              <TableHead>{content.phoneLabel}</TableHead>
              <TableHead>{content.typeLabel}</TableHead>
              <TableHead>{content.itemLabel}</TableHead>
              <TableHead>{content.dateLabel}</TableHead>
              <TableHead>{content.actionsLabel}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={8} className="text-center py-10"><Loader2 className="h-5 w-5 animate-spin inline-block mr-2" /> {content.loading}</TableCell></TableRow>
            ) : filtered.length === 0 ? (
              <TableRow><TableCell colSpan={8} className="text-center py-10">{content.noResults}</TableCell></TableRow>
            ) : filtered.map(s => {
              const d = s.subscribedAt instanceof Timestamp ? s.subscribedAt.toDate() : null;
              const dateStr = d ? new Intl.DateTimeFormat(language, { dateStyle: 'medium', timeStyle: 'short' }).format(d) : "-";
              const typeLabel = s.itemType === "activity" ? content.navActivities :
                                s.itemType === "trip" ? content.navTrips :
                                content.navEvents;
              return (
                <TableRow key={s.id}>
                  <TableCell>
                    <Checkbox checked={!!selected[s.id]} onCheckedChange={(v) => setSelected(prev => ({ ...prev, [s.id]: Boolean(v) }))} />
                  </TableCell>
                  <TableCell className="font-medium">{s.studentName || "-"}</TableCell>
                  <TableCell>{s.className || "-"}</TableCell>
                  <TableCell>{s.phoneNumber || "-"}</TableCell>
                  <TableCell>{typeLabel}</TableCell>
                  <TableCell>{s.itemTitle || "-"}</TableCell>
                  <TableCell>{dateStr}</TableCell>
                  <TableCell className="space-x-2">
                    <Button size="sm" variant="secondary" onClick={() => openEmailDialog([s.id])}>
                      <Mail className="h-4 w-4 mr-1" /> {content.email}
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="sm" variant="destructive">
                          <Trash className="h-4 w-4 mr-1" /> {content.delete}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>{content.confirmDeleteTitle}</AlertDialogTitle>
                          <AlertDialogDescription>{content.confirmDeleteMessage}</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>{content.cancel}</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(s.id)}>{content.delete}</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* حوار الإيميل */}
      <Dialog open={emailDialogOpen} onOpenChange={setEmailDialogOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>{content.sendEmailTitle}</DialogTitle>
            <DialogDescription>{content.sendEmailDescription}</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <Input value={subject} onChange={e => setSubject(e.target.value)} placeholder={content.subjectLabel} />
            <textarea value={html} onChange={e => setHtml(e.target.value)} className="w-full min-h-[160px] border rounded-md p-2 bg-background" placeholder={content.htmlContentPlaceholder} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEmailDialogOpen(false)}>{content.cancel}</Button>
            <Button onClick={sendEmail} disabled={sending}>
              {sending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {content.send}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
